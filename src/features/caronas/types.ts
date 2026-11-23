export interface CaronaEncontrada {
  id: string
  motorista: string
  origem: string
  destino: string
  /** Data no formato AAAA-MM-DD */
  data: string
  horario: string
  valorTotal: number
  vagasTotal: number
  vagasOcupadas: number
  vagasDisponiveis: number
  veiculo: string
  /** Percentual de 0 a 100 calculado pela API */
  compatibilidade: number
  motivos: string[]
}

export interface FiltrosBusca {
  origem: string
  destino: string
  /** Vazio significa qualquer data */
  data: string
  passageiros: number
}

export type Ordenacao = 'match' | 'horario' | 'preco'
