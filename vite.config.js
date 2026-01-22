import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network devices
    port: 5173,
    // No proxy needed - frontend will use VITE_API_URL from .env.local
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
