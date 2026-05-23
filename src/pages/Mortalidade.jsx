import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Mortalidade({
  user,
}) {

  const [registros, setRegistros] =
    useState([])

  const [tanques, setTanques] =
    useState([])

  const [editandoId, setEditandoId] =
    useState(null)

  const [form, setForm] = useState({
    tanque: "",
    quantidade: "",
    peso_medio: "",
    causa: "",
    data_mortalidade: "",
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

  // 🔥 CARREGAR MORTALIDADE
  async function carregarDados() {

    const { data, error } =
      await supabase
        .from("mortalidade")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })

    if (!error) {
      setRegistros(data)
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

    const biomassa_perdida =
      (
        Number(form.quantidade) *
        Number(form.peso_medio)
      ) / 1000

    // 🔥 EDITAR
    if (editandoId) {

      const { error } =
        await supabase
          .from("mortalidade")
          .update({
            tanque: form.tanque,
            quantidade:
              Number(form.quantidade),
            peso_medio:
              Number(form.peso_medio),
            biomassa_perdida,
            causa: form.causa,
            data_mortalidade:
              form.data_mortalidade,
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
          .from("mortalidade")
          .insert([
            {
              user_id: user.id,
              tanque: form.tanque,
              quantidade:
                Number(form.quantidade),
              peso_medio:
                Number(form.peso_medio),
              biomassa_perdida,
              causa: form.causa,
              data_mortalidade:
                form.data_mortalidade,
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
      quantidade: "",
      peso_medio: "",
      causa: "",
      data_mortalidade: "",
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
        .from("mortalidade")
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
      quantidade:
        item.quantidade,
      peso_medio:
        item.peso_medio,
      causa: item.causa,
      data_mortalidade:
        item.data_mortalidade,
    })
  }

  return (

    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        ☠️ Mortalidade
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

        {/* QUANTIDADE */}
        <input
          type="number"
          placeholder="Quantidade Morta"
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

        {/* PESO */}
        <input
          type="number"
          placeholder="Peso Médio (g)"
          className="w-full border p-3 rounded-xl"
          value={form.peso_medio}
          onChange={(e) =>
            setForm({
              ...form,
              peso_medio:
                e.target.value,
            })
          }
        />

        {/* CAUSA */}
        <input
          type="text"
          placeholder="Causa"
          className="w-full border p-3 rounded-xl"
          value={form.causa}
          onChange={(e) =>
            setForm({
              ...form,
              causa:
                e.target.value,
            })
          }
        />

        {/* DATA */}
        <input
          type="date"
          className="w-full border p-3 rounded-xl"
          value={
            form.data_mortalidade
          }
          onChange={(e) =>
            setForm({
              ...form,
              data_mortalidade:
                e.target.value,
            })
          }
        />

        {/* BOTÃO */}
        <button
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
        >

          {editandoId
            ? "Atualizar"
            : "Salvar"}

        </button>

      </form>

      {/* LISTA */}
      <div className="space-y-4">

        {registros.map((item) => (

          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {item.tanque}
                </h2>

                <p className="text-gray-500">
                  {item.data_mortalidade}
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
                  {item.quantidade}
                </h3>

              </div>

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Peso Médio
                </p>

                <h3 className="font-bold">
                  {item.peso_medio} g
                </h3>

              </div>

              <div className="bg-red-100 p-3 rounded-xl">

                <p className="text-sm text-red-700">
                  Biomassa Perdida
                </p>

                <h3 className="font-bold text-red-700">
                  {Number(
                    item.biomassa_perdida
                  ).toFixed(2)} kg
                </h3>

              </div>

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Causa
                </p>

                <h3 className="font-bold">
                  {item.causa}
                </h3>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}