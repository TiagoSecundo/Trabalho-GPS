import type { RegisteredUser, RegistrationInput } from '../types'

const USERS_STORAGE_KEY = 'forma.registered-users'
const CURRENT_USER_STORAGE_KEY = 'forma.current-user'

export async function getRegisteredUsers(): Promise<RegisteredUser[]> {
  const response = await fetch('/api/users')

  if (!response.ok) {
    throw new Error('Não foi possível consultar os cadastros.')
  }

  return (await response.json()) as RegisteredUser[]
}

export async function registerUser(
  input: RegistrationInput,
): Promise<RegisteredUser> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (response.status === 409) {
    throw new Error('Este e-mail já possui cadastro.')
  }

  if (!response.ok) {
    const body = (await response.json()) as { error?: string }
    throw new Error(body.error ?? 'Não foi possível concluir o cadastro.')
  }

  return (await response.json()) as RegisteredUser
}

export async function loginUser(
  input: Pick<RegistrationInput, 'email' | 'password'>,
): Promise<RegisteredUser> {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (response.status === 401) {
    throw new Error('E-mail ou senha incorretos.')
  }

  if (!response.ok) {
    const body = (await response.json()) as { error?: string }
    throw new Error(body.error ?? 'Não foi possível fazer login.')
  }

  return (await response.json()) as RegisteredUser
}

export function saveRegisteredUsers(users: RegisteredUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

export function getCurrentUser(): RegisteredUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<RegisteredUser>
    if (
      typeof parsed?.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
      }
    }
    return null
  } catch {
    return null
  }
}

export function saveCurrentUser(user: RegisteredUser): void {
  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Continua funcionando em memória caso o navegador restrinja o armazenamento
  }
}

export function clearCurrentUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
  } catch {
    // Ignora falhas de permissão do localStorage
  }
}
