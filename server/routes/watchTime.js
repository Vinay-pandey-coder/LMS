const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const WatchTime = require('../model/WatchTimemodel');

const router = express.Router();

// ============================================
// SAVE WATCH TIME
// ============================================
// POST /save
// Only students can save their watch time
// Request body: { lectureId, currentTime }
// This route saves how far the student has watched
router.post('/save', authMiddleware, roleMiddleware('student'), async (req, res) => {
  try {
    // Get data from request body
    const { lectureId, currentTime } = req.body;
    
    // Get student ID from the authenticated user
    const studentId = req.user.id;

    // Check if lectureId and currentTime are provided
    if (!lectureId || currentTime === undefined) {
      return res.status(400).json({
        message: 'Please provide lectureId and currentTime',
      });
    }

    // Check if a record already exists for this student and lecture
    const existingRecord = await WatchTime.findOne({
      studentId,
      lectureId,
    });

    let savedRecord;

    // If record exists → update it
    if (existingRecord) {
      // Update the currentTime in the existing record
      existingRecord.currentTime = currentTime;
      existingRecord.updatedAt = Date.now();
      
      // Save the updated record
      savedRecord = await existingRecord.save();

      console.log(`Updated watch time for student ${studentId} in lecture ${lectureId}`);

      // Send success response
      return res.status(200).json({
        message: 'Watch time updated successfully',
        watchTime: {
          studentId: savedRecord.studentId,
          lectureId: savedRecord.lectureId,
          currentTime: savedRecord.currentTime,
        },
      });
    }

    // If record does not exist → create new record
    const newWatchTime = new WatchTime({
      studentId,
      lectureId,
      currentTime,
    });

    // Save the new record to database
    savedRecord = await newWatchTime.save();

    console.log(`Created watch time record for student ${studentId} in lecture ${lectureId}`);

    // Send success response
    res.status(201).json({
      message: 'Watch time saved successfully',
      watchTime: {
        studentId: savedRecord.studentId,
        lectureId: savedRecord.lectureId,
        currentTime: savedRecord.currentTime,
      },
    });
  } catch (error) {
    console.error('Save watch time error:', error.message);
    res.status(500).json({ message: 'Server error while saving watch time' });
  }
});

// ============================================
// GET WATCH TIME FOR A LECTURE
// ============================================
// GET /lecture/:lectureId
// Only students can view their own watch time
// Returns the currentTime where student left off
// If no record exists, returns 0 (start from beginning)
router.get(
  '/lecture/:lectureId',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res) => {
    try {
      // Get lectureId from URL parameter
      const lectureId = req.params.lectureId;
      
      // Get student ID from the authenticated user
      const studentId = req.user.id;

      // Find the watch time record for this student and lecture
      const watchTimeRecord = await WatchTime.findOne({
        studentId,
        lectureId,
      });

      // Check if record exists
      if (watchTimeRecord) {
        // Record found - return the currentTime
        console.log(
          `Found watch time for student ${studentId} in lecture ${lectureId}: ${watchTimeRecord.currentTime}s`
        );

        return res.status(200).json({
          message: 'Watch time retrieved successfully',
          lectureId,
          currentTime: watchTimeRecord.currentTime,
        });
      }

      // Record not found - return 0 (start from beginning)
      console.log(
        `No watch time found for student ${studentId} in lecture ${lectureId}. Starting from beginning.`
      );

      res.status(200).json({
        message: 'No watch time found. Starting from beginning',
        lectureId,
        currentTime: 0,
      });
    } catch (error) {
      console.error('Get watch time error:', error.message);
      res.status(500).json({ message: 'Server error while fetching watch time' });
    }
  }
);

module.exports = router;