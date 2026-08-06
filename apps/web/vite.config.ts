import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: proxy `/api` → the Hono API so the SPA and API share an origin
// (cookies + no CORS friction). `/uploads` proxies the API's static file
// mount so pasted images resolve in dev. Set VITE_API_URL for a different host.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "http://localhost:8788",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
      "/uploads": {
        target: process.env.VITE_API_URL ?? "http://localhost:8788",
        changeOrigin: true,
      },
    },
  },
});
