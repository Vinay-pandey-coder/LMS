/**
 * API utility functions with automatic token handling
 * All API calls should use these functions to ensure token is always included
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Make API request with authorization header
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - fetch options
 * @returns {Promise} fetch response
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

/**
 * GET request
 */
export const apiGet = (endpoint) => {
  return apiCall(endpoint, {
    method: 'GET',
  });
};

/**
 * POST request
 */
export const apiPost = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint) => {
  return apiCall(endpoint, {
    method: 'DELETE',
  });
};