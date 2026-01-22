// Question.js - Question Model
// Stores quiz questions with multiple choice options

const mongoose = require('mongoose');

// Define Question Schema
const questionSchema = new mongoose.Schema({
  // Which test this question belongs to
  // References the Test model
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },

  // The question text
  questionText: {
    type: String,
    required: true,
  },

  // Array of 4 answer options
  // Example: ['Option A', 'Option B', 'Option C', 'Option D']
  options: {
    type: [String],
    required: true,
  },

  // The correct answer (must be one of the options)
  // Example: 'Option A'
  correctAnswer: {
    type: String,
    required: true,
  },

  // When the question was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Question model from schema
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;