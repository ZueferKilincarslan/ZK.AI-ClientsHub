import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerender } from 'vite-plugin-prerender';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        '/',
        '/analytics',
        '/workflows',
        '/settings',
        '/profile'
      ],
      rendererOptions: {
        headless: true,
        renderAfterDocumentEvent: 'render-event',
        renderAfterTime: 2000,
        maxConcurrentRoutes: 1,
      },
      postProcess(renderedRoute) {
        // Add meta tags and improve SEO
        renderedRoute.html = renderedRoute.html
          .replace(
            '<title>ZK.AI Client Portal</title>',
            `<title>ZK.AI Client Portal - AI Workflow Management</title>
            <meta name="description" content="Manage your AI workflows, analytics, and automation with ZK.AI's powerful client portal. Track performance, monitor executions, and optimize your business processes.">
            <meta name="keywords" content="AI, automation, workflows, analytics, n8n, business process, ZK.AI">
            <meta name="author" content="ZK.AI">
            <meta property="og:title" content="ZK.AI Client Portal - AI Workflow Management">
            <meta property="og:description" content="Manage your AI workflows, analytics, and automation with ZK.AI's powerful client portal.">
            <meta property="og:type" content="website">
            <meta property="og:site_name" content="ZK.AI">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="ZK.AI Client Portal">
            <meta name="twitter:description" content="Manage your AI workflows, analytics, and automation with ZK.AI's powerful client portal.">
            <meta name="robots" content="index, follow">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">`
          );
        return renderedRoute;
      }
    })
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
