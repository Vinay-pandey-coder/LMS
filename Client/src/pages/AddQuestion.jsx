// AddQuestion.jsx - Form for teachers to add questions to a quiz
// Only teachers can access this page
// Uses Redux auth state for token management
// Submits to POST /api/test/question endpoint

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AddQuestion = () => {
  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Get role from localStorage to verify this is a teacher
  const userRole = localStorage.getItem('userRole');

  // Get testId from URL parameters
  const { testId } = useParams();

  // State for form inputs
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });

  // State for form submission feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Router navigation
  const navigate = useNavigate();

  // Role check - redirect if not a teacher
  if (userRole !== 'teacher') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm">Only teachers can add questions.</p>
        </div>
      </div>
    );
  }

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation - all fields required
    if (!formData.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (!formData.optionA.trim()) {
      setError('Option A is required');
      return;
    }

    if (!formData.optionB.trim()) {
      setError('Option B is required');
      return;
    }

    if (!formData.optionC.trim()) {
      setError('Option C is required');
      return;
    }

    if (!formData.optionD.trim()) {
      setError('Option D is required');
      return;
    }

    // Verify token exists before making request
    if (!token) {
      setError('Authentication error. Please login again.');
      return;
    }

    // Verify testId exists
    if (!testId) {
      setError('Quiz ID is missing. Please access this page from a quiz.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare question data with testId from URL
      const questionData = {
        testId: testId,
        questionText: formData.questionText.trim(),
        options: [
          formData.optionA.trim(),
          formData.optionB.trim(),
          formData.optionC.trim(),
          formData.optionD.trim(),
        ],
        correctAnswer: formData.correctAnswer,
      };

      // Call backend API to add question
      // Endpoint: POST /api/test/question
      // Backend will:
      // 1. Check authMiddleware (verify token)
      // 2. Check roleMiddleware('teacher') (verify user is teacher)
      // 3. Validate correctAnswer exists in options
      // 4. Create question with testId reference
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      // Parse response
      const data = await response.json();

      // Check if request was successful
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add question');
      }

      // Show success state and clear form
      setSuccess(true);
      setSuccessMessage(`Question added successfully! Question ID: ${data.questionId}`);
      setLoading(false);

      // Clear form for next question
      setFormData({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding question:', err);
      setError(err.message || 'Failed to add question. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Add Questions to Quiz</h1>
      <p className="text-gray-600 mb-6">Add multiple-choice questions to your quiz</p>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Question Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Question Text - Required */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            placeholder="Enter the question..."
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Option A <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="optionA"
              value={formData.optionA}
              onChange={handleInputChange}
              placeholder="Enter option A"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Option B */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Option B <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="optionB"
              value={formData.optionB}
              onChange={handleInputChange}
              placeholder="Enter option B"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Option C */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Option C <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="optionC"
              value={formData.optionC}
              onChange={handleInputChange}
              placeholder="Enter option C"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Option D */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Option D <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="optionD"
              value={formData.optionD}
              onChange={handleInputChange}
              placeholder="Enter option D"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
        </div>

        {/* Correct Answer Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Correct Answer <span className="text-red-500">*</span>
          </label>
          <select
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          >
            <option value="A">Option A</option>
            <option value="B">Option B</option>
            <option value="C">Option C</option>
            <option value="D">Option D</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white font-medium py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Adding Question...' : 'Add Question'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/teacher/courses')}
            className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-400 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <p className="font-medium">💡 Tip</p>
        <p className="text-sm">You can add as many questions as you want. Click "Add Question" after each one to continue adding more questions to this quiz.</p>
      </div>
    </div>
  );
};

export default AddQuestion;