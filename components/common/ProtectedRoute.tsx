
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// FIX: Corrected import path for UserRole type.
import { UserRole } from '../../types/index';

interface ProtectedRouteProps {
  // FIX: Replaced JSX.Element with React.ReactNode to fix missing namespace error.
  children: React.ReactNode;
  role: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // Redirect to the correct dashboard or an unauthorized page
    const homePath = user.role === 'owner' ? '/owner/dashboard' : '/supplier/dashboard';
    return <Navigate to={homePath} replace />;
  }

  return children;
};

export default ProtectedRoute;