import { Activity, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { Workflow, Analytics } from '../../../lib/supabase';

interface ClientStatsGridProps {
  workflows: Workflow[];
  analytics: Analytics[];
}

export default function ClientStatsGrid({ workflows, analytics }: ClientStatsGridProps) {
  return (
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
                {workflows.filter(w => w.status === 'active').length}
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
                {workflows.reduce((sum, w) => sum + w.executions, 0).toLocaleString()}
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
                {workflows.length > 0 
                  ? Math.round(workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length)
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
              <dd className="text-2xl font-bold text-white">{analytics.length}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}