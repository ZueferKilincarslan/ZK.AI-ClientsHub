import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
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
  const [showFallback, setShowFallback] = useState(false);

  // Fallback timer to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        console.warn('⏰ Auth loading timeout - showing fallback');
        setShowFallback(true);
      }
    }, 10000); // 10 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [loading]);

  // Show loading screen while initializing
  if (loading && !showFallback) {
    return <LoadingScreen />;
  }

  // Show auth form if there's an error, no config, or fallback triggered
  if (error || showFallback || !user) {
    return <AuthForm />;
  }

  // Wait for profile to load (but with timeout protection)
  if (!profile && !showFallback) {
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
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AuthGuard>
            <Routes>
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </AuthGuard>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;