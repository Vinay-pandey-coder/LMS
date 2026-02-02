import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../utils/api';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/course/all');
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch courses');
        return;
      }

      setCourses(data.courses || []);
      setError('');
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError('Server error while fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await apiGet('/course/enrolled');
      const data = await response.json();

      if (response.ok) {
        const enrolledIds = (data.courses || []).map((course) => course.id);
        setEnrolledCourses(enrolledIds);
      }
    } catch (err) {
      console.error('Fetch enrolled courses error:', err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);
      const response = await apiPost('/course/enroll', { courseId });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to enroll in course');
        setEnrollingId(null);
        return;
      }

      // Add to enrolled courses
      setEnrolledCourses([...enrolledCourses, courseId]);
      setSuccessMessage(`Successfully enrolled in course!`);
      setError('');
    } catch (err) {
      console.error('Enroll error:', err);
      setError('Server error while enrolling');
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Courses</h1>
        <p className="text-gray-600">Discover and enroll in courses</p>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 pb-8">
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading courses...</p>
          </div>
        )}

        {/* Courses grid */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* Course header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">
                    by {course.teacherName}
                  </p>
                </div>

                {/* Description */}
                {course.description && (
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {course.description}
                  </p>
                )}

                {/* Enroll button or enrolled badge */}
                {isEnrolled(course._id) ? (
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-medium">
                    <span>✓</span>
                    <span>Enrolled</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrollingId === course._id}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                      enrollingId === course._id
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {enrollingId === course._id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No courses message */}
        {!loading && courses.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courses available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllCourses;