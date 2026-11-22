import type { DadosCarona } from '../../../components/Pagamento/Pagamento'
import type { CaronaEncontrada, FiltrosBusca } from '../types'

export async function buscarCaronas(
  filtros: FiltrosBusca,
  signal?: AbortSignal,
): Promise<CaronaEncontrada[]> {
  const parametros = new URLSearchParams({
    origem: filtros.origem,
    destino: filtros.destino,
    passageiros: String(filtros.passageiros),
  })
  if (filtros.data) parametros.set('data', filtros.data)

  const response = await fetch(`/api/caronas/busca?${parametros}`, { signal })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Não foi possível buscar caronas.')
  }

  return (await response.json()) as CaronaEncontrada[]
}

export async function listarCidades(): Promise<string[]> {
  const response = await fetch('/api/caronas/cidades')
  if (!response.ok) return []
  return (await response.json()) as string[]
}

/** Quantas pessoas dividem o custo: quem já reservou + quem está reservando agora */
export function pessoasNaDivisao(carona: CaronaEncontrada, passageiros: number): number {
  return carona.vagasOcupadas + passageiros
}

export function valorPorPessoa(carona: CaronaEncontrada, passageiros: number): number {
  return carona.valorTotal / pessoasNaDivisao(carona, passageiros)
}

/** Converte a carona escolhida no formato esperado pela tela de pagamento */
export function paraDadosPagamento(
  carona: CaronaEncontrada,
  passageiros: number,
): DadosCarona {
  const [ano, mes, dia] = carona.data.split('-')

  return {
    origem: carona.origem,
    destino: carona.destino,
    data: `${dia}/${mes}/${ano}`,
    horario: carona.horario,
    motorista: carona.motorista,
    valorTotal: carona.valorTotal,
    quantidadePassageiros: pessoasNaDivisao(carona, passageiros),
  }
}
