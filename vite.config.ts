import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/abuseipdb': {
        target: 'https://api.abuseipdb.com/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/abuseipdb/, '')
      },
      '/api/virustotal': {
        target: 'https://www.virustotal.com/vtapi/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/virustotal/, '')
      },
      '/api/yandex': {
        target: 'https://sba.yandex.net/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yandex/, '')
      },
      '/api/wot': {
        target: 'https://scorecard.api.mywot.com/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wot/, '')
      }
    }
  }
})
