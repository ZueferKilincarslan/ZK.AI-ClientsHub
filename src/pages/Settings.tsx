import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Copy, Plus, Trash2, Key } from 'lucide-react';

const mockApiKeys = [
  {
    id: 1,
    name: 'Production API Key',
    key: 'ak_live_1234567890abcdef',
    created: '2024-01-15',
    lastUsed: '2 hours ago',
    permissions: ['read', 'write'],
  },
  {
    id: 2,
    name: 'Development API Key',
    key: 'ak_test_abcdef1234567890',
    created: '2024-01-10',
    lastUsed: '1 day ago',
    permissions: ['read'],
  },
];

export default function Settings() {
  const { profile } = useAuth();
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [showKeys, setShowKeys] = useState({});
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);

  const toggleKeyVisibility = (keyId: number) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your API keys and account settings for {profile?.company || 'your account'}.
        </p>
      </div>

      {/* API Keys Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your API keys for accessing the AutoFlow API.
              </p>
            </div>
            <button
              onClick={() => setShowNewKeyForm(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Key
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* New Key Form */}
          {showNewKeyForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Create New API Key</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Mobile App Key"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2 text-sm text-gray-700">Read access</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="ml-2 text-sm text-gray-700">Write access</span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Create Key
                  </button>
                  <button
                    onClick={() => setShowNewKeyForm(false)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys List */}
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                      <Key className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{apiKey.name}</h3>
                      <p className="text-sm text-gray-500">Created {apiKey.created}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded-md text-sm font-mono">
                        {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Permissions: </span>
                      <span className="text-gray-900">{apiKey.permissions.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last used: </span>
                      <span className="text-gray-900">{apiKey.lastUsed}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Webhook Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure webhooks for receiving real-time updates from n8n.
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="url"
                placeholder="https://your-app.com/webhooks/n8n"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secret Key</label>
              <input
                type="password"
                placeholder="Enter webhook secret"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="webhook-enabled"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="webhook-enabled" className="ml-2 block text-sm text-gray-900">
                Enable webhook notifications
              </label>
            </div>
            <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Save Webhook Settings
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose how you want to be notified about workflow events.
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Workflow Failures</h3>
                <p className="text-sm text-gray-500">Get notified when workflows fail</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Daily Summary</h3>
                <p className="text-sm text-gray-500">Receive daily workflow performance summary</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                <p className="text-sm text-gray-500">Get weekly analytics reports</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
            <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}