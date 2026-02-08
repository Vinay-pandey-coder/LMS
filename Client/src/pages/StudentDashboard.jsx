
// StudentDashboard.jsx - Student Dashboard Summary
// Shows student's overview: enrolled courses, completed courses, quiz scores, pending assignments
// Displays key statistics for the student's learning journey

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';

export default function StudentDashboard() {
  // Navigation hook to redirect
  const navigate = useNavigate();

  // Local state for dashboard data
  const [dashboard, setDashboard] = useState(null);

  // Local state for loading
  const [loading, setLoading] = useState(false);

  // Local state for error messages
  const [error, setError] = useState(null);

  // Fetch dashboard summary when component loads
  useEffect(() => {
    // Function to fetch student dashboard from backend
    const fetchDashboard = async () => {
      // Set loading state
      setLoading(true);

      // Reset error state
      setError(null);

      try {
        // Call backend to get student dashboard
        const response = await apiGet('/dashboard/student');

        // Check if response is OK
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch student dashboard');
        }

        // Parse response JSON
        const data = await response.json();

        // Store dashboard data in local state
        setDashboard(data);
      } catch (err) {
        // If error, store error message
        console.error('Error fetching student dashboard:', err);
        setError(err.message || 'Error fetching dashboard');
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    // Fetch dashboard when component mounts
    fetchDashboard();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          {/* Loading spinner */}
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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

  // Show when no dashboard data
  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <p className="text-center text-gray-600 mb-4">
            No dashboard data available
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

  // Show student dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's your learning summary
          </p>
        </div>

        {/* Dashboard cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Enrolled Courses */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Enrolled Courses
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-blue-600">
                  {dashboard.totalEnrolledCourses}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">📚</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              Total courses you're enrolled in
            </p>
          </div>

          {/* Card 2: Completed Courses */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Completed Courses
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-green-600">
                  {dashboard.completedCourses}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">✅</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              Courses you've finished
            </p>
          </div>

          {/* Card 3: Average Quiz Score */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Average Quiz Score
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-yellow-600">
                  {dashboard.averageQuizScore !== null
                    ? `${dashboard.averageQuizScore}%`
                    : 'N/A'}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">📊</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              {dashboard.averageQuizScore !== null
                ? 'Your average score'
                : 'No quizzes attempted yet'}
            </p>
          </div>

          {/* Card 4: Pending Assignments */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Pending Assignments
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-red-600">
                  {dashboard.pendingAssignments}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">📝</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              Assignments awaiting grading
            </p>
          </div>
        </div>

        {/* Summary section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h2>

          {/* Stats content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stat 1 */}
            <div>
              <p className="text-gray-700 font-medium">Learning Progress</p>
              <p className="text-sm text-gray-600 mt-1">
                You're enrolled in {dashboard.totalEnrolledCourses} course(s).
                {dashboard.completedCourses > 0 ? (
                  <span>
                    {' '}You've completed {dashboard.completedCourses}.
                  </span>
                ) : (
                  <span> Keep going!</span>
                )}
              </p>
            </div>

            {/* Stat 2 */}
            <div>
              <p className="text-gray-700 font-medium">Next Steps</p>
              <p className="text-sm text-gray-600 mt-1">
                {dashboard.pendingAssignments > 0 ? (
                  <span>
                    You have {dashboard.pendingAssignments} assignment(s) waiting
                    for grading.
                  </span>
                ) : (
                  <span>No pending assignments. Great work!</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 font-medium"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
}
