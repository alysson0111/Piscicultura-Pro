import { useState } from "react"

// PRINCIPAIS
import Tanques from "./Tanques"
import Biometria from "./Biometria"
import Custos from "./Custos"
import Vendas from "./Vendas"
import Relatorios from "./Relatorios"

// NOVOS
import Mortalidade from "./Mortalidade"
import EstoqueRacao from "./EstoqueRacao"
import Lotes from "./Lotes"
import Crescimento from "./Crescimento"
import PrevisaoAbate from "./PrevisaoAbate"
import CurvaBiomassa from "./CurvaBiomassa"
import RcaTanques from "./RcaTanques"

export default function Dashboard({
  user,
  onLogout,
}) {

  const [aba, setAba] =
    useState("tanques")

  // 🔥 BOTÃO MENU
  function Botao({
    nome,
    valor,
  }) {

    return (

      <button
        onClick={() =>
          setAba(valor)
        }
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

  return (

    <div className="min-h-screen bg-slate-100 p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            🐟 Piscicultura PRO
          </h1>

          <p className="opacity-80">
            Usuário:
            {" "}
            {user?.email}
          </p>

        </div>

        {/* SAIR */}
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl font-bold"
        >

          Sair

        </button>

      </div>

      {/* MENU */}
      <div className="flex flex-wrap gap-3">

        <Botao
          nome="Tanques"
          valor="tanques"
        />

        <Botao
          nome="Biometria"
          valor="biometria"
        />

        <Botao
          nome="Custos"
          valor="custos"
        />

        <Botao
          nome="Vendas"
          valor="vendas"
        />

        <Botao
          nome="Relatórios"
          valor="relatorios"
        />

        <Botao
          nome="Mortalidade"
          valor="mortalidade"
        />

        <Botao
          nome="Estoque"
          valor="estoque"
        />

        <Botao
          nome="Lotes"
          valor="lotes"
        />

        <Botao
          nome="Crescimento"
          valor="crescimento"
        />

        <Botao
          nome="Previsão"
          valor="previsao"
        />

        <Botao
          nome="Curva Biomassa"
          valor="curva"
        />

        <Botao
          nome="RCA Tanques"
          valor="rca"
        />

      </div>

      {/* CONTEÚDO */}
      <div className="bg-white p-6 rounded-2xl shadow min-h-[600px]">

        {/* PRINCIPAIS */}
        {aba === "tanques" &&
          <Tanques user={user} />
        }

        {aba === "biometria" &&
          <Biometria user={user} />
        }

        {aba === "custos" &&
          <Custos user={user} />
        }

        {aba === "vendas" &&
          <Vendas user={user} />
        }

        {aba === "relatorios" &&
          <Relatorios user={user} />
        }

        {/* NOVOS */}
        {aba === "mortalidade" &&
          <Mortalidade user={user} />
        }

        {aba === "estoque" &&
          <EstoqueRacao user={user} />
        }

        {aba === "lotes" &&
          <Lotes user={user} />
        }

        {aba === "crescimento" &&
          <Crescimento user={user} />
        }

        {aba === "previsao" &&
          <PrevisaoAbate user={user} />
        }

        {aba === "curva" &&
          <CurvaBiomassa user={user} />
        }

        {aba === "rca" &&
          <RcaTanques user={user} />
        }

      </div>

    </div>
  )
}