// AddLecture.jsx - Form for teachers to add lectures to a course
// Only teachers can access this page
// Uses Redux auth state for token management
// Submits to POST /api/lecture/create endpoint

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AddLecture = () => {
  // Get token and role from Redux auth state
  const token = useSelector((state) => state.auth.token);
  const userRole = useSelector((state) => state.auth.role);

  // Get courseId from URL parameters
  const { courseId } = useParams();

  // State for form inputs
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    order: '1',
  });

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
          <p className="text-sm">Only teachers can add lectures.</p>
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

    // Validation - title and videoUrl are required
    if (!formData.title.trim()) {
      setError('Lecture title is required');
      return;
    }

    if (!formData.videoUrl.trim()) {
      setError('Video URL is required');
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

      // Prepare lecture data with courseId from URL
      const lectureData = {
        courseId: courseId,
        title: formData.title.trim(),
        videoUrl: formData.videoUrl.trim(),
        order: parseInt(formData.order) || 1, // Convert to number, default 1
      };

      // Call backend API to create lecture
      // Endpoint: POST /api/lecture/create
      // Backend will:
      // 1. Check authMiddleware (verify token)
      // 2. Check roleMiddleware('teacher') (verify user is teacher)
      // 3. Create lecture with courseId from request body
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lecture/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(lectureData),
      });

      // Parse response
      const data = await response.json();

      // Check if request was successful
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add lecture');
      }

      // Show success state and redirect
      setSuccess(true);
      setLoading(false);

      // Redirect to teacher's courses page after 1.5 seconds
      setTimeout(() => {
        navigate('/app/teacher/courses');
      }, 1500);
    } catch (err) {
      console.error('Error adding lecture:', err);
      setError(err.message || 'Failed to add lecture. Please try again.');
      setLoading(false);
    }
  };

  // Show success message
  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p className="font-medium">Lecture added successfully!</p>
          <p className="text-sm">Redirecting to your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Add Lecture to Course</h1>
      <p className="text-gray-600 mb-6">Create a new lecture and add it to your course</p>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Lecture Creation Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        {/* Lecture Title - Required */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Lecture Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Introduction to React Hooks"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Give your lecture a clear, descriptive title</p>
        </div>

        {/* Video URL - Required */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Video URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            placeholder="e.g., https://example.com/video.mp4"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Provide a valid video URL (YouTube, Vimeo, or direct link)</p>
        </div>

        {/* Lecture Order - Optional */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Lecture Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            placeholder="e.g., 1"
            min="1"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <p className="text-sm text-gray-500 mt-1">Set the position of this lecture in your course (default: 1)</p>
        </div>

        {/* Form Actions - Submit and Cancel */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white font-medium py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Adding Lecture...' : 'Add Lecture'}
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
  );
};

export default AddLecture;