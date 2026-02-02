
// TeacherCourses.jsx - Display all courses created by the teacher
// Teachers can view, edit, or delete their courses from this page

import { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';

const TeacherCourses = () => {
  // State for courses and loading
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teacher's courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      // Call backend API to get courses created by this teacher
      const response = await apiGet('/course/teacher');

      // Handle response
      if (!response.ok) {
        throw new Error('Failed to load courses');
      }

      const data = await response.json();
      setCourses(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading courses...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Show empty state if no courses
  if (courses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Courses</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
          <a
            href="/app/teacher/course/create"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Create Your First Course
          </a>
        </div>
      </div>
    );
  }

  // Display courses list
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <a
          href="/app/teacher/course/create"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Create Course
        </a>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            {/* Course Title */}
            <h2 className="text-xl font-bold mb-2">{course.title}</h2>

            {/* Course Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>

            {/* Course Info */}
            <div className="text-sm text-gray-500 mb-4">
              <p>Category: <span className="font-medium">{course.category}</span></p>
              <p>Students: <span className="font-medium">{course.enrolledStudents?.length || 0}</span></p>
            </div>

            {/* Action Buttons - Row 1 */}
            <div className="flex gap-2 mb-2 flex-wrap">
              <a
                href={`/app/course/${course._id}`}
                className="flex-1 min-w-24 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm"
              >
                View
              </a>
              <a
                href={`/app/teacher/course/${course._id}/add-lecture`}
                className="flex-1 min-w-28 text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm"
              >
                Add Lecture
              </a>
            </div>

            {/* Action Buttons - Row 2 */}
            <div className="flex gap-2 mb-2 flex-wrap">
              <a
                href={`/app/teacher/course/${course._id}/quizzes`}
                className="flex-1 min-w-28 text-center bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition text-sm"
              >
                Manage Quizzes
              </a>
              <a
                href={`/app/teacher/course/${course._id}/assignments`}
                className="flex-1 min-w-32 text-center bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition text-sm"
              >
                Manage Assignments
              </a>
            </div>
            
            {/* Additional Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => alert('Edit course functionality coming soon')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => alert('Delete course functionality coming soon')}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCourses;
