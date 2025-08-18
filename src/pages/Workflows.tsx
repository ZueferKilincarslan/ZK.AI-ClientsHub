import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

const workflows = [
  {
    id: 1,
    name: 'Welcome Email Sequence',
    status: 'active',
    lastRun: '2 minutes ago',
    executions: 1247,
    successRate: 98.2,
    description: 'Automated welcome series for new subscribers',
  },
  {
    id: 2,
    name: 'Lead Nurturing Campaign',
    status: 'active',
    lastRun: '15 minutes ago',
    executions: 892,
    successRate: 94.7,
    description: 'Multi-touch campaign for lead conversion',
  },
  {
    id: 3,
    name: 'Customer Onboarding',
    status: 'paused',
    lastRun: '1 hour ago',
    executions: 634,
    successRate: 87.3,
    description: 'Step-by-step onboarding for new customers',
  },
  {
    id: 4,
    name: 'Abandoned Cart Recovery',
    status: 'failed',
    lastRun: '3 hours ago',
    executions: 423,
    successRate: 76.8,
    description: 'Recover abandoned shopping carts',
  },
  {
    id: 5,
    name: 'Weekly Newsletter',
    status: 'active',
    lastRun: '1 day ago',
    executions: 156,
    successRate: 99.1,
    description: 'Weekly newsletter automation',
  },
];

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-100',
    label: 'Active',
  },
  paused: {
    icon: Pause,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100',
    label: 'Paused',
  },
  failed: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-100',
    label: 'Failed',
  },
};

export default function Workflows() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor your automated workflows.
          </p>
        </div>
        <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredWorkflows.map((workflow) => {
          const StatusIcon = statusConfig[workflow.status].icon;
          return (
            <div
              key={workflow.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${statusConfig[workflow.status].bg}`}>
                      <StatusIcon className={`h-5 w-5 ${statusConfig[workflow.status].color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {workflow.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[workflow.status].bg} ${statusConfig[workflow.status].color}`}>
                        {statusConfig[workflow.status].label}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Executions:</span>
                    <span className="font-medium text-gray-900">{workflow.executions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="font-medium text-gray-900">{workflow.successRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Run:</span>
                    <span className="font-medium text-gray-900">{workflow.lastRun}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {workflow.status === 'active' && (
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Pause className="mr-1 h-4 w-4" />
                        Pause
                      </button>
                    )}
                    {workflow.status === 'paused' && (
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Play className="mr-1 h-4 w-4" />
                        Resume
                      </button>
                    )}
                    {workflow.status === 'failed' && (
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Play className="mr-1 h-4 w-4" />
                        Restart
                      </button>
                    )}
                  </div>
                  <Link
                    to={`/workflows/${workflow.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}