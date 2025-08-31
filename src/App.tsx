import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import AdminPortal from './components/AdminPortal';
import ClientPortal from './components/ClientPortal';

function AppContent() {
  const { user, profile, loading } = useAuth();

  console.log('AppContent State:', { user: !!user, profile: !!profile, role: profile?.role, loading });

  if (loading) {
    console.log('AppContent: Loading auth state...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('AppContent: No user found, rendering AuthForm.');
    return <AuthForm />;
  }

  // User is logged in, but profile might still be null if fetching failed or is delayed
  if (!profile) {
    console.log('AppContent: User is logged in, but profile data is not available. This might indicate a profile fetching issue or a temporary state.');
    // Fallback to a loading state for profile, or a generic message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Route based on user role
  if (profile.role === 'admin') {
    console.log('AppContent: User is admin, routing to Admin Portal.');
    return <AdminPortal />;
  } else {
    console.log('AppContent: User is client or role is not admin, routing to Client Portal. Role:', profile.role);
    return <ClientPortal />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;