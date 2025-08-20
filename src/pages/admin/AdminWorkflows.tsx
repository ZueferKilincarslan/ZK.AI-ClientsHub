import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Workflow, Profile } from '../../lib/supabase';
import { 
  Upload, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  User
} from 'lucide-react';

interface WorkflowWithClient extends Workflow {
  client: Profile;
}

export default function AdminWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploadingWorkflow, setUploadingWorkflow] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllWorkflows();
    }
  }, [user]);

  const fetchAllWorkflows = async () => {
    try {
      setLoading(true);
      
      // Fetch all workflows with client information
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select(`
          *,
          profiles!workflows_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .order('updated_at', { ascending: false });

      if (workflowsError) throw workflowsError;

      const workflowsWithClients = (workflowsData || []).map(workflow => ({
        ...workflow,
        client: workflow.profiles
      }));

      setWorkflows(workflowsWithClients);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingWorkflow(true);
      
      // Read file content
      const fileContent = await file.text();
      const workflowData = JSON.parse(fileContent);

      // Call webhook with workflow data
      const webhookUrl = import.meta.env.VITE_WORKFLOW_WEBHOOK_URL || 'https://your-webhook-url.com/workflow';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow: workflowData,
          uploadedBy: user?.id,
          uploadedAt: new Date().toISOString(),
        }),
      });

      alert('Workflow uploaded successfully!');
      fetchAllWorkflows(); // Refresh data
    } catch (error) {
      console.error('Error uploading workflow:', error);
      alert('Error uploading workflow. Please try again.');
    } finally {
      setUploadingWorkflow(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.client?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-400/20',
      border: 'border-green-400/30',
      label: 'Active',
    },
    paused: {
      icon: Pause,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20',
      border: 'border-yellow-400/30',
      label: 'Paused',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/20',
      border: 'border-red-400/30',
      label: 'Failed',
    },
  };

  const formatLastRun = (lastRun: string | null) => {
    if (!lastRun) return 'Never';
    const date = new Date(lastRun);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Workflows</h1>
          <p className="mt-1 text-sm text-purple-300">
            Monitor and manage workflows across all clients.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={handleWorkflowUpload}
            className="hidden"
            id="workflow-upload-all"
            disabled={uploadingWorkflow}
          />
          <label
            htmlFor="workflow-upload-all"
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
              uploadingWorkflow
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
            }`}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadingWorkflow ? 'Uploading...' : 'Upload Workflow'}
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-purple-400" />
            </div>
            <input
              type="text"
              placeholder="Search workflows or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-purple-500/30 bg-slate-800/50 py-2 pl-10 pr-3 text-sm placeholder-purple-400 text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 backdrop-blur-sm"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-purple-500/30 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 backdrop-blur-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{workflows.length}</div>
            <div className="text-sm text-purple-300">Total Workflows</div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 shadow-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {workflows.filter(w => w.status === 'active').length}
            </div>
            <div className="text-sm text-green-300">Active</div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/20 shadow-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {workflows.filter(w => w.status === 'paused').length}
            </div>
            <div className="text-sm text-yellow-300">Paused</div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-red-500/20 shadow-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {workflows.filter(w => w.status === 'failed').length}
            </div>
            <div className="text-sm text-red-300">Failed</div>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-500/20">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Executions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                  Last Run
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {filteredWorkflows.map((workflow) => {
                const StatusIcon = statusConfig[workflow.status].icon;
                return (
                  <tr key={workflow.id} className="hover:bg-purple-500/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{workflow.name}</div>
                        <div className="text-sm text-purple-300">{workflow.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                          {workflow.client?.avatar_url ? (
                            <img 
                              src={workflow.client.avatar_url} 
                              alt={workflow.client.full_name || workflow.client.email}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-white">
                              {workflow.client?.full_name?.charAt(0) || workflow.client?.email?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {workflow.client?.full_name || 'Unnamed Client'}
                          </div>
                          <div className="text-sm text-purple-300">{workflow.client?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[workflow.status].bg} ${statusConfig[workflow.status].color} ${statusConfig[workflow.status].border}`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[workflow.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {workflow.executions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        workflow.success_rate >= 95 ? 'text-green-400' :
                        workflow.success_rate >= 80 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {workflow.success_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                      {formatLastRun(workflow.last_run)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-purple-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-white">No workflows found</h3>
          <p className="mt-1 text-sm text-purple-300">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}