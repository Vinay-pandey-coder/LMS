const mongoose = require('mongoose');

// Define Progress Schema
// This model tracks which lectures a student has completed in a course
const progressSchema = new mongoose.Schema({
  // The student who completed the lecture
  // This is a reference to the User model
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // The course where the lecture is from
  // This is a reference to the Course model
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },

  // The lecture that was completed
  // This is a reference to the Lecture model
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  },

  // Whether this lecture is completed by the student
  // Default is false (not completed)
  completed: {
    type: Boolean,
    default: false,
  },

  // When this progress record was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Progress model from schema
const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;