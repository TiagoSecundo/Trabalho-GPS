export interface RegisteredUser {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface RegistrationInput {
  name: string
  email: string
  password: string
}
