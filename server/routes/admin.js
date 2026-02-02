const express = require('express');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const User = require('../model/usermodel');
const Course = require('../model/Coursemodel');
const Enrollment = require('../model/Enrollmentmodel');

const router = express.Router();

// ============================================
// ADMIN DASHBOARD STATS API
// ============================================
// GET /api/admin/stats
// Protected route - Only admins can access
// Returns platform-wide statistics
router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const adminId = req.user.id;
      console.log(`Fetching stats for admin ${adminId}`);

      // ============================================
      // 1. COUNT TOTAL USERS
      // ============================================
      const totalUsers = await User.countDocuments();
      console.log(`Total users: ${totalUsers}`);

      // ============================================
      // 2. COUNT STUDENTS
      // ============================================
      const totalStudents = await User.countDocuments({ role: 'student' });
      console.log(`Total students: ${totalStudents}`);

      // ============================================
      // 3. COUNT TEACHERS
      // ============================================
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      console.log(`Total teachers: ${totalTeachers}`);

      // ============================================
      // 4. COUNT TOTAL COURSES
      // ============================================
      const totalCourses = await Course.countDocuments();
      console.log(`Total courses: ${totalCourses}`);

      // ============================================
      // 5. COUNT TOTAL ENROLLMENTS
      // ============================================
      const totalEnrollments = await Enrollment.countDocuments();
      console.log(`Total enrollments: ${totalEnrollments}`);

      // ============================================
      // 6. PREPARE AND SEND RESPONSE
      // ============================================
      res.status(200).json({
        message: 'Admin stats retrieved successfully',
        adminId,
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalEnrollments,
      });
    } catch (error) {
      console.error('Admin stats error:', error.message);
      res.status(500).json({
        message: 'Error fetching admin stats',
        error: error.message,
      });
    }
  }
);

// ============================================
// GET ENROLLMENT DETAILS API
// ============================================
// GET /api/admin/enrollments
// Protected route - Only admins can access
// Returns detailed enrollment data with student and course names
router.get(
  '/enrollments',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const adminId = req.user.id;
      console.log(`Fetching enrollments for admin ${adminId}`);

      // Get all enrollments with populated student and course info
      const enrollments = await Enrollment.find()
        .populate('studentId', 'name email')
        .populate('courseId', 'title');

      console.log(`Found ${enrollments.length} enrollments`);

      // Group enrollments by course for easy viewing
      const enrollmentsByStudents = enrollments.map((enrollment) => ({
        _id: enrollment._id,
        studentName: enrollment.studentId?.name || 'Unknown Student',
        studentEmail: enrollment.studentId?.email || 'N/A',
        courseName: enrollment.courseId?.title || 'Unknown Course',
        courseId: enrollment.courseId?._id || 'N/A',
      }));

      // Also get enrollment summary by course
      const courses = await Course.find();
      const enrollmentsByCourse = await Promise.all(
        courses.map(async (course) => {
          const courseEnrollments = await Enrollment.countDocuments({
            courseId: course._id,
          });
          return {
            courseId: course._id,
            courseName: course.title,
            studentCount: courseEnrollments,
          };
        })
      );

      res.status(200).json({
        message: 'Enrollments retrieved successfully',
        totalEnrollments: enrollments.length,
        enrollmentsByStudents,
        enrollmentsByCourse,
      });
    } catch (error) {
      console.error('Get enrollments error:', error.message);
      res.status(500).json({
        message: 'Error fetching enrollments',
        error: error.message,
      });
    }
  }
);

// ============================================
// GET ALL USERS API
// ============================================
// GET /api/admin/users
// Protected route - Only admins can access
// Returns list of all users with their roles
router.get(
  '/users',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const adminId = req.user.id;
      console.log(`Fetching all users for admin ${adminId}`);

      // Fetch all users with essential fields
      const users = await User.find(
        {},
        'name email role createdAt' // Only select these fields
      ).sort({ createdAt: -1 }); // Sort by newest first

      console.log(`Found ${users.length} users`);

      res.status(200).json({
        message: 'Users retrieved successfully',
        count: users.length,
        users,
      });
    } catch (error) {
      console.error('Get users error:', error.message);
      res.status(500).json({
        message: 'Error fetching users',
        error: error.message,
      });
    }
  }
);

// ============================================
// GET ALL TEACHERS API
// ============================================
// GET /api/admin/teachers
// Protected route - Only admins can access
// Returns list of all teachers with course counts
router.get(
  '/teachers',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const adminId = req.user.id;
      console.log(`Fetching all teachers for admin ${adminId}`);

      // Fetch all teachers
      const teachers = await User.find(
        { role: 'teacher' },
        'name email createdAt'
      ).sort({ createdAt: -1 });

      console.log(`Found ${teachers.length} teachers`);

      // For each teacher, count their courses
      const teachersWithCounts = await Promise.all(
        teachers.map(async (teacher) => {
          const courseCount = await Course.countDocuments({ teacherId: teacher._id });
          return {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            courseCount,
            createdAt: teacher.createdAt,
          };
        })
      );

      res.status(200).json({
        message: 'Teachers retrieved successfully',
        count: teachersWithCounts.length,
        teachers: teachersWithCounts,
      });
    } catch (error) {
      console.error('Get teachers error:', error.message);
      res.status(500).json({
        message: 'Error fetching teachers',
        error: error.message,
      });
    }
  }
);

// ============================================
// GET ALL COURSES API
// ============================================
// GET /api/admin/courses
// Protected route - Only admins can access
// Returns list of all courses with creator info
router.get(
  '/courses',
  authMiddleware,
  roleMiddleware('admin'),
  async (req, res) => {
    try {
      const adminId = req.user.id;
      console.log(`Fetching all courses for admin ${adminId}`);

      // Fetch all courses with teacher info
      const courses = await Course.find()
        .populate('teacherId', 'name email') // Get teacher details
        .sort({ createdAt: -1 }); // Sort by newest first

      console.log(`Found ${courses.length} courses`);

      res.status(200).json({
        message: 'Courses retrieved successfully',
        count: courses.length,
        courses,
      });
    } catch (error) {
      console.error('Get courses error:', error.message);
      res.status(500).json({
        message: 'Error fetching courses',
        error: error.message,
      });
      }
      }
      );

      // ============================================
      // CREATE ADMIN USER API (SECURE)
      // ============================================
      // POST /api/admin/create
      // Protected route - Only existing admins can create new admins
      // Prevents self-registration of admin
      router.post(
      '/create',
      authMiddleware,
      roleMiddleware('admin'),
      async (req, res) => {
      try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
       return res.status(400).json({
         message: 'Name, email, and password are required',
       });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
       return res.status(400).json({
         message: 'Email already registered',
       });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user (auto-verified)
      const newAdmin = new User({
       name,
       email,
       password: hashedPassword,
       role: 'admin',
       emailVerified: true, // Auto-verified for admin
       authProvider: 'local',
      });

      await newAdmin.save();

      res.status(201).json({
       message: 'Admin user created successfully',
       admin: {
         id: newAdmin._id,
         name: newAdmin.name,
         email: newAdmin.email,
         role: newAdmin.role,
       },
      });
      } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({
       message: 'Error creating admin user',
      });
      }
      }
      );

      // ============================================
      // CHANGE USER ROLE API
      // ============================================
      // PATCH /api/admin/user/:id/role
      // Protected route - Only admins can change roles
      // Allows switching between student and teacher
      router.patch(
      '/user/:id/role',
      authMiddleware,
      roleMiddleware('admin'),
      async (req, res) => {
      try {
      const { id } = req.params;
      const { role } = req.body;

      // Validation
      if (!role) {
       return res.status(400).json({ message: 'Role is required' });
      }

      // Validate role
      if (!['student', 'teacher', 'admin'].includes(role)) {
       return res.status(400).json({
         message: 'Invalid role. Must be student, teacher, or admin',
       });
      }

      // Find user
      const user = await User.findById(id);
      if (!user) {
       return res.status(404).json({ message: 'User not found' });
      }

      // Update role
      user.role = role;
      await user.save();

      res.status(200).json({
       message: 'User role updated successfully',
       user: {
         id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
       },
      });
      } catch (error) {
      console.error('Change role error:', error);
      res.status(500).json({
       message: 'Error changing user role',
      });
      }
      }
      );

      // ============================================
      // DELETE USER API
      // ============================================
      // DELETE /api/admin/user/:id
      // Protected route - Only admins can delete users
      // Prevents self-deletion
      router.delete(
      '/user/:id',
      authMiddleware,
      roleMiddleware('admin'),
      async (req, res) => {
      try {
      const { id } = req.params;
      const adminId = req.user.id;

      // Prevent self-deletion
      if (id === adminId) {
       return res.status(400).json({
         message: 'Cannot delete your own admin account',
       });
      }

      // Find and delete user
      const user = await User.findByIdAndDelete(id);

      if (!user) {
       return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
       message: 'User deleted successfully',
       deletedUser: {
         id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
       },
      });
      } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
       message: 'Error deleting user',
      });
      }
      }
      );

      module.exports = router;