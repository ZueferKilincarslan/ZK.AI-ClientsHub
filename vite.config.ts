import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: '_assets',
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: '_assets/[name]-[hash].js',
        chunkFileNames: '_assets/[name]-[hash].js',
        assetFileNames: '_assets/[name]-[hash].[ext]'
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
