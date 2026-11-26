import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, loginUser, saveCurrentUser } from '../services/userService'

interface LoginLocationState {
  email?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefilledEmail = (location.state as LoginLocationState | null)?.email ?? ''
  const currentUser = getCurrentUser()
  const [email, setEmail] = useState(prefilledEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Entrar | Forma'
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = await loginUser({ email: email.trim().toLowerCase(), password })
      saveCurrentUser(user)
      navigate('/busca', {
        state: { userName: user.name },
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Não foi possível fazer login. Tente novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] p-4 sm:p-6">
      <section className="w-full max-w-md rounded-3xl bg-white px-6 py-9 shadow-[0_24px_80px_-28px_rgba(27,45,83,0.28)] sm:px-10 sm:py-12">
        <Link to="/" className="mb-9 inline-flex items-center gap-3 text-lg font-semibold tracking-wide text-[#172d52] no-underline">
          <span className="grid size-10 place-items-center rounded-xl bg-[#172d52] text-[#a7e2d2]">
            <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
              <path d="M5 18.5V9.7L12 5l7 4.7v8.8h-5v-5.8h-4v5.8H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </span>
          forma
        </Link>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#438d81]">
          Que bom ter você de volta
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#172d52]">
          Entrar na sua conta
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Informe seus dados para acessar.
        </p>

        {currentUser && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#438d81]/30 bg-[#eaf8f5] px-4 py-3 text-xs text-[#172d52]">
            <span>
              Sessão ativa como <strong>{currentUser.name.split(' ')[0]}</strong>.
            </span>
            <Link to="/busca" className="shrink-0 font-semibold text-[#2f6f64] hover:underline">
              Ir para busca →
            </Link>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</span>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#438d81] focus:ring-4 focus:ring-[#438d81]/10"
              maxLength={254}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Senha</span>
            <input
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#438d81] focus:ring-4 focus:ring-[#438d81]/10"
              maxLength={128}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              required
              type="password"
              value={password}
            />
          </label>
          <button
            className="flex w-full items-center justify-center rounded-xl bg-[#1d4260] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173650] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438d81] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Ainda não tem conta?{' '}
          <Link className="font-semibold text-[#1d4260] hover:text-[#438d81]" to="/">
            Criar cadastro
          </Link>
        </p>
      </section>
    </main>
  )
}
