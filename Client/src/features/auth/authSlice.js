// authSlice.js - Authentication State Management
// Uses Redux Toolkit's createSlice for simple reducer creation
// Manages token and authentication state

import { createSlice } from '@reduxjs/toolkit';

// Get token from localStorage if it exists (for persistence)
// This is called when app first loads
const tokenFromStorage = localStorage.getItem('authToken');

// Create auth slice with initial state and reducers
const authSlice = createSlice({
  // Slice name - becomes the state key (state.auth)
  name: 'auth',

  // Initial state when app loads
  initialState: {
    // token - the JWT token from backend (or null)
    token: tokenFromStorage || null,

    // isAuthenticated - true if token exists, false otherwise
    isAuthenticated: !!tokenFromStorage,
  },

  // Reducers - functions that update state
  // These are dispatched by components
  reducers: {
    // loginSuccess - called when user successfully logs in
    // Payload should be the token from API response
    loginSuccess: (state, action) => {
      // Save token to Redux state
      state.token = action.payload;

      // Update isAuthenticated flag
      state.isAuthenticated = true;

      // Also save token to localStorage for persistence across refreshes
      localStorage.setItem('authToken', action.payload);
    },

    // logout - called when user clicks logout button
    logout: (state) => {
      // Clear token from Redux state
      state.token = null;

      // Update isAuthenticated flag
      state.isAuthenticated = false;

      // Remove token from localStorage
      localStorage.removeItem('authToken');
    },
  },
});

// Export actions for components to dispatch
export const { loginSuccess, logout } = authSlice.actions;

// Export reducer to use in store
export default authSlice.reducer;