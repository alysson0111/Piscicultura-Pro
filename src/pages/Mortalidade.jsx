import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Mortalidade({ user }) {

  const [tanques, setTanques] =
    useState([])

  const [dados, setDados] =
    useState([])

  const [tanque, setTanque] =
    useState("")

  const [quantidade, setQuantidade] =
    useState("")

  const [motivo, setMotivo] =
    useState("")

  const [data, setData] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [editando, setEditando] =
    useState(null)

  async function carregarDados() {

    try {

      // 🔥 TANQUES
      const { data: dadosTanques } =
        await supabase
          .from("tanques")
          .select("nome")
          .eq(
            "user_id",
            user.id
          )

      const nomesTanques =
        dadosTanques?.map(
          (t) => t.nome
        ) || []

      setTanques(
        dadosTanques || []
      )

      // 🔥 MORTALIDADE
      const {
        data: mortalidades,
      } = await supabase
        .from("mortalidade")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "data_mortalidade",
          {
            ascending: false,
          }
        )

      // 🔥 SOMENTE TANQUES EXISTENTES
      const validas =
        mortalidades?.filter(
          (item) =>
            nomesTanques.includes(
              item.tanque
            )
        ) || []

      // 🔥 EXCLUIR ÓRFÃOS
      const invalidas =
        mortalidades?.filter(
          (item) =>
            !nomesTanques.includes(
              item.tanque
            )
        ) || []

      if (
        invalidas.length > 0
      ) {

        const ids =
          invalidas.map(
            (item) => item.id
          )

        await supabase
          .from("mortalidade")
          .delete()
          .in("id", ids)

      }

      setDados(validas)

    } catch (erro) {
      console.log(erro)
    }
  }

  async function salvar(e) {

    e.preventDefault()

    setLoading(true)

    const payload = {
      user_id: user.id,
      tanque,
      quantidade:
        Number(
          quantidade
        ),
      motivo,
      data_mortalidade: data,
    }

    const query = editando

      ? supabase
          .from("mortalidade")
          .update(payload)
          .eq(
            "id",
            editando
          )

      : supabase
          .from("mortalidade")
          .insert([payload])

    const { error } =
      await query

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    limpar()

    carregarDados()

    setLoading(false)

    alert(
      editando
        ? "Registro atualizado!"
        : "Registro salvo!"
    )
  }

  function editar(item) {

    setEditando(item.id)

    setTanque(
      item.tanque || ""
    )

    setQuantidade(
      item.quantidade || ""
    )

    setMotivo(
      item.motivo || ""
    )

    setData(
      item.data_mortalidade ||
        ""
    )

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function limpar() {

    setEditando(null)

    setTanque("")

    setQuantidade("")

    setMotivo("")

    setData("")
  }

  async function excluir(id) {

    if (
      !confirm(
        "Excluir registro?"
      )
    )
      return

    await supabase
      .from("mortalidade")
      .delete()
      .eq("id", id)

    carregarDados()
  }

  useEffect(() => {

    if (user) {
      carregarDados()
    }

  }, [user])

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          ☠️ Mortalidade
        </h1>

        <p className="text-gray-500 mt-1">
          Controle de perdas
        </p>

      </div>

      {/* FORM */}
      <form
        onSubmit={salvar}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >

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
              (
                item,
                index
              ) => (
                <option
                  key={index}
                  value={
                    item.nome
                  }
                >
                  {item.nome}
                </option>
              )
            )}

          </select>

        </div>

        <div>

          <label className="font-bold">
            Quantidade
          </label>

          <input
            type="number"
            value={quantidade}
            onChange={(e) =>
              setQuantidade(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        <div>

          <label className="font-bold">
            Motivo
          </label>

          <input
            type="text"
            value={motivo}
            onChange={(e) =>
              setMotivo(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
          />

        </div>

        <div>

          <label className="font-bold">
            Data
          </label>

          <input
            type="date"
            value={data}
            onChange={(e) =>
              setData(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        <div className="md:col-span-2 lg:col-span-4 flex gap-3">

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold"
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
              onClick={limpar}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold"
            >

              Cancelar

            </button>

          )}

        </div>

      </form>

      {/* TABELA */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-auto">

        <h2 className="text-2xl font-bold mb-4">
          📋 Histórico
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b bg-slate-100">

              <th className="p-3 text-left">
                Data
              </th>

              <th className="p-3 text-left">
                Tanque
              </th>

              <th className="p-3 text-left">
                Quantidade
              </th>

              <th className="p-3 text-left">
                Motivo
              </th>

              <th className="p-3 text-left">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {dados.map(
              (item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-3">
                    {
                      item.data_mortalidade
                    }
                  </td>

                  <td className="p-3">
                    {item.tanque}
                  </td>

                  <td className="p-3">
                    {item.quantidade}
                  </td>

                  <td className="p-3">
                    {item.motivo}
                  </td>

                  <td className="p-3">

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          editar(
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

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}