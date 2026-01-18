import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getToken, logout } from '../utils/auth';

const Dashboard = () => {
  // State for courses list
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch enrolled courses when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      // Get token from localStorage
      const token = getToken();

      // Call backend API to get enrolled courses
      const response = await fetch('http://localhost:3000/api/course/enrolled', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json(); 

      // Check if request was successful
      if (!response.ok) {
        setError(data.message || 'Failed to fetch courses');
        return;
      }

      // Set courses in state
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError('Server error while fetching courses');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6 shadow">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>

        {/* Loading state */}
        {loading && (
          <p className="text-gray-600 text-center py-8">Loading courses...</p>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Courses grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                {/* Course title */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {course.title}
                </h3>

                {/* Course description */}
                {course.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {course.description}
                  </p>
                )}

                {/* Continue button */}
                <Link
                  to={`/course/${course.id}`}
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Continue Learning
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* No courses message */}
        {!loading && courses.length === 0 && !error && (
          <p className="text-gray-600 text-center py-8">
            You are not enrolled in any courses yet.
          </p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;