// test.js - Quiz/Test Routes
// Routes for creating tests, adding questions, taking tests, and submitting answers

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Import models
const Test = require('../model/Testmodel');
const Question = require('../model/Questionmodel');
const TestResult = require('../model/TestResultmodel');

// ============================================
// ROUTE 1: Create a new test (Teacher Only)
// ============================================
// POST /api/test/create
// Body: { title, courseId }
// Response: { testId, message }
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get title and courseId from request body
      const { title, courseId } = req.body;

      // Validate that title is provided
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      // Validate that courseId is provided
      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Create new test object
      // createdBy is the teacher (from authMiddleware)
      const newTest = new Test({
        title: title,
        courseId: courseId,
        createdBy: req.user.id, // User ID set by authMiddleware
      });

      // Save test to database
      await newTest.save();

      // Return success response with test ID
      return res.status(201).json({
        message: 'Test created successfully',
        testId: newTest._id,
      });
    } catch (error) {
      console.error('Error creating test:', error);
      return res.status(500).json({ message: 'Error creating test' });
    }
  }
);

// ============================================
// ROUTE 2: Add question to test (Teacher Only)
// ============================================
// POST /api/test/question
// Body: { testId, questionText, options, correctAnswer }
// Response: { questionId, message }
router.post(
  '/question',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get question details from request body
      const { testId, questionText, options, correctAnswer } = req.body;

      // Validate required fields
      if (!testId) {
        return res.status(400).json({ message: 'Test ID is required' });
      }

      if (!questionText) {
        return res.status(400).json({ message: 'Question text is required' });
      }

      if (!options || options.length === 0) {
        return res.status(400).json({ message: 'Options are required' });
      }

      if (!correctAnswer) {
        return res.status(400).json({ message: 'Correct answer is required' });
      }

      // Verify that correctAnswer is one of the options
      if (!options.includes(correctAnswer)) {
        return res.status(400).json({
          message: 'Correct answer must be one of the options',
        });
      }

      // Check if test exists
      const testExists = await Test.findById(testId);
      if (!testExists) {
        return res.status(404).json({ message: 'Test not found' });
      }

      // Create new question object
      const newQuestion = new Question({
        testId: testId,
        questionText: questionText,
        options: options,
        correctAnswer: correctAnswer,
      });

      // Save question to database
      await newQuestion.save();

      // Return success response
      return res.status(201).json({
        message: 'Question added successfully',
        questionId: newQuestion._id,
      });
    } catch (error) {
      console.error('Error adding question:', error);
      return res.status(500).json({ message: 'Error adding question' });
    }
  }
);

// ============================================
// ROUTE 3: Get test with questions (Student)
// ============================================
// GET /api/test/:testId
// Response: { test, questions }
// Note: Correct answers are NOT included (for security)
router.get('/:testId', authMiddleware, async (req, res) => {
  try {
    // Get test ID from URL parameters
    const testId = req.params.testId;

    // Find test by ID
    const test = await Test.findById(testId);

    // If test doesn't exist, return 404
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Find all questions for this test
    // Use projection to hide the correctAnswer field
    const questions = await Question.find({ testId: testId }).select(
      '-correctAnswer'
    );

    // Return test and questions
    // Note: correctAnswer is NOT included in questions
    return res.status(200).json({
      test: {
        _id: test._id,
        title: test.title,
        courseId: test.courseId,
      },
      questions: questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    return res.status(500).json({ message: 'Error fetching test' });
  }
});

// ============================================
// ROUTE 4: Submit test answers (Student)
// ============================================
// POST /api/test/submit
// Body: { testId, answers }
// answers format: [
//   { questionId: "...", selectedAnswer: "Option A" },
//   { questionId: "...", selectedAnswer: "Option B" }
// ]
// Response: { score, answers, message }
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    // Get test ID and answers from request body
    const { testId, answers } = req.body;

    // Validate required fields
    if (!testId) {
      return res.status(400).json({ message: 'Test ID is required' });
    }

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    // Find the test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Find all questions for this test
    // Need this to check correct answers
    const questions = await Question.find({ testId: testId });

    // Create object to map questionId to correct answer
    // Makes it easier to check if student's answer is correct
    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q.correctAnswer;
    });

    // Array to store which answers were correct
    let correctCount = 0;
    const processedAnswers = [];

    // Loop through each answer submitted by student
    answers.forEach((answer) => {
      // Get the correct answer from our map
      const correctAnswer = questionMap[answer.questionId];

      // Check if student's answer matches the correct answer
      const isCorrect = answer.selectedAnswer === correctAnswer;

      // If correct, increment score
      if (isCorrect) {
        correctCount++;
      }

      // Store the processed answer with correctness flag
      processedAnswers.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: isCorrect,
      });
    });

    // Calculate score as percentage
    // Example: 3 correct out of 5 = 60%
    const score = Math.round((correctCount / questions.length) * 100);

    // Create test result object
    const testResult = new TestResult({
      testId: testId,
      studentId: req.user.id, // From authMiddleware
      score: score,
      answers: processedAnswers,
    });

    // Save test result to database
    await testResult.save();

    // Return score and answer details
    return res.status(200).json({
      message: 'Test submitted successfully',
      testResult: {
        _id: testResult._id,
        score: score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
      },
      answers: processedAnswers,
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({ message: 'Error submitting test' });
  }
});

// Export router to use in server.js
module.exports = router;