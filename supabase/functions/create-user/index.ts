import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }

  try {
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL") ?? ""

    const anonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""

    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    const authHeader =
      req.headers.get("Authorization") ?? ""

    const userClient = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey
    )

    const {
      data: authUser,
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !authUser.user) {
      return json(
        {
          error: "Usuário não autenticado.",
        },
        401
      )
    }

    const {
      data: perfilRoot,
    } = await adminClient
      .from("profiles")
      .select("tipo_usuario,status")
      .eq("user_id", authUser.user.id)
      .maybeSingle()

    if (
      perfilRoot?.tipo_usuario !== "root" ||
      perfilRoot?.status !== "ativo"
    ) {
      return json(
        {
          error: "Apenas usuários root podem cadastrar novos usuários.",
        },
        403
      )
    }

    const body =
      await req.json()

    const nome =
      String(body.nome || "").trim()

    const email =
      String(body.email || "").trim().toLowerCase()

    const senha =
      String(body.senha || "")

    const tipoUsuario =
      body.tipo_usuario || "cliente"

    const statusPagamento =
      body.status_pagamento || "ativo"

    const plano =
      body.plano ||
      (
        tipoUsuario === "cliente"
          ? "pro"
          : "isento"
      )

    const inicioTeste =
      plano === "teste"
        ? new Date()
        : null

    const terminoTeste =
      inicioTeste
        ? new Date(
            inicioTeste.getTime() +
            30 * 24 * 60 * 60 * 1000
          )
        : null

    const valorMensal =
      Number(body.valor_mensal || 0)

    const descontoPercentual =
      Number(body.desconto_percentual || 0)

    const valorFinal =
      valorMensal -
      (
        valorMensal *
        descontoPercentual
      ) / 100

    const dataVencimento =
      body.data_vencimento || null

    if (!email || senha.length < 6) {
      return json(
        {
          error: "Informe e-mail e senha com pelo menos 6 caracteres.",
        },
        400
      )
    }

    const {
      data: novoUsuario,
      error: erroCriar,
    } = await adminClient.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        name: nome,
        plano,
        teste_inicia_em:
          inicioTeste?.toISOString() || null,
      },
    })

    if (erroCriar) {
      return json(
        {
          error: erroCriar.message,
        },
        400
      )
    }

    const {
      error: erroPerfil,
    } = await adminClient
      .from("profiles")
      .upsert({
        user_id: novoUsuario.user.id,
        nome,
        email,
        tipo_usuario: tipoUsuario,
        status: "ativo",
        status_pagamento: statusPagamento,
        plano,
        teste_inicia_em:
          inicioTeste?.toISOString() || null,
        teste_termina_em:
          terminoTeste?.toISOString() || null,
        valor_mensal: valorMensal,
        desconto_percentual: descontoPercentual,
        valor_final: valorFinal,
        data_vencimento: dataVencimento,
      }, {
        onConflict: "user_id",
      })

    if (erroPerfil) {
      return json(
        {
          error: erroPerfil.message,
        },
        400
      )
    }

    return json({
      ok: true,
      user_id: novoUsuario.user.id,
    })
  } catch (error) {
    return json(
      {
        error: error.message,
      },
      500
    )
  }
})

function json(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  )
}
