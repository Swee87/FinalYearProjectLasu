import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss(),],
//   server: {
//     proxy: {
//       '/auth': 'http://localhost:5000', // Your backend port
//       '/c': 'http://localhost:5000/auth' // Additional proxy rule
//     }
//   },
//   theme: {
//     extend: {
//       backgroundImage: {
//         'gradient-to-br': 'linear-gradient(to bottom right)',
//       },
//     }
//   }
// })



export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000', // Your backend port
        changeOrigin: true,
        secure: false,
        credentials: true,
        headers: {
          'Access-Control-Allow-Credentials': 'true'
        },
        bypass(req, res, options) {
          console.log(`Proxying request from ${req.url} to ${options.target}${req.url}`);
        }
      },
      '/c': {
        target: 'http://localhost:5000/auth', // Additional proxy rule
        changeOrigin: true,
        secure: false,
        credentials: true
      },
      // ✅ Added new proxy for /index and other protected routes
      '/index': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        credentials: true // 👈 Ensures cookies are passed through proxy
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        credentials: true // 👈 Ensures cookies are passed through proxy
      }
    }
  },
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-br': 'linear-gradient(to bottom right)',
      },
    }
  }
});