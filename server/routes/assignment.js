// assignment.js - Assignment Routes
// Routes for creating assignments, submitting answers, and evaluating submissions

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import models
const Assignment = require('../model/Assignmentmodel');
const AssignmentSubmission = require('../model/AssignmentSubmissionmodel');

// ============================================
// ROUTE 1: Create a new assignment (Teacher Only)
// ============================================
// POST /api/assignment/create
// Body: { title, description, courseId, dueDate }
// Response: { assignmentId, message }
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get assignment details from request body
      const { title, description, courseId, dueDate } = req.body;

      // Validate that title is provided
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      // Validate that description is provided
      if (!description) {
        return res.status(400).json({ message: 'Description is required' });
      }

      // Validate that courseId is provided
      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Validate that dueDate is provided
      if (!dueDate) {
        return res.status(400).json({ message: 'Due date is required' });
      }

      // Create new assignment object
      // createdBy is the teacher (from authMiddleware)
      const newAssignment = new Assignment({
        title: title,
        description: description,
        courseId: courseId,
        createdBy: req.user.id, // User ID set by authMiddleware
        dueDate: new Date(dueDate),
      });

      // Save assignment to database
      await newAssignment.save();

      // Return success response with assignment ID
      return res.status(201).json({
        message: 'Assignment created successfully',
        assignmentId: newAssignment._id,
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      return res.status(500).json({ message: 'Error creating assignment' });
    }
  }
);

// ============================================
// ROUTE 2: Get assignments for a course (Student)
// ============================================
// GET /api/assignment/course/:courseId
// Response: { assignments: [...] }
router.get('/course/:courseId', authMiddleware, async (req, res) => {
  try {
    // Get course ID from URL parameters
    const courseId = req.params.courseId;

    // Find all assignments for this course
    const assignments = await Assignment.find({ courseId: courseId })
      .populate('createdBy', 'name') // Include teacher name
      .sort({ dueDate: 1 }); // Sort by due date (earliest first)

    // Return assignments
    return res.status(200).json({
      assignments: assignments,
      totalAssignments: assignments.length,
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Error fetching assignments' });
  }
});

// ============================================
// ROUTE 3: Submit assignment (Student Only)
// ============================================
// POST /api/assignment/submit
// Body: { assignmentId, answerText }
// Response: { submissionId, message }
router.post(
  '/submit',
  authMiddleware,
  roleMiddleware('student'),
  async (req, res) => {
    try {
      // Get assignment ID and answer from request body
      const { assignmentId, answerText } = req.body;

      // Validate that assignmentId is provided
      if (!assignmentId) {
        return res.status(400).json({ message: 'Assignment ID is required' });
      }

      // Validate that answerText is provided
      if (!answerText) {
        return res.status(400).json({ message: 'Answer text is required' });
      }

      // Check if assignment exists
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Check if student has already submitted
      // A student can only submit once per assignment
      const existingSubmission = await AssignmentSubmission.findOne({
        assignmentId: assignmentId,
        studentId: req.user.id,
      });

      if (existingSubmission) {
        return res
          .status(400)
          .json({ message: 'You have already submitted this assignment' });
      }

      // Create new submission object
      const newSubmission = new AssignmentSubmission({
        assignmentId: assignmentId,
        studentId: req.user.id, // Student ID from authMiddleware
        answerText: answerText,
        status: 'submitted', // Initially marked as submitted (not checked)
      });

      // Save submission to database
      await newSubmission.save();

      // Return success response
      return res.status(201).json({
        message: 'Assignment submitted successfully',
        submissionId: newSubmission._id,
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return res.status(500).json({ message: 'Error submitting assignment' });
    }
  }
);

// ============================================
// ROUTE 4: Evaluate assignment (Teacher Only)
// ============================================
// POST /api/assignment/evaluate
// Body: { submissionId, marks }
// Response: { message }
// Teacher calls this to give marks to a submission
router.post(
  '/evaluate',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get submission ID and marks from request body
      const { submissionId, marks } = req.body;

      // Validate that submissionId is provided
      if (!submissionId) {
        return res
          .status(400)
          .json({ message: 'Submission ID is required' });
      }

      // Validate that marks is provided
      if (marks === undefined || marks === null) {
        return res.status(400).json({ message: 'Marks are required' });
      }

      // Validate that marks is a number
      if (typeof marks !== 'number' || marks < 0) {
        return res
          .status(400)
          .json({ message: 'Marks must be a positive number' });
      }

      // Find the submission
      const submission = await AssignmentSubmission.findById(submissionId);
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      // Update submission with marks and status
      submission.marks = marks;
      submission.status = 'checked'; // Mark as evaluated
      submission.evaluatedAt = new Date(); // Record when evaluation happened

      // Save updated submission
      await submission.save();

      // Return success response
      return res.status(200).json({
        message: 'Assignment evaluated successfully',
      });
    } catch (error) {
      console.error('Error evaluating assignment:', error);
      return res.status(500).json({ message: 'Error evaluating assignment' });
    }
  }
);

// ============================================
// BONUS ROUTE: Get student submissions for assignment (Teacher)
// ============================================
// GET /api/assignment/:assignmentId/submissions
// Only teacher can see all submissions
// Response: { submissions: [...] }
router.get(
  '/:assignmentId/submissions',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get assignment ID from URL
      const assignmentId = req.params.assignmentId;

      // Find all submissions for this assignment
      const submissions = await AssignmentSubmission.find({
        assignmentId: assignmentId,
      })
        .populate('studentId', 'name email') // Include student info
        .sort({ submittedAt: -1 }); // Newest first

      // Return submissions
      return res.status(200).json({
        submissions: submissions,
        totalSubmissions: submissions.length,
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return res
        .status(500)
        .json({ message: 'Error fetching submissions' });
    }
  }
);

// ============================================
// BONUS ROUTE: Get student's submission for assignment
// ============================================
// GET /api/assignment/:assignmentId/my-submission
// Student can view their own submission
// Response: { submission }
router.get(
  '/:assignmentId/my-submission',
  authMiddleware,
  async (req, res) => {
    try {
      // Get assignment ID from URL
      const assignmentId = req.params.assignmentId;

      // Find this student's submission for this assignment
      const submission = await AssignmentSubmission.findOne({
        assignmentId: assignmentId,
        studentId: req.user.id,
      });

      // If not found, return 404
      if (!submission) {
        return res
          .status(404)
          .json({ message: 'You have not submitted this assignment' });
      }

      // Return submission
      return res.status(200).json({
        submission: submission,
      });
    } catch (error) {
      console.error('Error fetching submission:', error);
      return res.status(500).json({ message: 'Error fetching submission' });
    }
  }
);

// Export router to use in server.js
module.exports = router;