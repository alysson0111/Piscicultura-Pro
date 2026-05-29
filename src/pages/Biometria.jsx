import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Biometria({ user }) {
  const [tanques, setTanques] = useState([])
  const [dados, setDados] = useState([])

  const [tanque, setTanque] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [pesoMedio, setPesoMedio] = useState("")
  const [dataBiometria, setDataBiometria] = useState("")

  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  const biomassa =
    (Number(quantidade || 0) * Number(pesoMedio || 0)) / 1000

  function formatar(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  async function carregarDados() {
    try {
      // TANQUES
      const { data: dadosTanques } = await supabase
        .from("tanques")
        .select("nome")
        .eq("user_id", user.id)

      const nomesTanques =
        dadosTanques?.map((t) => t.nome) || []

      setTanques(dadosTanques || [])

      // BIOMETRIA
      const { data: biometrias } = await supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id)
        .order("data_biometria", {
          ascending: false,
        })

      // SOMENTE TANQUES EXISTENTES
      const validas =
        biometrias?.filter((item) =>
          nomesTanques.includes(item.tanque)
        ) || []

      // EXCLUIR ÓRFÃOS
      const invalidas =
        biometrias?.filter(
          (item) =>
            !nomesTanques.includes(item.tanque)
        ) || []

      if (invalidas.length > 0) {
        const ids = invalidas.map(
          (item) => item.id
        )

        await supabase
          .from("biometria")
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
      quantidade: Number(quantidade),
      peso_medio: Number(pesoMedio),
      biomassa: Number(biomassa),
      data_biometria: dataBiometria,
    }

    const query = editando
      ? supabase
          .from("biometria")
          .update(payload)
          .eq("id", editando)
      : supabase
          .from("biometria")
          .insert([payload])

    const { error } = await query

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
        ? "Biometria atualizada!"
        : "Biometria salva!"
    )
  }

  function editar(item) {
    setEditando(item.id)

    setTanque(item.tanque || "")
    setQuantidade(item.quantidade || "")
    setPesoMedio(item.peso_medio || "")
    setDataBiometria(
      item.data_biometria || ""
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
    setPesoMedio("")
    setDataBiometria("")
  }

  async function excluir(id) {
    if (
      !confirm(
        "Excluir biometria?"
      )
    )
      return

    await supabase
      .from("biometria")
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
          📏 Biometria
        </h1>

        <p className="text-gray-500 mt-1">
          Controle de crescimento dos peixes
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={salvar}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >

        <div>
          <label className="font-bold">
            Tanque
          </label>

          <select
            value={tanque}
            onChange={(e) =>
              setTanque(e.target.value)
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
            Peso Médio (g)
          </label>

          <input
            type="number"
            step="0.01"
            value={pesoMedio}
            onChange={(e) =>
              setPesoMedio(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">
            Biomassa
          </label>

          <input
            type="text"
            readOnly
            value={`${formatar(
              biomassa
            )} kg`}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-green-700"
          />
        </div>

        <div>
          <label className="font-bold">
            Data
          </label>

          <input
            type="date"
            value={dataBiometria}
            onChange={(e) =>
              setDataBiometria(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

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
              onClick={limpar}
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
                Peso Médio
              </th>

              <th className="p-3 text-left">
                Biomassa
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
                  {new Date(
                    item.data_biometria
                  ).toLocaleDateString(
                    "pt-BR"
                  )}
                </td>

                <td className="p-3">
                  {item.tanque}
                </td>

                <td className="p-3">
                  {item.quantidade}
                </td>

                <td className="p-3">
                  {formatar(
                    item.peso_medio
                  )}{" "}
                  g
                </td>

                <td className="p-3 font-bold text-green-700">
                  {formatar(
                    item.biomassa
                  )}{" "}
                  kg
                </td>

                <td className="p-3">

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        editar(item)
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                    >

                      Editar

                    </button>

                    <button
                      onClick={() =>
                        excluir(item.id)
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