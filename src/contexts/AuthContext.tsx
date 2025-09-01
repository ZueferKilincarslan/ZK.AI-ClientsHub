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

  // Force clear all auth state and local storage
  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    setError(null);
    setLoading(false);
    
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
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
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔄 User signed in or token refreshed - fetching fresh profile');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching fresh profile...');
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
      console.log('🔍 Fetching fresh profile for user:', userId);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Always fetch fresh from database, no caching
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Error fetching profile:', error.message);
        
        // If profile doesn't exist, create one with default role
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating default profile...');
          await createDefaultProfile(userId);
          return; // createDefaultProfile will call fetchProfile again
        }
        
        throw error;
      } else {
        console.log('✅ Fresh profile fetched successfully:', {
          id: data.id,
          email: data.email,
          role: data.role,
          fullName: data.full_name
        });
        setProfile(data);
      }
    } catch (error) {
      console.error('💥 Critical error fetching profile:', error);
      setProfile(null);
      setError('Failed to load user profile. Please try refreshing the page.');
    } finally {
      console.log('✅ Auth initialization complete');
      setLoading(false);
      setInitialized(true);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      console.log('📝 Creating default profile for user:', userId);
      
      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('No authenticated user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: authUser.email!,
          role: 'client', // Default to client role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating default profile:', error);
        throw error;
      }
      
      console.log('✅ Default profile created successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('💥 Error creating default profile:', error);
      setError('Failed to create user profile. Please contact support.');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };
  const signOut = async () => {
    if (!supabase) return;
    
    console.log('👋 Signing out...');
    
    try {
      // Clear local state and storage immediately
      clearAuthState();
      setLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
      }
    } catch (error) {
      console.error('💥 Unexpected error during sign out:', error);
    } finally {
      // Ensure we're in a clean state
      clearAuthState();
      setLoading(false);
      
      console.log('✅ Sign out complete');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
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