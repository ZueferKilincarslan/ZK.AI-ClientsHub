import React from 'react';
import { User, Activity, BarChart3 } from 'lucide-react';

interface ClientDetailTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  workflowCount: number;
}

export default function ClientDetailTabs({ activeTab, setActiveTab, workflowCount }: ClientDetailTabsProps) {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'workflows', name: `Workflows (${workflowCount})`, icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 shadow-xl">
      <div className="border-b border-purple-500/20">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-purple-300 hover:text-white hover:border-purple-500/30'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Content for tabs will be rendered by parent component */}
    </div>
  );
}