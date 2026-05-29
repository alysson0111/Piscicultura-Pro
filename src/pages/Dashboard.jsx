import { useState } from "react"
import {
  Activity,
  BarChart3,
  ClipboardList,
  Droplets,
  Fish,
  Gauge,
  LineChart,
  LogOut,
  Package,
  Scale,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react"

import Tanques from "./Tanques"
import Biometria from "./Biometria"
import Custos from "./Custos"
import Vendas from "./Vendas"
import Relatorios from "./Relatorios"
import Parametros from "./Parametros"
import Mortalidade from "./Mortalidade"
import EstoqueRacao from "./EstoqueRacao"
import Manutencao from "./Lotes"
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

  const menu = [
    {
      nome: "Tanques",
      valor: "tanques",
      icon: Droplets,
    },
    {
      nome: "Biometria",
      valor: "biometria",
      icon: Scale,
    },
    {
      nome: "Vendas",
      valor: "vendas",
      icon: TrendingUp,
    },
    {
      nome: "Mortalidade",
      valor: "mortalidade",
      icon: Activity,
    },
    {
      nome: "Estoque",
      valor: "estoque",
      icon: Package,
    },
    {
      nome: "Custos",
      valor: "custos",
      icon: Wallet,
    },
    {
      nome: "Manutenção",
      valor: "manutencao",
      icon: Wrench,
    },
    {
      nome: "Parâmetros",
      valor: "parametros",
      icon: SlidersHorizontal,
    },
    {
      nome: "Crescimento",
      valor: "crescimento",
      icon: LineChart,
    },
    {
      nome: "Previsão",
      valor: "previsao",
      icon: Gauge,
    },
    {
      nome: "Curva Biomassa",
      valor: "curva",
      icon: BarChart3,
    },
    {
      nome: "RCA Tanques",
      valor: "rca",
      icon: Fish,
    },
    {
      nome: "Relatórios",
      valor: "relatorios",
      icon: ClipboardList,
    },
  ]

  const abaAtual =
    menu.find((item) => item.valor === aba) ||
    menu[0]

  function Botao({
    nome,
    valor,
    icon: Icon,
  }) {
    return (
      <button
        onClick={() => setAba(valor)}
        className={`flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
          aba === valor
            ? "bg-teal-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        }`}
      >
        <Icon
          size={17}
          strokeWidth={2.2}
        />
        <span className="truncate">
          {nome}
        </span>
      </button>
    )
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-5 px-3 py-5 sm:px-4 lg:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <Fish
                  size={28}
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-950">
                  Piscicultura PRO
                </h1>
                <p className="text-sm text-slate-500">
                  Gestão de produção aquícola
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                <span className="font-medium text-slate-900">
                  Usuário:
                </span>
                {" "}
                {user?.email}
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <LogOut size={17} />
                Sair
              </button>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                Operação
              </p>
              <p className="mt-1 text-lg font-bold text-slate-950">
                {abaAtual.nome}
              </p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                Módulos ativos
              </p>
              <p className="mt-1 text-lg font-bold text-slate-950">
                {menu.length} áreas de controle
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Status
              </p>
              <p className="mt-1 text-lg font-bold text-slate-950">
                Sistema conectado
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl min-w-0 gap-5 overflow-x-hidden px-3 py-5 sm:px-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-6">
        <aside className="min-w-0 h-fit rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {menu.map((item) => (
              <Botao
                key={item.valor}
                {...item}
              />
            ))}
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden min-h-[640px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
          {aba === "tanques" && <Tanques user={user} />}
          {aba === "biometria" && <Biometria user={user} />}
          {aba === "custos" && <Custos user={user} />}
          {aba === "vendas" && <Vendas user={user} />}
          {aba === "relatorios" && <Relatorios user={user} />}
          {aba === "mortalidade" && <Mortalidade user={user} />}
          {aba === "estoque" && <EstoqueRacao user={user} />}
          {aba === "manutencao" && <Manutencao user={user} />}
          {aba === "parametros" && <Parametros user={user} />}
          {aba === "crescimento" && <Crescimento user={user} />}
          {aba === "previsao" && <PrevisaoAbate user={user} />}
          {aba === "curva" && <CurvaBiomassa user={user} />}
          {aba === "rca" && <RcaTanques user={user} />}
        </section>
      </main>
    </div>
  )
}
