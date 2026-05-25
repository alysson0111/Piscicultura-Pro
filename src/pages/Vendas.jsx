import {
  useEffect,
  useState,
} from "react"

import { supabase }
from "../lib/supabase"

export default function Vendas({
  user,
}) {

  // STATES
  const [tanque, setTanque] =
    useState("")

  const [cliente, setCliente] =
    useState("")

  const [peso, setPeso] =
    useState("")

  const [valorKg, setValorKg] =
    useState("")

  const [dataVenda, setDataVenda] =
    useState("")

  const [dados, setDados] =
    useState([])

  const [tanques, setTanques] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [editando, setEditando] =
    useState(null)

  // 🔥 TOTAL
  const totalVenda =
    (
      Number(peso || 0) *
      Number(valorKg || 0)
    )

  // 🔥 FORMATAR
  function moeda(valor) {

    return Number(
      valor || 0
    ).toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )
  }

  // 🔥 CARREGAR
  async function carregarDados() {

    try {

      // VENDAS
      const {
        data,
        error,
      } = await supabase
        .from("vendas")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )

      if (!error) {
        setDados(data || [])
      }

      // TANQUES
      const {
        data: dadosTanques,
      } = await supabase
        .from("tanques")
        .select("nome")
        .eq(
          "user_id",
          user.id
        )

      setTanques(
        dadosTanques || []
      )

    } catch (erro) {

      console.log(erro)

    }
  }

  // 🔥 SALVAR
  async function salvarVenda(
    e
  ) {

    e.preventDefault()

    try {

      setLoading(true)

      const payload = {

        user_id:
          user.id,

        tanque,

        cliente,

        peso:
          Number(peso),

        valor_kg:
          Number(valorKg),

        valor_total:
          Number(totalVenda),

        data_venda:
          dataVenda,

      }

      // 🔥 EDITAR
      if (editando) {

        const {
          error,
        } = await supabase
          .from("vendas")
          .update(payload)
          .eq(
            "id",
            editando
          )

        if (error) {

          alert(
            error.message
          )

          return
        }

        alert(
          "Venda atualizada!"
        )

      }

      // 🔥 NOVO
      else {

        const {
          error,
        } = await supabase
          .from("vendas")
          .insert([payload])

        if (error) {

          alert(
            error.message
          )

          return
        }

        alert(
          "Venda salva!"
        )

      }

      limparFormulario()

      carregarDados()

    } catch (erro) {

      console.log(erro)

    } finally {

      setLoading(false)

    }
  }

  // 🔥 EDITAR
  function editarVenda(
    item
  ) {

    setEditando(item.id)

    setTanque(item.tanque)

    setCliente(item.cliente)

    setPeso(item.peso)

    setValorKg(
      item.valor_kg
    )

    setDataVenda(
      item.data_venda
    )

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // 🔥 LIMPAR
  function limparFormulario() {

    setEditando(null)

    setTanque("")

    setCliente("")

    setPeso("")

    setValorKg("")

    setDataVenda("")
  }

  // 🔥 EXCLUIR
  async function excluir(
    id
  ) {

    const confirmar =
      confirm(
        "Excluir venda?"
      )

    if (!confirmar)
      return

    try {

      const {
        error,
      } = await supabase
        .from("vendas")
        .delete()
        .eq("id", id)

      if (!error) {

        carregarDados()

      }

    } catch (erro) {

      console.log(erro)

    }
  }

  useEffect(() => {

    if (user) {

      carregarDados()

    }

  }, [user])

  return (

    <div className="space-y-6">

      {/* TOPO */}
      <div>

        <h1 className="text-3xl font-bold">
          💰 Vendas
        </h1>

        <p className="text-gray-500 mt-1">
          Controle de vendas da piscicultura
        </p>

      </div>

      {/* FORM */}
      <form
        onSubmit={salvarVenda}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >

        {/* TANQUE */}
        <div>

          <label className="font-bold">
            Tanque
          </label>

          <select
            value={tanque}
            onChange={(e) =>
              setTanque(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          >

            <option value="">
              Selecione
            </option>

            {tanques.map(
              (item, index) => (

                <option
                  key={index}
                  value={item.nome}
                >
                  {item.nome}
                </option>

              )
            )}

          </select>

        </div>

        {/* CLIENTE */}
        <div>

          <label className="font-bold">
            Cliente
          </label>

          <input
            type="text"
            value={cliente}
            onChange={(e) =>
              setCliente(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        {/* PESO */}
        <div>

          <label className="font-bold">
            Peso Total (kg)
          </label>

          <input
            type="number"
            step="0.01"
            value={peso}
            onChange={(e) =>
              setPeso(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        {/* VALOR KG */}
        <div>

          <label className="font-bold">
            Valor por Kg
          </label>

          <input
            type="number"
            step="0.01"
            value={valorKg}
            onChange={(e) =>
              setValorKg(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        {/* DATA */}
        <div>

          <label className="font-bold">
            Data da Venda
          </label>

          <input
            type="date"
            value={dataVenda}
            onChange={(e) =>
              setDataVenda(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        {/* TOTAL */}
        <div>

          <label className="font-bold">
            Valor Total
          </label>

          <input
            type="text"
            value={`R$ ${moeda(
              totalVenda
            )}`}
            readOnly
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-green-700"
          />

        </div>

        {/* BOTÕES */}
        <div className="flex items-end gap-2">

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl"
          >

            {loading
              ? "Salvando..."
              : editando
              ? "Atualizar"
              : "Salvar"}

          </button>

          {editando && (

            <button
              type="button"
              onClick={
                limparFormulario
              }
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold p-3 rounded-xl"
            >
              Cancelar
            </button>

          )}

        </div>

      </form>

      {/* TABELA */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-auto">

        <h2 className="text-2xl font-bold mb-4">
          📋 Histórico de Vendas
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b bg-slate-100">

              <th className="p-3 text-left">
                Tanque
              </th>

              <th className="p-3 text-left">
                Cliente
              </th>

              <th className="p-3 text-left">
                Peso
              </th>

              <th className="p-3 text-left">
                Valor/Kg
              </th>

              <th className="p-3 text-left">
                Total
              </th>

              <th className="p-3 text-left">
                Data
              </th>

              <th className="p-3 text-left">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {dados.map((item) => (

              <tr
                key={item.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-3">
                  {item.tanque}
                </td>

                <td className="p-3">
                  {item.cliente}
                </td>

                <td className="p-3">
                  {Number(
                    item.peso || 0
                  ).toFixed(2)} kg
                </td>

                <td className="p-3">
                  R$ {moeda(
                    item.valor_kg
                  )}
                </td>

                <td className="p-3 font-bold text-green-700">
                  R$ {moeda(
                    item.valor_total
                  )}
                </td>

                <td className="p-3">
                  {item.data_venda}
                </td>

                <td className="p-3">

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        editarVenda(
                          item
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        excluir(
                          item.id
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                    >
                      Excluir
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}