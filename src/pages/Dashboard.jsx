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
  MessageCircle,
  Package,
  Scale,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react"

import Tanques from "./Tanques"
import Biometria from "./Biometria"
import Custos from "./Custos"
import Vendas from "./Vendas"
import Relatorios from "./Relatorios"
import Parametros from "./Parametros"
import Usuarios from "./Usuarios"
import Mortalidade from "./Mortalidade"
import EstoqueRacao from "./EstoqueRacao"
import Manutencao from "./Lotes"
import Crescimento from "./Crescimento"
import PrevisaoAbate from "./PrevisaoAbate"
import CurvaBiomassa from "./CurvaBiomassa"
import RcaTanques from "./RcaTanques"

const WHATSAPP_PRO =
  "https://wa.me/5579998485516?text=Olá! Estou utilizando o período gratuito do Piscicultura PRO e desejo migrar para o Plano Pro."

function criarDataLocal(valor) {
  if (!valor) return null

  if (
    typeof valor === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    const [ano, mes, dia] =
      valor.split("-").map(Number)

    return new Date(ano, mes - 1, dia)
  }

  return new Date(valor)
}

function formatarData(valor) {
  const data = criarDataLocal(valor)

  if (!data || Number.isNaN(data.getTime())) {
    return "-"
  }

  return data.toLocaleDateString("pt-BR")
}

export default function Dashboard({
  user,
  perfil,
  onLogout,
}) {
  const [aba, setAba] =
    useState("tanques")

  const menu = [
    ...(perfil?.tipo_usuario === "root"
      ? [
          {
            nome: "Usuários",
            valor: "usuarios",
            icon: Users,
          },
        ]
      : []),
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

  const plano =
    perfil?.tipo_usuario === "root" ||
    perfil?.tipo_usuario === "parceiro" ||
    perfil?.status_pagamento === "isento"
      ? "isento"
      : perfil?.plano || "pro"

  const fimDoTeste =
    criarDataLocal(
      perfil?.teste_termina_em
    )

  const diasRestantesTeste =
    fimDoTeste
      ? Math.max(
          0,
          Math.ceil(
            (
              fimDoTeste.getTime() -
              new Date().getTime()
            ) /
            (1000 * 60 * 60 * 24)
          )
        )
      : 0

  function avisoMensalidade() {
    if (
      !perfil ||
      perfil.tipo_usuario === "root" ||
      perfil.status_pagamento === "isento" ||
      !perfil.data_vencimento
    ) {
      return null
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const vencimento =
      new Date(perfil.data_vencimento)
    vencimento.setHours(0, 0, 0, 0)

    const dias =
      Math.ceil(
        (
          vencimento -
          hoje
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      )

    if (dias < -5 || dias > 5) {
      return null
    }

    if (dias < 0) {
      const diasAtraso =
        Math.abs(dias)

      return `Sua mensalidade está atrasada há ${diasAtraso} dia${diasAtraso > 1 ? "s" : ""}.`
    }

    if (dias === 0) {
      return "Sua mensalidade vence hoje."
    }

    return `Sua mensalidade vence em ${dias} dia${dias > 1 ? "s" : ""}.`
  }

  function Botao({
    nome,
    valor,
    icon: Icon,
  }) {
    return (
      <button
        onClick={() => setAba(valor)}
        className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition lg:justify-start ${
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 mobile-app-shell">
      {avisoMensalidade() && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-3 text-center text-sm font-bold text-yellow-800 sm:text-base">
          {avisoMensalidade()}
        </div>
      )}

      <div className="border-b border-slate-200 bg-white/90 backdrop-blur mobile-topbar">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm sm:h-12 sm:w-12">
                <Fish
                  size={26}
                  strokeWidth={2.4}
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-slate-950 sm:text-2xl">
                  Piscicultura PRO
                </h1>
                <p className="text-sm text-slate-500">
                  Gestão de produção aquícola
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:px-4">
                <div>
                  <span className="font-medium text-slate-900">
                    Usuário:
                  </span>
                  {" "}
                  <span className="break-all">
                    {user?.email}
                  </span>
                </div>

                {plano === "teste" && (
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-amber-700">
                        Plano gratuito
                      </span>
                      <span className="text-xs text-slate-500">
                        {diasRestantesTeste} dia{diasRestantesTeste === 1 ? "" : "s"} restante{diasRestantesTeste === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Gratuito até {formatarData(perfil?.teste_termina_em)}
                    </p>
                    <a
                      href={encodeURI(WHATSAPP_PRO)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      <MessageCircle size={15} />
                      Migrar para o Plano Pro
                    </a>
                  </div>
                )}

                {plano === "pro" && (
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <p className="font-bold text-emerald-700">
                      Plano Pro
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Vencimento: {formatarData(perfil?.data_vencimento)}
                    </p>
                  </div>
                )}

                {plano === "isento" && (
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <p className="font-bold text-teal-700">
                      Plano isento
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={onLogout}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <LogOut size={17} />
                Sair
              </button>
            </div>
          </div>

          <div className="hidden">
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

      <main className="mx-auto grid w-full max-w-7xl min-w-0 gap-4 overflow-x-hidden px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-5 lg:px-6">
        <aside className="sticky top-0 z-20 -mx-3 min-w-0 border-y border-slate-200 bg-white p-2 shadow-sm sm:-mx-4 lg:static lg:mx-0 lg:h-fit lg:rounded-xl lg:border lg:shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
            {menu.map((item) => (
              <Botao
                key={item.valor}
                {...item}
              />
            ))}
          </div>
        </aside>

        <section className="mobile-content-panel min-h-[640px] min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
          {aba === "usuarios" && <Usuarios user={user} />}
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
