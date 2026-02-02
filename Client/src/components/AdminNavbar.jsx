// AdminNavbar.jsx - Navigation bar for admins
// Shows admin-specific links: Dashboard, Users, Teachers, Courses, Logout
// Uses React Router v6 <Link> for proper SPA navigation

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const AdminNavbar = () => {
  // Hook for logout redirect
  const navigate = useNavigate();

  // Redux dispatch hook for logout
  const dispatch = useDispatch();

  // Handle logout - clear auth state and redirect to login
  const handleLogout = () => {
    // Step 1: Dispatch Redux logout action (clears token from Redux + localStorage)
    dispatch(logout());

    // Step 2: Clear userRole from localStorage
    localStorage.removeItem('userRole');

    // Step 3: Redirect to login page
    navigate('/');
  };

  return (
    <nav className="bg-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Navbar container - flex layout for alignment */}
        <div className="flex items-center justify-between">
          {/* Left side: Brand/Logo */}
          <div className="text-2xl font-bold">
            LMS Admin
          </div>

          {/* Right side: Navigation links */}
          <div className="flex gap-6 items-center">
            {/* Dashboard link */}
            <Link
              to="/app/admin/dashboard"
              className="hover:bg-purple-600 px-3 py-2 rounded-lg transition"
            >
              Dashboard
            </Link>

            {/* Users link */}
            <Link
              to="/app/admin/users"
              className="hover:bg-purple-600 px-3 py-2 rounded-lg transition"
            >
              Users
            </Link>

            {/* Teachers link */}
            <Link
              to="/app/admin/teachers"
              className="hover:bg-purple-600 px-3 py-2 rounded-lg transition"
            >
              Teachers
            </Link>

            {/* Courses link */}
            <Link
              to="/app/admin/courses"
              className="hover:bg-purple-600 px-3 py-2 rounded-lg transition"
            >
              Courses
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;