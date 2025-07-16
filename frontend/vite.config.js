import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': 'http://localhost:5000',
      '/download': 'http://localhost:5000'
    },
    host: true
  },
  build: {
    outDir: '../frontend/dist'
  }
})
