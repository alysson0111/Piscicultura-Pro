import { useState } from "react"
import { supabase } from "./lib/supabase"

export default function Login({ setUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [modo, setModo] = useState("login") // login | cadastro
  const [loading, setLoading] = useState(false)

  // 🔐 LOGIN
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    // 🔥 IMPORTANTE: usa session.user (não data.user)
    setUser(data.session.user)
  }

  // 🆕 CADASTRO
  async function handleCadastro(e) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Conta criada! Agora faça login.")
    setModo("login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm space-y-4">

        <h1 className="text-2xl font-bold text-center">
          🐟 Sistema Piscicultura
        </h1>

        <form
          onSubmit={modo === "login" ? handleLogin : handleCadastro}
          className="space-y-3"
        >

          <input
            type="email"
            placeholder="Email"
            className="border p-3 w-full rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="border p-3 w-full rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold"
          >
            {loading
              ? "Carregando..."
              : modo === "login"
              ? "Entrar"
              : "Cadastrar"}
          </button>

        </form>

        {/* troca de modo */}
        <p className="text-center text-sm">
          {modo === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                className="text-blue-600 font-semibold"
                onClick={() => setModo("cadastro")}
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                className="text-blue-600 font-semibold"
                onClick={() => setModo("login")}
              >
                Fazer login
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  )
}