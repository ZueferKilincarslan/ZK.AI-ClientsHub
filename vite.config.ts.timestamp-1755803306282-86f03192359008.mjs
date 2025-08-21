// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { prerender } from "file:///home/project/node_modules/vite-plugin-prerender/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        "/",
        "/analytics",
        "/workflows",
        "/settings",
        "/profile"
      ],
      rendererOptions: {
        headless: true,
        renderAfterDocumentEvent: "render-event",
        renderAfterTime: 2e3,
        maxConcurrentRoutes: 1
      },
      postProcess(renderedRoute) {
        renderedRoute.html = renderedRoute.html.replace(
          "<title>ZK.AI Client Portal</title>",
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
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "_assets",
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "_assets/[name]-[hash].js",
        chunkFileNames: "_assets/[name]-[hash].js",
        assetFileNames: "_assets/[name]-[hash].[ext]"
      }
    }
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  preview: {
    port: 4173,
    strictPort: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBwcmVyZW5kZXIgfSBmcm9tICd2aXRlLXBsdWdpbi1wcmVyZW5kZXInO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBwcmVyZW5kZXIoe1xuICAgICAgcm91dGVzOiBbXG4gICAgICAgICcvJyxcbiAgICAgICAgJy9hbmFseXRpY3MnLFxuICAgICAgICAnL3dvcmtmbG93cycsXG4gICAgICAgICcvc2V0dGluZ3MnLFxuICAgICAgICAnL3Byb2ZpbGUnXG4gICAgICBdLFxuICAgICAgcmVuZGVyZXJPcHRpb25zOiB7XG4gICAgICAgIGhlYWRsZXNzOiB0cnVlLFxuICAgICAgICByZW5kZXJBZnRlckRvY3VtZW50RXZlbnQ6ICdyZW5kZXItZXZlbnQnLFxuICAgICAgICByZW5kZXJBZnRlclRpbWU6IDIwMDAsXG4gICAgICAgIG1heENvbmN1cnJlbnRSb3V0ZXM6IDEsXG4gICAgICB9LFxuICAgICAgcG9zdFByb2Nlc3MocmVuZGVyZWRSb3V0ZSkge1xuICAgICAgICAvLyBBZGQgbWV0YSB0YWdzIGFuZCBpbXByb3ZlIFNFT1xuICAgICAgICByZW5kZXJlZFJvdXRlLmh0bWwgPSByZW5kZXJlZFJvdXRlLmh0bWxcbiAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICc8dGl0bGU+WksuQUkgQ2xpZW50IFBvcnRhbDwvdGl0bGU+JyxcbiAgICAgICAgICAgIGA8dGl0bGU+WksuQUkgQ2xpZW50IFBvcnRhbCAtIEFJIFdvcmtmbG93IE1hbmFnZW1lbnQ8L3RpdGxlPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cImRlc2NyaXB0aW9uXCIgY29udGVudD1cIk1hbmFnZSB5b3VyIEFJIHdvcmtmbG93cywgYW5hbHl0aWNzLCBhbmQgYXV0b21hdGlvbiB3aXRoIFpLLkFJJ3MgcG93ZXJmdWwgY2xpZW50IHBvcnRhbC4gVHJhY2sgcGVyZm9ybWFuY2UsIG1vbml0b3IgZXhlY3V0aW9ucywgYW5kIG9wdGltaXplIHlvdXIgYnVzaW5lc3MgcHJvY2Vzc2VzLlwiPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cImtleXdvcmRzXCIgY29udGVudD1cIkFJLCBhdXRvbWF0aW9uLCB3b3JrZmxvd3MsIGFuYWx5dGljcywgbjhuLCBidXNpbmVzcyBwcm9jZXNzLCBaSy5BSVwiPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cImF1dGhvclwiIGNvbnRlbnQ9XCJaSy5BSVwiPlxuICAgICAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzp0aXRsZVwiIGNvbnRlbnQ9XCJaSy5BSSBDbGllbnQgUG9ydGFsIC0gQUkgV29ya2Zsb3cgTWFuYWdlbWVudFwiPlxuICAgICAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzpkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJNYW5hZ2UgeW91ciBBSSB3b3JrZmxvd3MsIGFuYWx5dGljcywgYW5kIGF1dG9tYXRpb24gd2l0aCBaSy5BSSdzIHBvd2VyZnVsIGNsaWVudCBwb3J0YWwuXCI+XG4gICAgICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnR5cGVcIiBjb250ZW50PVwid2Vic2l0ZVwiPlxuICAgICAgICAgICAgPG1ldGEgcHJvcGVydHk9XCJvZzpzaXRlX25hbWVcIiBjb250ZW50PVwiWksuQUlcIj5cbiAgICAgICAgICAgIDxtZXRhIG5hbWU9XCJ0d2l0dGVyOmNhcmRcIiBjb250ZW50PVwic3VtbWFyeV9sYXJnZV9pbWFnZVwiPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6dGl0bGVcIiBjb250ZW50PVwiWksuQUkgQ2xpZW50IFBvcnRhbFwiPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6ZGVzY3JpcHRpb25cIiBjb250ZW50PVwiTWFuYWdlIHlvdXIgQUkgd29ya2Zsb3dzLCBhbmFseXRpY3MsIGFuZCBhdXRvbWF0aW9uIHdpdGggWksuQUkncyBwb3dlcmZ1bCBjbGllbnQgcG9ydGFsLlwiPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cInJvYm90c1wiIGNvbnRlbnQ9XCJpbmRleCwgZm9sbG93XCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFwiPmBcbiAgICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVuZGVyZWRSb3V0ZTtcbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBiYXNlOiAnLycsXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnX2Fzc2V0cycsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdfYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ19hc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnX2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJ1xuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNDE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGlCQUFpQjtBQUkxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsTUFDUixRQUFRO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxpQkFBaUI7QUFBQSxRQUNmLFVBQVU7QUFBQSxRQUNWLDBCQUEwQjtBQUFBLFFBQzFCLGlCQUFpQjtBQUFBLFFBQ2pCLHFCQUFxQjtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxZQUFZLGVBQWU7QUFFekIsc0JBQWMsT0FBTyxjQUFjLEtBQ2hDO0FBQUEsVUFDQztBQUFBLFVBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQWFGO0FBQ0YsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
