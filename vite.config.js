import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://hospitality-management-1h5k.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
