import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

export default function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" />;
    if (user.role === 'CARETAKER') return <Navigate to="/caretaker/dashboard" />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" />;
    return <Navigate to="/login" />;
  }
  return children;
}
