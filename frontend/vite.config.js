import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': 'http://localhost:5000',
      '/download': 'http://localhost:5000'
    },
    allowedHosts: [
      'bass-needed-weekly.ngrok-free.app',
      '192.168.200.143',
      'localhost',
      '127.0.0.1'
    ]
  },
  build: {
    outDir: '../frontend/dist'
  }
})
