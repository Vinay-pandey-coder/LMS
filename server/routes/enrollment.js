const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Enrollment = require('../model/Enrollmentmodel');
const User = require('../model/usermodel');

const router = express.Router();

// ============================================
// GET /api/enrollment/course/:courseId
// Protected route - Only teachers can access
// Returns all enrolled students for a specific course
// ============================================
router.get(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      console.log(`Fetching enrollments for course ${courseId}`);

      // Find all enrollments for this course
      const enrollments = await Enrollment.find({ courseId })
        .populate('studentId', 'name email') // Populate student name and email
        .sort({ createdAt: -1 }); // Sort by newest first

      console.log(`Found ${enrollments.length} enrollments for course ${courseId}`);

      res.status(200).json({
        message: 'Enrollments retrieved successfully',
        courseId,
        enrollments,
        count: enrollments.length,
      });
    } catch (error) {
      console.error('Error fetching enrollments:', error.message);
      res.status(500).json({
        message: 'Error fetching enrollments',
        error: error.message,
      });
    }
  }
);

// ============================================
// GET /api/enrollment/teacher/:teacherId
// Protected route - Only teachers can access (or admins)
// Returns all students enrolled in all courses by this teacher
// ============================================
router.get(
  '/teacher/:teacherId',
  authMiddleware,
  async (req, res) => {
    try {
      const { teacherId } = req.params;
      const requestingUserId = req.user.id;

      // Check if requesting user is the teacher or an admin
      if (requestingUserId !== teacherId && req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Unauthorized - Cannot view enrollments for other teachers',
        });
      }

      console.log(`Fetching all enrollments for teacher ${teacherId}`);

      // This would require a Course.find({ teacherId }) first
      // For now, we'll return an error suggesting to use the course endpoint
      res.status(200).json({
        message: 'Use GET /api/enrollment/course/:courseId for per-course enrollments',
        note: 'Fetch all teacher courses first, then call enrollment endpoint for each course',
      });
    } catch (error) {
      console.error('Error fetching teacher enrollments:', error.message);
      res.status(500).json({
        message: 'Error fetching enrollments',
        error: error.message,
      });
    }
  }
);

module.exports = router;