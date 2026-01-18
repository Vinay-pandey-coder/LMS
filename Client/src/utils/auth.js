// Save token to localStorage
const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Clear token and logout
const logout = () => {
  localStorage.removeItem('authToken');
  // Redirect to login
  window.location.href = '/';
};

export { saveToken, getToken, logout };