// TeacherDashboard.jsx - Teacher Dashboard Summary
// Shows teacher's overview: created courses, enrolled students, pending submissions, created quizzes
// Displays key statistics for the teacher's teaching activity

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';

export default function TeacherDashboard() {
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
    // Function to fetch teacher dashboard from backend
    const fetchDashboard = async () => {
      // Set loading state
      setLoading(true);

      // Reset error state
      setError(null);

      try {
        // Call backend to get teacher dashboard
        const response = await apiGet('/dashboard/teacher');

        // Check if response is OK
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch teacher dashboard');
        }

        // Parse response JSON
        const data = await response.json();

        // Store dashboard data in local state
        setDashboard(data);
      } catch (err) {
        // If error, store error message
        console.error('Error fetching teacher dashboard:', err);
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
            <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
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
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
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
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show teacher dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome! Here's your teaching summary
          </p>
        </div>

        {/* Dashboard cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Courses Created */}
          <div 
            onClick={() => navigate('/app/teacher/courses')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Courses Created
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-purple-600">
                  {dashboard.totalCoursesCreated}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">🎓</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              Total courses you've created
            </p>
          </div>

          {/* Card 2: Total Students Enrolled */}
          <div 
            onClick={() => navigate('/app/teacher/students')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Students Enrolled
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-green-600">
                  {dashboard.totalStudentsEnrolled}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">👥</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              Total students across all courses
            </p>
          </div>

          {/* Card 3: Pending Submissions */}
          <div 
            onClick={() => navigate('/app/teacher/submissions')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Pending Submissions
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-orange-600">
                  {dashboard.pendingSubmissions}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">✏️</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              Assignments awaiting your grading
            </p>
          </div>

          {/* Card 4: Total Quizzes Created */}
          <div 
            onClick={() => navigate('/app/teacher/quizzes')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                {/* Card title */}
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Quizzes Created
                </p>
                {/* Card value */}
                <p className="text-3xl font-bold text-blue-600">
                  {dashboard.totalQuizzesCreated}
                </p>
              </div>
              {/* Card icon */}
              <div className="text-4xl">📋</div>
            </div>
            {/* Card footer */}
            <p className="text-xs text-gray-500 mt-3">
              Total quizzes you've created
            </p>
          </div>
        </div>

        {/* Summary section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h2>

          {/* Stats content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stat 1 */}
            <div>
              <p className="text-gray-700 font-medium">Course Activity</p>
              <p className="text-sm text-gray-600 mt-1">
                You've created {dashboard.totalCoursesCreated} course(s) with{' '}
                {dashboard.totalStudentsEnrolled} student(s) enrolled.
                {dashboard.totalQuizzesCreated > 0 ? (
                  <span>
                    {' '}You've also created {dashboard.totalQuizzesCreated} quiz(zes).
                  </span>
                ) : (
                  <span></span>
                )}
              </p>
            </div>

            {/* Stat 2 */}
            <div>
              <p className="text-gray-700 font-medium">Grading Queue</p>
              <p className="text-sm text-gray-600 mt-1">
                {dashboard.pendingSubmissions > 0 ? (
                  <span>
                    You have {dashboard.pendingSubmissions} assignment(s) waiting
                    for grading. Review them soon!
                  </span>
                ) : (
                  <span>No pending submissions. All caught up!</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}