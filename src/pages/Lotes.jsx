import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Lotes({
  user,
}) {

  const [dados, setDados] =
    useState([])

  const [tanques, setTanques] =
    useState([])

  const [editandoId, setEditandoId] =
    useState(null)

  const [form, setForm] = useState({
    tanque: "",
    nome_lote: "",
    fornecedor: "",
    quantidade_inicial: "",
    peso_inicial: "",
    data_povoamento: "",
  })

  // 🔥 CARREGAR TANQUES
  async function carregarTanques() {

    const { data, error } =
      await supabase
        .from("tanques")
        .select("*")
        .eq("user_id", user.id)

    if (!error) {
      setTanques(data)
    }
  }

  // 🔥 CARREGAR LOTES
  async function carregarDados() {

    const { data, error } =
      await supabase
        .from("lotes")
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
      carregarTanques()
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
          .from("lotes")
          .update({
            tanque: form.tanque,
            nome_lote:
              form.nome_lote,
            fornecedor:
              form.fornecedor,
            quantidade_inicial:
              Number(
                form.quantidade_inicial
              ),
            peso_inicial:
              Number(
                form.peso_inicial
              ),
            data_povoamento:
              form.data_povoamento,
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
          .from("lotes")
          .insert([
            {
              user_id: user.id,
              tanque: form.tanque,
              nome_lote:
                form.nome_lote,
              fornecedor:
                form.fornecedor,
              quantidade_inicial:
                Number(
                  form.quantidade_inicial
                ),
              peso_inicial:
                Number(
                  form.peso_inicial
                ),
              data_povoamento:
                form.data_povoamento,
            },
          ])

      if (error) {
        alert(error.message)
        return
      }
    }

    // 🔥 LIMPAR
    setForm({
      tanque: "",
      nome_lote: "",
      fornecedor: "",
      quantidade_inicial: "",
      peso_inicial: "",
      data_povoamento: "",
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
        .from("lotes")
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
      tanque: item.tanque,
      nome_lote:
        item.nome_lote,
      fornecedor:
        item.fornecedor,
      quantidade_inicial:
        item.quantidade_inicial,
      peso_inicial:
        item.peso_inicial,
      data_povoamento:
        item.data_povoamento,
    })
  }

  return (

    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        🐟 Lotes
      </h1>

      {/* FORM */}
      <form
        onSubmit={salvar}
        className="bg-slate-100 p-6 rounded-2xl space-y-4"
      >

        {/* TANQUE */}
        <select
          className="w-full border p-3 rounded-xl"
          value={form.tanque}
          onChange={(e) =>
            setForm({
              ...form,
              tanque:
                e.target.value,
            })
          }
        >

          <option value="">
            Selecione o tanque
          </option>

          {tanques.map((tanque) => (

            <option
              key={tanque.id}
              value={tanque.nome}
            >
              {tanque.nome}
            </option>

          ))}

        </select>

        {/* LOTE */}
        <input
          type="text"
          placeholder="Nome do Lote"
          className="w-full border p-3 rounded-xl"
          value={form.nome_lote}
          onChange={(e) =>
            setForm({
              ...form,
              nome_lote:
                e.target.value,
            })
          }
        />

        {/* FORNECEDOR */}
        <input
          type="text"
          placeholder="Fornecedor"
          className="w-full border p-3 rounded-xl"
          value={form.fornecedor}
          onChange={(e) =>
            setForm({
              ...form,
              fornecedor:
                e.target.value,
            })
          }
        />

        {/* QUANTIDADE */}
        <input
          type="number"
          placeholder="Quantidade Inicial"
          className="w-full border p-3 rounded-xl"
          value={
            form.quantidade_inicial
          }
          onChange={(e) =>
            setForm({
              ...form,
              quantidade_inicial:
                e.target.value,
            })
          }
        />

        {/* PESO */}
        <input
          type="number"
          placeholder="Peso Inicial (g)"
          className="w-full border p-3 rounded-xl"
          value={form.peso_inicial}
          onChange={(e) =>
            setForm({
              ...form,
              peso_inicial:
                e.target.value,
            })
          }
        />

        {/* DATA */}
        <input
          type="date"
          className="w-full border p-3 rounded-xl"
          value={
            form.data_povoamento
          }
          onChange={(e) =>
            setForm({
              ...form,
              data_povoamento:
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
                  {item.nome_lote}
                </h2>

                <p className="text-gray-500">
                  Tanque:
                  {" "}
                  {item.tanque}
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
            <div className="grid grid-cols-4 gap-3 mt-4">

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Quantidade
                </p>

                <h3 className="font-bold">
                  {item.quantidade_inicial}
                </h3>

              </div>

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Peso Inicial
                </p>

                <h3 className="font-bold">
                  {item.peso_inicial} g
                </h3>

              </div>

              <div className="bg-blue-100 p-3 rounded-xl">

                <p className="text-sm text-blue-700">
                  Fornecedor
                </p>

                <h3 className="font-bold text-blue-700">
                  {item.fornecedor}
                </h3>

              </div>

              <div className="bg-green-100 p-3 rounded-xl">

                <p className="text-sm text-green-700">
                  Povoamento
                </p>

                <h3 className="font-bold text-green-700">
                  {item.data_povoamento}
                </h3>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}