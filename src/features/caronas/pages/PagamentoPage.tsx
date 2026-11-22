import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Pagamento, { type DadosCarona } from '../../../components/Pagamento/Pagamento'
import type { EstadoConfirmacao } from './ConfirmacaoPage'

interface EstadoPagamento {
  carona?: DadosCarona
  userName?: string
}

// Liga a carona escolhida na busca ao componente de pagamento
export default function PagamentoPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const estado = location.state as EstadoPagamento | null
  const carona = estado?.carona

  if (!carona) {
    return <Navigate to="/busca" replace />
  }

  function confirmar(formaPagamento: EstadoConfirmacao['formaPagamento']) {
    const confirmacao: EstadoConfirmacao = {
      carona: carona!,
      formaPagamento,
      codigoReserva: gerarCodigoReserva(),
      userName: estado?.userName,
    }
    // replace: o botão "voltar" do navegador não leva de novo ao pagamento
    navigate('/confirmada', { replace: true, state: confirmacao })
  }

  return (
    <Pagamento carona={carona} onVoltar={() => navigate(-1)} onConfirmar={confirmar} />
  )
}

// Código curto e legível, sem caracteres ambíguos (0/O, 1/I)
function gerarCodigoReserva(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const valores = crypto.getRandomValues(new Uint32Array(6))
  return 'FRM-' + Array.from(valores, (v) => alfabeto[v % alfabeto.length]).join('')
}
