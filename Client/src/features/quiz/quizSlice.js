// quizSlice.js - Quiz State Management
// Manages quiz questions and results using Redux Toolkit
// Simple state management for quiz data

import { createSlice } from '@reduxjs/toolkit';

// Create quiz slice with initial state and reducers
const quizSlice = createSlice({
  // Slice name - becomes state key (state.quiz)
  name: 'quiz',

  // Initial state for quiz
  initialState: {
    // quiz - stores the quiz data (title, questions, etc)
    // null means no quiz loaded yet
    quiz: null,

    // result - stores the score after user submits answers
    // null means user hasn't submitted yet
    result: null,

    // loading - true while fetching quiz from backend
    // false when done loading
    loading: false,

    // error - stores any error message
    // null means no error
    error: null,
  },

  // Reducers - functions that update quiz state
  reducers: {
    // setQuiz - stores the fetched quiz questions
    // Payload: quiz object from backend
    setQuiz: (state, action) => {
      state.quiz = action.payload;
      state.error = null; // Clear any previous errors
    },

    // setResult - stores the score after submission
    // Payload: result object from backend (includes score, correctAnswers, etc)
    setResult: (state, action) => {
      state.result = action.payload;
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

    // resetQuiz - clear quiz data (when leaving quiz page)
    resetQuiz: (state) => {
      state.quiz = null;
      state.result = null;
      state.error = null;
      state.loading = false;
    },
  },
});

// Export actions for components to dispatch
export const { setQuiz, setResult, setLoading, setError, resetQuiz } = quizSlice.actions;

// Export reducer to use in store
export default quizSlice.reducer;