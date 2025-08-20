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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<AdminClients />} />
              <Route path="/clients" element={<AdminClients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/workflows" element={<AdminWorkflows />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/clients" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}