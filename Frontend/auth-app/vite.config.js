import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/auth': 'http://localhost:5000', // Your backend port
      '/c': 'http://localhost:5000/auth' // Additional proxy rule
    }
  },
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-br': 'linear-gradient(to bottom right)',
      },
    }
  }
})

