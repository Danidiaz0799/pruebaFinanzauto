import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' ? 'http://backend:3000' : 'http://localhost:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: process.env.NODE_ENV === 'production' ? 'http://backend:3000' : 'http://localhost:3000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
