import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "framer-motion": path.resolve(__dirname, "src/lib/framer-motion.tsx") } },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:8003", changeOrigin: true },
    },
  },
});
