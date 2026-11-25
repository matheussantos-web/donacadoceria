import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'Dona Ca Doceria',
        short_name: 'Dona Ca Doceria',
        description: 'Doces, bolos e sobremesas de confeitaria artesanal',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#FFFFFF',
        orientation: 'portrait-primary',
        scope: '/',
        lang: 'pt-BR',
        share_target: {
          action: '/gestao',
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
          },
        },
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('three')) return 'chunk-three'
          if (id.includes('gsap')) return 'chunk-gsap'
          if (id.includes('@supabase/supabase-js')) return 'chunk-supabase'
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})