import { Plugin } from 'vite'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && !req.url.startsWith('/api') && !req.url.includes('.') && !req.url.startsWith('/@') && !req.url.startsWith('/node_modules') && !req.url.startsWith('/src') && req.method === 'GET') {
          try {
            const indexPath = resolve(__dirname, 'index.html')
            const indexContent = readFileSync(indexPath, 'utf-8')
            res.setHeader('Content-Type', 'text/html')
            res.end(indexContent)
            return
          } catch (error) {
            console.error('Error serving SPA fallback:', error)
          }
        }
        next()
      })
    }
  }
}