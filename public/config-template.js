// Configuration template for production deployment
// Copy this file to config.js and update with your actual values

window.__APP_CONFIG__ = {
  // REQUIRED: Replace with your actual Supabase project URL
  SUPABASE_URL: 'https://jxauoyjzecefnezpdrel.supabase.co',
  
  // REQUIRED: Replace with your actual Supabase anon/public key
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4YXVveWp6ZWNlZm5lenBkcmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDEwMzQsImV4cCI6MjA3MDc3NzAzNH0.Z_BouHULSEleUeUKj3JS_orogFk5mc0xdZAjbgAJhGw',
  
  // Optional: App configuration
  APP_NAME: 'ZK.AI Client Portal',
  VERSION: '1.0.0',
  
  // Optional: Feature flags
  FEATURES: {
    ANALYTICS: true,
    WORKFLOWS: true,
    ADMIN_PANEL: true,
    DEBUG_MODE: false
  },
  
  // Optional: API endpoints
  API_ENDPOINTS: {
    WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/workflow-upload'
  }
};

// Make Supabase config available globally
window.__SUPABASE_URL__ = window.__APP_CONFIG__.SUPABASE_URL;
window.__SUPABASE_ANON_KEY__ = window.__APP_CONFIG__.SUPABASE_ANON_KEY;

console.log('📋 Production config loaded:', {
  hasSupabaseUrl: !!window.__SUPABASE_URL__,
  hasSupabaseKey: !!window.__SUPABASE_ANON_KEY__,
  appName: window.__APP_CONFIG__.APP_NAME
});
