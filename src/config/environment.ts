// Environment configuration helper
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appName: string;
  version: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get configuration from environment variables only
// Works with both development (.env.local) and production (Cloudflare env vars)
export function getAppConfig(): AppConfig {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  const config: AppConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    appName: import.meta.env.VITE_APP_NAME || 'ZK.AI Client Portal',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    isDevelopment,
    isProduction
  };

  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  return config;
}

// Export singleton instance
export const appConfig = getAppConfig();