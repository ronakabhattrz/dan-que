import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated()) {
        // Redirect to appropriate login page
        return <Navigate to={requireAdmin ? '/admin/login' : '/login'} replace />;
    }

    if (requireAdmin && !isAdmin()) {
        // User is authenticated but not an admin
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
