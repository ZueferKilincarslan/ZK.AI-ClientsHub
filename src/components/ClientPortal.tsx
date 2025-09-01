import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Analytics from '../pages/Analytics';
import Workflows from '../pages/Workflows';
import WorkflowDetail from '../pages/WorkflowDetail';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';

export default function ClientPortal() {
  const { profile, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug logging for client portal
  React.useEffect(() => {
    console.log('🏠 ClientPortal mounted:', {
      userId: user?.id,
      userEmail: user?.email,
      profileRole: profile?.role,
      profileId: profile?.id
    });
  }, [user, profile]);
  // Check if user needs to change password
  const requiresPasswordChange = user?.user_metadata?.requires_password_change === true;
  
  if (requiresPasswordChange) {
    console.log('🔒 User requires password change');
    return <ChangePassword />;
  }

  // Verify user has client role
  if (profile?.role !== 'client') {
    console.log('❌ User does not have client role:', profile?.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-400 mb-4">🚫</div>
          <h3 className="text-lg font-medium text-white mb-2">Access Denied</h3>
          <p className="text-red-300 mb-4">
            You don't have permission to access the client portal.
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering Client Portal for user:', user?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}