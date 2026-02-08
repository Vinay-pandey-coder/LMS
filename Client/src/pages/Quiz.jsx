
// Quiz.jsx - Quiz/Test Page
// Allows students to take a quiz and submit answers
// Shows questions, collects answers, and displays score

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setQuiz, setLoading, setError, setResult } from '../features/quiz/quizSlice';

export default function Quiz() {
  // Get testId from URL parameters (/:testId)
  const { testId } = useParams();

  // Navigation hook to go back after submitting
  const navigate = useNavigate();

  // Redux dispatch to update state
  const dispatch = useDispatch();

  // Read quiz data from Redux store
  const { quiz, result, loading, error } = useSelector((state) => state.quiz);

  // Read token from auth for API requests
  const token = useSelector((state) => state.auth.token);

  // Local state for selected answers
  // Format: { questionId: "selected answer text" }
  const [answers, setAnswers] = useState({});

  // Fetch quiz when component loads
  useEffect(() => {
    // Only fetch if testId exists and quiz not already loaded
    if (!testId || quiz) return;

    // Function to fetch quiz from backend
    const fetchQuiz = async () => {
      // Set loading state
      dispatch(setLoading(true));

      try {
        // Call backend to get quiz questions
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/test/${testId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Check if response is OK
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }

        // Parse response JSON
        const data = await response.json();

        // Store quiz in Redux
        dispatch(setQuiz(data));
      } catch (err) {
        // If error, store error message
        console.error('Error fetching quiz:', err);
        dispatch(setError(err.message || 'Error fetching quiz'));
      } finally {
        // Always set loading to false when done
        dispatch(setLoading(false));
      }
    };

    // Call fetch function
    fetchQuiz();
  }, [testId, quiz, token, dispatch]);

  // Handle answer selection
  // When user clicks an option, update local state
  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer,
    });
  };

  // Handle form submission
  // Collect all answers and send to backend
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault();

    // Validate that all questions are answered
    if (Object.keys(answers).length !== quiz.questions.length) {
      dispatch(setError('Please answer all questions'));
      return;
    }

    // Set loading state
    dispatch(setLoading(true));

    try {
      // Format answers as required by backend
      // Convert { questionId: "answer" } to [ { questionId: "...", selectedAnswer: "..." } ]
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId: questionId,
        selectedAnswer: answers[questionId],
      }));

      // Send answers to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: testId,
          answers: formattedAnswers,
        }),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      // Parse response
      const data = await response.json();

      // Store result in Redux
      // Result contains score, correctAnswers, totalQuestions
      dispatch(setResult(data.testResult));
    } catch (err) {
      // If error, store error message
      console.error('Error submitting quiz:', err);
      dispatch(setError(err.message || 'Error submitting quiz'));
    } finally {
      // Always set loading to false
      dispatch(setLoading(false));
    }
  };

  // Show loading state
  if (loading && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show result after submission
  if (result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4">Quiz Complete!</h2>

          {/* Score display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
            <p className="text-gray-600 mb-2">Your Score</p>
            <p className="text-4xl font-bold text-blue-600">{result.score}%</p>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-6 text-center">
            <p className="text-gray-600">
              Correct Answers: <span className="font-bold">{result.correctAnswers}</span>
            </p>
            <p className="text-gray-600">
              Total Questions: <span className="font-bold">{result.totalQuestions}</span>
            </p>
          </div>

          {/* Go back button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show quiz form
  if (quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Quiz header */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{quiz.test.title}</h1>
            <p className="text-gray-600 mt-2">
              Total Questions: {quiz.totalQuestions}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Quiz form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Render each question */}
              {quiz.questions.map((question, index) => (
                <div
                  key={question._id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  {/* Question number and text */}
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Question {index + 1}: {question.questionText}
                  </h3>

                  {/* Radio buttons for options */}
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                      >
                        {/* Radio button */}
                        <input
                          type="radio"
                          name={question._id}
                          value={option}
                          checked={answers[question._id] === option}
                          onChange={() =>
                            handleAnswerSelect(question._id, option)
                          }
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        {/* Option text */}
                        <span className="ml-3 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 disabled:bg-gray-400 transition"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}
