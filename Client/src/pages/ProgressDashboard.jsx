// ProgressDashboard.jsx - Student Progress Summary
// Shows student's course progress including lectures watched, quizzes, assignments
// Displays completion percentage and other progress metrics

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProgressDashboard() {
  // Get courseId from URL parameters
  const { courseId } = useParams();

  // Navigation hook to go back
  const navigate = useNavigate();

  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Local state for progress data
  const [progress, setProgress] = useState(null);

  // Local state for loading
  const [loading, setLoading] = useState(false);

  // Local state for error messages
  const [error, setError] = useState(null);

  // Local state for certificate download loading
  const [certificateLoading, setCertificateLoading] = useState(false);

  // Local state for certificate error messages
  const [certificateError, setCertificateError] = useState(null);

  // Fetch progress summary when component loads
  useEffect(() => {
    // Function to fetch progress from backend
    const fetchProgress = async () => {
      // Set loading state
      setLoading(true);

      // Reset error state
      setError(null);

      try {
        // Call backend to get progress summary
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/progress/summary/${courseId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Check if response is OK
        if (!response.ok) {
          throw new Error('Failed to fetch progress summary');
        }

        // Parse response JSON
        const data = await response.json();

        // Store progress data in local state
        setProgress(data);
      } catch (err) {
        // If error, store error message
        console.error('Error fetching progress:', err);
        setError(err.message || 'Error fetching progress summary');
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    // Only fetch if courseId exists
    if (courseId) {
      fetchProgress();
    }
  }, [courseId]);

  // ============================================
  // HANDLE CERTIFICATE DOWNLOAD
  // ============================================
  // Function to download certificate as PDF
  const handleGenerateCertificate = async () => {
    try {
      // Reset certificate error
      setCertificateError(null);

      // Set loading state
      setCertificateLoading(true);

      // Check if token exists
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Call backend API to generate certificate
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/certificate/course/${courseId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Check if response is OK
      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to generate certificate'
        );
      }

      // Convert response to blob (PDF file)
      const pdfBlob = await response.blob();

      // Create a temporary URL for the blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Create a temporary <a> element to trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'certificate.pdf';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(pdfUrl);

      console.log('Certificate downloaded successfully');
    } catch (err) {
      // Store error message
      console.error('Certificate download error:', err);
      setCertificateError(
        err.message || 'Error generating certificate. Please try again.'
      );
    } finally {
      // Always set loading to false
      setCertificateLoading(false);
    }
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
          <p className="mt-4 text-gray-600">Loading your progress...</p>
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

  // Show when no progress data
  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <p className="text-center text-gray-600 mb-4">
            No progress data available
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

  // Show progress dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-700 font-medium mb-4"
          >
            ← Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-800">My Progress</h1>
          <p className="text-gray-600 mt-2">
            Track your course completion and performance
          </p>
        </div>

        {/* Main progress cards container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Lecture Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Lecture Progress
            </h2>

            {/* Lectures watched info */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-2">
                Lectures Watched
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {progress.lectures.watched} / {progress.lectures.total}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress.completionPercent}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {progress.completionPercent}% Complete
              </p>
            </div>

            {/* Additional info */}
            <p className="text-sm text-gray-500">
              {progress.lectures.total - progress.lectures.watched} lectures
              remaining
            </p>
          </div>

          {/* Quiz Performance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Quiz Performance
            </h2>

            {/* Quiz score or not attempted */}
            {progress.quizzes.averageScore !== null ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {progress.quizzes.averageScore}%
                  </p>
                </div>

                {/* Quizzes attempted */}
                <p className="text-sm text-gray-600">
                  Quizzes Attempted: {progress.quizzes.attempted}
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-2">
                  No quizzes attempted yet
                </p>
                <p className="text-sm text-gray-500">
                  Start taking quizzes to see your performance
                </p>
              </div>
            )}
          </div>

          {/* Assignment Status Card - Full Width */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Assignment Status
            </h2>

            {/* Two column layout for assignments */}
            <div className="grid grid-cols-2 gap-6">
              {/* Submitted assignments */}
              <div>
                <p className="text-gray-600 text-sm mb-2">
                  Submitted
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {progress.assignments.submitted}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  assignments submitted
                </p>
              </div>

              {/* Graded assignments */}
              <div>
                <p className="text-gray-600 text-sm mb-2">
                  Graded
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {progress.assignments.graded}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  assignments graded
                </p>
              </div>
            </div>

            {/* Grading progress if submitted */}
            {progress.assignments.submitted > 0 && (
              <div className="mt-6">
                <p className="text-gray-600 text-sm mb-2">
                  Grading Progress
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        progress.assignments.submitted > 0
                          ? (progress.assignments.graded /
                              progress.assignments.submitted) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {progress.assignments.submitted -
                    progress.assignments.graded}{' '}
                  assignments pending grading
                </p>
              </div>
            )}
          </div>

          {/* Completion Summary Card - Full Width */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md p-6 md:col-span-2 border-l-4 border-blue-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Overall Progress
            </h2>

            {/* Main completion display */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">
                  Course Completion
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  {progress.completionPercent}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Based on lectures watched
                </p>
              </div>

              {/* Progress indicator icon */}
              <div className="text-6xl">
                {progress.completionPercent === 100 ? (
                  <span>🎉</span>
                ) : progress.completionPercent >= 75 ? (
                  <span>📈</span>
                ) : progress.completionPercent >= 50 ? (
                  <span>⚡</span>
                ) : (
                  <span>🚀</span>
                )}
              </div>
            </div>

            {/* Motivational message */}
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
              {progress.completionPercent === 100 ? (
                <p className="text-sm text-gray-700">
                  ✨ Congratulations! You've completed all lectures!
                </p>
              ) : progress.completionPercent >= 75 ? (
                <p className="text-sm text-gray-700">
                  🎯 Great progress! You're almost there!
                </p>
              ) : progress.completionPercent >= 50 ? (
                <p className="text-sm text-gray-700">
                  💪 You're halfway through! Keep going!
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  👋 Just getting started. Watch more lectures to progress!
                </p>
              )}
            </div>
          </div>

          {/* Certificate Section - Show if course is 100% complete */}
          {progress.completionPercent === 100 ? (
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-md p-6 md:col-span-2 border-l-4 border-green-500">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                🎓 Certificate of Completion
              </h2>

              {/* Certificate ready message */}
              <p className="text-gray-700 mb-4">
                Congratulations! You've completed all course requirements. Download your certificate to showcase your achievement.
              </p>

              {/* Show certificate error if any */}
              {certificateError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                  <p className="font-bold text-sm">Certificate Error</p>
                  <p className="text-sm">{certificateError}</p>
                </div>
              )}

              {/* Download certificate button */}
              <button
                onClick={handleGenerateCertificate}
                disabled={certificateLoading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-200 ${
                  certificateLoading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {certificateLoading ? (
                  <span className="flex items-center justify-center">
                    {/* Loading spinner */}
                    <span className="inline-block animate-spin mr-2">
                      ⏳
                    </span>
                    Generating certificate...
                  </span>
                ) : (
                  <span>📥 Download Certificate</span>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg shadow-md p-6 md:col-span-2 border-l-4 border-gray-400">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                🎓 Certificate of Completion
              </h2>

              {/* Message when course is not 100% complete */}
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                <p className="font-bold text-sm mb-2">Complete the course to unlock certificate</p>
                <p className="text-sm">
                  You're {100 - progress.completionPercent}% away from earning your certificate.
                  Watch the remaining {progress.lectures.total - progress.lectures.watched} lecture(s)
                  to complete the course.
                </p>
              </div>

              {/* Progress reminder */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress.completionPercent}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Current Progress: {progress.completionPercent}% / 100% required
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 font-medium"
          >
            Back to Course
          </button>
          <button
            onClick={() => navigate(`/app/course/${courseId}/assignment`)}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-medium"
          >
            View Assignments
          </button>
        </div>
      </div>
    </div>
  );
}