import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Biometria({ user }) {

  const [registros, setRegistros] =
    useState([])

  const [tanques, setTanques] =
    useState([])

  const [editandoId, setEditandoId] =
    useState(null)

  const [form, setForm] = useState({
    tanque: "",
    quantidade: "",
    peso: "",
    data_biometria: "",
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

  // 🔥 CARREGAR BIOMETRIA
  async function carregarBiometria() {

    const { data, error } =
      await supabase
        .from("biometria")
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
      carregarBiometria()
    }
  }, [user])

  // 🔥 SALVAR
  async function salvarBiometria(e) {

    e.preventDefault()

    const biomassa =
      (
        Number(form.quantidade) *
        Number(form.peso)
      ) / 1000

    // 🔥 EDITAR
    if (editandoId) {

      const { error } =
        await supabase
          .from("biometria")
          .update({
            tanque: form.tanque,
            quantidade: Number(
              form.quantidade
            ),
            peso: Number(form.peso),
            biomassa,
            data_biometria:
              form.data_biometria,
          })
          .eq("id", editandoId)

      if (error) {
        console.log(error)
        alert(error.message)
        return
      }

      setEditandoId(null)
    }

    // 🔥 NOVO
    else {

      const { error } =
        await supabase
          .from("biometria")
          .insert([
            {
              user_id: user.id,
              tanque: form.tanque,
              quantidade: Number(
                form.quantidade
              ),
              peso: Number(form.peso),
              biomassa,
              data_biometria:
                form.data_biometria,
            },
          ])

      if (error) {
        console.log(error)
        alert(error.message)
        return
      }
    }

    // 🔥 LIMPAR
    setForm({
      tanque: "",
      quantidade: "",
      peso: "",
      data_biometria: "",
    })

    carregarBiometria()
  }

  // 🔥 EXCLUIR
  async function excluirBiometria(id) {

    const confirmar = confirm(
      "Deseja excluir esta biometria?"
    )

    if (!confirmar) return

    const { error } =
      await supabase
        .from("biometria")
        .delete()
        .eq("id", id)

    if (!error) {
      carregarBiometria()
    }
  }

  // 🔥 EDITAR
  function editarBiometria(item) {

    setEditandoId(item.id)

    setForm({
      tanque: item.tanque,
      quantidade:
        item.quantidade,
      peso: item.peso,
      data_biometria:
        item.data_biometria,
    })
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        📊 Biometria
      </h1>

      {/* FORM */}
      <form
        onSubmit={salvarBiometria}
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

        {/* QUANTIDADE */}
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

        {/* PESO */}
        <input
          type="number"
          className="w-full border p-3 rounded-xl"
          placeholder="Peso médio (g)"
          value={form.peso}
          onChange={(e) =>
            setForm({
              ...form,
              peso: e.target.value,
            })
          }
        />

        {/* DATA */}
        <input
          type="date"
          className="w-full border p-3 rounded-xl"
          value={form.data_biometria}
          onChange={(e) =>
            setForm({
              ...form,
              data_biometria:
                e.target.value,
            })
          }
        />

        {/* BOTÃO */}
        <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">

          {editandoId
            ? "Atualizar Biometria"
            : "Salvar Biometria"}

        </button>

      </form>

      {/* LISTA */}
      <div className="space-y-4">

        {registros.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-xl font-bold">
                  {item.tanque}
                </h2>

                <p className="text-gray-500">
                  Data:
                  {" "}
                  {item.data_biometria}
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    editarBiometria(item)
                  }
                  className="bg-yellow-400 px-4 py-2 rounded-xl font-bold"
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    excluirBiometria(
                      item.id
                    )
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
                  {item.quantidade}
                </h3>

              </div>

              <div className="bg-slate-100 p-3 rounded-xl">

                <p className="text-sm text-gray-500">
                  Peso Médio
                </p>

                <h3 className="font-bold">
                  {item.peso} g
                </h3>

              </div>

              <div className="bg-green-100 p-3 rounded-xl">

                <p className="text-sm text-green-700">
                  Biomassa
                </p>

                <h3 className="font-bold text-green-700">
                  {Number(
                    item.biomassa
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