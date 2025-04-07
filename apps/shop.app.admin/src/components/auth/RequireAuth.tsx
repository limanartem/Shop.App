import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface RequireAuthProps {
  children: React.ReactElement;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, isAdmin } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
