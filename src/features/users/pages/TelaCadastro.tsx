import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  getRegisteredUsers,
  registerUser,
  saveCurrentUser,
  saveRegisteredUsers,
} from "../services/userService";
import type { RegisteredUser } from "../types";

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialForm: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function TelaCadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const currentUser = getCurrentUser();

  useEffect(() => {
    document.title = "Criar conta | Forma";
    let active = true;

    getRegisteredUsers()
      .then((registeredUsers) => {
        if (!active) return;
        setUsers(registeredUsers);
        saveRegisteredUsers(registeredUsers);
      })
      .catch(() => {
        if (active)
          setError(
            "Não foi possível conectar ao banco de dados. Tente novamente.",
          );
      })
      .finally(() => {
        if (active) setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField(field: keyof FormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = form.email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setError("Este e-mail já possui cadastro. Use outro endereço de e-mail.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await registerUser({
        name: form.name.trim(),
        email: normalizedEmail,
        password: form.password,
      });
      const updatedUsers = [newUser, ...users];
      setUsers(updatedUsers);

      saveCurrentUser(newUser);
      try {
        saveRegisteredUsers(updatedUsers);
      } catch {
        // Ignora falha de cache local; o SQLite e a sessão seguem ativos
      }
      navigate("/busca", {
        state: {
          userName: newUser.name,
          welcomeMessage: "Cadastro realizado com sucesso! Sua conta já está conectada.",
        },
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível concluir o cadastro. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] p-4 sm:p-6 lg:p-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_-28px_rgba(27,45,83,0.28)] lg:min-h-[690px] lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#172d52] p-10 text-white lg:flex xl:p-14">
          <div className="absolute -right-32 -top-28 size-96 rounded-full border border-white/10" />
          <div className="absolute -right-16 -top-12 size-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 -left-32 size-96 rounded-full bg-[#255e71]/30 blur-2xl" />

          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-lg font-semibold tracking-wide text-white no-underline"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-[#a7e2d2] text-[#172d52]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-6"
                  aria-hidden="true"
                >
                  <path
                    d="M5 18.5V9.7L12 5l7 4.7v8.8h-5v-5.8h-4v5.8H5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              forma
            </Link>
          </div>

          <div className="relative mb-8">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-[#c7d7e9]">
              <span className="size-2 rounded-full bg-[#9fe3cd]" />
              Um bom começo para novas possibilidades
            </div>
            <h1 className="max-w-md text-4xl font-semibold leading-[1.13] tracking-tight xl:text-[3.25rem]">
              Seu próximo capítulo começa aqui.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#bfccdd]">
              Crie sua conta e tenha tudo pronto para seguir em frente com mais
              tranquilidade.
            </p>

            <div className="mt-12 flex items-center gap-4 border-t border-white/15 pt-6">
              <div className="grid size-11 place-items-center rounded-full bg-white/10 text-[#a7e2d2]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3 5 6v5c0 4.5 2.9 7.7 7 10 4.1-2.3 7-5.5 7-10V6l-7-3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Seus dados, com cuidado</p>
                <p className="mt-1 text-xs text-[#bfccdd]">
                  Senhas protegidas e cadastro seguro.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center text-xs text-[#aebed2]">
            <span className="text-center">© 2026 Forma</span>
            {/* <span>{users.length} {users.length === 1 ? 'conta criada' : 'contas criadas'}</span> */}
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-2 text-base font-semibold tracking-wide text-[#172d52] no-underline lg:hidden"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[#172d52] text-[#a7e2d2]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    d="M5 18.5V9.7L12 5l7 4.7v8.8h-5v-5.8h-4v5.8H5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              forma
            </Link>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#438d81]">
                Boas-vindas
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#172d52] sm:text-[2.1rem]">
                Crie sua conta
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Preencha os campos abaixo para começar.
              </p>
            </div>

            {currentUser && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#438d81]/30 bg-[#eaf8f5] px-4 py-3 text-xs text-[#172d52]">
                <span>
                  Sessão ativa como <strong>{currentUser.name.split(" ")[0]}</strong>.
                </span>
                <Link
                  to="/busca"
                  className="shrink-0 font-semibold text-[#2f6f64] hover:underline"
                >
                  Ir para busca →
                </Link>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nome completo
                </span>
                <input
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#438d81] focus:ring-4 focus:ring-[#438d81]/10"
                  maxLength={100}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Como podemos te chamar?"
                  required
                  value={form.name}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  E-mail
                </span>
                <input
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#438d81] focus:ring-4 focus:ring-[#438d81]/10"
                  maxLength={254}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="voce@exemplo.com"
                  required
                  type="email"
                  value={form.email}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Senha
                  </span>
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#438d81] focus:ring-4 focus:ring-[#438d81]/10"
                    maxLength={128}
                    minLength={8}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Mínimo de 8 caracteres"
                    required
                    type="password"
                    value={form.password}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirme a senha
                  </span>
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#438d81] focus:ring-4 focus:ring-[#438d81]/10"
                    maxLength={128}
                    minLength={8}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    placeholder="Digite novamente"
                    required
                    type="password"
                    value={form.confirmPassword}
                  />
                </label>
              </div>

              <p className="pt-0.5 text-xs leading-5 text-slate-500">
                Ao continuar, seus dados serão armazenados para evitar cadastros
                duplicados.
              </p>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4260] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173650] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438d81] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || loadingUsers}
                type="submit"
              >
                {submitting
                  ? "Criando sua conta..."
                  : loadingUsers
                    ? "Conectando..."
                    : "Criar conta"}
                {!submitting && !loadingUsers && (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10h12m-5-5 5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Já tem uma conta?{" "}
              <Link
                className="font-semibold text-[#1d4260] hover:text-[#438d81]"
                to="/login"
              >
                Fazer login
              </Link>
            </p>

            <p className="mt-8 text-center text-xs text-slate-400">
              {loadingUsers
                ? "Verificando conexão com o banco de dados…"
                : "Seus dados são armazenados com segurança."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
