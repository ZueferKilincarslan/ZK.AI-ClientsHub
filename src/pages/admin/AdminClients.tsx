import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile } from '../../lib/supabase';
import { Users, Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientWithWorkflows extends Profile {
  workflows_count: number;
}

export default function AdminClients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientWithWorkflows[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    if (!user || !supabase) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 AdminClients: Fetching clients...');
      
      // Fetch all client profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      console.log('✅ AdminClients: Found profiles:', profiles?.length || 0);

      // Fetch workflow counts for each client
      const clientsWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            const { count, error: countError } = await supabase
              .from('workflows')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);

            if (countError) {
              console.error('Error fetching workflow count for client:', profile.id, countError);
              return {
                ...profile,
                workflows_count: 0
              };
            }

            return {
              ...profile,
              workflows_count: count || 0
            };
          } catch (error) {
            console.error('Error in workflow count fetch:', error);
            return {
              ...profile,
              workflows_count: 0
            };
          }
        })
      );

      console.log('✅ AdminClients: Clients with counts:', clientsWithCounts.length);
      setClients(clientsWithCounts);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    (client.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.organization_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This will also delete all their workflows and data.')) {
      deleteClient(clientId);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!supabase) return;
    
    try {
      // Delete the client profile (workflows will be deleted via CASCADE)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      // Remove from local state
      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-sm text-purple-300">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Management</h1>
          <p className="text-purple-300">Manage all client accounts and their workflows</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-red-500/20 shadow-xl p-6">
          <div className="text-center">
            <div className="text-red-400 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Clients</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchClients}
              className="inline-flex items-center px-4 py-2 border border-red-500/30 text-sm font-medium rounded-lg text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:text-white transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Management</h1>
          <p className="text-purple-300">Manage all client accounts and their workflows</p>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-purple-500/30 bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-400"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Workflows
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-purple-500/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
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
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{client.full_name || 'Unnamed Client'}</div>
                        <div className="text-sm text-purple-300">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {client.organization_id || 'No Organization'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-400/20 text-blue-400 border border-blue-400/30">
                      {client.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {client.workflows_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewClient(client.id)}
                        className="text-purple-400 hover:text-purple-300 p-1 transition-colors"
                        title="View client"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-purple-400 hover:text-purple-300 p-1 transition-colors"
                        title="Edit client"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-400 hover:text-red-300 p-1 transition-colors"
                        title="Delete client"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-purple-400" />
            <h3 className="mt-2 text-sm font-medium text-white">No clients found</h3>
            <p className="mt-1 text-sm text-purple-300">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new client.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}