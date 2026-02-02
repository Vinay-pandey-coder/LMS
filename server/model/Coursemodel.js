
const mongoose = require('mongoose');

// Define Course Schema
const courseSchema = new mongoose.Schema({
  // Course title
  title: {
    type: String,
    required: true,
  },

  // Course description
  description: {
    type: String,
  },

  // Teacher who created the course
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Course model from schema
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
