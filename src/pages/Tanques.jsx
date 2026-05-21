import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Tanques({ user }) {
  const [tanques, setTanques] = useState([])

  const [form, setForm] = useState({
    nome: "",
    especie: "",
    quantidade: "",
    peso: "",
  })

  const [editandoId, setEditandoId] =
    useState(null)

  // 🔥 CARREGAR
  async function carregarTanques() {
    const { data, error } = await supabase
      .from("tanques")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })

    if (!error) {
      setTanques(data)
    }
  }

  useEffect(() => {
    if (user) {
      carregarTanques()
    }
  }, [user])

  // 🔥 SALVAR
  async function salvarTanque(e) {
    e.preventDefault()

    const biomassa =
      (Number(form.quantidade) *
        Number(form.peso)) /
      1000

    // EDITAR
    if (editandoId) {
      const { error } = await supabase
        .from("tanques")
        .update({
          nome: form.nome,
          especie: form.especie,
          quantidade: Number(
            form.quantidade
          ),
          peso: Number(form.peso),
          biomassa,
        })
        .eq("id", editandoId)

      if (error) {
        console.log(error.message)
        return
      }

      setEditandoId(null)
    }

    // NOVO
    else {
      const { error } = await supabase
        .from("tanques")
        .insert([
          {
            user_id: user.id,
            nome: form.nome,
            especie: form.especie,
            quantidade: Number(
              form.quantidade
            ),
            peso: Number(form.peso),
            biomassa,
          },
        ])

      if (error) {
        console.log(error.message)
        return
      }
    }

    setForm({
      nome: "",
      especie: "",
      quantidade: "",
      peso: "",
    })

    carregarTanques()
  }

  // 🔥 EXCLUIR
  async function excluirTanque(id) {
    const confirmar = confirm(
      "Deseja excluir este tanque?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("tanques")
      .delete()
      .eq("id", id)

    if (!error) {
      carregarTanques()
    }
  }

  // 🔥 EDITAR
  function editarTanque(tanque) {
    setEditandoId(tanque.id)

    setForm({
      nome: tanque.nome,
      especie: tanque.especie,
      quantidade: tanque.quantidade,
      peso: tanque.peso,
    })
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        🐟 Tanques
      </h1>

      {/* FORM */}
      <form
        onSubmit={salvarTanque}
        className="bg-slate-100 p-6 rounded-2xl space-y-4"
      >

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Nome do tanque"
          value={form.nome}
          onChange={(e) =>
            setForm({
              ...form,
              nome: e.target.value,
            })
          }
        />

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Espécie"
          value={form.especie}
          onChange={(e) =>
            setForm({
              ...form,
              especie: e.target.value,
            })
          }
        />

        <input
          type="number"
          className="w-full border p-3 rounded-xl"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={(e) =>
            setForm({
              ...form,
              quantidade:
                e.target.value,
            })
          }
        />

        <input
          type="number"
          className="w-full border p-3 rounded-xl"
          placeholder="Peso médio"
          value={form.peso}
          onChange={(e) =>
            setForm({
              ...form,
              peso: e.target.value,
            })
          }
        />

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
          {editandoId
            ? "Atualizar Tanque"
            : "Salvar Tanque"}
        </button>

      </form>

      {/* LISTA */}
      <div className="space-y-4">

        {tanques.map((tanque) => (
          <div
            key={tanque.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >

            <div className="flex justify-between items-start">

              <div>
                <h2 className="text-xl font-bold">
                  {tanque.nome}
                </h2>

                <p className="text-gray-600">
                  {tanque.especie}
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    editarTanque(
                      tanque
                    )
                  }
                  className="bg-yellow-400 px-4 py-2 rounded-xl font-bold"
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    excluirTanque(
                      tanque.id
                    )
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                >
                  Excluir
                </button>

              </div>

            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">

              <div className="bg-slate-100 p-3 rounded-xl">
                <p className="text-sm text-gray-500">
                  Quantidade
                </p>

                <h3 className="font-bold">
                  {tanque.quantidade}
                </h3>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl">
                <p className="text-sm text-gray-500">
                  Peso Médio
                </p>

                <h3 className="font-bold">
                  {tanque.peso} g
                </h3>
              </div>

              <div className="bg-green-100 p-3 rounded-xl">
                <p className="text-sm text-green-700">
                  Biomassa
                </p>

                <h3 className="font-bold text-green-700">
                  {Number(
                    tanque.biomassa
                  ).toFixed(2)} kg
                </h3>
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}