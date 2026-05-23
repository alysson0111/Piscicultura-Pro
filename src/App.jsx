import { useEffect, useState } from "react"

import { supabase } from "./lib/supabase"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

export default function App() {

  const [user, setUser] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  // 🔥 CARREGAR SESSÃO
  useEffect(() => {

    async function carregarSessao() {

      const {
        data,
      } = await supabase.auth.getSession()

      setUser(
        data.session?.user || null
      )

      setLoading(false)
    }

    carregarSessao()

    // 🔥 OUVIR LOGIN/LOGOUT
    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setUser(
          session?.user || null
        )

      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  // 🔥 LOGOUT
  async function sair() {

    await supabase.auth.signOut()

    setUser(null)
  }

  // 🔥 LOADING
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-100">

        <div className="text-2xl font-bold">
          Carregando...
        </div>

      </div>

    )
  }

  // 🔥 LOGIN
  if (!user) {

    return (
      <Login
        onLogin={setUser}
      />
    )
  }

  // 🔥 DASHBOARD
  return (

    <Dashboard
      user={user}
      onLogout={sair}
    />

  )
}