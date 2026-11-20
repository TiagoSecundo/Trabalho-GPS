import { mkdirSync } from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const dataDirectory = path.resolve(process.cwd(), 'data')
mkdirSync(dataDirectory, { recursive: true })

export const database = new Database(path.join(dataDirectory, 'users.sqlite'))

database.pragma('journal_mode = WAL')
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`)
