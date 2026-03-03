import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerRoute = () => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/portal/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'customer') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default CustomerRoute;
