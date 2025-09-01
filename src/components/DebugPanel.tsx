import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { debugAuthState } from '../utils/debugAuth';
import { Bug, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function DebugPanel() {
  const { user, profile, loading, error } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [runningDebug, setRunningDebug] = useState(false);

  const runDebugSession = async () => {
    setRunningDebug(true);
    const result = await debugAuthState();
    setDebugResult(result);
    setRunningDebug(false);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center space-x-2 bg-slate-800/90 backdrop-blur-sm text-purple-300 px-3 py-2 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-all duration-200"
      >
        <Bug className="h-4 w-4" />
        <span className="text-xs">Debug</span>
        {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 w-80 bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-lg shadow-2xl p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Auth Debug Panel</h3>
              <button
                onClick={runDebugSession}
                disabled={runningDebug}
                className="flex items-center space-x-1 text-xs text-purple-300 hover:text-white"
              >
                <RefreshCw className={`h-3 w-3 ${runningDebug ? 'animate-spin' : ''}`} />
                <span>Run Debug</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-700/50 rounded p-2">
                <div className="text-purple-300">Auth State:</div>
                <div className="text-white font-mono">
                  User: {user ? '✅' : '❌'}<br/>
                  Profile: {profile ? '✅' : '❌'}<br/>
                  Loading: {loading ? '⏳' : '✅'}<br/>
                  Error: {error ? '❌' : '✅'}
                </div>
              </div>

              {user && (
                <div className="bg-slate-700/50 rounded p-2">
                  <div className="text-purple-300">User Info:</div>
                  <div className="text-white font-mono text-xs">
                    ID: {user.id.substring(0, 8)}...<br/>
                    Email: {user.email}<br/>
                    Metadata: {JSON.stringify(user.user_metadata, null, 2)}
                  </div>
                </div>
              )}

              {profile && (
                <div className="bg-slate-700/50 rounded p-2">
                  <div className="text-purple-300">Profile Info:</div>
                  <div className="text-white font-mono text-xs">
                    Role: {profile.role}<br/>
                    Name: {profile.full_name || 'None'}<br/>
                    Org: {profile.organization_id || 'None'}
                  </div>
                </div>
              )}

              {debugResult && (
                <div className="bg-slate-700/50 rounded p-2">
                  <div className="text-purple-300">Debug Result:</div>
                  <pre className="text-white font-mono text-xs whitespace-pre-wrap">
                    {JSON.stringify(debugResult, null, 2)}
                  </pre>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded p-2">
                  <div className="text-red-300">Error:</div>
                  <div className="text-red-200 text-xs">{error}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}