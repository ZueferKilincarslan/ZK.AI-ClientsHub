import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      if (!supabase) {
        console.warn('⚠️ ProtectedRoute: Supabase not configured');
        if (mounted) {
          setLoading(false);
          setSessionChecked(true);
        }
        return;
      }

      try {
        console.log('🔍 ProtectedRoute: Checking session with longer timeout...');
        
        // Always fetch fresh session data with timeout
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 10000)
          )
        ]);
        
        if (error) {
          console.error('Session check error:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
            setSessionChecked(true);
          }
          return;
        }

        if (mounted) {
          if (session?.user) {
            console.log('✅ ProtectedRoute: Valid session found');
            setUser(session.user);
          } else {
            console.log('❌ ProtectedRoute: No valid session');
            setUser(null);
          }
          setLoading(false);
          setSessionChecked(true);
        }
      } catch (error) {
        console.error('⚠️ ProtectedRoute: Error checking session:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Show loading while checking session
  if (loading || !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-purple-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    console.log('🔄 ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
}