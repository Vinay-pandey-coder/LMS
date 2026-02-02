
// TestResult.js - Test Result Model
// Stores student's quiz attempt and score

const mongoose = require('mongoose');

// Define TestResult Schema
const testResultSchema = new mongoose.Schema({
  // Which test was taken
  // References the Test model
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },

  // Which student took the test
  // References the User model
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Score out of 100
  // Example: 75 means 75/100
  score: {
    type: Number,
    required: true,
  },

  // Array of student's answers
  // Each item: { questionId, selectedAnswer, isCorrect }
  // Example:
  // [
  //   {
  //     questionId: ObjectId,
  //     selectedAnswer: 'Option A',
  //     isCorrect: true
  //   },
  //   {
  //     questionId: ObjectId,
  //     selectedAnswer: 'Option B',
  //     isCorrect: false
  //   }
  // ]
  answers: {
    type: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: String,
        isCorrect: Boolean,
      },
    ],
    required: true,
  },

  // When the test was submitted
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create TestResult model from schema
const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;