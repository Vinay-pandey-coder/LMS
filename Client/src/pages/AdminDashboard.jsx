
// AdminDashboard.jsx - Admin Dashboard with platform statistics
// Shows admin overview: total users, students, teachers, courses, enrollments
// All cards are clickable for drill-down management

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  // Fetch admin stats when component loads
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();

        if (!token) {
          throw new Error('Authentication token not found. Please login again.');
        }

        // Call backend to get admin stats
        const response = await fetch(
          'http://localhost:3000/api/admin/stats',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch admin stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError(err.message || 'Error fetching dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch enrollment details
  const handleEnrollmentCardClick = async () => {
    setShowEnrollmentModal(true);
    setEnrollmentLoading(true);

    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch enrollments');
      }

      const data = await response.json();
      setEnrollmentData(data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError(err.message || 'Error fetching enrollments');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
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

  // Show when no stats data
  if (!stats) {
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

  // Show admin dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Platform-wide statistics and management overview
          </p>
        </div>

        {/* Dashboard cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Card 1: Total Users */}
          <div 
            onClick={() => navigate('/app/admin/users')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click to view all users
            </p>
          </div>

          {/* Card 2: Total Students */}
          <div 
            onClick={() => navigate('/app/admin/users?role=student')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="text-4xl">🎓</div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Students registered
            </p>
          </div>

          {/* Card 3: Total Teachers */}
          <div 
            onClick={() => navigate('/app/admin/teachers')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Teachers
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.totalTeachers}
                </p>
              </div>
              <div className="text-4xl">👨‍🏫</div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Teachers on platform
            </p>
          </div>

          {/* Card 4: Total Courses */}
          <div 
            onClick={() => navigate('/app/admin/courses')}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats.totalCourses}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Courses available
            </p>
          </div>

          {/* Card 5: Total Enrollments */}
          <div 
            onClick={handleEnrollmentCardClick}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                  Total Enrollments
                </p>
                <p className="text-3xl font-bold text-pink-600">
                  {stats.totalEnrollments}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click to view details
            </p>
          </div>
        </div>

        {/* Summary section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Platform Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stat 1 */}
            <div>
              <p className="text-gray-700 font-medium">User Breakdown</p>
              <p className="text-sm text-gray-600 mt-1">
                Total {stats.totalUsers} user(s): {stats.totalStudents} student(s), {stats.totalTeachers} teacher(s)
              </p>
            </div>

            {/* Stat 2 */}
            <div>
              <p className="text-gray-700 font-medium">Learning Activity</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.totalCourses} course(s) with {stats.totalEnrollments} enrollment(s)
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment Modal */}
        {showEnrollmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-96 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-pink-500 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Enrollment Details</h2>
                <button
                  onClick={() => setShowEnrollmentModal(false)}
                  className="text-white text-2xl font-bold hover:text-pink-200"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-72">
                {enrollmentLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin">
                      <div className="h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
                    </div>
                    <p className="mt-4 text-gray-600">Loading enrollment data...</p>
                  </div>
                ) : enrollmentData ? (
                  <div className="space-y-6">
                    {/* Enrollments by Course Summary */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Enrollments by Course</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrollmentData.enrollmentsByCourse && enrollmentData.enrollmentsByCourse.length > 0 ? (
                          enrollmentData.enrollmentsByCourse.map((course) => (
                            <div
                              key={course.courseId}
                              className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200"
                            >
                              <p className="font-semibold text-gray-800">{course.courseName}</p>
                              <p className="text-pink-600 text-lg font-bold mt-1">
                                {course.studentCount} student(s)
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 col-span-2">No course data available</p>
                        )}
                      </div>
                    </div>

                    {/* All Enrollments List */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">All Enrollments</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {enrollmentData.enrollmentsByStudents && enrollmentData.enrollmentsByStudents.length > 0 ? (
                          enrollmentData.enrollmentsByStudents.map((enrollment) => (
                            <div
                              key={enrollment._id}
                              className="flex justify-between items-start bg-gray-50 p-3 rounded border border-gray-200 hover:bg-gray-100 transition"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{enrollment.studentName}</p>
                                <p className="text-xs text-gray-600">{enrollment.studentEmail}</p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-sm font-semibold text-pink-600">{enrollment.courseName}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No enrollments found</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No enrollment data available</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowEnrollmentModal(false)}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
