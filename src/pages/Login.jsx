import { useState } from "react"
import {
  Fish,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Smartphone,
  UserPlus,
} from "lucide-react"

import { supabase } from "../lib/supabase"

export default function Login({
  onLogin,
  modoRedefinirSenha = false,
  onSenhaRedefinida,
}) {
  const [email, setEmail] =
    useState("")

  const [senha, setSenha] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [recuperandoSenha, setRecuperandoSenha] =
    useState(false)

  const [novaSenha, setNovaSenha] =
    useState("")

  const [confirmarSenha, setConfirmarSenha] =
    useState("")

  const [salvandoSenha, setSalvandoSenha] =
    useState(false)

  const formularioInvalido =
    !email.trim() ||
    senha.length < 6 ||
    loading ||
    recuperandoSenha

  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    )

  const emailInvalido =
    !email.trim() ||
    loading ||
    recuperandoSenha

  function enviarLogin(e) {
    e.preventDefault()

    if (formularioInvalido) {
      return
    }

    entrar()
  }

  async function entrar() {
    try {
      setLoading(true)

      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) {
        alert(error.message)
        return
      }

      onLogin(data.user)
    } catch (erro) {
      console.log(erro)
    } finally {
      setLoading(false)
    }
  }

  async function cadastrar() {
    if (!emailValido) {
      alert(
        "Informe um e-mail válido para criar a conta."
      )
      return
    }

    if (senha.length < 6) {
      alert(
        "A senha precisa ter pelo menos 6 caracteres."
      )
      return
    }

    try {
      setLoading(true)

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: {
            plano: "teste",
            teste_inicia_em:
              new Date().toISOString(),
          },
        },
      })

      if (error) {
        alert(error.message)
        return
      }

      if (data.session) {
        alert("Usuário cadastrado!")
        onLogin(data.user)
        return
      }

      setSenha("")
      alert(
        "Cadastro realizado! Você poderá utilizar o Piscicultura PRO gratuitamente por 30 dias. Após esse período, será necessário migrar para o Plano Pro para continuar usando o sistema. Enviamos uma solicitação de confirmação para o seu e-mail."
      )
    } catch (erro) {
      console.log(erro)
    } finally {
      setLoading(false)
    }
  }

  async function recuperarSenha() {
    if (!email.trim()) {
      alert("Informe seu e-mail para receber o link de recuperação.")
      return
    }

    try {
      setRecuperandoSenha(true)

      const urlProducao =
        "https://piscicultura-pro.vercel.app"

      const origemLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"

      const urlBase =
        import.meta.env.VITE_APP_URL ||
        (
          origemLocal
            ? urlProducao
            : window.location.origin
        )

      const {
        error,
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: urlBase,
      })

      if (error) {
        alert(error.message)
        return
      }

      alert("Enviamos um link de recuperação para o seu e-mail.")
    } catch (erro) {
      console.log(erro)
    } finally {
      setRecuperandoSenha(false)
    }
  }

  async function salvarNovaSenha(e) {
    e.preventDefault()

    if (novaSenha.length < 6) {
      alert("A nova senha precisa ter pelo menos 6 caracteres.")
      return
    }

    if (novaSenha !== confirmarSenha) {
      alert("As senhas não conferem.")
      return
    }

    try {
      setSalvandoSenha(true)

      const {
        error,
      } = await supabase.auth.updateUser({
        password: novaSenha,
      })

      if (error) {
        alert(error.message)
        return
      }

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      )

      alert("Senha atualizada com sucesso. Entre novamente com sua nova senha.")

      await supabase.auth.signOut()
      onSenhaRedefinida?.()
      onLogin(null)
    } catch (erro) {
      console.log(erro)
    } finally {
      setSalvandoSenha(false)
    }
  }

  if (modoRedefinirSenha) {
    return (
      <div className="min-h-screen bg-slate-100 p-3 text-slate-950 sm:p-4">
        <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-xl items-center justify-center sm:min-h-[calc(100vh-2rem)]">
          <form
            onSubmit={salvarNovaSenha}
            className="w-full space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
                <KeyRound
                  size={26}
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                  Recuperação de senha
                </p>
                <h1 className="text-2xl font-bold">
                  Criar nova senha
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Nova senha
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                  <Lock
                    className="text-slate-400"
                    size={19}
                  />
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    placeholder="mínimo 6 caracteres"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Confirmar senha
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                  <Lock
                    className="text-slate-400"
                    size={19}
                  />
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={salvandoSenha}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <KeyRound size={18} />
              {salvandoSenha
                ? "Salvando..."
                : "Salvar nova senha"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 text-slate-950 sm:p-4">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:min-h-[calc(100vh-2rem)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-teal-700 p-5 text-white sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500 text-white">
              <Fish
                size={28}
                strokeWidth={2.4}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Piscicultura PRO
              </h1>
              <p className="text-sm text-teal-100">
                Gestão aquícola integrada
              </p>
            </div>
          </div>

          <div className="py-8 sm:py-16 lg:py-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-100">
              Controle de produção
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight sm:text-5xl">
              Dados de tanques, custos e biometria no mesmo painel.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-teal-50">
              Acompanhe a operação com indicadores claros para decidir rápido no manejo diário.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white shadow-sm">
              <Smartphone size={17} />
              Versão mobile disponível.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                12
              </p>
              <p className="text-sm text-teal-50">
                módulos
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 p-3 sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                PDF
              </p>
              <p className="text-sm text-teal-50">
                relatórios
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 p-3 sm:p-4">
              <p className="text-xl font-bold sm:text-2xl">
                XLS
              </p>
              <p className="text-sm text-teal-50">
                exportação
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <form
            onSubmit={enviarLogin}
            className="w-full max-w-md space-y-7"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                Acesso seguro
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Entrar no sistema
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Use seu e-mail e senha para continuar.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  E-mail
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                  <Mail
                    className="text-slate-400"
                    size={19}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Senha
                  </label>

                  <button
                    type="button"
                    onClick={recuperarSenha}
                    disabled={emailInvalido}
                    className="text-xs font-semibold text-teal-700 transition hover:text-teal-800 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {recuperandoSenha
                      ? "Enviando..."
                      : "Esqueci minha senha"}
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                  <Lock
                    className="text-slate-400"
                    size={19}
                  />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                    placeholder="mínimo 6 caracteres"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={formularioInvalido}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <LogIn size={18} />
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <button
                type="button"
                onClick={cadastrar}
                disabled={
                  loading ||
                  recuperandoSenha
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <UserPlus size={18} />
                {loading
                  ? "Criando..."
                  : "Criar conta"}
              </button>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Para criar uma conta, informe um e-mail válido e uma senha com pelo menos 6 caracteres.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
