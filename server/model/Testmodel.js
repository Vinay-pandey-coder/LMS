// Test.js - Test/Quiz Model
// Stores information about quizzes created by teachers

const mongoose = require('mongoose');

// Define Test Schema
const testSchema = new mongoose.Schema({
  // Title of the test/quiz
  title: {
    type: String,
    required: true,
  },

  // Course this test belongs to
  // References the Course model
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },

  // Teacher who created this test
  // References the User model
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // When the test was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Test model from schema
const Test = mongoose.model('Test', testSchema);

module.exports = Test;