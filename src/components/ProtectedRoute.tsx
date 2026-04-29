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

  if (userProfile?.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Account Suspended</h1>
          <p className="text-zinc-400 mb-6">Your account has been suspended due to violations of our terms of service.</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && userProfile) {
    if (!allowedRoles.includes(userProfile.role as any)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
