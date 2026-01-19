import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmailVerification from './pages/auth/EmailVerification';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Calculators from './pages/Calculators';
import RiskAssessment from './pages/RiskAssessment';

import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import { Settings } from './pages/Settings';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Public Route wrapper (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = localStorage.getItem('token');

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<Landing />} />

                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/reset-password"
                    element={
                        <PublicRoute>
                            <ResetPassword />
                        </PublicRoute>
                    }
                />

                {/* Email Verification Route (Protected) */}
                <Route
                    path="/verify-email"
                    element={
                        <ProtectedRoute>
                            <EmailVerification />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Routes with AppLayout */}
                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/calculators" element={<Calculators />} />
                    <Route path="/risk-assessment" element={<RiskAssessment />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                {/* 404 - Redirect to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
