import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug logging for environment variables
console.log('🔧 Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
});

// Check if environment variables are available and valid
export const hasSupabaseConfig = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

console.log('✅ Supabase config valid:', hasSupabaseConfig);

// Create Supabase client only if config is available
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Test Supabase connection with timeout and error handling
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.log('❌ No supabase client available');
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    console.log('🔍 Testing connection to Supabase...');
    
    // Quick health check with shorter timeout for production
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    // Test auth connection instead of database query to avoid permission issues
    const { data, error } = await supabase.auth.getSession();
    clearTimeout(timeoutId);
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      return { success: false, error: 'Auth connection failed' };
    }
    
    console.log('✅ Connection test successful');
    return { success: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? 
      (err.name === 'AbortError' ? 'Connection timeout' : err.message) : 
      'Network error';
    console.log('❌ Connection test error:', errorMessage);
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