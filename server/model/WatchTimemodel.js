
const mongoose = require('mongoose');

// Define WatchTime Schema
// This model tracks how far a student has watched in each lecture
// So they can resume from where they left off
const watchTimeSchema = new mongoose.Schema({
  // The student who is watching the lecture
  // This is a reference to the User model
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // The lecture being watched
  // This is a reference to the Lecture model
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  },

  // How many seconds into the lecture the student has watched
  // For example: 120 means 2 minutes (120 seconds)
  // Default is 0 (not started)
  currentTime: {
    type: Number,
    default: 0,
  },

  // When this watch time record was last updated
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create WatchTime model from schema
const WatchTime = mongoose.model('WatchTime', watchTimeSchema);

module.exports = WatchTime;