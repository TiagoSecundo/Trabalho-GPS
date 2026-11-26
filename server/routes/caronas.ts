import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import { database, formatarDataIso, seedCaronas } from '../database.js'

interface CaronaArmazenada {
  id: string
  motorista: string
  origem: string
  destino: string
  data: string
  horario: string
  valorTotal: number
  vagasTotal: number
  vagasOcupadas: number
  veiculo: string
}

export interface CaronaEncontrada extends CaronaArmazenada {
  vagasDisponiveis: number
  compatibilidade: number
  motivos: string[]
}

const router = Router()
const padraoData = /^\d{4}-\d{2}-\d{2}$/

// Apelidos comuns para facilitar a digitação da cidade
const apelidos: Record<string, string> = {
  bh: 'belo horizonte',
  beaga: 'belo horizonte',
  moc: 'montes claros',
  to: 'teofilo otoni',
}

// Pesos usados no cálculo da compatibilidade (somam 100)
const PESO_ORIGEM = 40
const PESO_DESTINO = 40
const PESO_DATA = 20

const SELECT_CARONAS = `
  SELECT id, motorista, origem, destino, data, horario,
         valor_total AS valorTotal, vagas_total AS vagasTotal,
         vagas_ocupadas AS vagasOcupadas, veiculo
  FROM caronas`

// Lista as cidades cadastradas, usada nas sugestões dos campos de busca
router.get('/cidades', (_request, response) => {
  seedCaronas()
  const linhas = database
    .prepare('SELECT origem AS cidade FROM caronas UNION SELECT destino FROM caronas ORDER BY cidade')
    .all() as Array<{ cidade: string }>

  response.json(linhas.map((linha) => linha.cidade))
})

// Busca caronas futuras e calcula o match com o pedido do passageiro
router.get('/busca', (request, response) => {
  seedCaronas()
  const origem = lerTexto(request.query.origem)
  const destino = lerTexto(request.query.destino)
  const data = lerTexto(request.query.data)
  const passageiros = Number(request.query.passageiros ?? 1)

  if (!origem || !destino || origem.length > 100 || destino.length > 100) {
    response.status(400).json({ error: 'Informe a origem e o destino da viagem.' })
    return
  }

  if (data && (!padraoData.test(data) || Number.isNaN(Date.parse(data)))) {
    response.status(400).json({ error: 'Informe uma data válida.' })
    return
  }

  if (!Number.isInteger(passageiros) || passageiros < 1 || passageiros > 4) {
    response.status(400).json({ error: 'Informe de 1 a 4 passageiros.' })
    return
  }

  const caronas = database
    .prepare(`${SELECT_CARONAS} WHERE data >= ? AND vagas_total - vagas_ocupadas >= ?`)
    .all(formatarDataIso(new Date()), passageiros) as CaronaArmazenada[]

  const resultados = caronas
    .map((carona) => avaliarCarona(carona, origem, destino, data))
    .filter((carona): carona is CaronaEncontrada => carona !== null)
    .sort(
      (a, b) =>
        b.compatibilidade - a.compatibilidade ||
        `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`),
    )

  response.json(resultados)
})

// Confirma a reserva abatendo as vagas disponíveis no SQLite
router.post('/:id/reservar', (request, response) => {
  const id = request.params.id.trim()
  const body = request.body as Record<string, unknown> | null
  const passageiros = Number(body?.passageiros ?? 1)

  if (!id) {
    response.status(400).json({ error: 'Identificador da carona inválido.' })
    return
  }

  if (!Number.isInteger(passageiros) || passageiros < 1 || passageiros > 4) {
    response.status(400).json({ error: 'Informe de 1 a 4 passageiros.' })
    return
  }

  const hoje = formatarDataIso(new Date())
  const reservarTransacao = database.transaction(() => {
    const carona = database
      .prepare(`${SELECT_CARONAS} WHERE id = ? AND data >= ?`)
      .get(id, hoje) as CaronaArmazenada | undefined

    if (!carona) {
      return { status: 404 as const, erro: 'Carona não encontrada ou já encerrada.' }
    }

    const vagasDisponiveis = carona.vagasTotal - carona.vagasOcupadas
    if (vagasDisponiveis < passageiros) {
      return {
        status: 409 as const,
        erro:
          vagasDisponiveis <= 0
            ? 'Esta carona não possui mais vagas disponíveis.'
            : `Restam apenas ${vagasDisponiveis} ${vagasDisponiveis === 1 ? 'vaga disponível' : 'vagas disponíveis'} nesta carona.`,
      }
    }

    database
      .prepare('UPDATE caronas SET vagas_ocupadas = vagas_ocupadas + ? WHERE id = ?')
      .run(passageiros, id)

    return {
      status: 200 as const,
      dados: {
        codigoReserva: gerarCodigoReserva(),
        vagasOcupadas: carona.vagasOcupadas + passageiros,
        vagasDisponiveis: vagasDisponiveis - passageiros,
      },
    }
  })

  const resultado = reservarTransacao()
  if (resultado.status !== 200) {
    response.status(resultado.status).json({ error: resultado.erro })
    return
  }

  response.status(201).json(resultado.dados)
})

// Código curto e legível, sem caracteres ambíguos (0/O, 1/I)
function gerarCodigoReserva(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  return 'FRM-' + Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('')
}

function avaliarCarona(
  carona: CaronaArmazenada,
  origem: string,
  destino: string,
  data: string,
): CaronaEncontrada | null {
  const pontosOrigem = compararCidades(origem, carona.origem)
  const pontosDestino = compararCidades(destino, carona.destino)

  // Sem relação com a origem ou o destino pedidos, a carona não entra no resultado
  if (pontosOrigem === 0 || pontosDestino === 0) return null

  const motivos: string[] = [
    pontosOrigem === 1 ? 'Mesma origem' : 'Origem parecida',
    pontosDestino === 1 ? 'Mesmo destino' : 'Destino parecido',
  ]

  let pontosData = 1
  if (data) {
    const diferencaDias = Math.round(
      (Date.parse(carona.data) - Date.parse(data)) / 86_400_000,
    )
    const distancia = Math.abs(diferencaDias)

    if (distancia === 0) {
      pontosData = 1
      motivos.push('Mesma data')
    } else if (distancia <= 3) {
      pontosData = distancia === 1 ? 0.5 : 0.25
      const sufixo = distancia === 1 ? 'dia' : 'dias'
      motivos.push(
        diferencaDias > 0
          ? `${distancia} ${sufixo} depois`
          : `${distancia} ${sufixo} antes`,
      )
    } else {
      // Datas muito distantes não são consideradas um match
      return null
    }
  }

  const compatibilidade = Math.round(
    pontosOrigem * PESO_ORIGEM + pontosDestino * PESO_DESTINO + pontosData * PESO_DATA,
  )

  return {
    ...carona,
    vagasDisponiveis: carona.vagasTotal - carona.vagasOcupadas,
    compatibilidade,
    motivos,
  }
}

// 1 = mesma cidade, 0.5 = nome parcialmente igual, 0 = cidades diferentes
function compararCidades(pedido: string, cadastrada: string): number {
  const a = normalizarCidade(pedido)
  const b = normalizarCidade(cadastrada)

  if (a === b) return 1
  if (a.length >= 3 && (b.includes(a) || a.includes(b))) return 0.5
  return 0
}

// Remove acentos, maiúsculas e a sigla do estado ("Belo Horizonte, MG" -> "belo horizonte")
function normalizarCidade(cidade: string): string {
  const semEstado = cidade.split(/[,-]/)[0] ?? ''
  const normalizada = semEstado
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  return apelidos[normalizada] ?? normalizada
}

function lerTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

export default router
