import { useEffect, useState } from "react"
import {
  Crown,
  MessageCircle,
  XCircle,
} from "lucide-react"

import { supabase } from "./lib/supabase"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

const DIAS_TESTE = 30
const WHATSAPP_PRO =
  "https://wa.me/5579998485516?text=Olá! Meu período de teste do Piscicultura PRO terminou e desejo ativar o Plano Pro."

function adicionarDias(data, dias) {
  const resultado = new Date(data)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}

function criarDataLocal(valor) {
  if (!valor) return null

  if (
    typeof valor === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    const [
      ano,
      mes,
      dia,
    ] = valor.split("-").map(Number)

    return new Date(
      ano,
      mes - 1,
      dia
    )
  }

  return new Date(valor)
}

function planoAtual(perfil, usuario) {
  if (
    perfil?.tipo_usuario === "root" ||
    perfil?.tipo_usuario === "parceiro" ||
    perfil?.status_pagamento === "isento"
  ) {
    return "isento"
  }

  if (perfil?.plano) {
    return perfil.plano
  }

  if (usuario?.user_metadata?.plano === "teste") {
    return "teste"
  }

  return "pro"
}

function terminoDoTeste(perfil, usuario) {
  if (perfil?.teste_termina_em) {
    return new Date(perfil.teste_termina_em)
  }

  const inicio =
    perfil?.teste_inicia_em ||
    usuario?.created_at ||
    new Date()

  return adicionarDias(inicio, DIAS_TESTE)
}

export default function App() {
  const [user, setUser] =
    useState(null)

  const [perfil, setPerfil] =
    useState(null)

  const [bloqueio, setBloqueio] =
    useState("")

  const [testeExpirado, setTesteExpirado] =
    useState(false)

  const [telaEncerrada, setTelaEncerrada] =
    useState(false)

  const [modoRedefinirSenha, setModoRedefinirSenha] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  function linkRedefinicaoSenha() {
    const params =
      new URLSearchParams(window.location.search)

    const hashParams =
      new URLSearchParams(
        window.location.hash.replace("#", "")
      )

    return (
      params.get("reset") === "senha" ||
      params.get("type") === "recovery" ||
      hashParams.get("type") === "recovery"
    )
  }

  async function carregarPerfil(
    usuario
  ) {
    if (!usuario) {
      setPerfil(null)
      setBloqueio("")
      setTesteExpirado(false)
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
      setTesteExpirado(false)
      return
    }

    let perfilAtual = data

    if (!perfilAtual) {
      const inicioTeste =
        new Date(
          usuario.created_at ||
          new Date()
        )

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
        plano:
          "teste",
        teste_inicia_em:
          inicioTeste.toISOString(),
        teste_termina_em:
          adicionarDias(
            inicioTeste,
            DIAS_TESTE
          ).toISOString(),
        data_ativacao_pro:
          null,
        valor_mensal:
          0,
        desconto_percentual:
          0,
        valor_final:
          0,
        data_vencimento:
          null,
      }

      let respostaCriacao =
        await supabase
          .from("profiles")
          .insert([
            novoPerfil,
          ])
          .select()
          .single()

      if (
        respostaCriacao.error?.message?.includes(
          "data_ativacao_pro"
        )
      ) {
        const {
          data_ativacao_pro,
          ...perfilSemAtivacao
        } = novoPerfil

        respostaCriacao =
          await supabase
            .from("profiles")
            .insert([
              perfilSemAtivacao,
            ])
            .select()
            .single()
      }

      if (
        respostaCriacao.error &&
        (
          respostaCriacao.error.message?.includes("plano") ||
          respostaCriacao.error.message?.includes("teste_inicia_em") ||
          respostaCriacao.error.message?.includes("teste_termina_em")
        )
      ) {
        const {
          plano,
          teste_inicia_em,
          teste_termina_em,
          data_ativacao_pro,
          ...perfilCompatibilidade
        } = novoPerfil

        respostaCriacao =
          await supabase
            .from("profiles")
            .insert([
              perfilCompatibilidade,
            ])
            .select()
            .single()
      }

      if (respostaCriacao.error) {
        console.log(respostaCriacao.error)
        setPerfil(null)
        setBloqueio("")
        setTesteExpirado(false)
        return
      }

      perfilAtual =
        respostaCriacao.data
    }

    setPerfil(perfilAtual)
    setTesteExpirado(false)

    const hoje =
      new Date()

    const vencimento =
      perfilAtual.data_vencimento
        ? criarDataLocal(
            perfilAtual.data_vencimento
          )
        : null

    if (vencimento) {
      vencimento.setHours(0, 0, 0, 0)
    }

    const hojePagamento =
      new Date(hoje)

    hojePagamento.setHours(0, 0, 0, 0)

    const diasAtraso =
      vencimento
        ? Math.floor(
            (
              hojePagamento -
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

    if (perfilAtual.status === "bloqueado") {
      setBloqueio(
        "Usuário bloqueado. Entre em contato com o suporte."
      )
      return
    }

    const plano =
      planoAtual(
        perfilAtual,
        usuario
      )

    if (
      plano === "teste" &&
      hoje >=
        terminoDoTeste(
          perfilAtual,
          usuario
        )
    ) {
      setBloqueio("")
      setTesteExpirado(true)
      return
    }

    if (
      plano === "pro" &&
      perfilAtual.tipo_usuario !== "root" &&
      perfilAtual.status_pagamento !== "isento" &&
      (
        (
          perfilAtual.status_pagamento === "vencido" &&
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
    setTesteExpirado(false)
  }

  useEffect(() => {
    async function carregarSessao() {
      setModoRedefinirSenha(
        linkRedefinicaoSenha()
      )

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
      (event, session) => {
        const usuario =
          session?.user || null

        setUser(usuario)

        if (
          event === "PASSWORD_RECOVERY" ||
          linkRedefinicaoSenha()
        ) {
          setModoRedefinirSenha(true)
          setBloqueio("")
          return
        }

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
    setTesteExpirado(false)
  }

  function ativarPlanoPro() {
    window.location.href =
      encodeURI(WHATSAPP_PRO)
  }

  async function recusarPlanoPro() {
    await supabase.auth.signOut()

    setUser(null)
    setPerfil(null)
    setBloqueio("")
    setTesteExpirado(false)
    setTelaEncerrada(true)

    window.setTimeout(() => {
      window.close()
    }, 300)
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

  if (telaEncerrada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <XCircle
            className="mx-auto text-slate-400"
            size={48}
          />

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Que pena!
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Quem sabe em outra oportunidade. Desejamos sucesso!
          </p>

          <button
            type="button"
            onClick={() => setTelaEncerrada(false)}
            className="mt-6 min-h-11 w-full rounded-lg bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-700"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Login
        onLogin={setUser}
        modoRedefinirSenha={modoRedefinirSenha}
        onSenhaRedefinida={() => setModoRedefinirSenha(false)}
      />
    )
  }

  if (
    testeExpirado &&
    !modoRedefinirSenha
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Crown
              size={30}
              strokeWidth={2.3}
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Seu período de teste terminou
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Os 30 dias gratuitos do Piscicultura PRO foram concluídos. Deseja ativar o Plano Pro para continuar utilizando o sistema?
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={ativarPlanoPro}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700"
            >
              <MessageCircle size={19} />
              Sim, ativar Pro
            </button>

            <button
              type="button"
              onClick={recusarPlanoPro}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              Não, obrigado
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (modoRedefinirSenha) {
    return (
      <Login
        onLogin={setUser}
        modoRedefinirSenha={modoRedefinirSenha}
        onSenhaRedefinida={() => setModoRedefinirSenha(false)}
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
