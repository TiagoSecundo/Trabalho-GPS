import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import InicioPage from './features/users/pages/InicioPage'
import LoginPage from './features/users/pages/LoginPage'
import ResultadoPage from './features/users/pages/ResultadoPage'
import BuscaPage from './features/caronas/pages/BuscaPage'
import ConfirmacaoPage from './features/caronas/pages/ConfirmacaoPage'
import PagamentoPage from './features/caronas/pages/PagamentoPage'
import TelaCadastro from './tela_cadastro/tela_cadastro'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TelaCadastro />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/resultado" element={<ResultadoPage />} />
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/busca" element={<BuscaPage />} />
        <Route path="/pagamento" element={<PagamentoPage />} />
        <Route path="/confirmada" element={<ConfirmacaoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
