import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prerender from 'vite-plugin-prerender';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        '/',
        '/workflows',
        '/settings',
        '/profile'
      ],
    }
    )
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
