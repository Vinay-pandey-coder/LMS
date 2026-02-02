// AssignmentSubmission.js - Assignment Submission Model
// Stores student submissions and teacher evaluations

const mongoose = require('mongoose');

// Define AssignmentSubmission Schema
const assignmentSubmissionSchema = new mongoose.Schema({
  // Assignment that was submitted
  // References the Assignment model
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },

  // Student who submitted the assignment
  // References the User model
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Student's answer (text-based)
  // The actual content of what the student submitted
  answerText: {
    type: String,
    required: true,
  },

  // Marks given by teacher
  // Initially null until teacher evaluates
  // Can be any number (e.g., 0 to 100)
  marks: {
    type: Number,
    default: null,
  },

  // Feedback/Comments from teacher
  // Optional field where teacher can write feedback
  // Initially null, filled when teacher grades
  feedback: {
    type: String,
    default: null,
  },

  // Status of submission
  // "submitted" = waiting for teacher evaluation
  // "checked" = teacher has evaluated and given marks
  status: {
    type: String,
    enum: ['submitted', 'checked'],
    default: 'submitted',
  },

  // When the student submitted the assignment
  submittedAt: {
    type: Date,
    default: Date.now,
  },

  // When the teacher evaluated (if evaluated)
  evaluatedAt: {
    type: Date,
    default: null,
  },

  // When the teacher graded (same as evaluatedAt, but more specific)
  gradedAt: {
    type: Date,
    default: null,
  },
});

// Create AssignmentSubmission model from schema
const AssignmentSubmission = mongoose.model(
  'AssignmentSubmission',
  assignmentSubmissionSchema
);

module.exports = AssignmentSubmission;