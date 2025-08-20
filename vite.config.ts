import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
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
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '222x70',
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
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml'
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
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml'
              }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        skipWaiting: true,
        clientsClaim: true
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