// CreateQuiz.jsx - Form for teachers to create a quiz for a course
// Only teachers can access this page
// Uses Redux auth state for token management
// Submits to POST /api/test/create endpoint

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CreateQuiz = () => {
  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Get role from localStorage to verify this is a teacher
  const userRole = localStorage.getItem('userRole');

  // Get courseId from URL parameters
  const { courseId } = useParams();

  // State for form input
  const [title, setTitle] = useState('');

  // State for form submission feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Router navigation
  const navigate = useNavigate();

  // Role check - redirect if not a teacher
  if (userRole !== 'teacher') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm">Only teachers can create quizzes.</p>
        </div>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation - title is required
    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    // Verify token exists before making request
    if (!token) {
      setError('Authentication error. Please login again.');
      return;
    }

    // Verify courseId exists
    if (!courseId) {
      setError('Course ID is missing. Please access this page from a course.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare quiz data with courseId from URL
      const quizData = {
        courseId: courseId,
        title: title.trim(),
      };

      // Call backend API to create quiz
      // Endpoint: POST /api/test/create
      // Backend will:
      // 1. Check authMiddleware (verify token)
      // 2. Check roleMiddleware('teacher') (verify user is teacher)
      // 3. Create quiz with createdBy = req.user.id
      // 4. Return testId (quiz ID)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test/create`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(quizData),
       });

      // Parse response
      const data = await response.json();

      // Check if request was successful
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create quiz');
      }

      // Quiz created successfully
      // Get the testId from response
      const testId = data.testId;

      // Show success state and redirect to add questions page
      setSuccess(true);
      setLoading(false);

      // Redirect to add questions page after 1.5 seconds
      // Teacher will add questions to the quiz on the next page
      setTimeout(() => {
        navigate(`/app/teacher/quiz/${testId}/add-question`);
      }, 1500);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.message || 'Failed to create quiz. Please try again.');
      setLoading(false);
    }
  };

  // Show success message
  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p className="font-medium">Quiz created successfully!</p>
          <p className="text-sm">Redirecting to add questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Create Quiz</h1>
          <p className="text-gray-600 text-center mb-6">Create a new quiz for your course</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Quiz Creation Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Title - Required */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., React Fundamentals Quiz"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Give your quiz a clear, descriptive title</p>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white font-medium py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 cursor-pointer"
              >
                {loading ? 'Creating Quiz...' : 'Create Quiz'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/teacher/courses')}
                className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-400 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;