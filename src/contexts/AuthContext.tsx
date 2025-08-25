import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  createClient: (email: string, password: string, fullName?: string) => Promise<void>;
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
  const [initialized, setInitialized] = useState(false);

  // Force clear all auth state
  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const initializeAuth = async () => {
      if (initialized) return;
      
      console.log('🔄 Initializing auth...');
      
      // Check if Supabase is configured
      if (!hasSupabaseConfig || !supabase) {
        console.log('❌ Supabase not configured');
        if (mounted) {
          setError('Supabase is not configured. Please connect to Supabase using the button in the top right.');
          clearAuthState();
          setLoading(false);
          setInitialized(true);
        }
        return;
      }

      try {
        // Set a timeout for initialization to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && !initialized) {
            console.log('⏰ Auth initialization timeout - proceeding to show login');
            clearAuthState();
            setError(null);
            setLoading(false);
            setInitialized(true);
          }
        }, 2000); // 2 seconds timeout
        
        console.log('🔍 Getting initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) {
          clearTimeout(timeoutId);
          return;
        }
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          console.log('Session error - showing login form');
          clearTimeout(timeoutId);
          clearAuthState();
          setError(null);
          setLoading(false);
          setInitialized(true);
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
          clearAuthState();
          setError(null);
          setLoading(false);
          setInitialized(true);
        }
        clearTimeout(timeoutId);
      } catch (err) {
        if (!mounted) return;
        console.error('💥 Unexpected error during auth initialization:', err);
        // Don't set error state for initialization failures - just show login
        console.log('Auth initialization failed - showing login form');
        clearAuthState();
        setError(null);
        setLoading(false);
        setInitialized(true);
        clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    // Listen for auth changes only if supabase is available
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (supabase) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out - clearing all state');
          clearAuthState();
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('👤 User signed out');
          clearAuthState();
          setLoading(false);
        }
      });
      
      subscription = authSubscription;
    }

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [initialized]);

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
      setInitialized(true);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    
    console.log('👋 Signing out...');
    
    try {
      // Clear local state immediately
      clearAuthState();
      setLoading(true);
      
      // Sign out from Supabase
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
        // Even if there's an error, we've cleared local state
      }
      
      // Clear any additional local storage items
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      console.log('✅ Sign out complete');
    } catch (error) {
      console.error('💥 Unexpected error during sign out:', error);
    } finally {
      // Ensure we're in a clean state
      clearAuthState();
      setLoading(false);
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }

      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const createClient = async (email: string, password: string, fullName?: string) => {
    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Create user with admin privileges
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          requires_password_change: true
        }
      });

      if (error) throw error;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'client'
        });

      if (profileError) throw profileError;
    } catch (error) {
      console.error('Error creating client:', error);
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
    createClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}