import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings, 
  Webhook, 
  Key, 
  Bell, 
  Shield,
  Save,
  TestTube
} from 'lucide-react';

export default function AdminSettings() {
  const { profile } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('https://your-n8n-instance.com/webhook/workflow-upload');
  const [apiKey, setApiKey] = useState('');
  const [notifications, setNotifications] = useState({
    newClients: true,
    workflowFailures: true,
    systemAlerts: true,
    weeklyReports: false,
  });

  const handleSaveSettings = () => {
    // Save settings logic here
    alert('Settings saved successfully!');
  };

  const handleTestWebhook = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert('Webhook test successful!');
      } else {
        alert('Webhook test failed. Please check the URL.');
      }
    } catch (error) {
      alert('Webhook test failed. Please check the URL.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="mt-1 text-sm text-purple-300">
          Configure system-wide settings and integrations.
        </p>
      </div>

      {/* Webhook Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="px-6 py-4 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600">
              <Webhook className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Webhook Configuration</h2>
              <p className="mt-1 text-sm text-purple-300">
                Configure webhook URL for n8n workflow processing.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Webhook URL
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-n8n-instance.com/webhook/workflow-upload"
                className="flex-1 rounded-lg border border-purple-500/30 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
              <button
                onClick={handleTestWebhook}
                className="inline-flex items-center px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
              >
                <TestTube className="mr-2 h-4 w-4" />
                Test
              </button>
            </div>
            <p className="mt-2 text-xs text-purple-400">
              This webhook will be called when workflows are uploaded via the admin interface.
            </p>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="px-6 py-4 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">API Configuration</h2>
              <p className="mt-1 text-sm text-purple-300">
                Manage API keys and external service integrations.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              n8n API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your n8n API key"
              className="block w-full rounded-lg border border-purple-500/30 bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            <p className="mt-2 text-xs text-purple-400">
              Required for authenticating with your n8n instance.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="px-6 py-4 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Notification Settings</h2>
              <p className="mt-1 text-sm text-purple-300">
                Configure admin notification preferences.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">New Client Registrations</h4>
                <p className="text-sm text-purple-300">Get notified when new clients register</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.newClients}
                onChange={(e) => setNotifications({...notifications, newClients: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded bg-slate-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Workflow Failures</h4>
                <p className="text-sm text-purple-300">Immediate alerts for failed workflows</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.workflowFailures}
                onChange={(e) => setNotifications({...notifications, workflowFailures: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded bg-slate-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">System Alerts</h4>
                <p className="text-sm text-purple-300">Important system notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.systemAlerts}
                onChange={(e) => setNotifications({...notifications, systemAlerts: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded bg-slate-700"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Weekly Reports</h4>
                <p className="text-sm text-purple-300">Weekly summary of platform activity</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded bg-slate-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
        <div className="px-6 py-4 border-b border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-pink-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Security Settings</h2>
              <p className="mt-1 text-sm text-purple-300">
                Configure security and access control settings.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Require 2FA for Admins</h4>
              <p className="text-sm text-purple-300">Enforce two-factor authentication for admin accounts</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded bg-slate-700"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Session Timeout</h4>
              <p className="text-sm text-purple-300">Automatically log out inactive users</p>
            </div>
            <select className="rounded-lg border border-purple-500/30 bg-slate-700/50 px-3 py-2 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400">
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}