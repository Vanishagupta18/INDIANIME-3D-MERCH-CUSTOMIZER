import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: "127.0.0.1",      // 🔥 force IPv4 (non-negotiable)
    port: 3000,             // 🔥 use a clean port
    strictPort: false,      // optional fallback
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // 🔥 avoid localhost
        changeOrigin: true,
      }
    }
  }
})