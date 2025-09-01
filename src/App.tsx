import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import AdminPortal from './components/AdminPortal';
import ClientPortal from './components/ClientPortal';
import DebugPanel from './components/DebugPanel';

function AppContent() {
  const { user, profile, loading } = useAuth();

  // Debug logging for troubleshooting
  React.useEffect(() => {
    console.log('🔍 App routing debug:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileRole: profile?.role,
      loading,
      timestamp: new Date().toISOString()
    });
  }, [user, profile, loading]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-purple-300">Loading your workspace...</p>
          <p className="mt-2 text-xs text-purple-400">
            {user ? 'Fetching profile...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // Show auth form if no user
  if (!user) {
    console.log('🔐 No user found - showing auth form');
    return <AuthForm />;
  }

  // Handle missing profile case
  if (!profile) {
    console.log('⚠️ User exists but no profile found - this should not happen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-white mb-2">Profile Not Found</h3>
          <p className="text-red-300 mb-4">
            Your account exists but profile data is missing. Please contact support.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-red-500/30 text-sm font-medium rounded-lg text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:text-white transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Route based on user role with explicit logging
  console.log('🎯 Routing user based on role:', {
    email: user.email,
    role: profile.role,
    profileId: profile.id
  });

  if (profile.role === 'admin') {
    console.log('✅ Routing to Admin Portal for:', user.email);
    return <AdminPortal />;
  } else if (profile.role === 'client') {
    console.log('✅ Routing to Client Portal for:', user.email);
    return <ClientPortal />;
  } else {
    console.log('❌ Unknown role detected:', profile.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-yellow-400 mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-white mb-2">Invalid Role</h3>
          <p className="text-yellow-300 mb-4">
            Your account has an invalid role: "{profile.role}". Please contact support.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-yellow-500/30 text-sm font-medium rounded-lg text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 hover:text-white transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
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
      <DebugPanel />
    </AuthProvider>
  );
}

export default App;