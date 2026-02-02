import { createSlice } from '@reduxjs/toolkit';

const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = localStorage.getItem('user');
const roleFromStorage = localStorage.getItem('role');

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    token: tokenFromStorage || null,
    user: userFromStorage ? JSON.parse(userFromStorage) : null,
    role: roleFromStorage || null,
    isAuthenticated: !!tokenFromStorage,
    loading: false,
    error: null,
  },

  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },

    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },

    setRole: (state, action) => {
      state.role = action.payload;
      if (action.payload) {
        localStorage.setItem('role', action.payload);
      } else {
        localStorage.removeItem('role');
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

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
  },
});

export const {
  setToken,
  setUser,
  setRole,
  setLoading,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;