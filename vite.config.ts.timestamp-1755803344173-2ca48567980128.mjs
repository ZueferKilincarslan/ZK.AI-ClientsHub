// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import prerender from "file:///home/project/node_modules/vite-plugin-prerender/dist/index.mjs";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcHJlcmVuZGVyIGZyb20gJ3ZpdGUtcGx1Z2luLXByZXJlbmRlcic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHByZXJlbmRlcih7XG4gICAgICByb3V0ZXM6IFtcbiAgICAgICAgJy8nLFxuICAgICAgICAnL2FuYWx5dGljcycsXG4gICAgICAgICcvd29ya2Zsb3dzJyxcbiAgICAgICAgJy9zZXR0aW5ncycsXG4gICAgICAgICcvcHJvZmlsZSdcbiAgICAgIF0sXG4gICAgICByZW5kZXJlck9wdGlvbnM6IHtcbiAgICAgICAgaGVhZGxlc3M6IHRydWUsXG4gICAgICAgIHJlbmRlckFmdGVyRG9jdW1lbnRFdmVudDogJ3JlbmRlci1ldmVudCcsXG4gICAgICAgIHJlbmRlckFmdGVyVGltZTogMjAwMCxcbiAgICAgICAgbWF4Q29uY3VycmVudFJvdXRlczogMSxcbiAgICAgIH0sXG4gICAgICBwb3N0UHJvY2VzcyhyZW5kZXJlZFJvdXRlKSB7XG4gICAgICAgIC8vIEFkZCBtZXRhIHRhZ3MgYW5kIGltcHJvdmUgU0VPXG4gICAgICAgIHJlbmRlcmVkUm91dGUuaHRtbCA9IHJlbmRlcmVkUm91dGUuaHRtbFxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgJzx0aXRsZT5aSy5BSSBDbGllbnQgUG9ydGFsPC90aXRsZT4nLFxuICAgICAgICAgICAgYDx0aXRsZT5aSy5BSSBDbGllbnQgUG9ydGFsIC0gQUkgV29ya2Zsb3cgTWFuYWdlbWVudDwvdGl0bGU+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50PVwiTWFuYWdlIHlvdXIgQUkgd29ya2Zsb3dzLCBhbmFseXRpY3MsIGFuZCBhdXRvbWF0aW9uIHdpdGggWksuQUkncyBwb3dlcmZ1bCBjbGllbnQgcG9ydGFsLiBUcmFjayBwZXJmb3JtYW5jZSwgbW9uaXRvciBleGVjdXRpb25zLCBhbmQgb3B0aW1pemUgeW91ciBidXNpbmVzcyBwcm9jZXNzZXMuXCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwia2V5d29yZHNcIiBjb250ZW50PVwiQUksIGF1dG9tYXRpb24sIHdvcmtmbG93cywgYW5hbHl0aWNzLCBuOG4sIGJ1c2luZXNzIHByb2Nlc3MsIFpLLkFJXCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwiYXV0aG9yXCIgY29udGVudD1cIlpLLkFJXCI+XG4gICAgICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnRpdGxlXCIgY29udGVudD1cIlpLLkFJIENsaWVudCBQb3J0YWwgLSBBSSBXb3JrZmxvdyBNYW5hZ2VtZW50XCI+XG4gICAgICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOmRlc2NyaXB0aW9uXCIgY29udGVudD1cIk1hbmFnZSB5b3VyIEFJIHdvcmtmbG93cywgYW5hbHl0aWNzLCBhbmQgYXV0b21hdGlvbiB3aXRoIFpLLkFJJ3MgcG93ZXJmdWwgY2xpZW50IHBvcnRhbC5cIj5cbiAgICAgICAgICAgIDxtZXRhIHByb3BlcnR5PVwib2c6dHlwZVwiIGNvbnRlbnQ9XCJ3ZWJzaXRlXCI+XG4gICAgICAgICAgICA8bWV0YSBwcm9wZXJ0eT1cIm9nOnNpdGVfbmFtZVwiIGNvbnRlbnQ9XCJaSy5BSVwiPlxuICAgICAgICAgICAgPG1ldGEgbmFtZT1cInR3aXR0ZXI6Y2FyZFwiIGNvbnRlbnQ9XCJzdW1tYXJ5X2xhcmdlX2ltYWdlXCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjp0aXRsZVwiIGNvbnRlbnQ9XCJaSy5BSSBDbGllbnQgUG9ydGFsXCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwidHdpdHRlcjpkZXNjcmlwdGlvblwiIGNvbnRlbnQ9XCJNYW5hZ2UgeW91ciBBSSB3b3JrZmxvd3MsIGFuYWx5dGljcywgYW5kIGF1dG9tYXRpb24gd2l0aCBaSy5BSSdzIHBvd2VyZnVsIGNsaWVudCBwb3J0YWwuXCI+XG4gICAgICAgICAgICA8bWV0YSBuYW1lPVwicm9ib3RzXCIgY29udGVudD1cImluZGV4LCBmb2xsb3dcIj5cbiAgICAgICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCI+YFxuICAgICAgICAgICk7XG4gICAgICAgIHJldHVybiByZW5kZXJlZFJvdXRlO1xuICAgICAgfVxuICAgIH0pXG4gIF0sXG4gIGJhc2U6ICcvJyxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdfYXNzZXRzJyxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ19hc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnX2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdfYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MTczLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sZUFBZTtBQUl0QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsTUFDUixRQUFRO0FBQUEsUUFDTjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxpQkFBaUI7QUFBQSxRQUNmLFVBQVU7QUFBQSxRQUNWLDBCQUEwQjtBQUFBLFFBQzFCLGlCQUFpQjtBQUFBLFFBQ2pCLHFCQUFxQjtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxZQUFZLGVBQWU7QUFFekIsc0JBQWMsT0FBTyxjQUFjLEtBQ2hDO0FBQUEsVUFDQztBQUFBLFVBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQWFGO0FBQ0YsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
