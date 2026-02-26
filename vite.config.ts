import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth':         { target: 'http://localhost:8080', changeOrigin: true },
      '/api/users':        { target: 'http://localhost:8080', changeOrigin: true },
      '/api/chat':         { target: 'http://localhost:8081', changeOrigin: true },
      '/api/messages':     { target: 'http://localhost:8081', changeOrigin: true },
      '/api/participants': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/device-tokens':{ target: 'http://localhost:8082', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});