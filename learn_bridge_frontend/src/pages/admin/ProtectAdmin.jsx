import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth);
  
  if (!initialized) {
    return <Navigate to="/signin" replace />;
    // return <div>Loading...</div>;
  }
  
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

export default ProtectedRoute