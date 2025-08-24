import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile, Workflow } from '../../lib/supabase';
import { 
  Users, 
  Search, 
  Plus,
  Eye, 
  Activity,
  Calendar,
  ArrowUpRight,
  Mail,
  Lock
} from 'lucide-react';

interface ClientWithWorkflows extends Profile {
  workflows: Workflow[];
  workflowCount: number;
  lastActivity: string | null;
}

export default function AdminClients() {
  const { user, createClient } = useAuth();
  const [clients, setClients] = useState<ClientWithWorkflows[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [addingClient, setAddingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [addClientError, setAddClientError] = useState('');

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Fetch all client profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch workflows for each client
      const clientsWithWorkflows = await Promise.all(
        (profiles || []).filter(profile => 
          // Filter clients (exclude admins)
          profile.role !== 'admin'
        ).map(async (profile) => {
          const { data: workflows, error: workflowsError } = await supabase
            .from('workflows')
            .select('*')
            .eq('user_id', profile.id)
            .order('updated_at', { ascending: false });

          if (workflowsError) {
            console.error('Error fetching workflows for client:', workflowsError);
          }

          const workflowList = workflows || [];
          const lastActivity = workflowList.length > 0 ? workflowList[0].updated_at : null;

          return {
            ...profile,
            workflows: workflowList,
            workflowCount: workflowList.length,
            lastActivity,
          };
        })
      );

      setClients(clientsWithWorkflows);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddClientError('');

    if (!newClientData.email || !newClientData.password) {
      setAddClientError('Email and password are required');
      return;
    }

    if (newClientData.password.length < 6) {
      setAddClientError('Password must be at least 6 characters long');
      return;
    }

    try {
      setAddingClient(true);
      await createClient(
        newClientData.email,
        newClientData.password,
        newClientData.fullName || undefined
      );

      // Reset form
      setNewClientData({
        email: '',
        password: '',
        fullName: '',
      });
      setShowAddClient(false);
      
      // Refresh clients list
      fetchClients();
      
      alert('Client created successfully! They will be required to change their password on first login.');
    } catch (error: any) {
      console.error('Error creating client:', error);
      setAddClientError(error.message || 'Failed to create client');
    } finally {
      setAddingClient(false);
    }
  };

  const handleCancelAddClient = () => {
    setShowAddClient(false);
    setNewClientData({
      email: '',
      password: '',
      fullName: '',
    });
    setAddClientError('');
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return 'No activity';
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Management</h1>
          <p className="mt-1 text-sm text-purple-300">
            Manage all registered clients and their workflows.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddClient(true)}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={handleCancelAddClient}></div>
            
            <div className="inline-block align-bottom bg-slate-800/95 backdrop-blur-xl rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-500/20">
              <div className="px-6 py-4 border-b border-purple-500/20">
                <h3 className="text-lg font-medium text-white">Add New Client</h3>
                <p className="mt-1 text-sm text-purple-300">Create a new client account with temporary password</p>
              </div>
              
              <form onSubmit={handleAddClient} className="px-6 py-4 space-y-4">
                {addClientError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{addClientError}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <input
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                      className="block w-full rounded-lg border border-purple-500/30 bg-slate-700/50 pl-10 pr-3 py-2 text-sm text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      placeholder="client@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newClientData.fullName}
                    onChange={(e) => setNewClientData({ ...newClientData, fullName: e.target.value })}
                    className="block w-full rounded-lg border border-purple-500/30 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Temporary Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <input
                      type="password"
                      value={newClientData.password}
                      onChange={(e) => setNewClientData({ ...newClientData, password: e.target.value })}
                      className="block w-full rounded-lg border border-purple-500/30 bg-slate-700/50 pl-10 pr-3 py-2 text-sm text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      placeholder="Temporary password"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="mt-1 text-xs text-purple-400">
                    Client will be required to change this password on first login
                  </p>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelAddClient}
                    className="px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingClient}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {addingClient ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-purple-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-purple-500/30 bg-slate-800/50 py-2 pl-10 pr-3 text-sm placeholder-purple-400 text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-300 truncate">Total Clients</dt>
                <dd className="text-2xl font-bold text-white">{clients.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-300 truncate">Total Workflows</dt>
                <dd className="text-2xl font-bold text-white">
                  {clients.reduce((sum, client) => sum + client.workflowCount, 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-300 truncate">Active Today</dt>
                <dd className="text-2xl font-bold text-white">
                  {clients.filter(client => formatLastActivity(client.lastActivity) === 'Today').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-400/40"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden shadow-lg">
                    {client.avatar_url ? (
                      <img 
                        src={client.avatar_url} 
                        alt={client.full_name || client.email}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {client.full_name?.charAt(0) || client.email.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {client.full_name || 'Unnamed Client'}
                    </h3>
                    <p className="text-sm text-purple-300">{client.email}</p>
                  </div>
                </div>
                <Link
                  to={`/clients/${client.id}`}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Workflows:</span>
                  <span className="font-medium text-white">{client.workflowCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Last Activity:</span>
                  <span className="font-medium text-white">{formatLastActivity(client.lastActivity)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Joined:</span>
                  <span className="font-medium text-white">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={`/clients/${client.id}`}
                  className="inline-flex items-center w-full justify-center px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-purple-400">
            <Users className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-white">No clients found</h3>
          <p className="mt-1 text-sm text-purple-300">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No clients have registered yet.'}
          </p>
        </div>
      )}
    </div>
  );
}