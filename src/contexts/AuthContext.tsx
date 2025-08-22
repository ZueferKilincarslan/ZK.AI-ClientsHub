import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabaseConfig, Profile, testSupabaseConnection } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  connectionTested: boolean;
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
  const [connectionTested, setConnectionTested] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Check if Supabase is configured
    if (!hasSupabaseConfig || !supabase) {
      if (mounted) {
        setError('Supabase is not configured. Please connect to Supabase using the button in the top right.');
        setLoading(false);
        setConnectionTested(true);
      }
      return;
    }

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        setError('Connection timeout. Please check your internet connection and try again.');
        setLoading(false);
        setConnectionTested(true);
      }
    }, 10000); // 10 second timeout

    // Test connection first
    const initializeAuth = async () => {
      try {
        const connectionTest = await testSupabaseConnection();
        
        if (!mounted) return;
        
        if (!connectionTest.success) {
          setError(`Connection failed: ${connectionTest.error}`);
          setLoading(false);
          setConnectionTested(true);
          return;
        }

        setConnectionTested(true);

        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError('Failed to connect to authentication service. Please try again.');
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Unexpected error during auth initialization:', err);
        setError('Failed to initialize authentication. Please refresh the page.');
        setLoading(false);
        setConnectionTested(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        if (!loading) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array is correct here

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        // Create a basic profile if none exists
        if (error.code === 'PGRST116') {
          console.log('No profile found, user can continue without profile');
        }
      } else if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = async () => {
    setLoading(true);
    setError(null);
    setConnectionTested(false);
    
    // Trigger re-initialization
    window.location.reload();
  };

  const signOut = async () => {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
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
    connectionTested,
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