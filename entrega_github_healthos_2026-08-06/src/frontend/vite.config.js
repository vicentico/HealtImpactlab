import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.(js|jsx)$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:8765", "/health": "http://127.0.0.1:8765" },
  },
  build: { sourcemap: false },
});
