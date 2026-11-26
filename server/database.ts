import { randomUUID } from 'node:crypto'
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

database.exec(`
  CREATE TABLE IF NOT EXISTS caronas (
    id TEXT PRIMARY KEY,
    motorista TEXT NOT NULL,
    origem TEXT NOT NULL,
    destino TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    valor_total REAL NOT NULL,
    vagas_total INTEGER NOT NULL,
    vagas_ocupadas INTEGER NOT NULL DEFAULT 0,
    veiculo TEXT NOT NULL
  )
`)

seedCaronas()

// Insere caronas de exemplo (datas relativas ao dia atual) enquanto não existe
// a tela de oferecer carona. Se não houver nenhuma carona futura (banco novo ou
// datas de demonstração vencidas), renova os exemplos automaticamente.
export function seedCaronas() {
  const hoje = formatarDataIso(new Date())
  const { futuras } = database
    .prepare('SELECT COUNT(*) AS futuras FROM caronas WHERE data >= ?')
    .get(hoje) as { futuras: number }
  if (futuras > 0) return

  database.prepare('DELETE FROM caronas WHERE data < ?').run(hoje)

  const exemplos: Array<
    [string, string, string, number, string, number, number, number, string]
  > = [
    // motorista, origem, destino, dias a partir de hoje, horário, valor, vagas, ocupadas, veículo
    ['João Silva', 'Diamantina, MG', 'Belo Horizonte, MG', 1, '08:00', 120, 4, 2, 'Fiat Argo prata'],
    ['Mariana Costa', 'Diamantina, MG', 'Belo Horizonte, MG', 1, '14:30', 140, 3, 0, 'VW Polo branco'],
    ['Carlos Pereira', 'Diamantina, MG', 'Belo Horizonte, MG', 2, '06:45', 110, 4, 3, 'Chevrolet Onix preto'],
    ['Ana Beatriz Rocha', 'Diamantina, MG', 'Curvelo, MG', 1, '09:15', 70, 3, 1, 'Hyundai HB20 vermelho'],
    ['Lucas Almeida', 'Diamantina, MG', 'Montes Claros, MG', 3, '07:30', 160, 4, 1, 'Toyota Corolla cinza'],
    ['Fernanda Lima', 'Belo Horizonte, MG', 'Diamantina, MG', 1, '17:00', 130, 4, 2, 'Renault Kwid azul'],
    ['Rafael Souza', 'Belo Horizonte, MG', 'Diamantina, MG', 4, '10:00', 125, 3, 0, 'Fiat Cronos branco'],
    ['Patrícia Mendes', 'Diamantina, MG', 'Serro, MG', 2, '12:00', 45, 3, 1, 'VW Gol prata'],
    ['Gustavo Ribeiro', 'Curvelo, MG', 'Belo Horizonte, MG', 1, '11:00', 80, 4, 2, 'Chevrolet Prisma preto'],
    ['Juliana Martins', 'Diamantina, MG', 'Teófilo Otoni, MG', 5, '08:30', 150, 4, 1, 'Jeep Renegade verde'],
    ['Thiago Oliveira', 'Montes Claros, MG', 'Diamantina, MG', 3, '15:00', 155, 3, 1, 'Nissan Versa branco'],
    ['Camila Ferreira', 'Diamantina, MG', 'Belo Horizonte, MG', 5, '18:00', 135, 4, 0, 'Honda City prata'],
  ]

  const inserir = database.prepare(
    `INSERT INTO caronas
      (id, motorista, origem, destino, data, horario, valor_total, vagas_total, vagas_ocupadas, veiculo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )

  const inserirTodas = database.transaction(() => {
    for (const [motorista, origem, destino, dias, horario, valor, vagas, ocupadas, veiculo] of exemplos) {
      const data = new Date()
      data.setDate(data.getDate() + dias)
      inserir.run(
        randomUUID(),
        motorista,
        origem,
        destino,
        formatarDataIso(data),
        horario,
        valor,
        vagas,
        ocupadas,
        veiculo,
      )
    }
  })
  inserirTodas()
}

export function formatarDataIso(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}
