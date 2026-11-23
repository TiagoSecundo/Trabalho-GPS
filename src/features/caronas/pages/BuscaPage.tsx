import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  buscarCaronas,
  listarCidades,
  paraDadosPagamento,
  valorPorPessoa,
} from '../services/caronaService'
import type { CaronaEncontrada, FiltrosBusca, Ordenacao } from '../types'

interface EstadoNavegacao {
  userName?: string
}

interface EstadoResultado {
  chave: string
  caronas: CaronaEncontrada[]
  erro: string
}

const estiloCampo =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#438d81] focus:ring-4 focus:ring-[#438d81]/10'

export default function BuscaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const userName = (location.state as EstadoNavegacao | null)?.userName
  const [parametros, setParametros] = useSearchParams()

  // Os filtros ficam na URL: ao voltar do pagamento, a busca é refeita sozinha
  const filtros = useMemo(() => lerFiltros(parametros), [parametros])
  const chaveBusca = filtros.origem && filtros.destino ? parametros.toString() : ''

  const [origem, setOrigem] = useState(filtros.origem)
  const [destino, setDestino] = useState(filtros.destino)
  const [data, setData] = useState(filtros.data)
  const [passageiros, setPassageiros] = useState(filtros.passageiros)
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('match')
  const [cidades, setCidades] = useState<string[]>([])
  const [resultado, setResultado] = useState<EstadoResultado | null>(null)

  const carregando = chaveBusca !== '' && resultado?.chave !== chaveBusca
  const hoje = dataLocalIso(new Date())

  useEffect(() => {
    listarCidades()
      .then(setCidades)
      .catch(() => setCidades([]))
  }, [])

  useEffect(() => {
    if (!chaveBusca) return

    const controle = new AbortController()
    buscarCaronas(filtros, controle.signal)
      .then((caronas) => setResultado({ chave: chaveBusca, caronas, erro: '' }))
      .catch((erro: unknown) => {
        if (controle.signal.aborted) return
        setResultado({
          chave: chaveBusca,
          caronas: [],
          erro: erro instanceof Error ? erro.message : 'Não foi possível buscar caronas.',
        })
      })

    return () => controle.abort()
  }, [chaveBusca, filtros])

  const caronasOrdenadas = useMemo(() => {
    const lista = [...(resultado?.caronas ?? [])]
    if (ordenacao === 'horario') {
      lista.sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`))
    } else if (ordenacao === 'preco') {
      lista.sort(
        (a, b) => valorPorPessoa(a, filtros.passageiros) - valorPorPessoa(b, filtros.passageiros),
      )
    }
    return lista
  }, [resultado, ordenacao, filtros.passageiros])

  const matchesExatos = caronasOrdenadas.filter((c) => c.compatibilidade === 100)
  const alternativas = caronasOrdenadas.filter((c) => c.compatibilidade < 100)

  function pesquisar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const novos = new URLSearchParams({
      origem: origem.trim(),
      destino: destino.trim(),
      passageiros: String(passageiros),
    })
    if (data) novos.set('data', data)
    setParametros(novos, { state: location.state })
  }

  function inverterTrajeto() {
    setOrigem(destino)
    setDestino(origem)
  }

  function reservar(carona: CaronaEncontrada) {
    navigate('/pagamento', {
      state: { carona: paraDadosPagamento(carona, filtros.passageiros), userName },
    })
  }

  return (
    <main className="min-h-screen bg-[#f4f6fb] px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between py-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-3 text-lg font-semibold tracking-wide text-[#172d52] no-underline"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#172d52] text-[#a7e2d2]">
              <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
                <path d="M5 18.5V9.7L12 5l7 4.7v8.8h-5v-5.8h-4v5.8H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </span>
            forma
          </Link>
          {userName && (
            <span className="text-sm text-slate-500">
              Olá, <strong className="font-semibold text-[#172d52]">{userName.split(' ')[0]}</strong>
            </span>
          )}
        </header>

        <nav aria-label="Etapas da reserva" className="grid grid-cols-3 gap-2 text-xs">
          <span className="border-t-4 border-[#438d81] pt-2 font-semibold text-[#438d81]">Cadastro</span>
          <span aria-current="step" className="border-t-4 border-[#172d52] pt-2 font-bold text-[#172d52]">Busca</span>
          <span className="border-t-4 border-[#dce5ef] pt-2 text-slate-500">Pagamento</span>
        </nav>

        <div className="pt-8 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[#172d52] sm:text-4xl">
            Para onde você vai?
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Informe o trajeto e encontramos as caronas mais compatíveis com a sua viagem.
          </p>
        </div>

        <form
          onSubmit={pesquisar}
          className="rounded-3xl bg-white p-5 shadow-[0_24px_80px_-28px_rgba(27,45,83,0.28)] sm:p-7"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Saindo de</span>
              <input
                className={estiloCampo}
                list="cidades-caronas"
                maxLength={100}
                onChange={(e) => setOrigem(e.target.value)}
                placeholder="Ex.: Diamantina"
                required
                value={origem}
              />
            </label>
            <button
              type="button"
              onClick={inverterTrajeto}
              aria-label="Inverter origem e destino"
              title="Inverter origem e destino"
              className="grid size-11 place-items-center self-end justify-self-center rounded-full border border-slate-200 text-[#1d4260] transition hover:bg-slate-50 md:mb-0.5"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-5 rotate-90 md:rotate-0" aria-hidden="true">
                <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Indo para</span>
              <input
                className={estiloCampo}
                list="cidades-caronas"
                maxLength={100}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ex.: Belo Horizonte"
                required
                value={destino}
              />
            </label>
          </div>

          <datalist id="cidades-caronas">
            {cidades.map((cidade) => (
              <option key={cidade} value={cidade} />
            ))}
          </datalist>

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Data <span className="font-normal text-slate-400">(opcional)</span>
              </span>
              <input
                className={estiloCampo}
                min={hoje}
                onChange={(e) => setData(e.target.value)}
                type="date"
                value={data}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Passageiros</span>
              <select
                className={estiloCampo}
                onChange={(e) => setPassageiros(Number(e.target.value))}
                value={passageiros}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'passageiro' : 'passageiros'}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 self-end rounded-xl bg-[#1d4260] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173650] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438d81]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Buscar caronas
            </button>
          </div>
        </form>

        <section aria-live="polite" className="mt-10">
          {!chaveBusca && <EstadoInicial />}

          {carregando && (
            <div className="space-y-3" aria-label="Carregando caronas">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/70" />
              ))}
            </div>
          )}

          {!carregando && resultado?.erro && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {resultado.erro}
            </div>
          )}

          {!carregando && chaveBusca && resultado && !resultado.erro && (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#172d52]">
                    {caronasOrdenadas.length === 0
                      ? 'Nenhuma carona encontrada'
                      : `${caronasOrdenadas.length} ${caronasOrdenadas.length === 1 ? 'carona encontrada' : 'caronas encontradas'}`}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {filtros.origem} → {filtros.destino}
                    {filtros.data ? ` · ${formatarDataCurta(filtros.data)}` : ' · qualquer data'}
                  </p>
                </div>
                {caronasOrdenadas.length > 1 && (
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Ordenar por
                    <select
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#438d81]"
                      onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                      value={ordenacao}
                    >
                      <option value="match">Melhor match</option>
                      <option value="horario">Mais cedo</option>
                      <option value="preco">Menor preço</option>
                    </select>
                  </label>
                )}
              </div>

              {caronasOrdenadas.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                  <p className="font-medium text-[#172d52]">Ainda não há caronas para esse trajeto.</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Tente remover a data, diminuir o número de passageiros ou buscar uma cidade próxima.
                  </p>
                </div>
              )}

              {matchesExatos.length > 0 && (
                <ListaCaronas
                  titulo="Match perfeito"
                  caronas={matchesExatos}
                  passageiros={filtros.passageiros}
                  onReservar={reservar}
                />
              )}

              {alternativas.length > 0 && (
                <ListaCaronas
                  titulo={matchesExatos.length > 0 ? 'Outras opções próximas' : 'Opções próximas'}
                  caronas={alternativas}
                  passageiros={filtros.passageiros}
                  onReservar={reservar}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function ListaCaronas({
  titulo,
  caronas,
  passageiros,
  onReservar,
}: {
  titulo: string
  caronas: CaronaEncontrada[]
  passageiros: number
  onReservar: (carona: CaronaEncontrada) => void
}) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#438d81]">{titulo}</h3>
      <ul className="space-y-3">
        {caronas.map((carona) => (
          <li key={carona.id}>
            <CartaoCarona carona={carona} passageiros={passageiros} onReservar={onReservar} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function CartaoCarona({
  carona,
  passageiros,
  onReservar,
}: {
  carona: CaronaEncontrada
  passageiros: number
  onReservar: (carona: CaronaEncontrada) => void
}) {
  const nivel = nivelMatch(carona.compatibilidade)

  return (
    <article className="grid gap-5 rounded-2xl bg-white p-5 shadow-[0_12px_40px_-24px_rgba(27,45,83,0.35)] sm:p-6 md:grid-cols-[1.3fr_1fr_auto] md:items-center">
      <div>
        <p className="text-xs font-medium text-slate-500">{formatarDataCurta(carona.data)}</p>
        <div className="mt-3 flex gap-3">
          <div className="flex flex-col items-center pt-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full border-2 border-[#1d4260]" />
            <span className="my-1 w-px flex-1 bg-slate-300" />
            <span className="size-2.5 rounded-full bg-[#438d81]" />
          </div>
          <div className="space-y-3">
            <p className="leading-tight">
              <span className="mr-2 font-semibold text-[#172d52]">{carona.horario}</span>
              <span className="text-slate-700">{carona.origem}</span>
            </p>
            <p className="leading-tight text-slate-700">{carona.destino}</p>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Motivos do match">
          {carona.motivos.map((motivo) => (
            <li key={motivo} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {motivo}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#edf4fb] text-sm font-semibold text-[#1d4260]">
          {iniciais(carona.motorista)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-[#172d52]">{carona.motorista}</p>
          <p className="truncate text-xs text-slate-500">{carona.veiculo}</p>
          <p className="mt-1 text-xs text-slate-600">
            {carona.vagasDisponiveis} {carona.vagasDisponiveis === 1 ? 'vaga livre' : 'vagas livres'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${nivel.classe}`}
          title="Compatibilidade entre a sua busca e esta carona"
        >
          {carona.compatibilidade}% match
        </span>
        <div className="text-right">
          <p className="text-xl font-semibold text-[#172d52]">{formatarMoeda(valorPorPessoa(carona, passageiros))}</p>
          <p className="text-xs text-slate-500">por pessoa</p>
        </div>
        <button
          type="button"
          onClick={() => onReservar(carona)}
          className="rounded-xl bg-[#1d4260] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173650] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438d81]"
        >
          Reservar
        </button>
      </div>
    </article>
  )
}

function EstadoInicial() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
      <p className="font-medium text-[#172d52]">Preencha a origem e o destino para ver as caronas.</p>
      <p className="mt-1 text-sm text-slate-500">
        Mostramos primeiro as viagens com o mesmo trajeto e data, depois as opções mais próximas.
      </p>
    </div>
  )
}

function lerFiltros(parametros: URLSearchParams): FiltrosBusca {
  const passageiros = Number(parametros.get('passageiros'))
  return {
    origem: parametros.get('origem') ?? '',
    destino: parametros.get('destino') ?? '',
    data: parametros.get('data') ?? '',
    passageiros: Number.isInteger(passageiros) && passageiros >= 1 && passageiros <= 4 ? passageiros : 1,
  }
}

function nivelMatch(compatibilidade: number) {
  if (compatibilidade === 100) return { classe: 'bg-[#eaf8f5] text-[#2f6f64]' }
  if (compatibilidade >= 70) return { classe: 'bg-[#edf4fb] text-[#1d4260]' }
  return { classe: 'bg-amber-50 text-amber-800' }
}

function dataLocalIso(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

function formatarDataCurta(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}
