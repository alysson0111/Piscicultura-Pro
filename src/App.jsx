import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

import Login from "./Login"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔐 pega sessão atual ao abrir o app
    async function loadUser() {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      setLoading(false)
    }

    loadUser()

    // 👂 escuta mudanças de login/logout em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ⏳ loading inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  // 🔓 não logado → login
  if (!user) {
    return <Login setUser={setUser} />
  }

  // 🔐 logado → dashboard
  return <Dashboard user={user} />
}