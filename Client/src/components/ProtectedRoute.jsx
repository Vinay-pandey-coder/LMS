// ProtectedRoute.jsx - Route protection using Redux authentication state
// Checks if user is authenticated before allowing access to protected pages

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  // Read isAuthenticated from Redux store (state.auth.isAuthenticated)
  // useSelector is a React Redux hook that lets components read state
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // If user is not authenticated, redirect to home (which redirects to login)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated, render the protected page
  return children;
}