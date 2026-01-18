const express = require('express');
const Course = require('../model/Coursemodel');
const Enrollment = require('../model/Enrollmentmodel');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// ============================================
// CREATE COURSE ROUTE
// ============================================
// Only teachers can create courses
router.post('/create', authMiddleware, roleMiddleware('teacher'), async (req, res) => {
  try {
    // Get title and description from request body
    const { title, description } = req.body;

    // Check if title is provided
    if (!title) {
      return res.status(400).json({ message: 'Please provide a course title' });
    }

    console.log('Teacher', req.user.id, 'creating course:', title);

    // Create a new course object
    const newCourse = new Course({
      title,
      description,
      teacherId: req.user.id, // Set teacher as the current logged-in user
    });

    // Save course to database
    await newCourse.save();

    console.log('Course created successfully:', newCourse._id);

    // Send success response
    res.status(201).json({
      message: 'Course created successfully',
      course: {
        id: newCourse._id,
        title: newCourse.title,
        description: newCourse.description,
        teacherId: newCourse.teacherId,
      },
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error while creating course' });
  }
});

// ============================================
// GET ALL COURSES ROUTE
// ============================================
// Only students can view all courses
router.get('/all', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    console.log('Student', req.user.id, 'fetching all courses');

    // Find all courses from database
    const courses = await Course.find();

    console.log('Found', courses.length, 'courses');

    // Send list of courses
    res.status(200).json({
      message: 'Courses retrieved successfully',
      courses: courses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
});

// ============================================
// ENROLL IN COURSE ROUTE
// ============================================
// Only students can enroll
router.post('/enroll', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    // Get courseId from request body
    const { courseId } = req.body;

    // Check if courseId is provided
    if (!courseId) {
      return res.status(400).json({ message: 'Please provide a courseId' });
    }

    console.log('Student', req.user.id, 'enrolling in course:', courseId);

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create new enrollment
    const newEnrollment = new Enrollment({
      studentId: req.user.id, // Current logged-in student
      courseId: courseId,
    });

    // Save enrollment to database
    await newEnrollment.save();

    console.log('Student enrolled successfully');

    // Send success response
    res.status(201).json({
      message: 'Enrolled in course successfully',
      enrollment: {
        id: newEnrollment._id,
        studentId: newEnrollment.studentId,
        courseId: newEnrollment.courseId,
      },
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error while enrolling in course' });
  }
});


// ============================================
// GET ENROLLED COURSES ROUTE
// ============================================
// Only students can view their enrolled courses
router.get('/enrolled', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    // Get student ID from authenticated user
    const studentId = req.user.id;

    console.log('Student', studentId, 'fetching enrolled courses');

    // Step 1: Find all enrollments for this student
    const enrollments = await Enrollment.find({ studentId });

    console.log('Found', enrollments.length, 'enrollments');

    // Step 2-4: For each enrollment, fetch the course details
    const courses = [];

    // Loop over each enrollment
    for (let enrollment of enrollments) {
      // Get the courseId from enrollment
      const courseId = enrollment.courseId;

      // Fetch the course using courseId
      const course = await Course.findById(courseId);

      // If course exists, add to courses array
      if (course) {
        courses.push({
          id: course._id,
          title: course.title,
          description: course.description,
        });
      }
    }

    console.log('Returning', courses.length, 'courses');

    // Step 5: Send courses as response
    res.status(200).json({
      message: 'Enrolled courses retrieved successfully',
      courses: courses,
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Server error while fetching enrolled courses' });
  }
});


module.exports = router;