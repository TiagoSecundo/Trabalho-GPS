import express from 'express'
import caronasRouter from './routes/caronas.js'
import usersRouter from './routes/users.js'

const app = express()
const port = Number(process.env.API_PORT ?? 3001)

app.use(express.json({ limit: '10kb' }))
app.use('/api/users', usersRouter)
app.use('/api/caronas', caronasRouter)

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
