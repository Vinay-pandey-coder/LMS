
const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: true,
  },
  // User's email (must be unique)
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // User's password
  password: {
    type: String,
    required: true,
  },
  // User's role (student, teacher, or admin)
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true,
    default: 'student',
  },
  // Email verification status
  emailVerified: {
    type: Boolean,
    default: false,
  },
  // Authentication provider
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email',
  },
  // Google ID (optional)
  googleId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create User model from schema
const User = mongoose.model('User', userSchema);
module.exports = User;
