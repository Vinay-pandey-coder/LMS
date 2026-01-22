// Assignment.js - Assignment Model
// Stores information about assignments created by teachers

const mongoose = require('mongoose');

// Define Assignment Schema
const assignmentSchema = new mongoose.Schema({
  // Title of the assignment
  title: {
    type: String,
    required: true,
  },

  // Description of the assignment
  // What students need to do
  description: {
    type: String,
    required: true,
  },

  // Course this assignment belongs to
  // References the Course model
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },

  // Teacher who created this assignment
  // References the User model
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Date when assignment is due
  // Students should submit before this date
  dueDate: {
    type: Date,
    required: true,
  },

  // When the assignment was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Assignment model from schema
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;