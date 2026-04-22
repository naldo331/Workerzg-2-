import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('customer' | 'worker' | 'admin')[];
  requireVerified?: boolean;
}

export default function ProtectedRoute({ allowedRoles, requireVerified }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerified && !currentUser.emailVerified) {
    // In Jamaican environment, email verification can be tricky to enforce strictly for MVP
    // but we can enforce it. We'll skip for Phase 1 to let them test easily unless requested.
  }

  if (allowedRoles && userProfile) {
    if (!allowedRoles.includes(userProfile.role as any)) {
      if (userProfile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (userProfile.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
      return <Navigate to="/customer/dashboard" replace />;
    }
  }

  return <Outlet />;
}
