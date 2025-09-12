import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import AuthForm from './components/AuthForm';
import AdminPortal from './components/AdminPortal';
import ClientPortal from './components/ClientPortal';
import ProtectedRoute from './components/ProtectedRoute';

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-4 text-purple-300">Loading your workspace...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<AuthForm />} />
            
            {/* Protected routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppRoutes />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Main app routes based on user role
function AppRoutes() {
  const { profile } = useAuth();

  // Route based on user role
  if (profile?.role === 'admin') {
    console.log('Routing to Admin Portal for user:', profile.email);
    return <AdminPortal />;
  } else {
    console.log('Routing to Client Portal for user:', profile.email, 'role:', profile?.role);
    return <ClientPortal />;
  }
}

export default App;