// StudentNavbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const StudentNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("userRole");
    navigate("/");
    setMenuOpen(false); // Close menu on logout as well
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold">LMS Student</div>

        {/* Hamburger button for small screens */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu links */}
        <div
          className={`flex-col md:flex md:flex-row md:items-center gap-4 md:gap-6 absolute md:static top-16 left-0 w-full md:w-auto bg-blue-600 md:bg-transparent transition-all ${
            menuOpen ? "flex" : "hidden"
          }`}
        >
          <Link
            to="/app/student/dashboard"
            className="hover:bg-blue-700 px-3 py-2 rounded-lg transition"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/app/dashboard"
            className="hover:bg-blue-700 px-3 py-2 rounded-lg transition"
            onClick={() => setMenuOpen(false)}
          >
            My Courses
          </Link>

          <Link
            to="/app/student/courses"
            className="hover:bg-blue-700 px-3 py-2 rounded-lg transition"
            onClick={() => setMenuOpen(false)}
          >
            Browse Courses
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
