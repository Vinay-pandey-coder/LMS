// TeacherQuizzes.jsx - Manage quizzes for a course or all teacher's quizzes
// Teachers can view quizzes, add questions, and view results
// Can be called with courseId (for course-specific quizzes) or without (for all quizzes)

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

const TeacherQuizzes = () => {
  // Get courseId from URL (optional)
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State for quizzes and courses
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGlobalView, setIsGlobalView] = useState(!courseId);

  // Fetch quizzes on mount
  useEffect(() => {
    if (courseId) {
      fetchQuizzesByCourse();
    } else {
      fetchAllTeacherQuizzes();
    }
  }, [courseId]);

  // Fetch quizzes for a specific course
  const fetchQuizzesByCourse = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/test/course/${courseId}`,
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
        throw new Error(data.message || 'Failed to fetch quizzes');
      }

      setQuizzes(data.tests || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all quizzes for teacher (from all courses)
  const fetchAllTeacherQuizzes = async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Fetch courses created by this teacher
      const coursesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/course/teacher`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!coursesResponse.ok) {
        throw new Error('Failed to load courses');
      }

      const coursesData = await coursesResponse.json();
      const teacherCourses = coursesData.data || [];
      setCourses(teacherCourses);

      // Fetch all quizzes from all teacher's courses
      const allQuizzes = [];
      for (const course of teacherCourses) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/test/course/${course._id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const tests = data.tests || [];
            // Add course info to each quiz
            tests.forEach((test) => {
              allQuizzes.push({
                ...test,
                courseId: course._id,
                courseName: course.title,
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching quizzes for course ${course._id}:`, err);
        }
      }
      setQuizzes(allQuizzes);
    } catch (err) {
      console.error('Error fetching teacher quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(isGlobalView ? '/app/teacher/dashboard' : -1)}
            className="text-blue-600 hover:text-blue-800 mb-4 text-sm font-medium"
          >
            ← {isGlobalView ? 'Back to Dashboard' : 'Back to Course'}
          </button>
          <h1 className="text-4xl font-bold text-gray-800">
            {isGlobalView ? 'All Quizzes' : 'Course Quizzes'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isGlobalView
              ? `You've created ${quizzes.length} quiz(zes)`
              : 'Manage quizzes for this course'}
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Create Quiz Button (only for course-specific view) */}
        {!isGlobalView && (
          <div className="mb-6">
            <Link
              to={`/app/teacher/course/${courseId}/create-quiz`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Create New Quiz
            </Link>
          </div>
        )}

        {/* No quizzes message */}
        {quizzes.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              {isGlobalView
                ? "You haven't created any quizzes yet."
                : 'No quizzes yet for this course.'}
            </p>
            {!isGlobalView && (
              <Link
                to={`/app/teacher/course/${courseId}/create-quiz`}
                className="inline-block text-blue-600 hover:text-blue-800"
              >
                Create the first quiz
              </Link>
            )}
          </div>
        )}

        {/* Quizzes Grid */}
        {quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Course name (only in global view) */}
                {isGlobalView && (
                  <p className="text-xs text-blue-600 font-medium mb-2">
                    {quiz.courseName}
                  </p>
                )}

                {/* Quiz Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">{quiz.title}</h3>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Add Questions Button */}
                  <Link
                    to={`/app/teacher/quiz/${quiz._id}/add-question`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm"
                  >
                    Add Questions
                  </Link>

                  {/* View Results Button */}
                  <Link
                    to={`/app/teacher/quiz/${quiz._id}/results`}
                    className="block w-full text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm"
                  >
                    View Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherQuizzes;