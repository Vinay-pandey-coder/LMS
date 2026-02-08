
// QuizResults.jsx - Display student quiz results for teachers
// Only teachers can view results for a specific quiz
// Shows a table with student names, scores, and submission dates

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const QuizResults = () => {
  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Get role from localStorage to verify this is a teacher
  const userRole = localStorage.getItem('userRole');

  // Get testId from URL parameters
  const { testId } = useParams();

  // State for results and loading
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');

  // Fetch quiz results when component loads
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verify token exists
        if (!token) {
          setError('Authentication error. Please login again.');
          setLoading(false);
          return;
        }

        // Verify testId exists
        if (!testId) {
          setError('Quiz ID is missing.');
          setLoading(false);
          return;
        }

        // Call backend API to fetch quiz results
        // Endpoint: GET /api/test/:testId/results
        // Backend will:
        // 1. Check authMiddleware (verify token)
        // 2. Check roleMiddleware('teacher') (verify user is teacher)
        // 3. Find all TestResult documents for this testId
        // 4. Populate student info and format response
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/test/${testId}/results`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Parse response
        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch quiz results');
        }

        // Set results
        setResults(data.results);

        // For demo, set a generic quiz title (could be enhanced with quiz name from backend)
        setQuizTitle('Quiz Results');

        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err.message || 'Failed to fetch quiz results. Please try again.');
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId, token]);

  // Role check - redirect if not a teacher
  if (userRole !== 'teacher') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Access Denied</p>
          <p className="text-sm">Only teachers can view quiz results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{quizTitle}</h1>
      <p className="text-gray-600 mb-6">View student performance and submission details</p>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading quiz results...</p>
        </div>
      )}

      {/* Results Table */}
      {!loading && !error && (
        <>
          {/* Empty State */}
          {results.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 font-medium mb-2">No submissions yet</p>
              <p className="text-gray-500 text-sm">
                Students haven't submitted their quiz attempts yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                <div>
                  <p className="text-gray-600 text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-800">{results.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Highest Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(...results.map((r) => r.score))}%
                  </p>
                </div>
              </div>

              {/* Results Table */}
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Score (%)
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Correct Answers
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Total Questions
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Submitted Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={result._id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {result.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.studentEmail}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            result.score >= 70
                              ? 'bg-green-100 text-green-800'
                              : result.score >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {result.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {result.correctAnswers}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {result.totalQuestions}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(result.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(result.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="font-medium">💡 About This Page</p>
            <p className="text-sm">
              This page displays all student submissions for this quiz. Scores are calculated based on
              the number of correct answers. Use this data to monitor student performance and identify
              areas that need improvement.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizResults;
