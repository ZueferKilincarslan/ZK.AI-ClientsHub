import { Workflow } from '../../../lib/supabase';
import { CheckCircle, AlertCircle, Pause } from 'lucide-react';

interface WorkflowListItemProps {
  workflow: Workflow;
  statusConfig: {
    active: { icon: typeof CheckCircle; color: string; bg: string; border: string; label: string; };
    paused: { icon: typeof Pause; color: string; bg: string; border: string; label: string; };
    failed: { icon: typeof AlertCircle; color: string; bg: string; border: string; label: string; };
  };
}

export default function WorkflowListItem({ workflow, statusConfig }: WorkflowListItemProps) {
  const StatusIcon = statusConfig[workflow.status].icon;

  return (
    <div className="border border-purple-500/20 rounded-lg p-4 bg-slate-700/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${statusConfig[workflow.status].bg}`}>
            <StatusIcon className={`h-5 w-5 ${statusConfig[workflow.status].color}`} />
          </div>
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
}