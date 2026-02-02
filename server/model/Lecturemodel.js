
const mongoose = require('mongoose');

// Define Lecture Schema
const lectureSchema = new mongoose.Schema({
  // Course ID - which course does this lecture belong to
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },

  // Lecture title
  title: {
    type: String,
    required: true,
  },

  // Video URL
  videoUrl: {
    type: String,
    required: true,
  },

  // Order of lecture in course (1st, 2nd, 3rd, etc.)
  order: {
    type: Number,
    default: 1,
  },
});

// Create Lecture model from schema
const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;