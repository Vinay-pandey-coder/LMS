// AdminCourses.jsx - View all courses on the platform
// Shows course details with creator (teacher) information

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiGet('/admin/courses');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
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
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600"
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
            className="text-indigo-600 hover:text-indigo-800 mb-4 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800">All Courses</h1>
          <p className="text-gray-600 mt-2">
            Total courses: <span className="font-bold text-indigo-600">{courses.length}</span>
          </p>
        </div>

        {/* No courses message */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No courses found.</p>
          </div>
        ) : (
          // Courses grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-indigo-500"
              >
                {/* Course title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {course.title}
                </h3>

                {/* Course description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Teacher info */}
                <div className="mb-4 p-3 bg-indigo-50 rounded">
                  <p className="text-xs text-gray-600 font-medium">Created by</p>
                  <p className="text-gray-800 font-semibold">
                    {course.teacherId?.name || 'Unknown Teacher'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {course.teacherId?.email}
                  </p>
                </div>

                {/* Created date */}
                <p className="text-xs text-gray-500">
                  Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}