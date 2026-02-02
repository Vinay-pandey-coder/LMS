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
// ROUTE: Get single submission by ID (Teacher)
// ============================================
// GET /api/assignment/submission/:submissionId
// Teachers can view a specific submission details
// Response: { submission }
router.get(
  '/submission/:submissionId',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get submission ID from URL
      const submissionId = req.params.submissionId;

      // Find submission by ID and populate student info
      const submission = await AssignmentSubmission.findById(submissionId)
        .populate('studentId', 'name email');

      // If not found, return 404
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
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

// ============================================
// ROUTE: Grade assignment submission (Teacher Only)
// ============================================
// PUT /api/assignment/submission/:submissionId/grade
// Body: { marks, feedback }
// Response: { message, submission }
// Teachers use this to give marks and feedback to a submission
router.put(
  '/submission/:submissionId/grade',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get submission ID from URL
      const submissionId = req.params.submissionId;

      // Get marks and feedback from request body
      const { marks, feedback } = req.body;

      // Validate that marks is provided
      if (marks === undefined || marks === null) {
        return res.status(400).json({ message: 'Marks are required' });
      }

      // Validate that marks is a number
      if (typeof marks !== 'number') {
        return res
          .status(400)
          .json({ message: 'Marks must be a number' });
      }

      // Validate that marks is not negative
      if (marks < 0) {
        return res
          .status(400)
          .json({ message: 'Marks cannot be negative' });
      }

      // Find the submission by ID
      const submission = await AssignmentSubmission.findById(submissionId);

      // If not found, return 404
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      // Update submission with marks
      submission.marks = marks;

      // Update submission with feedback (if provided)
      if (feedback) {
        submission.feedback = feedback;
      }

      // Update status to "checked" (graded)
      submission.status = 'checked';

      // Set grading timestamp to current date/time
      submission.gradedAt = new Date();

      // Also set evaluatedAt for backwards compatibility
      submission.evaluatedAt = new Date();

      // Save updated submission to database
      await submission.save();

      // Return success response with updated data
      return res.status(200).json({
        message: 'Assignment graded successfully',
        submission: {
          _id: submission._id,
          marks: submission.marks,
          feedback: submission.feedback,
          status: submission.status,
          gradedAt: submission.gradedAt,
        },
      });
    } catch (error) {
      // If error, log and return error message
      console.error('Error grading submission:', error);
      return res.status(500).json({ message: 'Error grading submission' });
    }
  }
);

// ============================================
// ROUTE: Get student's assignment result (Student Only)
// ============================================
// GET /api/assignment/:assignmentId/my-submission
// Response: { marks, feedback, submittedAt, gradedAt, status }
// Students use this to see their submission result and feedback
router.get(
  '/:assignmentId/my-submission',
  authMiddleware,
  async (req, res) => {
    try {
      // Get assignment ID from URL parameters
      const assignmentId = req.params.assignmentId;

      // Get student ID from authMiddleware (req.user.id)
      const studentId = req.user.id;

      // Find the submission matching this assignment and student
      const submission = await AssignmentSubmission.findOne({
        assignmentId: assignmentId,
        studentId: studentId,
      });

      // If no submission found, return 404
      if (!submission) {
        return res.status(404).json({
          message: 'Submission not found',
          submission: null,
        });
      }

      // Return submission result with marks and feedback
      return res.status(200).json({
        submission: {
          _id: submission._id,
          marks: submission.marks,
          feedback: submission.feedback,
          submittedAt: submission.submittedAt,
          gradedAt: submission.gradedAt,
          status: submission.status,
          answerText: submission.answerText,
        },
      });
    } catch (error) {
      // If error, log and return error message
      console.error('Error fetching student result:', error);
      return res.status(500).json({
        message: 'Error fetching submission result',
      });
    }
  }
);

// Export router to use in server.js
module.exports = router;