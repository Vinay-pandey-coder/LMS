const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Enrollment = require('../model/Enrollmentmodel');
const Course = require('../model/Coursemodel');
const TestResult = require('../model/TestResultmodel');
const AssignmentSubmission = require('../model/AssignmentSubmissionmodel');
const Test = require('../model/Testmodel');
const Assignment = require('../model/Assignmentmodel');

const router = express.Router();

// ============================================
// STUDENT DASHBOARD API
// ============================================
// GET /api/dashboard/student
// Protected route - Only students can access
// Returns summary of student's learning progress
router.get(
  '/student',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res) => {
    try {
      // Get student ID from authenticated user
      const studentId = req.user.id;

      console.log(`Fetching dashboard for student ${studentId}`);

      // ============================================
      // 1. COUNT TOTAL ENROLLED COURSES
      // ============================================
      // Find all enrollments for this student
      const enrollments = await Enrollment.find({ studentId });

      // Count total enrolled courses
      const totalEnrolledCourses = enrollments.length;

      console.log(`Student enrolled in ${totalEnrolledCourses} courses`);

      // ============================================
      // 2. COUNT COMPLETED COURSES
      // ============================================
      // A course is considered "completed" if completion is 100%
      // For simplicity, we'll count courses where student has watched all lectures
      // For now, we count enrollments with at least some progress
      // (A more accurate method would check WatchTime records)
      
      // Get course IDs from enrollments
      const courseIds = enrollments.map((e) => e.courseId);

      // For this simple implementation, we count courses as "in progress"
      // A more complete version would check lecture completion
      const completedCourses = courseIds.length > 0 ? 0 : 0; // Placeholder

      // Note: A real implementation would:
      // const lectures = await Lecture.find({ courseId: { $in: courseIds } });
      // const watchedLectures = await WatchTime.find({ studentId, lectureId: { $in: lectureIds } });
      // Then compare to mark courses complete
      // For now, we return 0 as a conservative estimate

      console.log(`Student completed ${completedCourses} courses`);

      // ============================================
      // 3. CALCULATE AVERAGE QUIZ SCORE
      // ============================================
      // Find all quiz results for this student
      const testResults = await TestResult.find({ studentId });

      // Calculate average score
      let averageQuizScore = null;

      // Only calculate if student has attempted at least one quiz
      if (testResults.length > 0) {
        // Sum all quiz scores
        const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);

        // Calculate average
        averageQuizScore = Math.round(totalScore / testResults.length);
      }

      console.log(`Student average quiz score: ${averageQuizScore}`);

      // ============================================
      // 4. COUNT PENDING ASSIGNMENTS
      // ============================================
      // Find all assignments from courses student is enrolled in
      const assignmentList = await Assignment.find({
        courseId: { $in: courseIds },
      });

      // Get assignment IDs
      const assignmentIds = assignmentList.map((a) => a._id);

      // Find ungraded submissions for this student
      const unsubmittedAssignments = await AssignmentSubmission.countDocuments({
        studentId,
        assignmentId: { $in: assignmentIds },
        marks: null, // Marks is null means not graded yet
      });

      const pendingAssignments = unsubmittedAssignments;

      console.log(`Student has ${pendingAssignments} pending assignments`);

      // ============================================
      // 5. PREPARE AND SEND RESPONSE
      // ============================================
      res.status(200).json({
        message: 'Student dashboard retrieved successfully',
        studentId,
        totalEnrolledCourses,
        completedCourses,
        averageQuizScore,
        pendingAssignments,
      });
    } catch (error) {
      // Log error for debugging
      console.error('Student dashboard error:', error.message);

      // Send error response
      res.status(500).json({
        message: 'Error fetching student dashboard',
        error: error.message,
      });
    }
  }
);

// ============================================
// TEACHER DASHBOARD API
// ============================================
// GET /api/dashboard/teacher
// Protected route - Only teachers can access
// Returns summary of teacher's created courses and student activity
router.get(
  '/teacher',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get teacher ID from authenticated user
      const teacherId = req.user.id;

      console.log(`Fetching dashboard for teacher ${teacherId}`);

      // ============================================
      // 1. COUNT TOTAL COURSES CREATED
      // ============================================
      // Find all courses created by this teacher
      const courses = await Course.find({ teacherId });

      // Count total courses created
      const totalCoursesCreated = courses.length;

      console.log(`Teacher created ${totalCoursesCreated} courses`);

      // ============================================
      // 2. COUNT TOTAL STUDENTS ENROLLED
      // ============================================
      // Get all course IDs created by this teacher
      const courseIds = courses.map((c) => c._id);

      // Find all students enrolled in any of these courses
      const enrollments = await Enrollment.find({
        courseId: { $in: courseIds },
      });

      // Count unique students (in case a student is enrolled in multiple courses)
      const uniqueStudentIds = new Set(
        enrollments.map((e) => e.studentId.toString())
      );

      const totalStudentsEnrolled = uniqueStudentIds.size;

      console.log(`Teacher has ${totalStudentsEnrolled} students enrolled`);

      // ============================================
      // 3. COUNT PENDING SUBMISSIONS
      // ============================================
      // Find all assignments created by this teacher
      const assignments = await Assignment.find({
        createdBy: teacherId,
      });

      // Get assignment IDs
      const assignmentIds = assignments.map((a) => a._id);

      // Count ungraded submissions
      const pendingSubmissions = await AssignmentSubmission.countDocuments({
        assignmentId: { $in: assignmentIds },
        marks: null, // Marks is null means not graded yet
      });

      console.log(`Teacher has ${pendingSubmissions} pending submissions`);

      // ============================================
      // 4. COUNT TOTAL QUIZZES CREATED
      // ============================================
      // Find all quizzes/tests created by this teacher
      const tests = await Test.find({
        createdBy: teacherId,
      });

      // Count total quizzes
      const totalQuizzesCreated = tests.length;

      console.log(`Teacher created ${totalQuizzesCreated} quizzes`);

      // ============================================
      // 5. PREPARE AND SEND RESPONSE
      // ============================================
      res.status(200).json({
        message: 'Teacher dashboard retrieved successfully',
        teacherId,
        totalCoursesCreated,
        totalStudentsEnrolled,
        pendingSubmissions,
        totalQuizzesCreated,
      });
    } catch (error) {
      // Log error for debugging
      console.error('Teacher dashboard error:', error.message);

      // Send error response
      res.status(500).json({
        message: 'Error fetching teacher dashboard',
        error: error.message,
      });
    }
  }
);

module.exports = router;