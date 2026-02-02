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
// GET ALL QUIZZES FOR A COURSE (STUDENT)
// ============================================
// GET /api/test/course/:courseId
router.get(
  '/course/:courseId',
  authMiddleware,
  async (req, res) => {
    try {
      const { courseId } = req.params;

      // Find all tests linked to this course
      const tests = await Test.find({ courseId }).select('_id title');

      return res.status(200).json({
        tests,
      });
    } catch (error) {
      console.error('Error fetching quizzes by course:', error);
      return res.status(500).json({
        message: 'Error fetching quizzes',
      });
    }
  }
);

// ============================================
// ROUTE 3: Get quiz results (Teacher Only)
// ============================================
// GET /api/test/:testId/results
// Purpose: Teachers view all student results for a quiz
// Response: Array of results with student info
router.get(
  '/:testId/results',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get testId from URL params
      const { testId } = req.params;

      // Validate testId
      if (!testId) {
        return res.status(400).json({ message: 'Test ID is required' });
      }

      // Find test to verify it exists
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }

      // Find all results for this test
      // Populate studentId with name and email from User model
      const results = await TestResult.find({ testId: testId })
        .populate('studentId', 'name email')
        .sort({ submittedAt: -1 });

      // Get total questions for this test
      const questions = await Question.find({ testId: testId });
      const totalQuestions = questions.length;

      // Format response with student info and scores
      const formattedResults = results.map((result) => ({
        _id: result._id,
        studentName: result.studentId.name,
        studentEmail: result.studentId.email,
        score: result.score,
        correctAnswers: Math.round(
          (result.score / 100) * totalQuestions
        ),
        totalQuestions: totalQuestions,
        submittedAt: result.submittedAt,
      }));

      // Return results
      return res.status(200).json({
        message: 'Quiz results fetched successfully',
        testId: testId,
        testTitle: test.title,
        results: formattedResults,
        totalResults: formattedResults.length,
      });
    } catch (error) {
      console.error('Error fetching test results:', error);
      return res.status(500).json({ message: 'Error fetching test results' });
    }
  }
);

// ============================================
// ROUTE 4: Get test with questions (Student)
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

// ============================================ 
// ROUTE 5: Get quiz results (Teacher Only)
// ============================================ 
// GET /api/test/:testId/results
// Response: { results: [ { studentName, studentEmail, score, correctAnswers, totalQuestions, submittedAt } ] }
router.get(
  '/:testId/results',
  authMiddleware,
  roleMiddleware('teacher'),
  async (req, res) => {
    try {
      // Get testId from URL parameters
      const { testId } = req.params;

      // Validate testId
      if (!testId) {
        return res.status(400).json({ message: 'Test ID is required' });
      }

      // Check if test exists
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }

      // Find all test results for this test
      // Populate studentId to get student name and email
      const testResults = await TestResult.find({ testId: testId })
        .populate('studentId', 'name email')
        .sort({ submittedAt: -1 });

      // If no results found, return empty array
      if (!testResults || testResults.length === 0) {
        return res.status(200).json({
          message: 'No submissions yet',
          results: [],
        });
      }

      // Format results for frontend
      const formattedResults = testResults.map((result) => {
        // Count correct answers from the answers array
        const correctCount = result.answers.filter((ans) => ans.isCorrect).length;
        const totalQuestions = result.answers.length;

        return {
          _id: result._id,
          studentName: result.studentId.name,
          studentEmail: result.studentId.email,
          score: result.score,
          correctAnswers: correctCount,
          totalQuestions: totalQuestions,
          submittedAt: result.submittedAt,
        };
      });

      // Return formatted results
      return res.status(200).json({
        message: 'Quiz results fetched successfully',
        results: formattedResults,
      });
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      return res.status(500).json({ message: 'Error fetching quiz results' });
    }
  }
);

// Export router to use in server.js
module.exports = router;