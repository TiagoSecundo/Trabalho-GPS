import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Pagamento, { type DadosCarona } from '../../../components/Pagamento/Pagamento'
import { getCurrentUser } from '../../users/services/userService'
import { reservarCarona } from '../services/caronaService'
import type { EstadoConfirmacao } from './ConfirmacaoPage'

interface EstadoPagamento {
  carona?: DadosCarona
  userName?: string
}

// Liga a carona escolhida na busca ao componente de pagamento e persiste no SQLite
export default function PagamentoPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const estado = location.state as EstadoPagamento | null
  const usuarioAtual = getCurrentUser()
  const userName = estado?.userName ?? usuarioAtual?.name
  const carona = estado?.carona
  const [enviando, setEnviando] = useState(false)
  const [erroReserva, setErroReserva] = useState('')

  useEffect(() => {
    document.title = 'Pagamento | Forma'
  }, [])

  if (!userName) {
    return <Navigate to="/login" replace />
  }

  if (!carona) {
    return <Navigate to="/busca" replace />
  }

  async function confirmar(formaPagamento: EstadoConfirmacao['formaPagamento']) {
    if (!carona) return
    setErroReserva('')
    setEnviando(true)

    try {
      let codigoReserva = gerarCodigoReservaLocal()
      if (carona.id) {
        const resposta = await reservarCarona(
          carona.id,
          carona.passageirosReserva ?? 1,
        )
        codigoReserva = resposta.codigoReserva
      }

      const confirmacao: EstadoConfirmacao = {
        carona,
        formaPagamento,
        codigoReserva,
        userName,
      }
      // replace: o botão "voltar" do navegador não leva de novo ao pagamento
      navigate('/confirmada', { replace: true, state: confirmacao })
    } catch (erro) {
      setErroReserva(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível confirmar sua reserva. Tente novamente.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Pagamento
      carona={carona}
      enviando={enviando}
      erroReserva={erroReserva}
      onVoltar={() => navigate(-1)}
      onConfirmar={confirmar}
    />
  )
}

// Fallback local caso a tela seja acionada com dados de demonstração sem ID
function gerarCodigoReservaLocal(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const valores = crypto.getRandomValues(new Uint32Array(6))
  return 'FRM-' + Array.from(valores, (v) => alfabeto[v % alfabeto.length]).join('')
}
