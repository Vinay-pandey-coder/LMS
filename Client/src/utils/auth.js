
// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Clear token and logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  window.location.href = '/';
};

export { getToken, logout };
