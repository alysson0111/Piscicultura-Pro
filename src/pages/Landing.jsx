import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  Droplets,
  Fish,
  Gauge,
  LineChart,
  Menu,
  MessageCircle,
  Scale,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from "lucide-react"
import { useState } from "react"

import heroImage from "../assets/piscicultura-hero.webp"

const WHATSAPP =
  "https://wa.me/5579998485516?text=Olá! Gostaria de conhecer melhor o Piscicultura PRO."

const recursos = [
  {
    icon: Droplets,
    titulo: "Tanques e lotes",
    texto: "Acompanhe povoamento, densidade, volume, mortalidade e situação de cada tanque.",
  },
  {
    icon: Scale,
    titulo: "Biometria e biomassa",
    texto: "Registre pesagens e acompanhe a evolução do peso médio e da biomassa produzida.",
  },
  {
    icon: Gauge,
    titulo: "Previsão de abate",
    texto: "Projete peso, biomassa futura e a data prevista para retirada dos peixes.",
  },
  {
    icon: Wallet,
    titulo: "Custos e resultados",
    texto: "Centralize ração, energia, manutenção e demais custos da produção.",
  },
  {
    icon: LineChart,
    titulo: "Crescimento e RCA",
    texto: "Visualize crescimento diário, conversão alimentar e custo por quilo produzido.",
  },
  {
    icon: ClipboardList,
    titulo: "Relatórios completos",
    texto: "Gere relatórios em PDF e Excel para apoiar decisões e organizar a propriedade.",
  },
]

export default function Landing({
  onAcessar,
}) {
  const [menuAberto, setMenuAberto] =
    useState(false)

  function acessar() {
    setMenuAberto(false)
    onAcessar()
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a
            href="#inicio"
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Fish size={24} strokeWidth={2.4} />
            </span>
            <span className="text-lg font-black">
              Piscicultura <span className="text-teal-600">PRO</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a className="hover:text-teal-700" href="#recursos">Recursos</a>
            <a className="hover:text-teal-700" href="#beneficios">Benefícios</a>
            <a className="hover:text-teal-700" href="#plano">Plano</a>
            <a className="hover:text-teal-700" href="#contato">Contato</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={acessar}
              className="min-h-10 px-4 text-sm font-bold text-slate-700 hover:text-teal-700"
            >
              Acessar
            </button>
            <button
              type="button"
              onClick={acessar}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-bold text-white hover:bg-teal-700"
            >
              Começar grátis
              <ArrowRight size={17} />
            </button>
          </div>

          <button
            type="button"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex h-11 w-11 items-center justify-center text-slate-700 md:hidden"
          >
            {menuAberto ? <X /> : <Menu />}
          </button>
        </div>

        {menuAberto && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <nav className="mx-auto grid max-w-7xl gap-1 text-sm font-semibold">
              <a onClick={() => setMenuAberto(false)} className="p-3" href="#recursos">Recursos</a>
              <a onClick={() => setMenuAberto(false)} className="p-3" href="#beneficios">Benefícios</a>
              <a onClick={() => setMenuAberto(false)} className="p-3" href="#plano">Plano</a>
              <button
                type="button"
                onClick={acessar}
                className="mt-2 min-h-11 rounded-lg bg-teal-600 px-4 font-bold text-white"
              >
                Acessar o sistema
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section
          id="inicio"
          className="relative flex min-h-[620px] items-end overflow-hidden bg-slate-950 sm:min-h-[680px]"
        >
          <img
            src={heroImage}
            alt="Estrutura de piscicultura com tanques de produção"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/68 to-slate-950/12" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

          <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 border-l-4 border-emerald-400 pl-3 text-sm font-bold uppercase text-emerald-300">
                Gestão aquícola completa
              </p>
              <h1 className="max-w-xl text-4xl font-black leading-tight text-white sm:text-6xl">
                Mais controle para produzir peixe com resultado.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                Organize tanques, biometria, alimentação, custos e previsões em um sistema feito para a rotina da piscicultura.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={acessar}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Testar grátis por 30 dias
                  <ArrowRight size={19} />
                </button>
                <a
                  href="#recursos"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 font-bold text-white backdrop-blur hover:bg-white/20"
                >
                  Conhecer recursos
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white">
                <span className="flex items-center gap-2"><Check size={17} className="text-emerald-400" /> Sem cartão</span>
                <span className="flex items-center gap-2"><Check size={17} className="text-emerald-400" /> Acesso pelo celular</span>
                <span className="flex items-center gap-2"><Check size={17} className="text-emerald-400" /> 30 dias gratuitos</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 px-4 py-7 sm:grid-cols-4 sm:px-6">
            {[
              ["14", "áreas de controle"],
              ["PDF e Excel", "relatórios"],
              ["Mobile", "iPhone e Android"],
              ["30 dias", "teste gratuito"],
            ].map(([valor, legenda]) => (
              <div key={legenda} className="px-3 py-3 text-center">
                <p className="text-xl font-black text-teal-700 sm:text-2xl">{valor}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">{legenda}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="recursos" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase text-teal-700">Tudo no mesmo lugar</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Da entrada dos peixes ao resultado da produção.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Informações organizadas para acompanhar o manejo diário, identificar custos e planejar a retirada.
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
              {recursos.map(({ icon: Icon, titulo, texto }) => (
                <article key={titulo} className="bg-white p-6 sm:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{titulo}</h3>
                  <p className="mt-2 leading-6 text-slate-600">{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="beneficios" className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold uppercase text-teal-700">Decisão com dados</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Enxergue a produção antes que o resultado vire surpresa.
              </h2>
              <p className="mt-5 leading-7 text-slate-600">
                O Piscicultura PRO transforma registros do dia a dia em indicadores simples para você comparar, corrigir e planejar.
              </p>
              <div className="mt-8 grid gap-5">
                {[
                  [BarChart3, "Indicadores claros", "Biomassa, RCA, crescimento e preço por quilo produzido."],
                  [ShieldCheck, "Dados organizados", "Histórico centralizado por usuário e por tanque."],
                  [Smartphone, "Acesso em qualquer lugar", "Interface adaptada para computador, iPhone e Android."],
                ].map(([Icon, titulo, texto]) => (
                  <div key={titulo} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Icon size={21} />
                    </span>
                    <div>
                      <h3 className="font-bold">{titulo}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-teal-700 p-7 text-white sm:row-span-2">
                <Fish size={35} />
                <p className="mt-16 text-sm font-semibold text-teal-100">Visão da produção</p>
                <p className="mt-2 text-3xl font-black">Tanque por tanque.</p>
                <p className="mt-4 leading-7 text-teal-50">
                  Dados de povoamento, mortalidade, peso, biomassa e previsão conectados.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-bold text-slate-500">Crescimento</p>
                <p className="mt-3 text-3xl font-black text-emerald-700">g/dia</p>
                <p className="mt-2 text-sm text-slate-600">Calculado pelo histórico real das biometrias.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white">
                <p className="text-sm font-bold text-slate-400">Custo produzido</p>
                <p className="mt-3 text-3xl font-black text-emerald-400">R$/kg</p>
                <p className="mt-2 text-sm text-slate-300">Custos e biomassa reunidos em um indicador.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="plano" className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
              <div>
                <p className="text-sm font-bold uppercase text-emerald-400">Comece sem risco</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-5xl">
                  Use todos os recursos gratuitamente por 30 dias.
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-slate-300">
                  Conheça o sistema com seus próprios dados. Ao final do período, você decide se deseja migrar para o Plano Pro.
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-900 p-7">
                <p className="text-sm font-bold text-emerald-400">Teste gratuito</p>
                <p className="mt-2 text-4xl font-black">30 dias</p>
                <ul className="mt-6 grid gap-3 text-sm text-slate-200">
                  <li className="flex gap-2"><Check size={18} className="text-emerald-400" /> Todos os módulos liberados</li>
                  <li className="flex gap-2"><Check size={18} className="text-emerald-400" /> Versão mobile incluída</li>
                  <li className="flex gap-2"><Check size={18} className="text-emerald-400" /> Sem cartão de crédito</li>
                </ul>
                <button
                  type="button"
                  onClick={acessar}
                  className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Criar minha conta
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="contato" className="border-b border-slate-200 bg-emerald-50 py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">Quer conversar antes de começar?</h2>
              <p className="mt-2 text-slate-600">Fale diretamente com a equipe do Piscicultura PRO.</p>
            </div>
            <a
              href={encodeURI(WHATSAPP)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-emerald-600 px-6 font-bold text-white hover:bg-emerald-700"
            >
              <MessageCircle size={20} />
              Falar pelo WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Fish size={20} className="text-teal-600" />
            Piscicultura PRO
          </div>
          <p>Gestão simples para uma produção mais eficiente.</p>
          <button type="button" onClick={acessar} className="text-left font-bold text-teal-700 sm:text-right">
            Acessar sistema
          </button>
        </div>
      </footer>
    </div>
  )
}
