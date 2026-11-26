import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { DadosCarona } from '../../../components/Pagamento/Pagamento'
import { clearCurrentUser, getCurrentUser } from '../../users/services/userService'

export interface EstadoConfirmacao {
  carona: DadosCarona
  formaPagamento: 'pix' | 'cartao'
  codigoReserva: string
  userName?: string
}

const nomesPagamento: Record<EstadoConfirmacao['formaPagamento'], string> = {
  pix: 'Pix',
  cartao: 'Cartão',
}

export default function ConfirmacaoPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const estado = location.state as EstadoConfirmacao | null
  const usuarioAtual = getCurrentUser()
  const [mensagemCopia, setMensagemCopia] = useState('')

  useEffect(() => {
    document.title = 'Reserva confirmada | Forma'
  }, [])

  const userName = estado?.userName ?? usuarioAtual?.name
  if (!userName) {
    return <Navigate to="/login" replace />
  }

  if (!estado?.carona || !estado.codigoReserva) {
    return <Navigate to="/busca" replace />
  }

  const { carona, formaPagamento, codigoReserva } = estado
  const lugaresReservados = carona.passageirosReserva ?? 1
  const valorPorPassageiro =
    carona.quantidadePassageiros > 0 ? carona.valorTotal / carona.quantidadePassageiros : 0
  const valorPago = valorPorPassageiro * lugaresReservados

  function sair() {
    clearCurrentUser()
    navigate('/login', { replace: true })
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigoReserva)
      setMensagemCopia('Código copiado!')
    } catch {
      setMensagemCopia('Selecione e copie o código')
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6fb] px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between py-6">
          <Link
            to="/busca"
            className="inline-flex items-center gap-3 text-lg font-semibold tracking-wide text-[#172d52] no-underline"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#172d52] text-[#a7e2d2]">
              <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
                <path d="M5 18.5V9.7L12 5l7 4.7v8.8h-5v-5.8h-4v5.8H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </span>
            forma
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Olá, <strong className="font-semibold text-[#172d52]">{userName.split(' ')[0]}</strong>
            </span>
            <button
              type="button"
              onClick={sair}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#1d4260] transition hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </header>

        <nav aria-label="Etapas da reserva" className="grid grid-cols-3 gap-2 text-xs">
          {['Cadastro', 'Busca', 'Pagamento'].map((etapa) => (
            <span key={etapa} className="border-t-4 border-[#438d81] pt-2 font-semibold text-[#438d81]">
              {etapa} ✓
            </span>
          ))}
        </nav>

        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_-28px_rgba(27,45,83,0.28)]">
          <div className="px-6 pt-10 pb-8 text-center sm:px-12">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#eaf8f5] text-[#438d81]">
              <svg viewBox="0 0 24 24" fill="none" className="size-8" aria-hidden="true">
                <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#438d81]">
              Reserva concluída
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#172d52]">
              Carona confirmada{userName ? `, ${userName.split(' ')[0]}` : ''}!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              {lugaresReservados > 1
                ? `Suas ${lugaresReservados} vagas com ${carona.motorista} estão garantidas.`
                : `Sua vaga com ${carona.motorista} está garantida.`}{' '}
              Guarde o código abaixo para apresentar no embarque.
            </p>

            <div className="mx-auto mt-6 flex max-w-xs items-center justify-between gap-3 rounded-2xl border border-dashed border-[#438d81]/50 bg-[#eaf8f5]/50 px-5 py-3">
              <div className="text-left">
                <p className="text-xs text-slate-500">Código da reserva</p>
                <p className="font-mono text-lg font-semibold tracking-wider text-[#172d52]">{codigoReserva}</p>
              </div>
              <button
                type="button"
                onClick={copiarCodigo}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#1d4260] transition hover:bg-slate-50"
              >
                Copiar
              </button>
            </div>
            <p role="status" className="mt-2 h-4 text-xs text-[#438d81]">
              {mensagemCopia}
            </p>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-7 sm:px-12">
            <h2 className="text-sm font-semibold text-[#172d52]">Detalhes da viagem</h2>

            <div className="mt-4 flex gap-3">
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

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              <Detalhe rotulo="Data" valor={carona.data} />
              <Detalhe rotulo="Motorista" valor={carona.motorista} />
              {carona.veiculo && <Detalhe rotulo="Veículo" valor={carona.veiculo} />}
              <Detalhe
                rotulo="Vagas reservadas"
                valor={`${lugaresReservados} ${lugaresReservados === 1 ? 'passageiro' : 'passageiros'}`}
              />
              <Detalhe rotulo="Pagamento" valor={nomesPagamento[formaPagamento]} />
              <Detalhe rotulo="Total pago" valor={formatarMoeda(valorPago)} destaque />
            </dl>

            <ul className="mt-7 space-y-2 rounded-2xl bg-white p-4 text-sm text-slate-600">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-[#438d81]">•</span>
                Chegue ao ponto de encontro com 10 minutos de antecedência.
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-[#438d81]">•</span>
                Informe o código da reserva ao motorista no embarque.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:justify-center sm:px-12">
            <Link
              to="/busca"
              state={{ userName }}
              className="inline-flex items-center justify-center rounded-xl bg-[#1d4260] px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#173650]"
            >
              Buscar outra carona
            </Link>
            {userName && (
              <Link
                to="/inicio"
                state={{ userName }}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-[#1d4260] no-underline transition hover:bg-slate-50"
              >
                Voltar ao início
              </Link>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          Protótipo acadêmico. Nenhuma cobrança real foi feita.
        </p>
      </div>
    </main>
  )
}

function Detalhe({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{rotulo}</dt>
      <dd className={`mt-0.5 font-semibold ${destaque ? 'text-[#438d81]' : 'text-[#172d52]'}`}>{valor}</dd>
    </div>
  )
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
