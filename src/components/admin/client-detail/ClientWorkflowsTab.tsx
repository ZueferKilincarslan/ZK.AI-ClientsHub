import React from 'react';
import { Plus, CheckCircle, AlertCircle, Pause } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Profile, Workflow } from '../../../lib/supabase';
import WorkflowListItem from './WorkflowListItem';
import AddWorkflowModal from './AddWorkflowModal';

interface ClientWorkflowsTabProps {
  client: (Profile & { workflows: Workflow[] }) | null;
  user: User | null;
  fetchClientData: () => void;
  statusConfig: {
    active: { icon: typeof CheckCircle; color: string; bg: string; border: string; label: string; };
    paused: { icon: typeof Pause; color: string; bg: string; border: string; label: string; };
    failed: { icon: typeof AlertCircle; color: string; bg: string; border: string; label: string; };
  };
}

export default function ClientWorkflowsTab({ client, user, fetchClientData, statusConfig }: ClientWorkflowsTabProps) {
  const [showAddWorkflow, setShowAddWorkflow] = React.useState(false);

  if (!client) return null;

  return (
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
      
      <AddWorkflowModal
        isOpen={showAddWorkflow}
        onClose={() => setShowAddWorkflow(false)}
        client={client}
        user={user}
        onWorkflowAdded={fetchClientData}
      />
      
      <div className="space-y-4">
        {client.workflows.map((workflow) => (
          <WorkflowListItem key={workflow.id} workflow={workflow} statusConfig={statusConfig} />
        ))}
      </div>
    </div>
  );
}