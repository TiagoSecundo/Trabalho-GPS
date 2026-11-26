import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { clearCurrentUser, getCurrentUser } from '../services/userService'

interface HomeState {
  userName?: string
}

export default function InicioPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as HomeState | null
  const currentUser = getCurrentUser()
  const userName = state?.userName ?? currentUser?.name

  useEffect(() => {
    document.title = 'Início | Forma'
  }, [])

  if (!userName) {
    return <Navigate to="/login" replace />
  }

  function handleLogout() {
    clearCurrentUser()
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] p-4 sm:p-6">
      <section className="w-full max-w-2xl rounded-3xl bg-white px-6 py-10 shadow-[0_24px_80px_-28px_rgba(27,45,83,0.28)] sm:px-12 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#438d81]">
          Área inicial
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#172d52] sm:text-4xl">
          Olá, {userName.split(' ')[0]}!
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Encontre caronas compatíveis com o seu trajeto e divida os custos da viagem com praticidade.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-xl bg-[#1d4260] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#173650]"
            state={{ userName }}
            to="/busca"
          >
            Buscar carona
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#1d4260] transition hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </section>
    </main>
  )
}
