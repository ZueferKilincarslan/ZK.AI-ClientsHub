import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  // Check if user needs to change password
  const requiresPasswordChange = user?.user_metadata?.requires_password_change === true;
  
  if (requiresPasswordChange) {
    return <ChangePassword />;
  }

  // Redirect to login if accessing login page while authenticated
  if (location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

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