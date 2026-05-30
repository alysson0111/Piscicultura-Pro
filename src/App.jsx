import { useEffect, useState } from "react"

import { supabase } from "./lib/supabase"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [user, setUser] =
    useState(null)

  const [perfil, setPerfil] =
    useState(null)

  const [bloqueio, setBloqueio] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  async function carregarPerfil(
    usuario
  ) {
    if (!usuario) {
      setPerfil(null)
      setBloqueio("")
      return
    }

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "user_id",
        usuario.id
      )
      .maybeSingle()

    if (error) {
      console.log(error)
      setPerfil(null)
      setBloqueio("")
      return
    }

    if (!data) {
      const novoPerfil = {
        user_id:
          usuario.id,
        nome:
          usuario.email,
        email:
          usuario.email,
        tipo_usuario:
          "cliente",
        status:
          "ativo",
        status_pagamento:
          "ativo",
        valor_mensal:
          0,
        desconto_percentual:
          0,
        valor_final:
          0,
        data_vencimento:
          null,
      }

      const {
        data: perfilCriado,
        error: erroCriar,
      } = await supabase
        .from("profiles")
        .insert([
          novoPerfil,
        ])
        .select()
        .single()

      if (erroCriar) {
        console.log(erroCriar)
        setPerfil(null)
        setBloqueio("")
        return
      }

      setPerfil(perfilCriado)
      setBloqueio("")
      return
    }

    setPerfil(data)

    const hoje =
      new Date()

    hoje.setHours(0, 0, 0, 0)

    const vencimento =
      data.data_vencimento
        ? new Date(data.data_vencimento)
        : null

    if (vencimento) {
      vencimento.setHours(0, 0, 0, 0)
    }

    const diasAtraso =
      vencimento
        ? Math.floor(
            (
              hoje -
              vencimento
            ) /
            (
              1000 *
              60 *
              60 *
              24
            )
          )
        : 0

    if (data.status === "bloqueado") {
      setBloqueio(
        "Usuário bloqueado. Entre em contato com o suporte."
      )
      return
    }

    if (
      data.tipo_usuario !== "root" &&
      data.status_pagamento !== "isento" &&
      (
        (
          data.status_pagamento === "vencido" &&
          !vencimento
        ) ||
        (
          vencimento &&
          diasAtraso > 5
        )
      )
    ) {
      setBloqueio(
        "Acesso suspenso por pendência de pagamento."
      )
      return
    }

    setBloqueio("")
  }

  useEffect(() => {
    async function carregarSessao() {
      const {
        data,
      } = await supabase.auth.getSession()

      const usuario =
        data.session?.user || null

      setUser(usuario)
      await carregarPerfil(usuario)
      setLoading(false)
    }

    carregarSessao()

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const usuario =
          session?.user || null

        setUser(usuario)
        carregarPerfil(usuario)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function sair() {
    await supabase.auth.signOut()

    setUser(null)
    setPerfil(null)
    setBloqueio("")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-2xl font-bold">
          Carregando...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Login
        onLogin={setUser}
      />
    )
  }

  if (bloqueio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="bg-white max-w-md rounded-2xl p-8 shadow text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-950">
            Acesso indisponível
          </h1>

          <p className="text-slate-600">
            {bloqueio}
          </p>

          <button
            onClick={sair}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  return (
    <Dashboard
      user={user}
      perfil={perfil}
      onLogout={sair}
    />
  )
}
