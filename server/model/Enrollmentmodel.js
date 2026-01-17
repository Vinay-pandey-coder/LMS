const mongoose = require('mongoose');

// Define Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
  // Student who is enrolling
  // ObjectId refers to the User model's _id
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Course the student is enrolling in
  // ObjectId refers to the Course model's _id
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
});

// Create Enrollment model from schema
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;