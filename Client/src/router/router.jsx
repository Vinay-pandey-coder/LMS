import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import CourseDetail from '../pages/CourseDetail';
import Quiz from '../pages/Quiz';
import Assignmentt from '../pages/Assignment'

// Define all routes using createBrowserRouter
const router = createBrowserRouter([
  // PUBLIC ROUTE
  {
    path: '/',
    element: <Login/>,
  },

  // PROTECTED ROUTES
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: '/course/:courseId',
    element: (
      <ProtectedRoute>
        <CourseDetail />
      </ProtectedRoute>
    ),
  },

    // Quiz route - students take quiz for a course
  {
    path: '/course/:courseId/quiz/:testId',
    element: (
      <ProtectedRoute>
        <Quiz />
      </ProtectedRoute>
    ),
  },

  // Assignment route - students view and submit assignments for a course
  {
    path: '/course/:courseId/assignment',
    element: (
      <ProtectedRoute>
        <Assignmentt/>
      </ProtectedRoute>
    ),
  },

]);

export default router;