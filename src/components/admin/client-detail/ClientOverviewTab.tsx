import React from 'react';
import { Workflow } from '../../../lib/supabase';
import { CheckCircle, AlertCircle, Pause } from 'lucide-react';

interface ClientOverviewTabProps {
  workflows: Workflow[];
  statusConfig: {
    active: { icon: typeof CheckCircle; color: string; bg: string; border: string; label: string; };
    paused: { icon: typeof Pause; color: string; bg: string; border: string; label: string; };
    failed: { icon: typeof AlertCircle; color: string; bg: string; border: string; label: string; };
  };
}

export default function ClientOverviewTab({ workflows, statusConfig }: ClientOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {workflows.slice(0, 5).map((workflow) => {
            const StatusIcon = statusConfig[workflow.status].icon;
            return (
              <div key={workflow.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${statusConfig[workflow.status].bg}`}>
                    <StatusIcon className={`h-4 w-4 ${statusConfig[workflow.status].color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{workflow.name}</p>
                    <p className="text-sm text-purple-300">{workflow.description}</p>
                  </div>
                </div>
                <div className="text-sm text-purple-300">
                  {workflow.executions.toLocaleString()} executions
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}