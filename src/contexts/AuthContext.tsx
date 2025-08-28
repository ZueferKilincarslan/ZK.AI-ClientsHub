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
    console.log('🧹 Clearing auth state');
    setUser(null);
    setProfile(null);
    setSession(null);
    setError(null);
    
    // Clear any cached data but don't clear loading state here
    try {
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
    } catch (error) {
      console.warn('Error clearing storage:', error);
    }
  };

  // Fetch profile with retry logic
  const fetchProfile = async (userId: string, retries = 3): Promise<Profile | null> => {
    if (!supabase) return null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Fetching profile for user: ${userId} (attempt ${attempt})`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.warn('Profile not found for user:', userId);
            return null;
          }
          throw error;
        }

        console.log('✅ Profile fetched successfully. Role:', data.role);
        return data;
      } catch (error) {
        console.error(`❌ Error fetching profile (attempt ${attempt}):`, error);
        
        if (attempt === retries) {
          return null;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return null;
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
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
        console.log('🔄 Initializing auth...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          clearAuthState();
          setLoading(false);
          setInitialized(true);
          return;
        }

        console.log('📋 Initial session:', session ? 'Found' : 'None');
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Fetch profile
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          clearAuthState();
        }
        
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (err) {
        console.error('💥 Auth initialization error:', err);
        if (mounted) {
          clearAuthState();
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        // Handle sign out
        if (event === 'SIGNED_OUT' || !session) {
          console.log('👋 User signed out - clearing state');
          clearAuthState();
          setLoading(false);
          return;
        }
        
        // Handle sign in or token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔄 User signed in or token refreshed');
          setSession(session);
          setUser(session.user);
          
          // Fetch fresh profile
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
            setLoading(false);
          }
        }
      });
      
      authSubscription = subscription;
    }

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

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
      
      console.log('✅ Sign out complete');
    } catch (error) {
      console.error('💥 Unexpected error during sign out:', error);
    } finally {
      // Ensure clean state
      clearAuthState();
      setLoading(false);
      
      // Force navigation to root and reload
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