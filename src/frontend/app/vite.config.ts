import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    fs: { allow: ['../../..'] },
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: [
      '@aethon/models',
      '@aethon/engine',
      '@aethon/api-client',
      '@aethon/api-contract',
    ],
  },
})
