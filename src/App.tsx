import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import JobDetailsPage from './pages/JobDetailsPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PostJobPage from './pages/customer/PostJobPage';
import EditJobPage from './pages/customer/EditJobPage';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerEditProfilePage from './pages/worker/WorkerEditProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Static
import SupportPage from './pages/static/SupportPage';
import HelpCenterPage from './pages/static/HelpCenterPage';
import PrivacyPolicyPage from './pages/static/PrivacyPolicyPage';
import TermsOfServicePage from './pages/static/TermsOfServicePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/worker/:id" element={<WorkerProfilePage />} />
            <Route path="/job/:id" element={<JobDetailsPage />} />
            
            <Route path="/support" element={<SupportPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            
            {/* Employer Routes */}
            <Route path="/employer" element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="profile" element={<CustomerDashboard />} />
              <Route path="post-job" element={<PostJobPage />} />
              <Route path="edit-job/:id" element={<EditJobPage />} />
            </Route>

            {/* Worker Routes */}
            <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']} />}>
              <Route path="profile" element={<WorkerDashboard />} />
              <Route path="profile/edit" element={<WorkerEditProfilePage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route index element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Auth (No MainLayout wrapper so it can be standalone or we can wrap it, let's wrap it in another or just raw) */}
          <Route element={<MainLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
