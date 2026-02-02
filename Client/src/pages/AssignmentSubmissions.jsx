// AssignmentSubmissions.jsx - Teacher View Assignment Submissions
// Teachers can see all student submissions for an assignment
// Shows student details, answers, and submission dates

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AssignmentSubmissions() {
  // Get assignmentId from URL parameters
  const { assignmentId } = useParams();

  // Navigation hook to go back
  const navigate = useNavigate();

  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Local state for submissions data
  const [submissions, setSubmissions] = useState([]);

  // Local state for loading
  const [loading, setLoading] = useState(false);

  // Local state for error messages
  const [error, setError] = useState(null);

  // Fetch submissions when component loads
  useEffect(() => {
    // Function to fetch submissions from backend
    const fetchSubmissions = async () => {
      // Set loading state
      setLoading(true);

      // Reset error state
      setError(null);

      try {
        // Call backend to get all submissions for this assignment
        const response = await fetch(
          `http://localhost:3000/api/assignment/${assignmentId}/submissions`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Check if response is OK
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        // Parse response JSON
        const data = await response.json();

        // Store submissions in local state
        setSubmissions(data.submissions || []);
      } catch (err) {
        // If error, store error message
        console.error('Error fetching submissions:', err);
        setError(err.message || 'Error fetching submissions');
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    // Only fetch if assignmentId exists
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          {/* Loading spinner */}
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
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

  // Show when no submissions
  if (submissions.length === 0) {
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
              Assignment Submissions
            </h1>
          </div>

          {/* Empty state message */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No submissions yet</p>
            <p className="text-gray-500 mt-2">
              Students have not submitted this assignment
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show submissions list
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
            Assignment Submissions
          </h1>
          <p className="text-gray-600 mt-2">
            Total submissions: {submissions.length}
          </p>
        </div>

        {/* Submissions list */}
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              {/* Student header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  {/* Student name - bold and large */}
                  <p className="text-xl font-bold text-gray-800">
                    {submission.studentId.name}
                  </p>
                  {/* Student email - smaller, gray */}
                  <p className="text-gray-600">{submission.studentId.email}</p>
                </div>

                {/* Submission date - top right */}
                <p className="text-sm text-gray-500">
                  {formatDate(submission.submittedAt)}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Answer text in gray box */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {submission.answerText}
                </p>
              </div>

              {/* Submission status (if available) */}
              {submission.status && (
                <div className="mt-4">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      submission.status === 'checked'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {submission.status === 'checked'
                      ? '✓ Graded'
                      : 'Pending Grading'}
                  </span>
                </div>
              )}

              {/* Marks if available */}
              {submission.marks !== null && submission.marks !== undefined && (
                <div className="mt-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Marks:</span>{' '}
                    {submission.marks}
                  </p>
                </div>
              )}

              {/* Grade button - only show if not yet graded */}
              {submission.status !== 'checked' && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      navigate(
                        `/app/submission/${submission._id}/grade`
                      )
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Grade
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}