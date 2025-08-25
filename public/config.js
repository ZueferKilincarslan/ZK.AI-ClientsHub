// Development configuration - uses environment variables
// This file prevents the SyntaxError when loading /config.js in development
// In production, replace this with actual Supabase credentials

window.__APP_CONFIG__ = {
  // These will be undefined in development, which is fine since we use VITE_ env vars
  SUPABASE_URL: "https://jxauoyjzecefnezpdrel.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4YXVveWp6ZWNlZm5lenBkcmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDEwMzQsImV4cCI6MjA3MDc3NzAzNH0.Z_BouHULSEleUeUKj3JS_orogFk5mc0xdZAjbgAJhGw",
  
  // App configuration
  APP_NAME: 'ZK.AI Client Portal',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    ANALYTICS: true,
    WORKFLOWS: true,
    ADMIN_PANEL: true,
    DEBUG_MODE: true // Enable debug mode in development
  }
};

// Make Supabase config available globally (will be undefined in dev, which is expected)
window.__SUPABASE_URL__ = window.__APP_CONFIG__.SUPABASE_URL;
window.__SUPABASE_ANON_KEY__ = window.__APP_CONFIG__.SUPABASE_ANON_KEY;

console.log('🔧 Development config loaded - using VITE environment variables for Supabase');
