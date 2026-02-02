// GradeSubmission.jsx - Teacher Grade Assignment Submission
// Teachers can grade a student submission and provide marks and feedback
// Shows student details, their answer, and form to grade

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function GradeSubmission() {
  // Get submissionId from URL parameters
  const { submissionId } = useParams();

  // Navigation hook to go back
  const navigate = useNavigate();

  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Local state for submission data
  const [submission, setSubmission] = useState(null);

  // Local state for form inputs
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  // Local state for UI feedback
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch submission details when component loads
  useEffect(() => {
    // Function to fetch submission from backend
    const fetchSubmission = async () => {
      // Set fetching state
      setFetching(true);

      // Reset error state
      setError(null);

      try {
        // Call backend to get submission details
        const response = await fetch(
          `http://localhost:3000/api/assignment/submission/${submissionId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Check if response is OK
        if (!response.ok) {
          throw new Error('Failed to fetch submission details');
        }

        // Parse response JSON
        const data = await response.json();

        // Store submission in local state
        setSubmission(data.submission || data);
      } catch (err) {
        // If error, store error message
        console.error('Error fetching submission:', err);
        setError(err.message || 'Error fetching submission details');
      } finally {
        // Always set fetching to false
        setFetching(false);
      }
    };

    // Only fetch if submissionId exists
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  // Handle form submission
  // Send marks and feedback to backend
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault();

    // Reset success message
    setSuccessMessage(null);

    // Validate that marks is provided
    if (marks === '' || marks === null) {
      setError('Marks are required');
      return;
    }

    // Validate that marks is a number
    const marksNumber = parseFloat(marks);
    if (isNaN(marksNumber)) {
      setError('Marks must be a valid number');
      return;
    }

    // Validate that marks is not negative
    if (marksNumber < 0) {
      setError('Marks cannot be negative');
      return;
    }

    // Set loading state
    setLoading(true);

    // Reset error state
    setError(null);

    try {
      // Send grading to backend
      const response = await fetch(
        `http://localhost:3000/api/assignment/submission/${submissionId}/grade`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            marks: marksNumber,
            feedback: feedback || null,
          }),
        }
      );

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grade submission');
      }

      // Parse response
      const data = await response.json();

      // Update submission with new data
      setSubmission(data.submission);

      // Show success message
      setSuccessMessage('Assignment graded successfully!');

      // Clear form after 2 seconds and go back
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      // If error, store error message
      console.error('Error grading submission:', err);
      setError(err.message || 'Error grading submission');
    } finally {
      // Always set loading to false
      setLoading(false);
    }
  };

  // Format date in readable format
  // Example: "Jan 15, 2025 at 2:30 PM"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state while fetching submission
  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          {/* Loading spinner */}
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          {/* Error message box */}
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>

          {/* Go back button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show when submission not found
  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <p className="text-center text-gray-600 mb-4">
            Submission not found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show grading form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Page header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-700 font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Grade Assignment</h1>
        </div>

        {/* Student info card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Student header */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Student</p>
            <p className="text-2xl font-bold text-gray-800">
              {submission.studentId?.name || 'Student'}
            </p>
            {submission.studentId?.email && (
              <p className="text-gray-600">{submission.studentId.email}</p>
            )}
          </div>

          {/* Submission date */}
          <p className="text-sm text-gray-500">
            Submitted: {formatDate(submission.submittedAt)}
          </p>
        </div>

        {/* Student's answer card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Student's Answer
          </h2>

          {/* Answer text in gray box */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {submission.answerText}
            </p>
          </div>
        </div>

        {/* Grading form card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Provide Grade and Feedback
          </h2>

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
              <p className="font-bold">✓ Success</p>
              <p className="text-sm mt-1">{successMessage}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-bold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Grading form */}
          {!successMessage && (
            <form onSubmit={handleSubmit}>
              {/* Marks input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">
                  Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Enter marks (e.g., 85)"
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a non-negative number
                </p>
              </div>

              {/* Feedback textarea */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">
                  Feedback <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write feedback or comments for the student (optional)..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Help the student improve with constructive feedback
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-400 transition"
              >
                {loading ? 'Grading...' : 'Submit Grade'}
              </button>
            </form>
          )}

          {/* After successful submission */}
          {successMessage && (
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600 transition"
            >
              Go Back to Submissions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}