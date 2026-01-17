const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Lecture = require('../model/Lecturemodel');

const router = express.Router();

// ============================================
// ADD LECTURE (TEACHER ONLY)
// ============================================
// POST /add
// Only teachers can add lectures
router.post('/add', authMiddleware, roleMiddleware('teacher'), async (req, res) => {
  try {
    // Get data from request body
    const { courseId, title, videoUrl, order } = req.body;

    // Check if all required fields are provided
    if (!courseId || !title || !videoUrl) {
      return res.status(400).json({
        message: 'Please provide courseId, title, and videoUrl',
      });
    }

    // Create new lecture
    const newLecture = new Lecture({
      courseId,
      title,
      videoUrl,
      order: order || 1, // Default order is 1 if not provided
    });

    // Save lecture to database
    await newLecture.save();

    console.log('New lecture added:', newLecture._id);

    // Send success response
    res.status(201).json({
      message: 'Lecture added successfully',
      lecture: {
        id: newLecture._id,
        courseId: newLecture.courseId,
        title: newLecture.title,
        videoUrl: newLecture.videoUrl,
        order: newLecture.order,
      },
    });
  } catch (error) {
    console.error('Add lecture error:', error.message);
    res.status(500).json({ message: 'Server error while adding lecture' });
  }
});

// ============================================
// GET LECTURES BY COURSE (STUDENT ONLY)
// ============================================
// GET /course/:courseId
// Only students can view lectures
// Returns all lectures for a course, sorted by order
router.get(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res) => {
    try {
      // Get courseId from URL parameters
      const courseId = req.params.courseId;

      // Find all lectures for this course
      // sort() arranges lectures by order (ascending)
      const lectures = await Lecture.find({ courseId }).sort({ order: 1 });

      console.log(
        `Found ${lectures.length} lectures for course ${courseId}`
      );

      // Send lectures
      res.status(200).json({
        message: 'Lectures retrieved successfully',
        courseId,
        lectureCount: lectures.length,
        lectures: lectures.map((lecture) => ({
          id: lecture._id,
          title: lecture.title,
          videoUrl: lecture.videoUrl,
          order: lecture.order,
        })),
      });
    } catch (error) {
      console.error('Get lectures error:', error.message);
      res.status(500).json({ message: 'Server error while fetching lectures' });
    }
  }
);

module.exports = router;