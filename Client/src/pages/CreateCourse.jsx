// CreateCourse.jsx - Form for teachers to create new courses
// Only teachers can access this page
// Uses Redux auth state for token management
// Submits to POST /api/course/create endpoint

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CreateCourse = () => {
  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Get role from Redux to verify this is a teacher
  const userRole = useSelector((state) => state.auth.role);

  // State for form inputs (only title and description required)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
          <p className="text-sm">Only teachers can create courses.</p>
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

    // Validation - title and description are required
    if (!formData.title.trim()) {
      setError('Course title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Course description is required');
      return;
    }

    // Verify token exists before making request
    if (!token) {
      setError('Authentication error. Please login again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call backend API to create course
      // Endpoint: POST /api/course/create
      // Backend will:
      // 1. Check authMiddleware (verify token)
      // 2. Check roleMiddleware('teacher') (verify user is teacher)
      // 3. Create course with teacherId = req.user.id
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/course/create`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(formData),
       });

      // Parse response
      const data = await response.json();

      // Check if request was successful
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }

      // Show success state and redirect
      setSuccess(true);
      setLoading(false);

      // Redirect to teacher's courses page after 1.5 seconds
      setTimeout(() => {
        navigate('/app/teacher/courses');
      }, 1500);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err.message || 'Failed to create course. Please try again.');
      setLoading(false);
    }
  };

  // Show success message
  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p className="font-medium">Course created successfully!</p>
          <p className="text-sm">Redirecting to your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Course Creation Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        {/* Course Title - Required */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Course Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Introduction to React"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Give your course a clear, descriptive title</p>
        </div>

        {/* Course Description - Required */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what students will learn in this course..."
            rows="5"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Explain the course objectives and content</p>
        </div>

        {/* Form Actions - Submit and Cancel */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white font-medium py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Creating Course...' : 'Create Course'}
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

export default CreateCourse;