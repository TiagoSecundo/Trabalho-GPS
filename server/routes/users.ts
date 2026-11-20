import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import { Router } from 'express'
import { database } from '../database.js'

interface RegistrationInput {
  name: string
  email: string
  password: string
}

interface PublicUser {
  id: string
  name: string
  email: string
  createdAt: string
}

interface StoredUser extends PublicUser {
  passwordHash: string
}

const router = Router()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dummySalt = 'forma-login-verification'

router.get('/', (_request, response) => {
  const users = database
    .prepare(
      'SELECT id, name, email, created_at AS createdAt FROM users ORDER BY created_at DESC',
    )
    .all() as PublicUser[]

  response.json(users)
})

router.post('/', (request, response, next) => {
  const body: unknown = request.body
  if (!isRegistrationInput(body)) {
    response.status(400).json({ error: 'Informe nome, e-mail e senha válidos.' })
    return
  }

  const name = body.name.trim()
  const email = body.email.trim().toLowerCase()
  const password = body.password

  if (
    name.length === 0 ||
    name.length > 100 ||
    email.length > 254 ||
    !emailPattern.test(email) ||
    password.length < 8 ||
    password.length > 128
  ) {
    response.status(400).json({ error: 'Confira os dados e tente novamente.' })
    return
  }

  const salt = randomBytes(16).toString('hex')
  const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
  const user: PublicUser = {
    id: randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString(),
  }

  try {
    database
      .prepare(
        'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(user.id, user.name, user.email, passwordHash, user.createdAt)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed: users.email')
    ) {
      response.status(409).json({ error: 'Este e-mail já possui cadastro.' })
      return
    }
    next(error)
    return
  }

  response.status(201).json(user)
})

router.post('/login', (request, response) => {
  const body: unknown = request.body
  if (!isLoginInput(body)) {
    response.status(400).json({ error: 'Informe e-mail e senha.' })
    return
  }

  const email = body.email.trim().toLowerCase()
  const user = database
    .prepare(
      'SELECT id, name, email, created_at AS createdAt, password_hash AS passwordHash FROM users WHERE email = ?',
    )
    .get(email) as StoredUser | undefined
  const [salt, storedHash] = user?.passwordHash.split(':') ?? [dummySalt, '']
  const passwordHash = scryptSync(body.password, salt, 64)
  const expectedHash = Buffer.from(storedHash, 'hex')
  const passwordMatches =
    expectedHash.length === passwordHash.length &&
    timingSafeEqual(expectedHash, passwordHash)

  if (!user || !passwordMatches) {
    response.status(401).json({ error: 'E-mail ou senha incorretos.' })
    return
  }

  response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  })
})

function isRegistrationInput(value: unknown): value is RegistrationInput {
  if (typeof value !== 'object' || value === null) return false

  const input = value as Record<string, unknown>
  return (
    typeof input.name === 'string' &&
    typeof input.email === 'string' &&
    typeof input.password === 'string'
  )
}

function isLoginInput(
  value: unknown,
): value is Pick<RegistrationInput, 'email' | 'password'> {
  if (typeof value !== 'object' || value === null) return false

  const input = value as Record<string, unknown>
  return (
    typeof input.email === 'string' &&
    typeof input.password === 'string' &&
    input.email.length <= 254 &&
    input.password.length <= 128
  )
}

export default router
