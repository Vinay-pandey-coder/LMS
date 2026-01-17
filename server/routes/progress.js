const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Progress = require('../model/Progressmodel');
const Lecture = require('../model/Lecturemodel');

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

module.exports = router;