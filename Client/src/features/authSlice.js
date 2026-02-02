import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  role: localStorage.getItem('role') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Start authentication request
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    // Register success
    registerSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.role = user.role;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Persist to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
    },

    // Login success
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.role = user.role;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
    },

    // Auth failure
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Restore from localStorage (for page refresh)
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const role = localStorage.getItem('role');

      if (token && user && role) {
        state.token = token;
        state.user = JSON.parse(user);
        state.role = role;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  authStart,
  registerSuccess,
  loginSuccess,
  authFailure,
  logout,
  clearError,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;