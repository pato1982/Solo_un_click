import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // El VPS corre en NODE_ENV=production — solo acepta dominios de producción.
            // El túnel SSH es local, así que impersonamos el origen válido.
            proxyReq.setHeader('origin', 'https://soloaunclick.cl')
          })
        },
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
