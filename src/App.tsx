import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import AdminPortal from './components/AdminPortal';
import ClientPortal from './components/ClientPortal';

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

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, error } = useAuth();
  const location = useLocation();

  // Show loading screen while initializing
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error state if Supabase is not configured
  if (error) {
    return <AuthForm />;
  }

  // Show login form if no user
  if (!user) {
    return <AuthForm />;
  }

  // Wait for profile to load
  if (!profile) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function AppContent() {
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
    <AuthProvider>
      <Router>
        <AuthGuard>
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </AuthGuard>
      </Router>
    </AuthProvider>
  );
}

export default App;