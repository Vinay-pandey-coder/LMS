import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getToken } from '../utils/auth';
import { Link } from 'react-router-dom';

const CourseDetail = () => {
  // Get courseId from URL
  const { courseId } = useParams();

  // ============================================
  // ROLE DETECTION - STUDENT VS TEACHER
  // ============================================
  // Get user role from localStorage
  // Students: watch videos, save time, see progress
  // Teachers: view their course content, no watch-time saving
  const userRole = localStorage.getItem('role');
  const isTeacher = userRole === 'teacher';
  const isStudent = userRole === 'student';

  // State for lectures and selected lecture
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
const [assignments, setAssignments] = useState([]);


  // Ref to access video element
  const videoRef = useRef(null);

  // Fetch lectures when component mounts or courseId changes
  useEffect(() => {
    fetchLectures();
    fetchQuizzes();
    fetchAssignments();
  }, [courseId]);

  // ============================================
  // FETCH LAST WATCHED TIME FOR SELECTED LECTURE
  // ============================================
  // This function fetches the saved watch time from backend
  const fetchLastWatchTime = async (lectureId) => {
    try {
      // Get token from localStorage
      const token = getToken();

      // Call backend API to get last watch time
       const response = await fetch(
         `${import.meta.env.VITE_API_URL}/watch-time/lecture/${lectureId}`,
         {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`,
           },
         }
       );

      // Check if request was successful
      if (!response.ok) {
        console.log('No previous watch time found for this lecture');
        return null;
      }

      // Parse response
      const data = await response.json();

      // Return saved watch time (in seconds)
      return data.currentTime || 0;
    } catch (err) {
      console.error('Error fetching watch time:', err);
      return null;
    }
  };

  // ============================================
  // APPLY WATCH TIME WHEN METADATA LOADS
  // ============================================
  // This function applies the saved watch time to the video
  const handleVideoLoadedMetadata = async () => {
    // Only proceed if we have a selected lecture and video element
    if (!selectedLecture || !videoRef.current) {
      return;
    }

    try {
      // Fetch the last watched time for this lecture
      const savedTime = await fetchLastWatchTime(selectedLecture.id);

      // If we have a saved time, apply it to the video
      if (savedTime && savedTime > 0) {
        // Set video to resume from last watched time
        videoRef.current.currentTime = savedTime;
        console.log(`Video resumed from ${savedTime} seconds`);
      }
    } catch (err) {
      console.error('Error applying watch time:', err);
    }
  };

  // ============================================
  // APPLY WATCH TIME WHEN LECTURE CHANGES
  // ============================================
  // When user selects a new lecture, wait for metadata to load
  // then apply the saved watch time for that lecture
  useEffect(() => {
    // If we have a selected lecture, set up the metadata load handler
    if (selectedLecture && videoRef.current) {
      // Add event listener for when video metadata loads
      const videoElement = videoRef.current;
      videoElement.addEventListener('loadedmetadata', handleVideoLoadedMetadata);

      // Cleanup: remove event listener when component unmounts or lecture changes
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleVideoLoadedMetadata);
      };
    }
  }, [selectedLecture]);

  // Fetch lectures for this course from backend
  const fetchLectures = async () => {
    try {
      // Get token from localStorage
      const token = getToken();

      // Call backend API to get lectures
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/lecture/course/${courseId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // Check if request was successful
      if (!response.ok) {
        setError(data.message || 'Failed to fetch lectures');
        return;
      }

      // Set lectures in state
      setLectures(data.lectures || []);

      // Select first lecture by default
      if (data.lectures && data.lectures.length > 0) {
        setSelectedLecture(data.lectures[0]);
      }
    } catch (err) {
      console.error('Fetch lectures error:', err);
      setError('Server error while fetching lectures');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
  try {
    const token = getToken();

    const res = await fetch(
       `${import.meta.env.VITE_API_URL}/test/course/${courseId}`,
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );

    const data = await res.json();
    if (res.ok) {
      setQuizzes(data.tests || []);
    }
  } catch (err) {
    console.error("Fetch quizzes error", err);
  }
};

const fetchAssignments = async () => {
  try {
    const token = getToken();

    const res = await fetch(
       `${import.meta.env.VITE_API_URL}/assignment/course/${courseId}`,
       {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       }
     );

    const data = await res.json();
    if (res.ok) {
      setAssignments(data.assignments || []);
    }
  } catch (err) {
    console.error("Fetch assignments error", err);
  }
};


  // Handle when video is paused (save watch time)
  // NOTE: Only students save watch time
  // Teachers just view content without saving progress
  const handleVideoPause = async () => {
    // Only save if we have a selected lecture and video
    if (!selectedLecture || !videoRef.current) {
      return;
    }

    // ============================================
    // ONLY STUDENTS SAVE WATCH TIME
    // ============================================
    // If teacher is viewing, don't save watch time
    // Teachers are reviewing content, not learning
    if (!isStudent) {
      console.log('Teacher viewing - watch time not saved');
      return;
    }

    try {
      // Get current video time
      const currentTime = videoRef.current.currentTime;

      // Get token from localStorage
      const token = getToken();

      // Send watch time to backend (STUDENTS ONLY)
      await fetch(`${import.meta.env.VITE_API_URL}/watch-time/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          lectureId: selectedLecture.id,
          currentTime: Math.round(currentTime),
        }),
      });

      console.log('Watch time saved:', currentTime);
    } catch (err) {
      console.error('Save watch time error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6 shadow">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {isTeacher ? 'Course Content (Teacher View)' : 'Course Details'}
            </h1>
            {/* View Progress button - STUDENTS ONLY */}
            {isStudent && (
              <Link
                to={`/app/course/${courseId}/progress`}
                className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition"
              >
                View Progress
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Loading state */}
        {loading && (
          <p className="text-gray-600 text-center py-8">Loading lectures...</p>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Lectures loaded */}
        {!loading && lectures.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Video player section */}
            <div className="lg:col-span-3">
              {selectedLecture && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Video player */}
                  <div className="bg-black aspect-video flex items-center justify-center">
                    <video
                    key={selectedLecture.id}
                      ref={videoRef}
                      controls
                      className="w-full h-full"
                      onPause={handleVideoPause}
                    >
                      <source src={selectedLecture.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Lecture title and info */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedLecture.title}
                    </h2>
                    <p className="text-gray-600">
                      Lecture {selectedLecture.order}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lectures list sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-200 px-4 py-3 font-bold text-gray-800">
                  Lectures ({lectures.length})
                </div>

                {/* Lectures list */}
                <div className="divide-y max-h-screen overflow-y-auto">
                  {lectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => setSelectedLecture(lecture)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition ${
                        selectedLecture?.id === lecture.id
                          ? 'bg-blue-100 border-l-4 border-blue-500'
                          : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-700">
                        {lecture.order}. {lecture.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No lectures message */}
        {!loading && lectures.length === 0 && !error && (
          <p className="text-gray-600 text-center py-8">
            No lectures found for this course.
          </p>
        )}

        {/* QUIZ SECTION - STUDENTS ONLY */}
        {isStudent && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Quizzes</h2>

            {quizzes.length === 0 && (
              <p className="text-gray-600">No quizzes available.</p>
            )}

            {quizzes.map((quiz) => (
              <Link
                key={quiz._id}
                to={`/app/course/${courseId}/quiz/${quiz._id}`}
                className="block bg-white p-4 rounded shadow mb-3 hover:bg-blue-50"
              >
                <p className="font-semibold">{quiz.title}</p>
                <p className="text-sm text-gray-600">Start Quiz</p>
              </Link>
            ))}
          </div>
        )}

        {/* ASSIGNMENT SECTION - STUDENTS ONLY */}
        {isStudent && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Assignments</h2>

            {assignments.length === 0 && (
              <p className="text-gray-600">No assignments available.</p>
            )}

            {assignments.map((a) => (
              <Link
                key={a._id}
                to={`/app/course/${courseId}/assignment`}
                className="block bg-white p-4 rounded shadow mb-3 hover:bg-green-50"
              >
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-gray-600">View Assignment</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      



    </div>
  );
};

export default CourseDetail;