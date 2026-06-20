import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';

// Auth Pages (No sidebar needed)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Main Pages (Inside Layout)
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LearningPage from './pages/LearningPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

import 'bootstrap/dist/css/bootstrap.min.css';

// Protected Route wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#0F172A' }}>
        <div className="spinner-border" role="status" style={{ color: '#00E5FF' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/scanner" replace />;
  }

  return children;
};

// Layout-wrapped route
const LayoutRoute = ({ children }) => (
  <Layout>{children}</Layout>
);

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#0F172A' }}>
        <div className="spinner-border" role="status" style={{ color: '#00E5FF' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/scanner" : "/login"} replace />} />

      {/* Auth routes (no Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public routes (with Layout/Sidebar) */}
      <Route path="/scanner" element={<LayoutRoute><ScannerPage /></LayoutRoute>} />
      <Route path="/learning" element={<LayoutRoute><LearningPage /></LayoutRoute>} />

      {/* Protected User routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><LayoutRoute><DashboardPage /></LayoutRoute></ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute><LayoutRoute><HistoryPage /></LayoutRoute></ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute><LayoutRoute><AnalyticsPage /></LayoutRoute></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><LayoutRoute><SettingsPage /></LayoutRoute></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><LayoutRoute><ProfilePage /></LayoutRoute></ProtectedRoute>
      } />

      {/* Admin-only routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}><LayoutRoute><AdminPage /></LayoutRoute></ProtectedRoute>
      } />

      {/* 404 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
