// store.js - Redux Store Configuration
// Uses Redux Toolkit's configureStore for a simple setup
// This is the central place where all Redux state lives

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';

// Create Redux store
// configureStore is from Redux Toolkit and sets up everything for us
const store = configureStore({
  // reducers object - each key becomes a slice of state
  reducer: {
    // auth reducer manages authentication state (token, isAuthenticated)
    auth: authReducer,
  },
});

// Export store to use in main.jsx with Provider
export default store;