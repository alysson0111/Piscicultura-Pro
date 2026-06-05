import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Biometria({ user }) {
  const [tanques, setTanques] = useState([])
  const [dados, setDados] = useState([])

  const [tanque, setTanque] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [pesoTotal, setPesoTotal] = useState("")
  const [dataBiometria, setDataBiometria] = useState("")

  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  const biomassa =
    Number(pesoTotal || 0) / 1000

  const pesoMedio =
    Number(quantidade || 0) > 0
      ? Number(pesoTotal || 0) /
        Number(quantidade || 0)
      : 0

  function formatar(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function formatarPeso(valorGramas) {
    const gramas =
      Number(valorGramas || 0)

    if (Math.abs(gramas) >= 1000) {
      return `${formatar(
        gramas / 1000
      )} kg`
    }

    return `${formatar(gramas)} g`
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

    const peixesPesados =
      Number(quantidade || 0)

    if (peixesPesados < 10) {
      alert(
        "Informe no mínimo 10 peixes pesados para registrar a biometria."
      )
      return
    }

    setLoading(true)

    const payload = {
      user_id: user.id,
      tanque,
      quantidade: peixesPesados,
      peso_total: Number(pesoTotal),
      peso_medio: Number(pesoMedio),
      biomassa: Number(biomassa),
      data_biometria: dataBiometria,
    }

    const salvarComPayload = (dadosPayload) =>
      editando
        ? supabase
            .from("biometria")
            .update(dadosPayload)
            .eq("id", editando)
        : supabase
            .from("biometria")
            .insert([dadosPayload])

    let query = salvarComPayload(payload)

    let { error } = await query

    if (
      error &&
      error.message?.includes("peso_total")
    ) {
      const {
        peso_total,
        ...payloadCompatibilidade
      } = payload

      query = salvarComPayload(
        payloadCompatibilidade
      )

      const resposta = await query
      error = resposta.error
    }

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
    setPesoTotal(
      Number(item.peso_total || 0) ||
      Number(item.biomassa || 0) * 1000 ||
      Number(item.quantidade || 0) *
      Number(item.peso_medio || 0)
    )
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
    setPesoTotal("")
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
            Peixes pesados
          </label>

          <input
            type="number"
            min="10"
            step="1"
            value={quantidade}
            onChange={(e) =>
              setQuantidade(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

          <p className="mt-1 text-xs text-slate-500">
            Mínimo de 10 peixes para uma biometria mais precisa.
          </p>
        </div>

        <div>
          <label className="font-bold">
            Peso total (g)
          </label>

          <input
            type="number"
            step="0.01"
            value={pesoTotal}
            onChange={(e) =>
              setPesoTotal(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">
            Peso médio
          </label>

          <input
            type="text"
            readOnly
            value={formatarPeso(
              pesoMedio
            )}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-blue-700"
          />
        </div>

        <div>
          <label className="font-bold">
            Biomassa da amostra
          </label>

          <input
            type="text"
            readOnly
            value={formatarPeso(
              pesoTotal
            )}
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
                Peixes pesados
              </th>

              <th className="p-3 text-left">
                Peso médio
              </th>

              <th className="p-3 text-left">
                Biomassa da amostra
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
                  {formatarPeso(
                    item.peso_medio
                  )}
                </td>

                <td className="p-3 font-bold text-green-700">
                  {formatarPeso(
                    Number(
                      item.peso_total ||
                      Number(item.biomassa || 0) *
                      1000
                    )
                  )}
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
