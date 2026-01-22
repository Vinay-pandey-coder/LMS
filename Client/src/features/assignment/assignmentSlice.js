// assignmentSlice.js - Assignment State Management
// Manages assignments and submission status using Redux Toolkit
// Stores list of assignments and submission feedback

import { createSlice } from '@reduxjs/toolkit';

// Create assignment slice with initial state and reducers
const assignmentSlice = createSlice({
  // Slice name - becomes state key (state.assignment)
  name: 'assignment',

  // Initial state for assignments
  initialState: {
    // assignments - array of assignment objects
    // Empty array initially, filled when fetched from backend
    assignments: [],

    // submissionStatus - stores result after submission
    // null means haven't submitted yet
    // Contains: { submissionId, message, status }
    submissionStatus: null,

    // loading - true while fetching assignments from backend
    // false when done loading
    loading: false,

    // error - stores any error message
    // null means no error
    error: null,
  },

  // Reducers - functions that update assignment state
  reducers: {
    // setAssignments - stores the fetched assignments list
    // Payload: array of assignment objects from backend
    setAssignments: (state, action) => {
      state.assignments = action.payload;
      state.error = null; // Clear any previous errors
    },

    // setSubmissionStatus - stores result after submitting assignment
    // Payload: submission response from backend
    setSubmissionStatus: (state, action) => {
      state.submissionStatus = action.payload;
    },

    // setLoading - set loading state
    // Payload: true or false
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // setError - store error message
    // Payload: error message string
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false; // Stop loading when error occurs
    },

    // clearSubmissionStatus - clear submission response
    // Used when user starts new submission
    clearSubmissionStatus: (state) => {
      state.submissionStatus = null;
    },

    // resetAssignments - clear all assignment data (when leaving page)
    resetAssignments: (state) => {
      state.assignments = [];
      state.submissionStatus = null;
      state.error = null;
      state.loading = false;
    },
  },
});

// Export actions for components to dispatch
export const {
  setAssignments,
  setSubmissionStatus,
  setLoading,
  setError,
  clearSubmissionStatus,
  resetAssignments,
} = assignmentSlice.actions;

// Export reducer to use in store
export default assignmentSlice.reducer;