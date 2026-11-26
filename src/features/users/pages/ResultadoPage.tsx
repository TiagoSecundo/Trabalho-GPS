import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/userService'

interface ResultState {
  flow: 'cadastro' | 'login'
  userName: string
  email?: string
  localCacheSaved?: boolean
}

export default function ResultadoPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ResultState | null
  const currentUser = getCurrentUser()

  useEffect(() => {
    document.title = 'Confirmação | Forma'
  }, [])

  if (
    !state ||
    (state.flow !== 'cadastro' && state.flow !== 'login') ||
    typeof state.userName !== 'string'
  ) {
    return <Navigate to={currentUser ? '/busca' : '/'} replace />
  }

  const isRegistration = state.flow === 'cadastro'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] p-4 sm:p-6">
      <section className="w-full max-w-lg rounded-3xl bg-white px-6 py-10 text-center shadow-[0_24px_80px_-28px_rgba(27,45,83,0.28)] sm:px-12 sm:py-14">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <svg viewBox="0 0 24 24" fill="none" className="size-8" aria-hidden="true">
            <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#438d81]">
          {isRegistration ? 'Cadastro realizado com sucesso' : 'Acesso confirmado'}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#172d52]">
          {isRegistration ? 'Tudo certo, ' : 'Bem-vindo(a), '}
          {state.userName.split(' ')[0]}!
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          {isRegistration
            ? 'Cadastro realizado com sucesso. Agora você já pode buscar sua carona.'
            : 'Seu e-mail e senha foram validados. Você já pode buscar sua carona.'}
        </p>
        {isRegistration && state.localCacheSaved === false && (
          <p role="status" className="mt-4 text-xs text-amber-700">
            O cadastro foi salvo no banco, mas não foi possível atualizar o armazenamento local.
          </p>
        )}
        {isRegistration && !currentUser ? (
          <Link
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#1d4260] px-5 py-3.5 text-sm font-semibold text-white no-underline transition hover:bg-[#173650] sm:w-auto sm:min-w-52"
            state={state.email ? { email: state.email } : undefined}
            to="/login"
          >
            Fazer login
          </Link>
        ) : (
          <button
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#1d4260] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173650] sm:w-auto sm:min-w-52"
            onClick={() => navigate('/busca', { state: { userName: state.userName } })}
            type="button"
          >
            Buscar carona
          </button>
        )}
      </section>
    </main>
  )
}
