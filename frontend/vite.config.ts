import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom'],
          'vendor-lucide':   ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    minify: 'esbuild',  // changed from terser to esbuild
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    sourcemap: false,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
})