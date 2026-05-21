import { useState } from "react"
import { supabase } from "../lib/supabase"

import Tanques from "./Tanques"
import Biometria from "./Biometria"
import Custos from "./Custos"
import Vendas from "./Vendas"
import Relatorios from "./Relatorios"

export default function Dashboard({ user }) {
  const [aba, setAba] = useState("tanques")

  function Botao({ nome, valor }) {
    return (
      <button
        onClick={() => setAba(valor)}
        className={`px-4 py-2 rounded-xl font-bold transition ${
          aba === valor
            ? "bg-blue-600 text-white"
            : "bg-white text-black shadow"
        }`}
      >
        {nome}
      </button>
    )
  }

  async function sair() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow">

        <h1 className="text-3xl font-bold">
          🐟 Sistema Piscicultura PRO
        </h1>

        <p className="mt-2 opacity-80">
          Usuário logado: {user?.email}
        </p>

        <button
          onClick={sair}
          className="mt-4 bg-white text-black px-4 py-2 rounded-xl font-bold"
        >
          Sair
        </button>

      </div>

      {/* MENU */}
      <div className="flex flex-wrap gap-3 mt-6">

        <Botao nome="Tanques" valor="tanques" />

        <Botao nome="Biometria" valor="biometria" />

        <Botao nome="Custos" valor="custos" />

        <Botao nome="Vendas" valor="vendas" />

        <Botao nome="Relatórios" valor="relatorios" />

      </div>

      {/* CONTEÚDO */}
      <div className="bg-white rounded-2xl shadow p-6 mt-6 min-h-[500px]">

        {aba === "tanques" && (
          <Tanques user={user} />
        )}

        {aba === "biometria" && (
          <Biometria user={user} />
        )}

        {aba === "custos" && (
          <Custos user={user} />
        )}

        {aba === "vendas" && (
          <Vendas user={user} />
        )}

        {aba === "relatorios" && (
          <Relatorios user={user} />
        )}

      </div>

    </div>
  )
}