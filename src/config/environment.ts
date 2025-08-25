// Environment configuration helper
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appName: string;
  version: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get configuration from multiple sources with priority:
// 1. Vite environment variables (development)
// 2. Global config object (production)
// 3. Fallback values
export function getAppConfig(): AppConfig {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // Try to get config from global object (production)
  const globalConfig = (window as any).__APP_CONFIG__ || {};
  
  const config: AppConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 
                globalConfig.SUPABASE_URL || 
                (window as any).__SUPABASE_URL__ || 
                '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 
                    globalConfig.SUPABASE_ANON_KEY || 
                    (window as any).__SUPABASE_ANON_KEY__ || 
                    '',
    appName: globalConfig.APP_NAME || 'ZK.AI Client Portal',
    version: globalConfig.VERSION || '1.0.0',
    isDevelopment,
    isProduction
  };

  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase configuration. Please check your environment variables or config.js file.');
  }

  return config;
}

// Export singleton instance
export const appConfig = getAppConfig();