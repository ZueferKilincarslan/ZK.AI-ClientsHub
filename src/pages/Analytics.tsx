import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Analytics as AnalyticsType, Workflow } from '../lib/supabase';
import { Calendar, Filter, Download, TrendingUp, Mail, Workflow as WorkflowIcon, Users, BarChart3 } from 'lucide-react';

const timeRanges = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'Last year', value: '1y' },
];

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsType[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase!
        .from('analytics')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (analyticsError) throw analyticsError;
      setAnalytics(analyticsData || []);

      // Fetch workflows for detailed metrics
      const { data: workflowsData, error: workflowsError } = await supabase!
        .from('workflows')
        .select('*')
        .eq('user_id', user!.id);

      if (workflowsError) throw workflowsError;
      setWorkflows(workflowsData || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getAnalyticsValue = (metricName: string) => {
    const metric = analytics.find(a => a.metric_name === metricName);
    return metric?.metric_value || '0';
  };

  const metrics = [
    {
      name: 'Total Executions',
      value: getAnalyticsValue('total_executions'),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: WorkflowIcon,
    },
    {
      name: 'Success Rate',
      value: getAnalyticsValue('success_rate') + '%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      name: 'Emails Sent',
      value: getAnalyticsValue('emails_sent'),
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: Mail,
    },
    {
      name: 'Active Workflows',
      value: workflows.filter(w => w.status === 'active').length.toString(),
      change: '+5.3%',
      changeType: 'positive' as const,
      icon: Users,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-sm text-purple-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no workflows exist
  if (!loading && workflows.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="mt-1 text-sm text-purple-300">
              Track your workflow performance and engagement metrics.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-purple-400 mb-4">
              <BarChart3 className="h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Analytics Data Yet</h3>
            <p className="text-purple-300 mb-6 max-w-md mx-auto">
              You don't have any workflows yet. Create your first workflow to start seeing analytics and performance metrics.
            </p>
            <button 
              onClick={() => window.location.href = '/workflows'}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <WorkflowIcon className="mr-2 h-4 w-4" />
              View Workflows
            </button>
          </div>
        </div>

        {/* Placeholder Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Workflow Executions</h3>
            <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg border border-purple-500/10">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <p className="text-purple-300">Chart will appear when you have workflow data</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Success Rate Trend</h3>
            <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg border border-purple-500/10">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <p className="text-purple-300">Success rate trends will show here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-purple-300">
            Track your workflow performance and engagement metrics.
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-red-500/20 shadow-xl p-6">
          <div className="text-center">
            <div className="text-red-400 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Analytics</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchAnalyticsData}
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-purple-300">
            Track your workflow performance and engagement metrics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-lg border border-purple-500/30 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 backdrop-blur-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button className="inline-flex items-center rounded-lg border border-purple-500/30 bg-slate-800/50 px-3 py-2 text-sm font-medium text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all duration-200">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-xl px-4 py-5 shadow-xl hover:shadow-2xl transition-all duration-200 sm:px-6 border border-purple-500/20"
          >
            <dt>
              <div className="absolute rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-3 shadow-lg">
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-purple-300">
                {metric.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-white">{metric.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                {metric.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workflow Executions Chart */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Workflow Executions</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-purple-300">Successful</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                <span className="text-sm text-purple-300">Failed</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg border border-purple-500/10">
            <p className="text-purple-300">Chart will be rendered here with Chart.js</p>
          </div>
        </div>

        {/* Success Rate Chart */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Success Rate Trend</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg border border-purple-500/10">
            <p className="text-purple-300">Line chart showing success rate over time</p>
          </div>
        </div>

        {/* Email Performance */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Email Performance</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg border border-purple-500/10">
            <p className="text-purple-300">Bar chart showing email metrics</p>
          </div>
        </div>

        {/* Workflow Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Workflow Distribution</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg border border-purple-500/10">
            <p className="text-purple-300">Pie chart showing workflow types</p>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-white mb-4">Workflow Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-500/20">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Workflow Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Executions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Avg Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Last Run
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-purple-500/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {workflow.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                      {workflow.executions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        workflow.success_rate >= 95 ? 'bg-green-400/20 text-green-400 border border-green-400/30' :
                        workflow.success_rate >= 80 ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
                        'bg-red-400/20 text-red-400 border border-red-400/30'
                      }`}>
                        {workflow.success_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">2.3s</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                      {workflow.last_run ? new Date(workflow.last_run).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}