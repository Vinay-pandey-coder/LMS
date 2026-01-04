const mongoose = require('mongoose')


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
  
  // User's password (will be hashed before saving)
  password: {
    type: String,
    required: true,
  },
  
  // User's role (student or teacher)
  role: {
    type: String,
    default: 'student', 
  },
});

const User = mongoose.model('User',userSchema)

module.exports = User