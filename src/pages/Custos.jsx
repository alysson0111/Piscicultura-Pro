import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Custos({ user }) {

  const [custos, setCustos] = useState([])

  const [editandoId, setEditandoId] =
    useState(null)

  const [form, setForm] = useState({
    tipo: "",
    descricao: "",
    valor: "",
    data_custo: "",
  })

  // 🔥 CARREGAR CUSTOS
  async function carregarCustos() {

    const { data, error } = await supabase
      .from("custos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })

    if (error) {
      console.log(error)
      return
    }

    setCustos(data)
  }

  useEffect(() => {
    if (user) {
      carregarCustos()
    }
  }, [user])

  // 🔥 SALVAR
  async function salvarCusto(e) {
    e.preventDefault()

    // EDITAR
    if (editandoId) {

      const { error } = await supabase
        .from("custos")
        .update({
          tipo: form.tipo,
          descricao: form.descricao,
          valor: Number(form.valor),
          data_custo: form.data_custo,
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
        .from("custos")
        .insert([
          {
            user_id: user.id,
            tipo: form.tipo,
            descricao: form.descricao,
            valor: Number(form.valor),
            data_custo: form.data_custo,
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
      tipo: "",
      descricao: "",
      valor: "",
      data_custo: "",
    })

    carregarCustos()
  }

  // 🔥 EXCLUIR
  async function excluirCusto(id) {

    const confirmar = confirm(
      "Deseja excluir este custo?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("custos")
      .delete()
      .eq("id", id)

    if (error) {
      console.log(error)
      return
    }

    carregarCustos()
  }

  // 🔥 EDITAR
  function editarCusto(item) {

    setEditandoId(item.id)

    setForm({
      tipo: item.tipo,
      descricao: item.descricao,
      valor: item.valor,
      data_custo: item.data_custo,
    })
  }

  return (
    <div className="space-y-6">

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold">
        💰 Custos
      </h1>

      {/* FORM */}
      <form
        onSubmit={salvarCusto}
        className="bg-slate-100 p-6 rounded-2xl space-y-4"
      >

        {/* TIPO */}
        <select
          className="w-full border p-3 rounded-xl"
          value={form.tipo}
          onChange={(e) =>
            setForm({
              ...form,
              tipo: e.target.value,
            })
          }
        >

          <option value="">
            Tipo do custo
          </option>

          <option value="Ração">
            Ração
          </option>

          <option value="Energia">
            Energia
          </option>

          <option value="Medicamento">
            Medicamento
          </option>

          <option value="Funcionários">
            Funcionários
          </option>

          <option value="Outros">
            Outros
          </option>

        </select>

        {/* DESCRIÇÃO */}
        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Descrição do custo"
          value={form.descricao}
          onChange={(e) =>
            setForm({
              ...form,
              descricao: e.target.value,
            })
          }
        />

        {/* VALOR */}
        <input
          type="number"
          className="w-full border p-3 rounded-xl"
          placeholder="Valor"
          value={form.valor}
          onChange={(e) =>
            setForm({
              ...form,
              valor: e.target.value,
            })
          }
        />

        {/* DATA */}
        <input
          type="date"
          className="w-full border p-3 rounded-xl"
          value={form.data_custo}
          onChange={(e) =>
            setForm({
              ...form,
              data_custo: e.target.value,
            })
          }
        />

        {/* BOTÃO */}
        <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold">

          {editandoId
            ? "Atualizar Custo"
            : "Salvar Custo"}

        </button>

      </form>

      {/* LISTA */}
      <div className="space-y-4">

        {custos.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >

            <div className="flex justify-between items-start">

              <div>

                <div className="flex gap-2 items-center">

                  <h2 className="text-xl font-bold">
                    {item.descricao}
                  </h2>

                  <span className="bg-slate-200 px-3 py-1 rounded-xl text-sm">
                    {item.tipo}
                  </span>

                </div>

                <p className="text-gray-500 mt-2">
                  Data: {item.data_custo}
                </p>

              </div>

              {/* BOTÕES */}
              <div className="flex gap-2">

                <button
                  onClick={() =>
                    editarCusto(item)
                  }
                  className="bg-yellow-400 px-4 py-2 rounded-xl font-bold"
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    excluirCusto(item.id)
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                >
                  Excluir
                </button>

              </div>

            </div>

            {/* VALOR */}
            <div className="mt-4">

              <div className="bg-red-100 p-3 rounded-xl inline-block">

                <p className="text-sm text-red-700">
                  Valor
                </p>

                <h3 className="font-bold text-red-700">
                  R$ {Number(item.valor).toFixed(2)}
                </h3>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}