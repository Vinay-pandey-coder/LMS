import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setRole } from '../features/auth/authSlice';
import StudentNavbar from '../components/StudentNavbar';
import TeacherNavbar from '../components/TeacherNavbar';
import AdminNavbar from '../components/AdminNavbar';

const RoleLayout = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const token = useSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (!role) {
      const storageRole = localStorage.getItem('role');
      if (storageRole) {
        dispatch(setRole(storageRole));
      }
    }

    setLoading(false);
  }, [token, role, dispatch]);

  if (loading) {
    return null;
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const displayRole = role || localStorage.getItem('role');

  if (!displayRole) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {displayRole === 'student' && <StudentNavbar />}
      {displayRole === 'teacher' && <TeacherNavbar />}
      {displayRole === 'admin' && <AdminNavbar />}

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RoleLayout;
