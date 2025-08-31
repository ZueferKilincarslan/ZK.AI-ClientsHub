import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile, Workflow, Analytics } from '../../lib/supabase';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  Pause,
  TrendingUp,
  BarChart3,
  Plus,
} from 'lucide-react';

interface ClientData extends Profile {
  workflows: Workflow[];
  analytics: Analytics[];
}

export default function ClientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddWorkflow, setShowAddWorkflow] = useState(false);
  const [uploadingWorkflow, setUploadingWorkflow] = useState(false);
  const [workflowData, setWorkflowData] = useState({
    name: '',
    file: null as File | null,
  });

  useEffect(() => {
    if (user && id) {
      fetchClientData();
    }
  }, [user, id]);

  const fetchClientData = async () => {
    if (!supabase) return; // Add null check for supabase
    try {
      setLoading(true);
      
      // Fetch client profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Fetch client workflows
      const { data: workflows, error: workflowsError } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', id)
        .order('updated_at', { ascending: false });

      if (workflowsError) throw workflowsError;

      // Fetch client analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', id)
        .order('date', { ascending: false });

      if (analyticsError) throw analyticsError;

      setClient({
        ...profile,
        workflows: workflows || [],
        analytics: analytics || [],
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflowData.name || !workflowData.file) {
      alert('Please provide both workflow name and file');
      return;
    }

    try {
      setUploadingWorkflow(true);
      
      // Read file content
      const fileContent = await workflowData.file.text();
      const workflowJson = JSON.parse(fileContent);

      // Prepare webhook payload
      const webhookPayload = {
        client: {
          id: client?.id,
          name: client?.full_name || 'Unnamed Client',
          email: client?.email,
        },
        workflow: {
          name: workflowData.name,
          data: workflowJson,
        },
        uploadedBy: user?.id,
        uploadedAt: new Date().toISOString(),
      };

      // Call webhook
      const webhookUrl = localStorage.getItem('webhook_url') || 
                        import.meta.env.VITE_WORKFLOW_WEBHOOK_URL || 
                        'https://your-webhook-url.com/workflow-upload';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
      }

      alert('Workflow uploaded successfully!');
      setShowAddWorkflow(false);
      setWorkflowData({ name: '', file: null });
      fetchClientData(); // Refresh data
    } catch (error: any) {
      console.error('Error uploading workflow:', error);
      alert('Error uploading workflow: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingWorkflow(false);
    }
  };

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

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'workflows', name: `Workflows (${client?.workflows.length || 0})`, icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white">Client not found</h3>
        <p className="mt-1 text-sm text-purple-300">
          The requested client could not be found.
        </p>
        <Link
          to="/clients"
          className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/clients"
            className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden shadow-lg">
              {client.avatar_url ? (
                <img 
                  src={client.avatar_url} 
                  alt={client.full_name || client.email}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-white">
                  {client.full_name?.charAt(0) || client.email.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {client.full_name || 'Unnamed Client'}
              </h1>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-purple-300">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <div className="flex items-center text-purple-300">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="text-sm">
                    Joined {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{client.workflows.length}</div>
              <div className="text-sm text-purple-300">Workflows</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-300 truncate">Active Workflows</dt>
                <dd className="text-2xl font-bold text-white">
                  {client.workflows.filter(w => w.status === 'active').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-300 truncate">Total Executions</dt>
                <dd className="text-2xl font-bold text-white">
                  {client.workflows.reduce((sum, w) => sum + w.executions, 0).toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-300 truncate">Avg Success Rate</dt>
                <dd className="text-2xl font-bold text-white">
                  {client.workflows.length > 0 
                    ? Math.round(client.workflows.reduce((sum, w) => sum + w.success_rate, 0) / client.workflows.length)
                    : 0}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 shadow-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-300 truncate">Analytics Records</dt>
                <dd className="text-2xl font-bold text-white">{client.analytics.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="border-b border-purple-500/20">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-purple-300 hover:text-white hover:border-purple-500/30'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {client.workflows.slice(0, 5).map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const StatusIcon = statusConfig[workflow.status].icon;
                          return (
                            <div className={`p-2 rounded-lg ${statusConfig[workflow.status].bg}`}>
                              <StatusIcon className={`h-4 w-4 ${statusConfig[workflow.status].color}`} />
                            </div>
                          );
                        })()}
                        <div>
                          <p className="text-sm font-medium text-white">{workflow.name}</p>
                          <p className="text-sm text-purple-300">{workflow.description}</p>
                        </div>
                      </div>
                      <div className="text-sm text-purple-300">
                        {workflow.executions.toLocaleString()} executions
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflows' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Client Workflows</h3>
                <button
                  onClick={() => setShowAddWorkflow(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Workflow
                </button>
              </div>
              
              {/* Add Workflow Modal */}
              {showAddWorkflow && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowAddWorkflow(false)}></div>
                    
                    <div className="inline-block align-bottom bg-slate-800/95 backdrop-blur-xl rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-500/20">
                      <div className="px-6 py-4 border-b border-purple-500/20">
                        <h3 className="text-lg font-medium text-white">Add Workflow</h3>
                        <p className="mt-1 text-sm text-purple-300">Upload a workflow for {client?.full_name || client?.email}</p>
                      </div>
                      
                      <form onSubmit={handleWorkflowUpload} className="px-6 py-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-300 mb-2">
                            Workflow Name *
                          </label>
                          <input
                            type="text"
                            value={workflowData.name}
                            onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
                            className="block w-full rounded-lg border border-purple-500/30 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            placeholder="Enter workflow name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-300 mb-2">
                            Workflow File (JSON) *
                          </label>
                          <input
                            type="file"
                            accept=".json"
                            onChange={(e) => setWorkflowData({ ...workflowData, file: e.target.files?.[0] || null })}
                            className="block w-full text-sm text-purple-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                            required
                          />
                        </div>
                        
                        <div className="flex items-center justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowAddWorkflow(false)}
                            className="px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={uploadingWorkflow}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {uploadingWorkflow ? 'Uploading...' : 'Upload Workflow'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {client.workflows.map((workflow) => {
                  const StatusIcon = statusConfig[workflow.status].icon;
                  return (
                    <div key={workflow.id} className="border border-purple-500/20 rounded-lg p-4 bg-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const StatusIcon = statusConfig[workflow.status].icon;
                            return (
                              <div className={`p-2 rounded-lg ${statusConfig[workflow.status].bg}`}>
                                <StatusIcon className={`h-5 w-5 ${statusConfig[workflow.status].color}`} />
                              </div>
                            );
                          })()}
                          <div>
                            <h4 className="text-sm font-medium text-white">{workflow.name}</h4>
                            <p className="text-sm text-purple-300">{workflow.description}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[workflow.status].bg} ${statusConfig[workflow.status].color} ${statusConfig[workflow.status].border}`}>
                          {statusConfig[workflow.status].label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-purple-300">Executions:</span>
                          <span className="ml-2 font-medium text-white">{workflow.executions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Success Rate:</span>
                          <span className="ml-2 font-medium text-white">{workflow.success_rate}%</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Last Run:</span>
                          <span className="ml-2 font-medium text-white">
                            {workflow.last_run ? new Date(workflow.last_run).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Analytics Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-500/20">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Metric
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {client.analytics.map((analytic) => (
                      <tr key={analytic.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {analytic.metric_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                          {analytic.metric_value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                          {new Date(analytic.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}