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
          setLoading(false);
          setInitialized(true);
        }
        return;
      }

      try {
        // Set a reasonable timeout for initialization
        timeoutId = setTimeout(() => {
          if (mounted && !initialized) {
            console.log('⏰ Auth initialization timeout, showing login');
            setLoading(false);
            setInitialized(true);
          }
        }, 3000); // Reduced to 3 seconds
        
        console.log('🔍 Getting initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) {
          clearTimeout(timeoutId);
          return;
        }
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          console.log('No valid session found, showing login form');
          clearTimeout(timeoutId);
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
          setLoading(false);
          setInitialized(true);
        }
        clearTimeout(timeoutId);
      } catch (err) {
        if (!mounted) return;
        console.error('💥 Unexpected error during auth initialization:', err);
        // Don't crash on initialization errors - just show login
        console.log('Auth initialization failed, showing login form');
        setLoading(false);
        setInitialized(true);
        clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase?.auth?.onAuthStateChange(async (event, session) => {
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
      clearTimeout(timeoutId);
      subscription.unsubscribe();
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