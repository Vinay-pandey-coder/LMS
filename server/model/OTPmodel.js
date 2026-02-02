const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  // Email address for OTP verification
  email: {
    type: String,
    required: true,
  },
  // OTP code (6 digits)
  otp: {
    type: String,
    required: true,
  },
  // Expiration time
  expiresAt: {
    type: Date,
    required: true,
  },
  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete OTP after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;