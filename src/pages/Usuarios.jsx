import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Usuarios({
  user,
}) {
  const [usuarios, setUsuarios] =
    useState([])

  const [nome, setNome] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [senha, setSenha] =
    useState("")

  const [tipoUsuario, setTipoUsuario] =
    useState("cliente")

  const [statusPagamento, setStatusPagamento] =
    useState("ativo")

  const [plano, setPlano] =
    useState("pro")

  const [valorMensal, setValorMensal] =
    useState("")

  const [descontoPercentual, setDescontoPercentual] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function calcularValorFinal(
    valor,
    desconto
  ) {
    const mensal =
      Number(valor || 0)

    const percentual =
      Number(desconto || 0)

    return mensal -
      (
        mensal *
        percentual
      ) / 100
  }

  function adicionarUmMes(data) {
    const resultado = new Date(data)
    const dia = resultado.getDate()

    resultado.setDate(1)
    resultado.setMonth(resultado.getMonth() + 1)

    const ultimoDiaDoMes = new Date(
      resultado.getFullYear(),
      resultado.getMonth() + 1,
      0
    ).getDate()

    resultado.setDate(
      Math.min(dia, ultimoDiaDoMes)
    )

    return resultado
  }

  function dataParaCampo(data) {
    if (!data) return ""

    const valor = new Date(data)
    const ano = valor.getFullYear()
    const mes = String(
      valor.getMonth() + 1
    ).padStart(2, "0")
    const dia = String(
      valor.getDate()
    ).padStart(2, "0")

    return `${ano}-${mes}-${dia}`
  }

  function formatarData(data) {
    if (!data) return "-"

    return new Date(data).toLocaleDateString(
      "pt-BR"
    )
  }

  async function carregarUsuarios() {
    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      )

    if (error) {
      console.log(error)
      return
    }

    setUsuarios(data || [])
  }

  async function cadastrarUsuario(e) {
    e.preventDefault()
    setLoading(true)

    const ativacaoPro =
      plano === "pro"
        ? new Date()
        : null

    const vencimentoPro =
      ativacaoPro
        ? dataParaCampo(
            adicionarUmMes(
              ativacaoPro
            )
          )
        : null

    const {
      data,
      error,
    } = await supabase.functions.invoke(
      "create-user",
      {
        body: {
          nome,
          email,
          senha,
          tipo_usuario:
            tipoUsuario,
          status_pagamento:
            statusPagamento,
          plano,
          valor_mensal:
            Number(valorMensal || 0),
          desconto_percentual:
            Number(descontoPercentual || 0),
          data_vencimento:
            vencimentoPro,
          data_ativacao_pro:
            ativacaoPro?.toISOString() || null,
        },
      }
    )

    setLoading(false)

    if (error) {
      alert(
        error.message ||
        "Erro ao criar usuário. Confira se a Edge Function foi implantada."
      )
      return
    }

    if (data?.error) {
      alert(data.error)
      return
    }

    setNome("")
    setEmail("")
    setSenha("")
    setTipoUsuario("cliente")
    setStatusPagamento("ativo")
    setPlano("pro")
    setValorMensal("")
    setDescontoPercentual("")
    await carregarUsuarios()
    alert("Usuário cadastrado!")
  }

  async function atualizarPerfil(
    id,
    campos
  ) {
    const {
      error,
    } = await supabase
      .from("profiles")
      .update(campos)
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    carregarUsuarios()
  }

  async function atualizarPlano(
    item,
    novoPlano
  ) {
    const campos = {
      plano: novoPlano,
    }

    if (novoPlano === "pro") {
      const ativacao =
        item.plano === "pro" &&
        item.data_ativacao_pro
          ? new Date(item.data_ativacao_pro)
          : new Date()

      campos.data_ativacao_pro =
        ativacao.toISOString()
      campos.data_vencimento =
        dataParaCampo(
          adicionarUmMes(ativacao)
        )
      campos.status_pagamento = "ativo"
    } else {
      campos.data_ativacao_pro = null
      campos.data_vencimento = null
    }

    await atualizarPerfil(
      item.id,
      campos
    )
  }

  useEffect(() => {
    if (user) carregarUsuarios()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Usuários
        </h1>
        <p className="text-gray-500 mt-1">
          Cadastro e controle de acesso dos clientes e parceiros
        </p>
      </div>

      <form
        onSubmit={cadastrarUsuario}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="font-bold">
            Nome
          </label>
          <input
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="font-bold">
            Tipo
          </label>
          <select
            value={tipoUsuario}
            onChange={(e) =>
              setTipoUsuario(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="cliente">
              Cliente pagante
            </option>
            <option value="parceiro">
              Parceiro gratuito
            </option>
            <option value="root">
              Root
            </option>
          </select>
        </div>

        <div>
          <label className="font-bold">
            Pagamento
          </label>
          <select
            value={statusPagamento}
            onChange={(e) =>
              setStatusPagamento(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="ativo">
              Ativo
            </option>
            <option value="vencido">
              Vencido
            </option>
            <option value="isento">
              Isento
            </option>
          </select>
        </div>

        <div>
          <label className="font-bold">
            Plano
          </label>
          <select
            value={plano}
            onChange={(e) =>
              setPlano(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="teste">
              Teste gratuito
            </option>
            <option value="pro">
              Plano Pro
            </option>
            <option value="isento">
              Isento
            </option>
          </select>
        </div>

        <div>
          <label className="font-bold">
            Valor mensal
          </label>
          <input
            type="number"
            step="0.01"
            value={valorMensal}
            onChange={(e) =>
              setValorMensal(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Ex: 99.90"
          />
        </div>

        <div>
          <label className="font-bold">
            Desconto (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={descontoPercentual}
            onChange={(e) =>
              setDescontoPercentual(e.target.value)
            }
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Ex: 10"
          />
        </div>

        <div>
          <label className="font-bold">
            Vencimento do Plano Pro
          </label>
          <input
            type="date"
            value={
              plano === "pro"
                ? dataParaCampo(
                    adicionarUmMes(
                      new Date()
                    )
                  )
                : ""
            }
            readOnly
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100"
          />
          <p className="mt-1 text-sm text-slate-500">
            Calculado para o mesmo dia do mês seguinte à ativação.
          </p>
        </div>

        <div>
          <label className="font-bold">
            Valor final
          </label>
          <input
            readOnly
            value={`R$ ${moeda(
              calcularValorFinal(
                valorMensal,
                descontoPercentual
              )
            )}`}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-green-700"
          />
        </div>

        <div className="flex items-end">
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl"
          >
            {loading
              ? "Cadastrando..."
              : "Cadastrar usuário"}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-2xl shadow overflow-auto">
        <h2 className="text-2xl font-bold mb-4">
          Usuários cadastrados
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">E-mail</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Plano</th>
              <th className="p-3 text-left">Pagamento</th>
              <th className="p-3 text-left">Mensalidade</th>
              <th className="p-3 text-left">Desconto</th>
              <th className="p-3 text-left">Valor final</th>
              <th className="p-3 text-left">Cadastro</th>
              <th className="p-3 text-left">Ativação Pro</th>
              <th className="p-3 text-left">Vencimento</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-3 font-bold">
                  {item.nome || "-"}
                </td>
                <td className="p-3">
                  {item.email}
                </td>
                <td className="p-3">
                  <select
                    value={item.tipo_usuario}
                    onChange={(e) =>
                      atualizarPerfil(
                        item.id,
                        {
                          tipo_usuario:
                            e.target.value,
                        }
                      )
                    }
                    className="border p-2 rounded-lg"
                  >
                    <option value="cliente">cliente</option>
                    <option value="parceiro">parceiro</option>
                    <option value="root">root</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      atualizarPerfil(
                        item.id,
                        {
                          status:
                            e.target.value,
                        }
                      )
                    }
                    className="border p-2 rounded-lg"
                  >
                    <option value="ativo">ativo</option>
                    <option value="bloqueado">bloqueado</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={
                      item.plano ||
                      (
                        item.tipo_usuario === "root" ||
                        item.tipo_usuario === "parceiro" ||
                        item.status_pagamento === "isento"
                          ? "isento"
                          : "pro"
                      )
                    }
                    onChange={(e) =>
                      atualizarPlano(
                        item,
                        e.target.value
                      )
                    }
                    className="border p-2 rounded-lg"
                  >
                    <option value="teste">teste</option>
                    <option value="pro">Pro</option>
                    <option value="isento">isento</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={item.status_pagamento}
                    onChange={(e) =>
                      atualizarPerfil(
                        item.id,
                        {
                          status_pagamento:
                            e.target.value,
                        }
                      )
                    }
                    className="border p-2 rounded-lg"
                  >
                    <option value="ativo">ativo</option>
                    <option value="vencido">vencido</option>
                    <option value="isento">isento</option>
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="0.01"
                    value={item.valor_mensal || ""}
                    onChange={(e) =>
                      atualizarPerfil(
                        item.id,
                        {
                          valor_mensal:
                            Number(e.target.value || 0),
                        }
                      )
                    }
                    className="w-28 border p-2 rounded-lg"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    step="0.01"
                    value={item.desconto_percentual || ""}
                    onChange={(e) =>
                      atualizarPerfil(
                        item.id,
                        {
                          desconto_percentual:
                            Number(e.target.value || 0),
                        }
                      )
                    }
                    className="w-24 border p-2 rounded-lg"
                  />
                </td>
                <td className="p-3 font-bold text-green-700">
                  R$ {moeda(
                    item.valor_final ||
                    calcularValorFinal(
                      item.valor_mensal,
                      item.desconto_percentual
                    )
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {formatarData(
                    item.created_at
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {formatarData(
                    item.data_ativacao_pro
                  )}
                </td>
                <td className="p-3">
                  <input
                    type="date"
                    value={item.data_vencimento || ""}
                    onChange={(e) =>
                      atualizarPerfil(
                        item.id,
                        {
                          data_vencimento:
                            e.target.value || null,
                        }
                      )
                    }
                    className="border p-2 rounded-lg"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
