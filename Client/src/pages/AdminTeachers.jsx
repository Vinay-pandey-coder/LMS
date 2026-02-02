// AdminTeachers.jsx - View all teachers and their course counts
// Shows teacher details with number of courses created

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();

        if (!token) {
          throw new Error('Authentication token not found. Please login again.');
        }

        const response = await fetch(
          'http://localhost:3000/api/admin/teachers',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch teachers');
        }

        const data = await response.json();
        setTeachers(data.teachers || []);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError(err.message || 'Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

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
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/admin/dashboard')}
            className="text-orange-600 hover:text-orange-800 mb-4 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800">All Teachers</h1>
          <p className="text-gray-600 mt-2">
            Total teachers: <span className="font-bold text-orange-600">{teachers.length}</span>
          </p>
        </div>

        {/* No teachers message */}
        {teachers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No teachers found.</p>
          </div>
        ) : (
          // Teachers grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-orange-500"
              >
                {/* Teacher name */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {teacher.name}
                </h3>

                {/* Teacher email */}
                <p className="text-gray-600 text-sm mb-4">
                  {teacher.email}
                </p>

                {/* Course count badge */}
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 font-medium">Courses Created</p>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-lg">
                    {teacher.courseCount}
                  </span>
                </div>

                {/* Registration date */}
                <p className="text-xs text-gray-500 mt-4">
                  Registered: {new Date(teacher.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}