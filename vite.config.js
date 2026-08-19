import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Plugin dev: obsluguje /api/* lokalnie (npm run dev), bo funkcje serverless
// Vercela nie dzialaja pod samym Vite. Na Vercelu (produkcja) uzywane sa prawdziwe
// funkcje z api/ — ten plugin dziala WYLACZNIE w trybie dev.
function devApiPlugin() {
  return {
    name: 'dev-api',
    apply: 'serve', // tylko dev, nie build
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // GET /api/tasks — serwuj data/tasks.json z dysku
        if (req.url === '/api/tasks' && req.method === 'GET') {
          try {
            const raw = readFileSync(join(process.cwd(), 'data', 'tasks.json'), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(raw)
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err.message || err) }))
          }
          return
        }
        // POST /api/results — w dev NIE zapisujemy do bazy, tylko potwierdzamy,
        // zeby dalo sie testowac UI bez MongoDB. Waliduje niepusta ocene jak produkcja.
        if (req.url === '/api/results' && req.method === 'POST') {
          let body = ''
          req.on('data', (c) => (body += c))
          req.on('end', () => {
            try {
              const b = JSON.parse(body || '{}')
              const mos = Object.values(b.scores || {}).filter((v) => Number(v) > 0)
              if (!b.taskId || !b.rater || mos.length === 0) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'DEV: brak wymaganych pol lub oceny MOS' }))
                return
              }
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, submissionId: `dev-${Date.now()}`, dev: true }))
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'DEV: zly JSON' }))
            }
          })
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
})
