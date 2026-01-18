import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getToken } from '../utils/auth';

const CourseDetail = () => {
  // Get courseId from URL
  const { courseId } = useParams();

  // State for lectures and selected lecture
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ref to access video element
  const videoRef = useRef(null);

  // Fetch lectures when component mounts or courseId changes
  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  // Fetch lectures for this course from backend
  const fetchLectures = async () => {
    try {
      // Get token from localStorage
      const token = getToken();

      // Call backend API to get lectures
      const response = await fetch(
        `http://localhost:3000/api/lecture/course/${courseId}`,
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

  // Handle when video is paused (save watch time)
  const handleVideoPause = async () => {
    // Only save if we have a selected lecture and video
    if (!selectedLecture || !videoRef.current) {
      return;
    }

    try {
      // Get current video time
      const currentTime = videoRef.current.currentTime;

      // Get token from localStorage
      const token = getToken();

      // Send watch time to backend
      await fetch('http://localhost:3000/api/watch-time/save', {
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
          <h1 className="text-3xl font-bold">Course Details</h1>
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
      </main>
    </div>
  );
};

export default CourseDetail;