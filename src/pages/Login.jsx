import { useState } from "react"
import {
  Fish,
  Lock,
  LogIn,
  Mail,
  UserPlus,
} from "lucide-react"

import { supabase } from "../lib/supabase"

export default function Login({
  onLogin,
}) {
  const [email, setEmail] =
    useState("")

  const [senha, setSenha] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [recuperandoSenha, setRecuperandoSenha] =
    useState(false)

  const formularioInvalido =
    !email.trim() ||
    senha.length < 6 ||
    loading ||
    recuperandoSenha

  const emailInvalido =
    !email.trim() ||
    loading ||
    recuperandoSenha

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
    try {
      setLoading(true)

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password: senha,
      })

      if (error) {
        alert(error.message)
        return
      }

      alert("Usuário cadastrado!")
      onLogin(data.user)
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

      const {
        error,
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
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

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-slate-950 p-8 text-white sm:p-10">
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
              <p className="text-sm text-slate-300">
                Gestão aquícola integrada
              </p>
            </div>
          </div>

          <div className="py-16 lg:py-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-300">
              Controle de produção
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
              Dados de tanques, custos e biometria no mesmo painel.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Acompanhe a operação com indicadores claros para decidir rápido no manejo diário.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">
                12
              </p>
              <p className="text-sm text-slate-300">
                módulos
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">
                PDF
              </p>
              <p className="text-sm text-slate-300">
                relatórios
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">
                XLS
              </p>
              <p className="text-sm text-slate-300">
                exportação
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md space-y-7">
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
                onClick={entrar}
                disabled={formularioInvalido}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <LogIn size={18} />
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <button
                onClick={cadastrar}
                disabled={formularioInvalido}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <UserPlus size={18} />
                Criar conta
              </button>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Para criar uma conta, informe um e-mail válido e uma senha com pelo menos 6 caracteres.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
