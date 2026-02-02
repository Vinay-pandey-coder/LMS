const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Progress = require('../model/Progressmodel');
const Lecture = require('../model/Lecturemodel');
const WatchTime = require('../model/WatchTimemodel');
const Test = require('../model/Testmodel');
const TestResult = require('../model/TestResultmodel');
const Assignment = require('../model/Assignmentmodel');
const AssignmentSubmission = require('../model/AssignmentSubmissionmodel');

const router = express.Router();

// ============================================
// MARK LECTURE AS COMPLETED
// ============================================
// POST /complete
// Only students can mark lectures as completed
// Request body: { courseId, lectureId }
router.post('/complete', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    // Get data from request body
    const { courseId, lectureId } = req.body;
    
    // Get student ID from the authenticated user
    const studentId = req.user.id;

    // Check if courseId and lectureId are provided
    if (!courseId || !lectureId) {
      return res.status(400).json({
        message: 'Please provide courseId and lectureId',
      });
    }

    // Create a new progress record
    const newProgress = new Progress({
      studentId,
      courseId,
      lectureId,
      completed: true, // Mark as completed
    });

    // Save the progress record to database
    await newProgress.save();

    console.log(`Student ${studentId} completed lecture ${lectureId}`);

    // Send success response
    res.status(201).json({
      message: 'Lecture marked as completed',
      progress: {
        studentId: newProgress.studentId,
        courseId: newProgress.courseId,
        lectureId: newProgress.lectureId,
        completed: newProgress.completed,
      },
    });
  } catch (error) {
    console.error('Mark complete error:', error.message);
    res.status(500).json({ message: 'Server error while marking lecture as completed' });
  }
});

// ============================================
// GET COURSE PROGRESS
// ============================================
// GET /course/:courseId
// Only students can view their progress
// Returns progress statistics for a specific course
router.get(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res) => {
    try {
      // Get courseId from URL parameter
      const courseId = req.params.courseId;
      
      // Get student ID from the authenticated user
      const studentId = req.user.id;

      // Find all lectures in this course
      const allLectures = await Lecture.find({ courseId });
      
      // Count total lectures
      const totalLectures = allLectures.length;

      // Find all completed lectures by this student in this course
      const completedProgress = await Progress.find({
        studentId,
        courseId,
        completed: true,
      });
      
      // Count completed lectures
      const completedLectures = completedProgress.length;

      // Calculate progress percentage
      // Formula: (completedLectures / totalLectures) * 100
      let progressPercentage = 0;
      
      // Check if there are any lectures in the course
      if (totalLectures > 0) {
        progressPercentage = (completedLectures / totalLectures) * 100;
      }

      console.log(
        `Course ${courseId} progress for student ${studentId}: ${completedLectures}/${totalLectures}`
      );

      // Send progress data
      res.status(200).json({
        message: 'Course progress retrieved successfully',
        courseId,
        studentId,
        totalLectures,
        completedLectures,
        progressPercentage: Math.round(progressPercentage), // Round to nearest whole number
      });
    } catch (error) {
      console.error('Get progress error:', error.message);
      res.status(500).json({ message: 'Server error while fetching progress' });
    }
  }
);

// ============================================
// GET PROGRESS SUMMARY
// ============================================
// GET /api/progress/summary/:courseId
// Only students can view their progress summary
// Returns comprehensive progress data for a course:
// - Total lectures vs lectures watched
// - Quiz average score
// - Assignment submission status
// - Completion percentage
router.get(
  '/summary/:courseId',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res) => {
    try {
      // Get courseId from URL parameters
      const courseId = req.params.courseId;

      // Get student ID from authenticated user
      const studentId = req.user.id;

      // Validate courseId
      if (!courseId) {
        return res.status(400).json({
          message: 'Course ID is required',
        });
      }

      // ============================================
      // 1. COUNT TOTAL LECTURES IN COURSE
      // ============================================
      // Find all lectures for this course
      const allLectures = await Lecture.find({ courseId: courseId });

      // Count total lectures
      const totalLectures = allLectures.length;

      // ============================================
      // 2. COUNT LECTURES WATCHED BY STUDENT
      // ============================================
      // Find all watch time records for this student in this course
      const watchedRecords = await WatchTime.find({
        studentId: studentId,
        lectureId: {
          $in: allLectures.map((lecture) => lecture._id),
        },
      });

      // Count lectures watched (distinct lecture count)
      const lecturesWatched = watchedRecords.length;

      // ============================================
      // 3. CALCULATE QUIZ AVERAGE SCORE
      // ============================================
      // Find all tests in this course
      const tests = await Test.find({ courseId: courseId });

      // Get test IDs
      const testIds = tests.map((test) => test._id);

      // Find all quiz results for this student in these tests
      const quizResults = await TestResult.find({
        studentId: studentId,
        testId: { $in: testIds },
      });

      // Calculate average quiz score
      let quizAverageScore = null;

      // Only calculate if student has attempted at least one quiz
      if (quizResults.length > 0) {
        // Sum all quiz scores
        const totalScore = quizResults.reduce((sum, result) => sum + result.score, 0);

        // Calculate average
        quizAverageScore = Math.round(totalScore / quizResults.length);
      }

      // ============================================
      // 4. COUNT ASSIGNMENT SUBMISSIONS
      // ============================================
      // Find all assignments in this course
      const assignments = await Assignment.find({ courseId: courseId });

      // Get assignment IDs
      const assignmentIds = assignments.map((assignment) => assignment._id);

      // Find all submissions for this student in these assignments
      const submissions = await AssignmentSubmission.find({
        studentId: studentId,
        assignmentId: { $in: assignmentIds },
      });

      // Count total submissions
      const assignmentsSubmitted = submissions.length;

      // Count graded submissions (where marks is not null)
      const assignmentsGraded = submissions.filter(
        (submission) => submission.marks !== null && submission.marks !== undefined
      ).length;

      // ============================================
      // 5. CALCULATE COMPLETION PERCENTAGE
      // ============================================
      // Simple calculation based on lectures watched only
      let completionPercent = 0;

      // Only calculate if there are lectures in the course
      if (totalLectures > 0) {
        completionPercent = Math.round(
          (lecturesWatched / totalLectures) * 100
        );
      }

      // ============================================
      // 6. PREPARE AND SEND RESPONSE
      // ============================================
      console.log(
        `Progress summary for student ${studentId} in course ${courseId}:`
      );

      res.status(200).json({
        courseId: courseId,
        studentId: studentId,
        lectures: {
          total: totalLectures,
          watched: lecturesWatched,
        },
        quizzes: {
          averageScore: quizAverageScore,
          attempted: quizResults.length,
        },
        assignments: {
          submitted: assignmentsSubmitted,
          graded: assignmentsGraded,
        },
        completionPercent: completionPercent,
      });
    } catch (error) {
      // Log error for debugging
      console.error('Progress summary error:', error.message);

      // Send error response
      res.status(500).json({
        message: 'Error fetching progress summary',
      });
    }
  }
);

module.exports = router;