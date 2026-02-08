// TeacherStudents.jsx - View all students enrolled in teacher's courses
// Shows students grouped by course with enrollment details

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [courseStudents, setCourseStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch teacher's courses with enrolled students from backend
  useEffect(() => {
    fetchCoursesAndStudents();
  }, []);

  const fetchCoursesAndStudents = async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Step 1: Fetch courses created by this teacher
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
      const courses = coursesData.data || [];

      if (courses.length === 0) {
        setCourseStudents([]);
        setTotalStudents(0);
        setLoading(false);
        return;
      }

      // Step 2: For each course, fetch enrolled students via enrollment endpoint
      const courseStudentsList = [];
      const uniqueStudentIds = new Set();

      for (const course of courses) {
        try {
          // Fetch enrollments for this course
          const enrollmentResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/enrollment/course/${course._id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            const enrollments = enrollmentData.enrollments || [];

            if (enrollments.length > 0) {
              courseStudentsList.push({
                courseId: course._id,
                courseName: course.title,
                courseDescription: course.description,
                students: enrollments,
              });

              // Track unique students
              enrollments.forEach((enrollment) => {
                if (enrollment.studentId?._id) {
                  uniqueStudentIds.add(enrollment.studentId._id);
                } else if (enrollment.studentId) {
                  uniqueStudentIds.add(enrollment.studentId.toString());
                }
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching students for course ${course._id}:`, err);
          // Continue with next course even if this one fails
        }
      }

      setCourseStudents(courseStudentsList);
      setTotalStudents(uniqueStudentIds.size);
    } catch (err) {
      console.error('Error fetching courses and students:', err);
      setError(err.message || 'Failed to load courses and students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading students...</p>
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
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
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
            className="text-green-600 hover:text-green-800 mb-4 text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Enrolled Students</h1>
          <p className="text-gray-600 mt-2">
            Total students enrolled: <span className="font-bold text-green-600">{totalStudents}</span>
          </p>
        </div>

        {/* No students message */}
        {courseStudents.length === 0 || totalStudents === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No students enrolled in your courses yet.</p>
            <button
              onClick={() => navigate('/app/teacher/dashboard')}
              className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          // Courses with students
          <div className="space-y-6">
            {courseStudents.map((courseGroup) => (
              <div key={courseGroup.courseId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                  <h2 className="text-2xl font-bold text-white">{courseGroup.courseName}</h2>
                  <p className="text-green-100 mt-1">
                    {courseGroup.students.length} student(s) enrolled
                  </p>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left p-4 font-semibold text-gray-700">Student Name</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Enrolled On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseGroup.students.map((enrollment, idx) => {
                        const studentName =
                          enrollment.studentId?.name || 'Unknown Student';
                        const studentEmail = enrollment.studentId?.email || 'N/A';
                        const enrolledDate = new Date(
                          enrollment.enrolledAt || enrollment.createdAt
                        ).toLocaleDateString();

                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50 transition">
                            <td className="p-4 text-gray-800">{studentName}</td>
                            <td className="p-4 text-gray-600">{studentEmail}</td>
                            <td className="p-4 text-gray-600 text-sm">
                              {enrolledDate}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}