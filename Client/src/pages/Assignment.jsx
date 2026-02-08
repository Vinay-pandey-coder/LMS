// Assignment.jsx - Assignment List & Submission Page
// Students can view assignments and submit answers
// Shows list of assignments for the course

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setAssignments,
  setLoading,
  setError,
  setSubmissionStatus,
  clearSubmissionStatus,
} from "../features/assignment/assignmentSlice";

export default function Assignment() {
  // Get courseId from URL parameters
  const { courseId } = useParams();

  // Navigation hook to go back
  const navigate = useNavigate();

  // Redux dispatch to update state
  const dispatch = useDispatch();

  // Read assignment data from Redux store
  const { assignments, submissionStatus, loading, error } = useSelector(
    (state) => state.assignment,
  );

  // Read token from auth for API requests
  const token = useSelector((state) => state.auth.token);

  // Local state for form inputs
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [studentSubmission, setStudentSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Clear submission status and error when component mounts
  useEffect(() => {
    // Clear any previous submission status or errors from Redux
    dispatch(clearSubmissionStatus());
  }, [dispatch]);

  // Fetch assignments when component loads
  useEffect(() => {
    // Only fetch if courseId exists and assignments not already loaded
    if (!courseId || assignments.length > 0) return;

    // Function to fetch assignments from backend
    const fetchAssignments = async () => {
      // Set loading state
      dispatch(setLoading(true));

      try {
        // Call backend to get assignments for this course
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/assignment/course/${courseId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Check if response is OK
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }

        // Parse response JSON
        const data = await response.json();

        console.log("Fetched assignments:", data);

        // Store assignments in Redux
        dispatch(setAssignments(data.assignments || []));
      } catch (err) {
        // If error, store error message
        console.error("Error fetching assignments:", err);
        dispatch(setError(err.message || "Error fetching assignments"));
      } finally {
        // Always set loading to false
        dispatch(setLoading(false));
      }
    };

    // Call fetch function
    fetchAssignments();
  }, [courseId, assignments.length, token, dispatch]);

  // Handle assignment selection
  // When user clicks on an assignment, show submission form or grades
  const handleSelectAssignment = async (assignment) => {
    console.log("Selected assignment:", assignment);
    // Clear any previous submission status
    dispatch(clearSubmissionStatus());
    // Set selected assignment
    setSelectedAssignment(assignment);
    // Clear answer text
    setAnswerText("");

    // Fetch student's submission for this assignment
    setSubmissionLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/assignment/${assignment._id}/my-submission`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Student submission:", data);
        setStudentSubmission(data.submission);
      } else {
        // No submission found - student hasn't submitted yet
        setStudentSubmission(null);
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
      setStudentSubmission(null);
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Handle form submission
  // Send answer to backend
  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault();

    // Validate that answer is not empty
    if (!answerText.trim()) {
      dispatch(setError("Please enter your answer"));
      return;
    }

    // Set loading state
    dispatch(setLoading(true));

    try {
      // Send submission to backend
      const response = await fetch(
         `${import.meta.env.VITE_API_URL}/assignment/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assignmentId: selectedAssignment._id,
            answerText: answerText,
          }),
        },
      );

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit assignment");
      }

      // Parse response
      const data = await response.json();

      // Store submission status in Redux
      dispatch(setSubmissionStatus(data));

      // Clear form
      setAnswerText("");
    } catch (err) {
      // If error, store error message
      console.error("Error submitting assignment:", err);
      dispatch(setError(err.message || "Error submitting assignment"));
    } finally {
      // Always set loading to false
      dispatch(setLoading(false));
    }
  };

  // Show loading state
  if (loading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show when no assignments
  if (assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <p className="text-center text-gray-600">No assignments available</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show assignments list and submission form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Page header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-700 font-medium mb-4"
          >
            ← Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Assignments list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-100 px-6 py-4">
                <h2 className="font-bold text-gray-800">
                  Assignments ({assignments.length})
                </h2>
              </div>

              {/* List of assignments */}
              <div className="divide-y max-h-96 overflow-y-auto">
                {assignments && assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <button
                      key={assignment._id}
                      onClick={() => handleSelectAssignment(assignment)}
                      className={`w-full text-left px-6 py-4 hover:bg-blue-50 transition cursor-pointer ${
                        selectedAssignment?._id === assignment._id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <p className="font-bold text-gray-800 truncate">
                        {assignment.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No assignments available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Selected assignment details and submission form */}
          <div className="lg:col-span-2">
            {selectedAssignment ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Assignment details */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedAssignment.title}
                </h2>

                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                  <span>
                    📅 Due:{" "}
                    {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                  </span>
                  <span>
                    👨‍🏫 By {selectedAssignment.createdBy?.name || "Teacher"}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedAssignment.description}
                  </p>
                </div>

                {/* Loading submission status */}
                {submissionLoading && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin">
                      <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                    <p className="mt-2 text-gray-600 text-sm">
                      Loading submission status...
                    </p>
                  </div>
                )}

                {/* Show grades if already submitted and graded */}
                {!submissionLoading && studentSubmission && (
                  <div>
                    {studentSubmission.status === "checked" && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-green-700 font-bold text-lg">
                              ✓ Assignment Graded
                            </p>
                            <p className="text-green-600 text-sm mt-1">
                              Graded on{" "}
                              {studentSubmission.gradedAt
                                ? new Date(
                                    studentSubmission.gradedAt,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold text-green-600">
                              {studentSubmission.marks}
                            </p>
                            <p className="text-green-600 text-sm">Marks</p>
                          </div>
                        </div>

                        {studentSubmission.feedback && (
                          <div className="bg-white rounded p-4 border border-green-200">
                            <p className="font-semibold text-gray-800 mb-2">
                              Teacher's Feedback
                            </p>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {studentSubmission.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {studentSubmission.status === "submitted" && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                        <p className="text-blue-700 font-bold text-lg">
                          ⏳ Pending Review
                        </p>
                        <p className="text-blue-600 text-sm mt-2">
                          Your assignment has been submitted on{" "}
                          {new Date(
                            studentSubmission.submittedAt,
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-blue-600 text-sm mt-1">
                          Waiting for teacher to grade...
                        </p>
                      </div>
                    )}

                    {/* Show submitted answer for reference */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="font-semibold text-gray-800 mb-2">
                        Your Submission
                      </p>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">
                        {studentSubmission.answerText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success message */}
                {submissionStatus && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                    <p className="font-bold">✓ Submitted Successfully!</p>
                    <p className="text-sm mt-1">{submissionStatus.message}</p>
                  </div>
                )}

                {/* Submission form - only show if no submission yet */}
                {!submissionLoading && !studentSubmission && (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        Your Answer
                      </label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Write your answer here..."
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-400 transition"
                    >
                      {loading ? "Submitting..." : "Submit Assignment"}
                    </button>
                  </form>
                )}

                {/* After successful submission - show success and clear button */}
                {submissionStatus && !studentSubmission && (
                  <button
                    onClick={() => {
                      setSelectedAssignment(null);
                      dispatch(clearSubmissionStatus());
                    }}
                    className="w-full bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600 transition"
                  >
                    Submit Another Assignment
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">
                  Select an assignment to view details and submit
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
