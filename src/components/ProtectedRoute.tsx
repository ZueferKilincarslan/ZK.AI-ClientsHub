import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading, error } = useAuth();
  const location = useLocation();
  const [showFallback, setShowFallback] = useState(false);

  // Fallback timer to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        console.warn('⏰ Auth loading timeout - redirecting to login');
        setShowFallback(true);
      }
    }, 10000); // 10 second fallback

    return () => clearTimeout(fallbackTimer);
  }, [loading]);

  // Show loading screen while initializing
  if (loading && !showFallback) {
    return <LoadingScreen />;
  }

  // Redirect to login if there's an error, no config, or fallback triggered, or no user
  if (error || showFallback || !user) {
    console.log('🔄 Redirecting to login - no authenticated user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for profile to load (but with timeout protection)
  if (!profile && !showFallback) {
    return <LoadingScreen />;
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}