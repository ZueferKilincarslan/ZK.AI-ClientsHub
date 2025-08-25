import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import ClientPortal from './components/ClientPortal';
import AdminPortal from './components/AdminPortal';

function AppContent() {
  const { user, loading, error, profile, retryConnection } = useAuth();

  console.log('🎯 App state:', { 
    hasUser: !!user, 
    loading, 
    hasError: !!error, 
    userRole: profile?.role 
  });

  // Always enforce authentication flow - no bypassing in any mode
  const isAuthenticated = !!user;
  const isInitializing = loading && !error;

  // Show error state only for critical errors (not configuration issues)
  if (error) {
    console.log('❌ Showing error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-md w-full space-y-8 text-center mx-auto flex flex-col justify-center min-h-screen">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 shadow-2xl">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white">Connection Error</h1>
          <p className="mt-2 text-sm text-purple-300">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Retry Connection
            </button>
            <div className="text-xs text-purple-400">
              <p>If this persists, check:</p>
              <ul className="mt-1 space-y-1">
                <li>• Internet connection</li>
                <li>• Supabase configuration</li>
                <li>• Browser console for errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state with timeout protection
  if (isInitializing) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <div className="mt-4">
            <h1 className="text-xl font-bold text-white">ZK.AI</h1>
            <p className="text-sm text-purple-300 mt-2">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if no user is authenticated
  if (!isAuthenticated) {
    console.log('🔐 Showing login form - no user authenticated');
    return <AuthForm />;
  }

  // Show appropriate portal based on user role with proper routing
  console.log('🏠 User authenticated, showing portal for role:', profile?.role || 'client');
  
  return (
    <Router>
      <Routes>
        {profile?.role === 'admin' ? (
          <Route path="/*" element={<AdminPortal />} />
        ) : (
          <Route path="/*" element={<ClientPortal />} />
        )}
      </Routes>
    </Router>
  );
}

export default function App() {
  // Ensure clean state on app mount
  React.useEffect(() => {
    console.log('🚀 App mounted - ensuring clean authentication state');
    
    // Clear any stale data that might cause preview mode issues
    const clearStaleData = () => {
      // Don't clear legitimate auth tokens, just stale UI state
      sessionStorage.removeItem('preview-mode-bypass');
      sessionStorage.removeItem('demo-user');
    };
    
    clearStaleData();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}