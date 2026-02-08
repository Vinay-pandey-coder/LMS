// AssignmentResult.jsx - Student View Assignment Result
// Shows student their marks, feedback, and submission status
// Displays teacher's feedback and score for a submitted assignment

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AssignmentResult() {
  // Get assignmentId from URL parameters
  const { assignmentId } = useParams();

  // Navigation hook to go back
  const navigate = useNavigate();

  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Local state for submission result
  const [submission, setSubmission] = useState(null);

  // Local state for loading
  const [loading, setLoading] = useState(false);

  // Local state for error messages
  const [error, setError] = useState(null);

  // Fetch submission result when component loads
  useEffect(() => {
    // Function to fetch result from backend
    const fetchResult = async () => {
      // Set loading state
      setLoading(true);

      // Reset error state
      setError(null);

      try {
        // Call backend to get student's submission result
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/assignment/${assignmentId}/my-submission`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Check if response is OK
        if (!response.ok) {
          // If 404, means student hasn't submitted
          if (response.status === 404) {
            setSubmission(null);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch result');
        }

        // Parse response JSON
        const data = await response.json();

        // Store submission result in local state
        setSubmission(data.submission || null);
      } catch (err) {
        // If error, store error message
        console.error('Error fetching result:', err);
        setError(err.message || 'Error fetching assignment result');
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    // Only fetch if assignmentId exists
    if (assignmentId) {
      fetchResult();
    }
  }, [assignmentId]);

  // Format date in readable format
  // Example: "Jan 15, 2025 at 2:30 PM"
  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet graded';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          {/* Loading spinner */}
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading assignment result...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
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

  // Show when student hasn't submitted
  if (!submission) {
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
            <h1 className="text-3xl font-bold text-gray-800">
              Assignment Result
            </h1>
          </div>

          {/* Not submitted card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">
                You haven't submitted this assignment yet
              </p>
              <p className="text-gray-500 mb-6">
                Submit your assignment to receive marks and feedback from your teacher
              </p>

              {/* Go back button */}
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Go Back to Assignments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show assignment result
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
          <h1 className="text-3xl font-bold text-gray-800">
            Assignment Result
          </h1>
        </div>

        {/* Submission status card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Status indicator */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                submission.status === 'checked'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {submission.status === 'checked'
                ? '✓ Graded'
                : '⏳ Pending Grading'}
            </span>
          </div>

          {/* Submission dates */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Submitted:</span>{' '}
              {formatDate(submission.submittedAt)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Graded:</span>{' '}
              {submission.status === 'checked'
                ? formatDate(submission.gradedAt)
                : 'Not yet graded'}
            </p>
          </div>
        </div>

        {/* Marks card - Show if graded */}
        {submission.status === 'checked' &&
          submission.marks !== null &&
          submission.marks !== undefined && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Your Marks</p>
                <p className="text-5xl font-bold text-blue-600">
                  {submission.marks}
                </p>
                <p className="text-gray-500 mt-2">
                  out of 100 (or your school's scale)
                </p>
              </div>
            </div>
          )}

        {/* Feedback card - Show if available */}
        {submission.status === 'checked' && submission.feedback && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Teacher's Feedback
            </h2>

            {/* Feedback text in bordered box */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {submission.feedback}
              </p>
            </div>
          </div>
        )}

        {/* Not graded yet card */}
        {submission.status !== 'checked' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center">
              <p className="text-gray-600 text-lg">
                Your assignment has been submitted
              </p>
              <p className="text-gray-500 mt-2">
                Your teacher will review it soon. Check back for marks and
                feedback!
              </p>
            </div>
          </div>
        )}

        {/* Your answer card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Your Submission
          </h2>

          {/* Submitted answer in gray box */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {submission.answerText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}