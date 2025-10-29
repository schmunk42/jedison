import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  // Use MPA mode to disable SPA fallback
  appType: 'mpa',
  plugins: [
    vue(),
    {
      name: 'custom-404-handler',
      configureServer(server) {
        // Use 'post' to ensure this runs after Vite's built-in middleware
        server.middlewares.use((req, res, next) => {
          const url = req.url || '/'

          // Skip Vite's special requests
          if (url.startsWith('/@') || url.startsWith('/__')) {
            return next()
          }

          // Root path or .html files - let Vite handle
          if (url === '/' || url === '/index.html' || url.endsWith('.html')) {
            return next()
          }

          // Check if file/directory exists in project root
          const rootPath = join(__dirname, url.split('?')[0])
          if (existsSync(rootPath)) {
            return next()
          }

          // File doesn't exist - return 404
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html')
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>404 - Not Found</title>
              <style>
                body { font-family: sans-serif; text-align: center; padding: 50px; }
                h1 { color: #e53e3e; }
              </style>
            </head>
            <body>
              <h1>404 - Page Not Found</h1>
              <p>The requested path <code>${url}</code> does not exist.</p>
              <p><a href="/">Go to Playground</a></p>
            </body>
            </html>
          `)
        })
      },
      configurePreviewServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '/'

            // Root path - serve playground index.html
            if (url === '/' || url === '/index.html') {
              return next()
            }

            // Check if file exists in docs directory (for built playground assets)
            const docsPath = join(__dirname, 'docs', url.split('?')[0])
            if (existsSync(docsPath)) {
              return next()
            }

            // Check if file exists in project root (for demos, dist, etc.)
            const rootPath = join(__dirname, url.split('?')[0])
            if (existsSync(rootPath)) {
              // Serve from project root
              req.url = '/..' + url
              return next()
            }

            // File doesn't exist - return 404
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/html')
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>404 - Not Found</title>
                <style>
                  body { font-family: sans-serif; text-align: center; padding: 50px; }
                  h1 { color: #e53e3e; }
                </style>
              </head>
              <body>
                <h1>404 - Page Not Found</h1>
                <p>The requested path <code>${url}</code> does not exist.</p>
                <p><a href="/">Go to Playground</a></p>
              </body>
              </html>
            `)
          })
        }
      }
    }
  ],
  build: {
    outDir: resolve(__dirname, 'docs')
  },
  server: {
    open: true,
    port: 8282,
    watch: {
      include: ['src/**', 'src-docs/**']
    },
    fs: {
      // Allow serving files from project root (including demos, dist)
      strict: false,
      allow: ['..']
    }
  },
  preview: {
    open: false,
    port: 8181,
    strictPort: true
  }
})
