import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="page-container"><p>Cargando...</p></div>;
  }

  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
