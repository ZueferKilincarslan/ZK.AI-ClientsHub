// Debug utilities for authentication troubleshooting
import { supabase } from '../lib/supabase';

export const debugAuthState = async () => {
  if (!supabase) {
    console.log('❌ Supabase not available for debugging');
    return;
  }

  try {
    console.log('🔍 === AUTH DEBUG SESSION START ===');
    
    // 1. Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📋 Current session:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      sessionError: sessionError?.message
    });

    if (!session?.user) {
      console.log('❌ No active session found');
      return;
    }

    // 2. Check user metadata
    console.log('👤 User metadata:', {
      metadata: session.user.user_metadata,
      appMetadata: session.user.app_metadata,
      requiresPasswordChange: session.user.user_metadata?.requires_password_change
    });

    // 3. Check profile in database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    console.log('📊 Profile data:', {
      hasProfile: !!profile,
      profileRole: profile?.role,
      profileEmail: profile?.email,
      profileError: profileError?.message,
      profileErrorCode: profileError?.code
    });

    // 4. Test RLS policies
    const { data: testQuery, error: rlsError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id);

    console.log('🔒 RLS test:', {
      canReadProfile: !!testQuery,
      rlsError: rlsError?.message
    });

    console.log('🔍 === AUTH DEBUG SESSION END ===');
    
    return {
      session: !!session,
      profile: !!profile,
      role: profile?.role,
      errors: {
        session: sessionError?.message,
        profile: profileError?.message,
        rls: rlsError?.message
      }
    };
  } catch (error) {
    console.error('💥 Debug session failed:', error);
    return null;
  }
};

// Call this function from browser console to debug auth issues
(window as any).debugAuth = debugAuthState;

export const validateUserRole = (role: string | undefined): role is 'admin' | 'client' => {
  return role === 'admin' || role === 'client';
};

export const logAuthFlow = (step: string, data: any) => {
  console.log(`🔄 Auth Flow [${step}]:`, data);
};