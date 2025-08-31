import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pause, 
  Settings, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Database,
  Webhook
} from 'lucide-react';

interface LogStep {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  duration: string;
  error?: string; // Make error optional
}

interface ExecutionLog {
  id: number;
  timestamp: string;
  status: 'success' | 'failed';
  duration: string;
  error?: string; // Make error optional
  steps: LogStep[];
}

interface WorkflowDetailData {
  name: string;
  status: 'active' | 'paused' | 'failed';
  description: string;
  created: string;
  lastModified: string;
  executions: number;
  successRate: number;
  avgDuration: string;
}

const workflowData: Record<string, WorkflowDetailData> = {
  "1": { // Use string key for ID
    name: 'Welcome Email Sequence',
    status: 'active',
    description: 'Automated welcome series for new subscribers',
    created: '2024-01-15',
    lastModified: '2024-01-20',
    executions: 1247,
    successRate: 98.2,
    avgDuration: '2.3s',
  }
};

const executionLogs: ExecutionLog[] = [
  {
    id: 1,
    timestamp: '2024-01-22 14:30:25',
    status: 'success',
    duration: '2.1s',
    steps: [
      { name: 'Trigger: New Subscriber', status: 'success', duration: '0.1s' },
      { name: 'Send Welcome Email', status: 'success', duration: '1.8s' },
      { name: 'Add to CRM', status: 'success', duration: '0.2s' },
    ]
  },
  {
    id: 2,
    timestamp: '2024-01-22 14:28:15',
    status: 'success',
    duration: '2.4s',
    steps: [
      { name: 'Trigger: New Subscriber', status: 'success', duration: '0.1s' },
      { name: 'Send Welcome Email', status: 'success', duration: '2.1s' },
      { name: 'Add to CRM', status: 'success', duration: '0.2s' },
    ]
  },
  {
    id: 3,
    timestamp: '2024-01-22 14:25:42',
    status: 'failed',
    duration: '1.2s',
    error: 'Email service timeout',
    steps: [
      { name: 'Trigger: New Subscriber', status: 'success', duration: '0.1s' },
      { name: 'Send Welcome Email', status: 'failed', duration: '1.0s', error: 'Timeout' },
      { name: 'Add to CRM', status: 'skipped', duration: '0s' },
    ]
  },
];

const workflowSteps = [
  { id: 1, name: 'New Subscriber Trigger', type: 'trigger', icon: Webhook },
  { id: 2, name: 'Send Welcome Email', type: 'action', icon: Mail },
  { id: 3, name: 'Add to CRM Database', type: 'action', icon: Database },
];

export default function WorkflowDetail() {
  const { id } = useParams<{ id: string }>(); // Specify type for id
  const [activeTab, setActiveTab] = useState('overview');
  
  const workflow = id ? workflowData[id] : workflowData["1"]; // Handle undefined id

  if (!workflow) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Workflow not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The requested workflow could not be found.
        </p>
        <Link
          to="/workflows"
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflows
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'executions', name: 'Execution Logs' },
    { id: 'settings', name: 'Settings' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/workflows"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </button>
          <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Settings className="mr-2 h-4 w-4" />
            Edit
          </button>
          <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </button>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{workflow.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Executions</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{workflow.executions.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{workflow.successRate}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Avg Duration</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{workflow.avgDuration}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{workflow.lastModified}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Workflow Steps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Steps</h3>
                <div className="space-y-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                          <step.icon className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{step.type}</p>
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <div className="flex-shrink-0">
                          <div className="h-5 w-5 text-gray-400">→</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {executionLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Execution {log.status === 'success' ? 'completed' : 'failed'}
                          </p>
                          <p className="text-sm text-gray-500">{log.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Duration: {log.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'executions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Execution Logs</h3>
              <div className="space-y-4">
                {executionLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.timestamp}
                          </p>
                          <p className="text-sm text-gray-500">
                            Duration: {log.duration}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    
                    {log.error && (
                      <div className="mb-3 p-2 bg-red-50 rounded-md">
                        <p className="text-sm text-red-700">Error: {log.error}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {log.steps.map((step, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            {step.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {step.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                            {step.status === 'skipped' && <Clock className="h-4 w-4 text-gray-400" />}
                            <span className="text-gray-900">{step.name}</span>
                            {step.error && <span className="text-red-600">({step.error})</span>}
                          </div>
                          <span className="text-gray-500">{step.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Workflow Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Workflow Name</label>
                  <input
                    type="text"
                    value={workflow.name}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={workflow.description}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
                    Enable workflow
                  </label>
                </div>
                <div className="pt-4">
                  <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}