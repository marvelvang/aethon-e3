import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
  plugins: [react(), renderBuildingPngs],
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
