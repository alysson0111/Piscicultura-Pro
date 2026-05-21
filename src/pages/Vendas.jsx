import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Vendas({ user }) {

  const [vendas, setVendas] = useState([])
  const [tanques, setTanques] = useState([])

  const [editandoId, setEditandoId] =
    useState(null)

  const [form, setForm] = useState({
    tanque: "",
    cliente: "",
    quantidade_kg: "",
    valor_kg: "",
    data_venda: "",
  })

  // 🔥 CARREGAR TANQUES
  async function carregarTanques() {

    const { data, error } = await supabase
      .from("tanques")
      .select("*")
      .eq("user_id", user.id)

    if (!error) {
      setTanques(data)
    }
  }

  // 🔥 CARREGAR VENDAS
  async function carregarVendas() {

    const { data, error } = await supabase
      .from("vendas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })

    if (!error) {
      setVendas(data)
    }
  }

  useEffect(() => {
    if (user) {
      carregarTanques()
      carregarVendas()
    }
  }, [user])

  // 🔥 SALVAR
  async function salvarVenda(e) {
    e.preventDefault()

    const total =
      Number(form.quantidade_kg) *
      Number(form.valor_kg)

    // EDITAR
    if (editandoId) {

      const { error } = await supabase
        .from("vendas")
        .update({
          tanque: form.tanque,
          cliente: form.cliente,
          quantidade_kg: Number(
            form.quantidade_kg
          ),
          valor_kg: Number(
            form.valor_kg
          ),
          total,
          data_venda:
            form.data_venda,
        })
        .eq("id", editandoId)

      if (error) {
        console.log(error)
        alert(error.message)
        return
      }

      setEditandoId(null)
    }

    // NOVO
    else {

      const { error } = await supabase
        .from("vendas")
        .insert([
          {
            user_id: user.id,
            tanque: form.tanque,
            cliente: form.cliente,
            quantidade_kg: Number(
              form.quantidade_kg
            ),
            valor_kg: Number(
              form.valor_kg
            ),
            total,
            data_venda:
              form.data_venda,
          },
        ])

      if (error) {
        console.log(error)
        alert(error.message)
        return
      }
    }

    // LIMPAR FORM
    setForm({
      tanque: "",
      cliente: "",
      quantidade_kg: "",
      valor_kg: "",
      data_venda: "",
    })

    carregarVendas()
  }

  // 🔥 EXCLUIR
  async function excluirVenda(id) {

    const confirmar = confirm(
      "Deseja excluir esta venda?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("vendas")
      .delete()
      .eq("id", id)

    if (!error) {
      carregarVendas()
    }
  }

  // 🔥 EDITAR
  function editarVenda(item) {

    setEditandoId(item.id)

    setForm({
      tanque: item.tanque,
      cliente: item.cliente,
      quantidade_kg:
        item.quantidade_kg,
      valor_kg: item.valor_kg,
      data_venda:
        item.data_venda,
    })
  }

  return (
    <div className="space-y-6">

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold">
        💸 Vendas
      </h1>

      {/* FORM */}
      <form
        onSubmit={salvarVenda}
        className="bg-slate-100 p-6 rounded-2xl space-y-4"
      >

        {/* TANQUE */}
        <select
          className="w-full border p-3 rounded-xl"
          value={form.tanque}
          onChange={(e) =>
            setForm({
              ...form,
              tanque: e.target.value,
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

        {/* CLIENTE */}
        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Cliente"
          value={form.cliente}
          onChange={(e) =>
            setForm({
              ...form,
              cliente: e.target.value,
            })
          }
        />

        {/* KG */}
        <input
          type="number"
          className="w-full border p-3 rounded-xl"
          placeholder="Quantidade KG"
          value={form.quantidade_kg}
          onChange={(e) =>
            setForm({
              ...form,
              quantidade_kg:
                e.target.value,
            })
          }
        />

        {/* VALOR KG */}
        <input
          type="number"
          className="w-full border p-3 rounded-xl"
          placeholder="Valor por KG"
          value={form.valor_kg}
          onChange={(e) =>
            setForm({
              ...form,
              valor_kg:
                e.target.value,
            })
          }
        />

        {/* DATA */}
        <input
          type="date"
          className="w-full border p-3 rounded-xl"
          value={form.data_venda}
          onChange={(e) =>
            setForm({
              ...form,
              data_venda:
                e.target.value,
            })
          }
        />

        {/* BOTÃO */}
        <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">

          {editandoId
            ? "Atualizar Venda"
            : "Salvar Venda"}

        </button>

      </form>

      {/* LISTA */}
      <div className="space-y-4">

        {vendas.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-xl font-bold">
                  {item.cliente}
                </h2>

                <p className="text-gray-500">
                  Tanque: {item.tanque}
                </p>

                <p className="text-gray-500">
                  Data: {item.data_venda}
                </p>

              </div>

              {/* BOTÕES */}
              <div className="flex gap-2">

                <button
                  onClick={() =>
                    editarVenda(item)
                  }
                  className="bg-yellow-400 px-4 py-2 rounded-xl font-bold"
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    excluirVenda(item.id)
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
                  {item.quantidade_kg} kg
                </h3>

              </div>

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Valor/KG
                </p>

                <h3 className="font-bold">
                  R$ {item.valor_kg}
                </h3>

              </div>

              <div className="bg-green-100 p-3 rounded-xl">

                <p className="text-sm text-green-700">
                  Total
                </p>

                <h3 className="font-bold text-green-700">
                  R$ {Number(item.total).toFixed(2)}
                </h3>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}