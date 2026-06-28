import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Backend (Spring Boot) base for the dev proxy. Override with BACKEND_URL if needed.
const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API routes to the backend in dev so the browser talks same-origin (no CORS).
    proxy: {
      "/campaigns": {
        target: backend,
        changeOrigin: true,
        // Don't proxy browser page navigations — only JS fetch/XHR calls.
        // Without this, navigating to /campaigns directly returns raw JSON from
        // the backend instead of index.html.
        bypass: (req) =>
          req.headers.accept?.includes("text/html") ? "/index.html" : null,
      },
      "/oauth/google/login": { target: backend, changeOrigin: true },
      "/oauth/google/callback": { target: backend, changeOrigin: true },
    },
  },
});
