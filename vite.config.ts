import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /api requests to the Flask backend during local development.
      // Start Flask on port 5001:  python api/index.py
      '/api': {
        // Port 5000 is often used by macOS AirPlay — Flask uses 5001 instead.
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
