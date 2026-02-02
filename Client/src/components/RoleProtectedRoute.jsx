import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RoleProtectedRoute({ children, requiredRole }) {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.role);
  const storageRole = localStorage.getItem('role');
  
  const userRole = role || storageRole;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== requiredRole) {
    if (userRole === 'admin') {
      return <Navigate to="/app/admin/dashboard" replace />;
    } else if (userRole === 'teacher') {
      return <Navigate to="/app/teacher/dashboard" replace />;
    } else {
      return <Navigate to="/app/student/dashboard" replace />;
    }
  }

  return children;
}