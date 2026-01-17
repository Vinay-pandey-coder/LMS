const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// ============================================
// STUDENT ROUTE
// ============================================
// Only users with role "student" can access this
router.get('/student', authMiddleware, roleMiddleware('student'), (req, res) => {
  // If you reach here, user is authenticated and has student role
  res.status(200).json({
    message: 'Welcome Student Dashboard',
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

// ============================================
// TEACHER ROUTE
// ============================================
// Only users with role "teacher" can access this
router.get('/teacher', authMiddleware, roleMiddleware('teacher'), (req, res) => {
  // If you reach here, user is authenticated and has teacher role
  res.status(200).json({
    message: 'Welcome Teacher Dashboard',
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

// ============================================
// ADMIN ROUTE
// ============================================
// Only users with role "admin" can access this
router.get('/admin', authMiddleware, roleMiddleware('admin'), (req, res) => {
  // If you reach here, user is authenticated and has admin role
  res.status(200).json({
    message: 'Welcome Admin Dashboard',
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

module.exports = router;