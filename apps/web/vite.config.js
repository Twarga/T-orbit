import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@cosmic-watch/core-types': path.resolve(__dirname, '../../packages/core-types/src'),
      '@cosmic-watch/orbital-engine': path.resolve(__dirname, '../../packages/orbital-engine/src'),
      '@cosmic-watch/validation': path.resolve(__dirname, '../../packages/validation/src'),
      '@cosmic-watch/observability': path.resolve(__dirname, '../../packages/observability/src'),
    },
  },
  server: {
    port: 8787,
    open: false,
    fs: {
      allow: ['..'],
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          cesium: ['cesium'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['cesium'],
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
});
