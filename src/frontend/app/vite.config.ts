import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execFileSync, execSync } from 'child_process'
import path from 'path'

const renderBuildingPngs = {
  name: 'render-building-pngs',
  buildStart() {
    const script = path.resolve(__dirname, '../../../scripts/render-building-pngs.py')
    execFileSync('python3', [script], { stdio: 'inherit' })
  },
}

const buildNumber = (() => {
  try { return execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim() }
  catch { return '0' }
})()

export default defineConfig({
  plugins: [
    react(),
    renderBuildingPngs,
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Aethon E3',
        short_name: 'Aethon',
        description: 'Isometric city-building strategy game',
        theme_color: '#080812',
        background_color: '#080812',
        display: 'standalone',
        orientation: 'landscape',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  define: { __BUILD_NUMBER__: JSON.stringify(buildNumber) },
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
