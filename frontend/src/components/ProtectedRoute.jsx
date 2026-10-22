import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles is an array of role strings that may access the children
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // simple loading UI
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // logged in but role not authorized
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
