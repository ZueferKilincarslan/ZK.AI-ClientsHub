import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase, Workflow, Analytics } from '../lib/supabase';
import { 
  Activity, 
  Mail, 
  Workflow as WorkflowIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

      if (workflowsError) throw workflowsError;
      setWorkflows(workflowsData || []);

      // Fetch analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', new Date().toISOString().split('T')[0]);

      if (analyticsError) throw analyticsError;
      setAnalytics(analyticsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnalyticsValue = (metricName: string) => {
    const metric = analytics.find(a => a.metric_name === metricName);
    return metric?.metric_value || '0';
  };

  const stats = [
    {
      name: 'Active Workflows',
      value: workflows.filter(w => w.status === 'active').length.toString(),
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: WorkflowIcon,
    },
    {
      name: 'Emails Sent',
      value: getAnalyticsValue('emails_sent'),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Mail,
    },
    {
      name: 'Success Rate',
      value: getAnalyticsValue('success_rate') + '%',
      change: '-0.3%',
      changeType: 'negative' as const,
      icon: TrendingUp,
    },
    {
      name: 'Total Executions',
      value: getAnalyticsValue('total_executions'),
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: Activity,
    },
  ];

  const recentActivity = workflows.slice(0, 4).map(workflow => ({
    id: workflow.id,
    workflow: workflow.name,
    status: workflow.status === 'active' ? 'completed' : workflow.status === 'failed' ? 'failed' : 'running',
    time: workflow.last_run ? new Date(workflow.last_run).toLocaleString() : 'Never',
    executions: workflow.executions,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || profile?.email}!
        </h1>
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
                      {activity.executions.toLocaleString()} executions
                    </span>
                    {(activity.status === 'completed' || activity.status === 'active') && (
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
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/workflows';
                }}
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Updates</h3>
            <div className="space-y-4">
              {workflows.slice(0, 3).map((workflow) => (
                <div key={workflow.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {workflow.status === 'active' && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    {workflow.status === 'paused' && (
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    )}
                    {workflow.status === 'failed' && (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      {workflow.name} is {workflow.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      {workflow.executions.toLocaleString()} total executions
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all workflows →
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
                <WorkflowIcon className="h-6 w-6 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">
                  View Workflows
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