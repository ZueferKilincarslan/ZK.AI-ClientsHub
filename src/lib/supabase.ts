import { createClient } from '@supabase/supabase-js';

// Safe environment variable access with fallbacks
function getEnvVar(key: string): string {
  try {
    return import.meta.env[key] || '';
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return '';
  }
}

// Get Supabase credentials from environment variables with error handling
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const environment = getEnvVar('MODE') || 'unknown';

// Validate environment variables
function validateSupabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  }
  
  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (supabaseAnonKey.length < 20) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

const configValidation = validateSupabaseConfig();
export const hasSupabaseConfig = configValidation.isValid;

// Enhanced logging for debugging
console.log('🔧 Supabase Configuration:', {
  environment,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  isValid: hasSupabaseConfig,
  errors: configValidation.errors
});

// Create Supabase client with enhanced error handling
export const supabase = (() => {
  if (!hasSupabaseConfig) {
    console.warn('❌ Supabase client not created due to invalid configuration');
    return null;
  }
  
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
    
    console.log('✅ Supabase client created successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    return null;
  }
})();

// Enhanced connection test with better error handling
export const testSupabaseConnection = async (): Promise<{ success: boolean; error: string | null }> => {
  if (!supabase) {
    return { 
      success: false, 
      error: hasSupabaseConfig ? 'Failed to create Supabase client' : 'Supabase not configured' 
    };
  }
  
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Use a shorter timeout for production environments
    const timeoutMs = environment === 'production' ? 3000 : 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    // Test with a simple auth check
    const sessionPromise = supabase.auth.getSession();
    const result = await Promise.race([
      sessionPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
      )
    ]);
    
    clearTimeout(timeoutId);
    
    console.log('✅ Supabase connection test successful');
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? 
      (error.name === 'AbortError' || error.message.includes('timeout') ? 'Connection timeout' : error.message) : 
      'Unknown connection error';
    
    console.warn('⚠️ Supabase connection test failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role: 'client' | 'admin';
  organization_id?: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'failed';
  executions: number;
  success_rate: number;
  last_run?: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  user_id: string;
  metric_name: string;
  metric_value: string;
  date: string;
  created_at: string;
}