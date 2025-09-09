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
  const [connectionTested, setConnectionTested] = useState(false);

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
    let initializationTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      console.log('🚀 Starting auth initialization...');
      
      // Set a maximum initialization time to prevent infinite loading
      initializationTimeout = setTimeout(() => {
        if (mounted) {
          console.warn('⏰ Auth initialization timeout - forcing completion');
          setLoading(false);
          if (!hasSupabaseConfig) {
            setError('Supabase configuration missing');
          }
        }
      }, 8000); // 8 second timeout
      
      if (!hasSupabaseConfig || !supabase) {
        console.warn('❌ Supabase not configured - showing auth form');
        if (mounted) {
          clearTimeout(initializationTimeout);
          setError('Supabase configuration missing');
          setLoading(false);
          setConnectionTested(true);
        }
        return;
      }

      try {
        console.log('🔄 Testing Supabase connection...');
        
        // Test connection first with timeout
        const connectionTest = await Promise.race([
          testSupabaseConnection(),
          new Promise<{ success: boolean; error: string }>((_, reject) => 
            setTimeout(() => reject({ success: false, error: 'Connection test timeout' }), 5000)
          )
        ]);
        
        if (!mounted) return;
        setConnectionTested(true);
        
        if (!connectionTest.success) {
          console.warn('⚠️ Supabase connection failed, but continuing with auth check:', connectionTest.error);
          // Don't set error here - let auth proceed in case it's just a network hiccup
        }
        
        console.log('🔄 Getting initial session...');
        
        // Get session with shorter timeout for production
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 3000)
          )
        ]) as any;
        
        if (!mounted) return;
        clearTimeout(initializationTimeout);
        
        if (sessionResult.error) {
          console.warn('⚠️ Session error (will show login):', sessionResult.error.message);
          clearAuthState();
          setLoading(false);
          return;
        }

        const session = sessionResult.data?.session;
        console.log('📋 Initial session:', session ? 'Found' : 'None');
        
        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          setSession(session);
          setUser(session.user);
          
          // Fetch profile
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
            console.log('✅ Auth initialization complete with user');
          }
        } else {
          console.log('👤 No user session found');
          clearAuthState();
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.warn('⚠️ Auth initialization error (will show login):', err);
        if (mounted) {
          clearTimeout(initializationTimeout);
          clearAuthState();
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event);
        
        // Handle sign out
        if (event === 'SIGNED_OUT' || !session) {
          console.log('👋 User signed out');
          clearAuthState();
          setLoading(false);
          return;
        }
        
        // Handle sign in or token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔄 User authenticated');
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
      console.log('🧹 Auth context cleanup');
      mounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
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
        window.location.href = '/login';
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