import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'robots.txt'],
      manifest: {
        name: 'DevNotes - Developer Note-Taking App',
        short_name: 'DevNotes',
        description: 'A fast, organized note-taking application designed for software developers with markdown support, code highlighting, and hierarchical organization.',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'New Note',
            short_name: 'New Note',
            description: 'Create a new note',
            url: '/?action=new-note',
            icons: [
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'Search Notes',
            short_name: 'Search',
            description: 'Search through your notes',
            url: '/?action=search',
            icons: [
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          editor: ['@codemirror/state', '@codemirror/view', '@codemirror/commands', '@codemirror/lang-markdown', '@codemirror/theme-one-dark', 'codemirror'],
          markdown: ['unified', 'remark-parse', 'remark-gfm', 'remark-math', 'remark-rehype', 'rehype-highlight', 'rehype-katex', 'rehype-raw', 'rehype-stringify'],
          utils: ['zustand', 'dexie', 'clsx', 'tailwind-merge'],
          math: ['katex', 'mermaid'],
          ui: ['@radix-ui/react-slot', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
  }
})