import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import CourseDetail from '../pages/CourseDetail';

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
]);

export default router;