import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function EstoqueRacao({
  user,
}) {

  const [dados, setDados] =
    useState([])

  const [editandoId, setEditandoId] =
    useState(null)

  const [form, setForm] = useState({
    tipo_racao: "",
    quantidade: "",
    movimentacao: "Entrada",
    data_movimentacao: "",
  })

  // 🔥 CARREGAR
  async function carregarDados() {

    const { data, error } =
      await supabase
        .from("estoque_racao")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })

    if (!error) {
      setDados(data)
    }
  }

  useEffect(() => {

    if (user) {
      carregarDados()
    }

  }, [user])

  // 🔥 SALVAR
  async function salvar(e) {

    e.preventDefault()

    // 🔥 EDITAR
    if (editandoId) {

      const { error } =
        await supabase
          .from("estoque_racao")
          .update({
            tipo_racao:
              form.tipo_racao,
            quantidade:
              Number(form.quantidade),
            movimentacao:
              form.movimentacao,
            data_movimentacao:
              form.data_movimentacao,
          })
          .eq("id", editandoId)

      if (error) {
        alert(error.message)
        return
      }

      setEditandoId(null)
    }

    // 🔥 NOVO
    else {

      const { error } =
        await supabase
          .from("estoque_racao")
          .insert([
            {
              user_id: user.id,
              tipo_racao:
                form.tipo_racao,
              quantidade:
                Number(form.quantidade),
              movimentacao:
                form.movimentacao,
              data_movimentacao:
                form.data_movimentacao,
            },
          ])

      if (error) {
        alert(error.message)
        return
      }
    }

    // 🔥 LIMPAR
    setForm({
      tipo_racao: "",
      quantidade: "",
      movimentacao:
        "Entrada",
      data_movimentacao: "",
    })

    carregarDados()
  }

  // 🔥 EXCLUIR
  async function excluir(id) {

    const confirmar =
      confirm(
        "Deseja excluir?"
      )

    if (!confirmar) return

    const { error } =
      await supabase
        .from("estoque_racao")
        .delete()
        .eq("id", id)

    if (!error) {
      carregarDados()
    }
  }

  // 🔥 EDITAR
  function editar(item) {

    setEditandoId(item.id)

    setForm({
      tipo_racao:
        item.tipo_racao,
      quantidade:
        item.quantidade,
      movimentacao:
        item.movimentacao,
      data_movimentacao:
        item.data_movimentacao,
    })
  }

  // 🔥 CALCULAR SALDO
  const saldo =
    dados.reduce(
      (acc, item) => {

        if (
          item.movimentacao ===
          "Entrada"
        ) {
          return (
            acc +
            Number(
              item.quantidade
            )
          )
        }

        return (
          acc -
          Number(item.quantidade)
        )

      },
      0
    )

  return (

    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        🥫 Estoque de Ração
      </h1>

      {/* SALDO */}
      <div className="bg-green-100 p-6 rounded-2xl shadow">

        <p className="text-green-700">
          Saldo Atual
        </p>

        <h2 className="text-4xl font-bold text-green-700">
          {saldo.toFixed(2)} kg
        </h2>

      </div>

      {/* FORM */}
      <form
        onSubmit={salvar}
        className="bg-slate-100 p-6 rounded-2xl space-y-4"
      >

        {/* TIPO */}
        <input
          type="text"
          placeholder="Tipo de Ração"
          className="w-full border p-3 rounded-xl"
          value={form.tipo_racao}
          onChange={(e) =>
            setForm({
              ...form,
              tipo_racao:
                e.target.value,
            })
          }
        />

        {/* QUANTIDADE */}
        <input
          type="number"
          placeholder="Quantidade (kg)"
          className="w-full border p-3 rounded-xl"
          value={form.quantidade}
          onChange={(e) =>
            setForm({
              ...form,
              quantidade:
                e.target.value,
            })
          }
        />

        {/* MOVIMENTAÇÃO */}
        <select
          className="w-full border p-3 rounded-xl"
          value={form.movimentacao}
          onChange={(e) =>
            setForm({
              ...form,
              movimentacao:
                e.target.value,
            })
          }
        >

          <option>
            Entrada
          </option>

          <option>
            Saída
          </option>

        </select>

        {/* DATA */}
        <input
          type="date"
          className="w-full border p-3 rounded-xl"
          value={
            form.data_movimentacao
          }
          onChange={(e) =>
            setForm({
              ...form,
              data_movimentacao:
                e.target.value,
            })
          }
        />

        {/* BOTÃO */}
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
        >

          {editandoId
            ? "Atualizar"
            : "Salvar"}

        </button>

      </form>

      {/* LISTA */}
      <div className="space-y-4">

        {dados.map((item) => (

          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {item.tipo_racao}
                </h2>

                <p className="text-gray-500">
                  {
                    item.data_movimentacao
                  }
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    editar(item)
                  }
                  className="bg-yellow-400 px-4 py-2 rounded-xl font-bold"
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    excluir(item.id)
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                >
                  Excluir
                </button>

              </div>

            </div>

            {/* CARDS */}
            <div className="grid grid-cols-3 gap-3 mt-4">

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Quantidade
                </p>

                <h3 className="font-bold">
                  {item.quantidade} kg
                </h3>

              </div>

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Movimentação
                </p>

                <h3 className="font-bold">
                  {item.movimentacao}
                </h3>

              </div>

              <div className="bg-blue-100 p-3 rounded-xl">

                <p className="text-sm text-blue-700">
                  Tipo
                </p>

                <h3 className="font-bold text-blue-700">
                  {item.tipo_racao}
                </h3>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}