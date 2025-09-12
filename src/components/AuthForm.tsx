import React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase, hasSupabaseConfig, testSupabaseConnection } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Zap } from 'lucide-react';

export default function AuthForm() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  // Redirect if user is already authenticated
  if (!loading && user) {
    console.log('🔄 User already authenticated, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  // Test connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      console.log('🔐 AuthForm: Testing Supabase connection...');
      
      if (!hasSupabaseConfig) {
        console.log('❌ AuthForm: No Supabase config');
        setConnectionStatus('failed');
        setConfigErrors(['Supabase configuration missing']);
        return;
      }
      
      if (!supabase) {
        console.log('❌ AuthForm: No Supabase client');
        setConnectionStatus('failed');
        setConfigErrors(['Failed to create Supabase client']);
        return;
      }
      
      try {
        // Quick connection test
        const testResult = await Promise.race([
          testSupabaseConnection(),
          new Promise<{ success: boolean; error: string }>((_, reject) => 
            setTimeout(() => reject({ success: false, error: 'Connection timeout' }), 3000)
          )
        ]);
        
        if (testResult.success) {
          console.log('✅ AuthForm: Connection successful');
          setConnectionStatus('connected');
        } else {
          console.warn('⚠️ AuthForm: Connection failed, but allowing auth attempt:', testResult.error);
          // Still allow auth form to show - connection issues might be temporary
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.warn('⚠️ AuthForm: Connection test error, but allowing auth attempt:', error);
        // Still show auth form - better to try than block completely
        setConnectionStatus('connected');
      }
    };
    
    checkConnection();
  }, []);

  // Show configuration error only if we're sure config is missing
  if (connectionStatus === 'failed' && configErrors.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 shadow-2xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-white">
              Configuration Required
            </h1>
            <p className="mt-2 text-sm text-purple-300">
              Please configure environment variables to enable authentication
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-purple-500/20">
            <div className="text-center">
              <p className="text-purple-300 mb-4">
                Please configure the required environment variables.
              </p>
              <div className="text-xs text-purple-400 mb-4">
                <p className="mb-2">Missing configuration:</p>
                <ul className="mt-2 space-y-1 text-left text-red-300">
                  {configErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
                <p className="mt-2 text-purple-500">
                  Development: Add to .env.local file<br/>
                  Production: Set in Cloudflare Pages environment variables
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking connection
  if (connectionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-purple-300">Connecting to authentication service...</p>
        </div>
      </div>
    );
  }

  // Show auth form once connection is verified or we decide to proceed anyway
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl">
              <Zap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white">
            Welcome to ZK.AI
          </h1>
          <p className="mt-2 text-sm text-purple-300">
            Access your client portal and manage your AI workflows
          </p>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-purple-500/20">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7c3aed',
                    brandAccent: '#6d28d9',
                    inputBackground: 'rgba(51, 65, 85, 0.5)',
                    inputText: 'white',
                    inputPlaceholder: 'rgba(196, 181, 253, 0.6)',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders={false}
            view="sign_in"
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-purple-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}