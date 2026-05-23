import { useState } from "react"

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

      alert(
        "Usuário cadastrado!"
      )

      onLogin(data.user)

    } catch (erro) {

      console.log(erro)

    } finally {

      setLoading(false)

    }
  }

  return (

    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow space-y-6">

        <div className="text-center">

          <h1 className="text-4xl font-bold text-blue-600">
            🐟 Piscicultura PRO
          </h1>

          <p className="text-gray-500 mt-2">
            Sistema profissional de gestão aquícola
          </p>

        </div>

        {/* EMAIL */}
        <div>

          <label className="font-bold">
            E-mail
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Digite seu e-mail"
          />

        </div>

        {/* SENHA */}
        <div>

          <label className="font-bold">
            Senha
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Digite sua senha"
          />

        </div>

        {/* BOTÕES */}
        <div className="flex gap-3">

          <button
            onClick={entrar}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
          >

            Entrar

          </button>

          <button
            onClick={cadastrar}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
          >

            Criar Conta

          </button>

        </div>

      </div>

    </div>
  )
}