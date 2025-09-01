import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminClients from '../pages/admin/AdminClients';
import AdminWorkflows from '../pages/admin/AdminWorkflows';
import AdminSettings from '../pages/admin/AdminSettings';
import ClientDetail from '../pages/admin/ClientDetail';

export default function AdminPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, user } = useAuth();

  // Debug logging for admin portal
  React.useEffect(() => {
    console.log('👑 AdminPortal mounted:', {
      userId: user?.id,
      userEmail: user?.email,
      profileRole: profile?.role,
      profileId: profile?.id
    });
  }, [user, profile]);

  // Verify user has admin role
  if (profile?.role !== 'admin') {
    console.log('❌ User does not have admin role:', profile?.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-400 mb-4">🚫</div>
          <h3 className="text-lg font-medium text-white mb-2">Access Denied</h3>
          <p className="text-red-300 mb-4">
            You don't have permission to access the admin portal.
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering Admin Portal for user:', user?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<AdminClients />} />
              <Route path="/clients" element={<AdminClients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/workflows" element={<AdminWorkflows />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}