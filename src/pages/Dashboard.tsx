import React from 'react';
import { 
  Activity, 
  Mail, 
  Workflow, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  {
    name: 'Active Workflows',
    value: '12',
    change: '+2.1%',
    changeType: 'positive',
    icon: Workflow,
  },
  {
    name: 'Emails Sent',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive',
    icon: Mail,
  },
  {
    name: 'Success Rate',
    value: '94.2%',
    change: '-0.3%',
    changeType: 'negative',
    icon: TrendingUp,
  },
  {
    name: 'Total Executions',
    value: '18,429',
    change: '+8.7%',
    changeType: 'positive',
    icon: Activity,
  },
];

const recentActivity = [
  {
    id: 1,
    workflow: 'Welcome Email Sequence',
    status: 'completed',
    time: '2 minutes ago',
    executions: 15,
  },
  {
    id: 2,
    workflow: 'Lead Nurturing Campaign',
    status: 'running',
    time: '5 minutes ago',
    executions: 8,
  },
  {
    id: 3,
    workflow: 'Customer Onboarding',
    status: 'failed',
    time: '12 minutes ago',
    executions: 3,
  },
  {
    id: 4,
    workflow: 'Weekly Newsletter',
    status: 'completed',
    time: '1 hour ago',
    executions: 1,
  },
];

const notifications = [
  {
    id: 1,
    type: 'success',
    message: 'Welcome Email Sequence completed successfully',
    time: '5 minutes ago',
  },
  {
    id: 2,
    type: 'warning',
    message: 'API rate limit approaching for MailChimp integration',
    time: '1 hour ago',
  },
  {
    id: 3,
    type: 'error',
    message: 'Customer Onboarding workflow failed - check logs',
    time: '2 hours ago',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your workflows.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow sm:px-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center" />
                )}
                <span className="sr-only">
                  {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                </span>
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-400' :
                      activity.status === 'running' ? 'bg-blue-400' :
                      'bg-red-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.workflow}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {activity.executions} executions
                    </span>
                    {activity.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    {activity.status === 'running' && (
                      <Clock className="h-4 w-4 text-blue-400" />
                    )}
                    {activity.status === 'failed' && (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a
                href="/workflows"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all workflows →
              </a>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    {notification.type === 'warning' && (
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    )}
                    {notification.type === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all notifications →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 text-left shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <div className="flex items-center space-x-3">
                <Workflow className="h-6 w-6 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">
                  Create New Workflow
                </span>
              </div>
            </button>
            <button className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 text-left shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">
                  View Analytics
                </span>
              </div>
            </button>
            <button className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 text-left shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">
                  Email Templates
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}