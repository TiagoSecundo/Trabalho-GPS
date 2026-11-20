import { Link, Navigate, useLocation } from 'react-router-dom'

interface HomeState {
  userName: string
}

export default function InicioPage() {
  const location = useLocation()
  const state = location.state as HomeState | null

  if (!state || typeof state.userName !== 'string') {
    return <Navigate to="/login" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] p-4 sm:p-6">
      <section className="w-full max-w-2xl rounded-3xl bg-white px-6 py-10 shadow-[0_24px_80px_-28px_rgba(27,45,83,0.28)] sm:px-12 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#438d81]">
          Área inicial
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#172d52] sm:text-4xl">
          Olá, {state.userName.split(' ')[0]}!
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Seu cadastro e seu login foram concluídos. Esta tela confirma o redirecionamento para o site.
        </p>
        <Link
          className="mt-8 inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#1d4260] no-underline transition hover:bg-slate-50"
          to="/login"
        >
          Sair
        </Link>
      </section>
    </main>
  )
}
