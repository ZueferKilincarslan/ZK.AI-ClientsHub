import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminPortal from './components/AdminPortal';
import ClientPortal from './components/ClientPortal';

function ProtectedAppContent() {
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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <ProtectedAppContent />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;