import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '../../../lib/supabase';

interface AddWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: (Profile & { workflows: any[] }) | null;
  user: User | null;
  onWorkflowAdded: () => void;
}

export default function AddWorkflowModal({ isOpen, onClose, client, user, onWorkflowAdded }: AddWorkflowModalProps) {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workflowName || !workflowFile) {
      alert('Please provide both workflow name and file');
      return;
    }

    try {
      setUploading(true);
      
      const fileContent = await workflowFile.text();
      const workflowJson = JSON.parse(fileContent);

      const webhookPayload = {
        client: {
          id: client?.id,
          name: client?.full_name || 'Unnamed Client',
          email: client?.email,
        },
        workflow: {
          name: workflowName,
          data: workflowJson,
        },
        uploadedBy: user?.id,
        uploadedAt: new Date().toISOString(),
      };

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
      onWorkflowAdded(); // Callback to refresh client data in parent
      onClose(); // Close modal
      setWorkflowName('');
      setWorkflowFile(null);
    } catch (error: any) {
      console.error('Error uploading workflow:', error);
      alert('Error uploading workflow: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-slate-800/95 backdrop-blur-xl rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-500/20">
          <div className="px-6 py-4 border-b border-purple-500/20">
            <h3 className="text-lg font-medium text-white">Add Workflow</h3>
            <p className="mt-1 text-sm text-purple-300">Upload a workflow for {client?.full_name || client?.email}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Workflow Name *
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
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
                onChange={handleFileChange}
                className="block w-full text-sm text-purple-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                required
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {uploading ? 'Uploading...' : 'Upload Workflow'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}