import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spaFallback } from './vite-plugin-spa-fallback'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), spaFallback()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'globalThis',
  },
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  preview: {
    port: 3001,
    host: true,
  },
})