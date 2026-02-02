// TeacherAssignments.jsx - Manage assignments for a course
// Teachers can view assignments and their submissions

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TeacherAssignments = () => {
  // Get courseId from URL
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // State for assignments
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assignments on mount
  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  // Fetch assignments for this course
  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/assignment/course/${courseId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch assignments');
      }

      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4 text-sm"
        >
          ← Back to Courses
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Course Assignments</h1>
        <p className="text-gray-600 mt-2">Manage assignments for this course</p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* No assignments message */}
      {assignments.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No assignments yet for this course.</p>
        </div>
      )}

      {/* Assignments Grid */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              {/* Assignment Title */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {assignment.title}
              </h3>

              {/* Due Date */}
              <p className="text-sm text-gray-600 mb-4">
                Due: {formatDate(assignment.dueDate)}
              </p>

              {/* Description Preview */}
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                {assignment.description}
              </p>

              {/* View Submissions Button */}
              <Link
                to={`/app/teacher/assignment/${assignment._id}/submissions`}
                className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm"
              >
                View Submissions
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;