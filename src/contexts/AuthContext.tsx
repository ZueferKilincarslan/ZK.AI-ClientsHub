import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig, Profile, testSupabaseConnection } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  retryConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      console.log('🔄 Initializing auth...');
      
      // Check if Supabase is configured
      if (!hasSupabaseConfig || !supabase) {
        console.log('❌ Supabase not configured');
        if (mounted) {
          setError('Supabase is not configured. Please connect to Supabase using the button in the top right.');
          setLoading(false);
        }
        return;
      }

      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (mounted && loading) {
          console.log('⏰ Auth initialization timeout');
          setError('Connection timeout. Please check your internet connection and try again.');
          setLoading(false);
        }
      }, 8000); // 8 second timeout

      try {
        console.log('🔍 Testing Supabase connection...');
        const connectionTest = await testSupabaseConnection();
        
        if (!mounted) return;
        
        if (!connectionTest.success) {
          console.log('❌ Connection test failed:', connectionTest.error);
          setError(`Connection failed: ${connectionTest.error}`);
          setLoading(false);
          return;
        }

        console.log('✅ Connection test successful');

        // Get initial session
        console.log('🔍 Getting initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          setError('Failed to connect to authentication service. Please try again.');
          setLoading(false);
          return;
        }

        console.log('📋 Initial session:', session ? 'Found' : 'None');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('👤 No user, showing login');
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('💥 Unexpected error during auth initialization:', err);
        setError('Failed to initialize authentication. Please refresh the page.');
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 User authenticated, fetching profile...');
        await fetchProfile(session.user.id);
      } else {
        console.log('👤 User signed out');
        setProfile(null);
        setLoading(false);
      }
    }) || { subscription: { unsubscribe: () => {} } };

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array is correct here

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
        // Don't set error state for profile fetch failures - user can still use the app
        setProfile(null);
      } else if (data) {
        console.log('✅ Profile fetched successfully:', data.role);
        setProfile(data);
      } else {
        console.log('ℹ️ No profile found, user can continue without profile');
        setProfile(null);
      }
    } catch (error) {
      console.error('💥 Error fetching profile:', error);
      setProfile(null);
    } finally {
      console.log('✅ Auth initialization complete');
      setLoading(false);
    }
  };

  const retryConnection = async () => {
    console.log('🔄 Retrying connection...');
    setLoading(true);
    setError(null);
    
    // Trigger re-initialization by reloading the page
    window.location.reload();
  };

  const signOut = async () => {
    if (!supabase) return;
    
    console.log('👋 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signOut,
    updateProfile,
    retryConnection,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}