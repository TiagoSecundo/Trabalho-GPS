import { existsSync } from 'node:fs'
import path from 'node:path'
import express from 'express'
import caronasRouter from './routes/caronas.js'
import usersRouter from './routes/users.js'

const app = express()
const port = Number(process.env.API_PORT ?? 3001)

app.use(express.json({ limit: '10kb' }))
app.use('/api/users', usersRouter)
app.use('/api/caronas', caronasRouter)

const distPath = path.resolve(process.cwd(), 'dist')
if (process.env.NODE_ENV === 'production' && existsSync(distPath)) {
  app.use(express.static(distPath))
  app.use((request, response, next) => {
    if (request.method !== 'GET' || request.path.startsWith('/api')) {
      next()
      return
    }
    response.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use(
  (
    error: Error,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    void _next
    console.error('API error:', error.message)
    response.status(500).json({ error: 'Ocorreu um erro interno. Tente novamente.' })
  },
)

const server = app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`)
})

function closeServer() {
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGINT', closeServer)
process.on('SIGTERM', closeServer)
