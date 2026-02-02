// TeacherSubmissions.jsx - View all pending submissions for teacher's courses
// Shows assignments waiting for grading with student and submission details

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

export default function TeacherSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teacher's courses and pending submissions
  useEffect(() => {
    fetchCoursesAndSubmissions();
  }, []);

  const fetchCoursesAndSubmissions = async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Fetch courses created by this teacher
      const coursesResponse = await fetch('http://localhost:3000/api/course/teacher', {
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

      // Fetch all pending submissions
      const submissionsResponse = await fetch(
        'http://localhost:3000/api/assignment/submissions/pending',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // If endpoint doesn't exist, fetch submissions by course
      if (!submissionsResponse.ok) {
        const allSubmissions = [];
        for (const course of teacherCourses) {
          try {
            const res = await fetch(
              `http://localhost:3000/api/assignment/course/${course._id}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              }
            );

            if (res.ok) {
              const data = await res.json();
              // Filter for ungraded submissions
              const assignments = data.assignments || [];
              assignments.forEach((assignment) => {
                assignment.submissions?.forEach((sub) => {
                  if (!sub.gradedBy) {
                    allSubmissions.push({
                      ...sub,
                      assignmentId: assignment._id,
                      assignmentTitle: assignment.title,
                      courseName: course.title,
                      courseId: course._id,
                    });
                  }
                });
              });
            }
          } catch (err) {
            console.error(`Error fetching submissions for course ${course._id}:`, err);
          }
        }
        setSubmissions(allSubmissions);
      } else {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/teacher/dashboard')}
            className="text-orange-600 hover:text-orange-800 mb-4 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Pending Submissions</h1>
          <p className="text-gray-600 mt-2">
            Assignments waiting for grading:{' '}
            <span className="font-bold text-orange-600">{submissions.length}</span>
          </p>
        </div>

        {/* No submissions message */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-gray-600 mb-4 text-lg">No pending submissions.</p>
            <p className="text-gray-500 mb-6">All assignments have been graded!</p>
            <button
              onClick={() => navigate('/app/teacher/dashboard')}
              className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          // Submissions Table
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <th className="text-left p-4 font-semibold">Assignment</th>
                    <th className="text-left p-4 font-semibold">Course</th>
                    <th className="text-left p-4 font-semibold">Student</th>
                    <th className="text-left p-4 font-semibold">Submitted On</th>
                    <th className="text-center p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 text-gray-800 font-medium">
                        {submission.assignmentTitle || submission.assignment?.title || 'Assignment'}
                      </td>
                      <td className="p-4 text-gray-600">
                        {submission.courseName || submission.course?.title || 'Course'}
                      </td>
                      <td className="p-4 text-gray-600">
                        {submission.studentName || submission.student?.name || 'Student'}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {formatDate(submission.submittedAt || submission.createdAt)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (submission._id) {
                              navigate(`/app/submission/${submission._id}/grade`);
                            } else {
                              alert('Cannot grade this submission');
                            }
                          }}
                          className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition text-sm font-medium"
                        >
                          Grade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}