// TeacherNavbar.jsx - Navigation bar for teachers
// Shows teacher-specific links: Dashboard, My Courses, Create Course, Logout
// Uses React Router v6 <Link> for proper SPA navigation

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const TeacherNavbar = () => {
  // Hook for logout redirect (only used for logout, not regular navigation)
  const navigate = useNavigate();

  // Redux dispatch hook for logout
  const dispatch = useDispatch();

  // Handle logout - clear auth state and redirect to login
  const handleLogout = () => {
    // Step 1: Dispatch Redux logout action (clears token from Redux + localStorage)
    dispatch(logout());

    // Step 2: Clear userRole from localStorage
    localStorage.removeItem('userRole');

    // Step 3: Redirect to login page (logout is special - not a regular route)
    navigate('/');
  };

  return (
    <nav className="bg-purple-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Navbar container - flex layout for alignment */}
        <div className="flex items-center justify-between">
          {/* Left side: Brand/Logo */}
          <div className="text-2xl font-bold">
            LMS Teacher
          </div>

          {/* Right side: Navigation links */}
          <div className="flex gap-6 items-center">
            {/* Dashboard link - uses React Router <Link> for proper navigation */}
            <Link
              to="/app/teacher/dashboard"
              className="hover:bg-purple-700 px-3 py-2 rounded-lg transition"
            >
              Dashboard
            </Link>

            {/* My Courses link - uses React Router <Link> */}
            <Link
              to="/app/teacher/courses"
              className="hover:bg-purple-700 px-3 py-2 rounded-lg transition"
            >
              My Courses
            </Link>

            {/* Create Course link - uses React Router <Link> */}
            <Link
              to="/app/teacher/course/create"
              className="hover:bg-purple-700 px-3 py-2 rounded-lg transition"
            >
              Create Course
            </Link>

            {/* Logout button - onClick handler (not a regular route) */}
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

export default TeacherNavbar;