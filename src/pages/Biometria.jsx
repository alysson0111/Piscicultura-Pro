import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Biometria({ user }) {
  const [tanque, setTanque] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [pesoMedio, setPesoMedio] = useState("")
  const [biomassa, setBiomassa] = useState("")
  const [dataBiometria, setDataBiometria] = useState("")
  const [dados, setDados] = useState([])
  const [tanques, setTanques] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const total =
      (Number(quantidade || 0) * Number(pesoMedio || 0)) / 1000

    setBiomassa(total.toFixed(2))
  }, [quantidade, pesoMedio])

  async function carregarDados() {
    try {
      const { data: dadosTanques } = await supabase
        .from("tanques")
        .select("nome")
        .eq("user_id", user.id)

      const nomesTanques = dadosTanques?.map((t) => t.nome) || []

      setTanques(dadosTanques || [])

      const { data: biometrias, error } = await supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id)
        .order("data_biometria", { ascending: false })

      if (error) {
        console.log(error)
        return
      }

      const biometriasValidas =
        biometrias?.filter((item) =>
          nomesTanques.includes(item.tanque)
        ) || []

      const biometriasInvalidas =
        biometrias?.filter((item) =>
          !nomesTanques.includes(item.tanque)
        ) || []

      if (biometriasInvalidas.length > 0) {
        const idsInvalidos = biometriasInvalidas.map((item) => item.id)

        await supabase
          .from("biometria")
          .delete()
          .in("id", idsInvalidos)
      }

      setDados(biometriasValidas)
    } catch (erro) {
      console.log(erro)
    }
  }

  async function salvarBiometria(e) {
    e.preventDefault()

    try {
      setLoading(true)

      const { error } = await supabase.from("biometria").insert([
        {
          user_id: user.id,
          tanque,
          quantidade: Number(quantidade),
          peso_medio: Number(pesoMedio),
          biomassa: Number(biomassa),
          data_biometria: dataBiometria,
        },
      ])

      if (error) {
        alert(error.message)
        return
      }

      setTanque("")
      setQuantidade("")
      setPesoMedio("")
      setBiomassa("")
      setDataBiometria("")

      carregarDados()
      alert("Biometria salva!")
    } catch (erro) {
      console.log(erro)
    } finally {
      setLoading(false)
    }
  }

  async function excluir(id) {
    const confirmar = confirm("Excluir biometria?")

    if (!confirmar) return

    const { error } = await supabase
      .from("biometria")
      .delete()
      .eq("id", id)

    if (!error) {
      carregarDados()
    }
  }

  useEffect(() => {
    if (user) {
      carregarDados()
    }
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📏 Biometria</h1>
        <p className="text-gray-500 mt-1">
          Controle de peso e biomassa
        </p>
      </div>

      <form
        onSubmit={salvarBiometria}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="font-bold">Tanque</label>

          <select
            value={tanque}
            onChange={(e) => setTanque(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          >
            <option value="">Selecione</option>

            {tanques.map((item, index) => (
              <option key={index} value={item.nome}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold">Quantidade</label>

          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">Peso Médio (g)</label>

          <input
            type="number"
            step="0.01"
            value={pesoMedio}
            onChange={(e) => setPesoMedio(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">Biomassa (kg)</label>

          <input
            type="number"
            value={biomassa}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100"
            readOnly
          />
        </div>

        <div>
          <label className="font-bold">Data Biometria</label>

          <input
            type="date"
            value={dataBiometria}
            onChange={(e) => setDataBiometria(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-2xl shadow overflow-auto">
        <h2 className="text-2xl font-bold mb-4">
          📋 Histórico
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tanque</th>
              <th className="p-3 text-left">Quantidade</th>
              <th className="p-3 text-left">Peso Médio</th>
              <th className="p-3 text-left">Biomassa</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-3">{item.data_biometria}</td>
                <td className="p-3">{item.tanque}</td>
                <td className="p-3">{item.quantidade}</td>

                <td className="p-3">
                  {Number(item.peso_medio || 0).toFixed(2)} g
                </td>

                <td className="p-3">
                  {Number(item.biomassa || 0).toFixed(2)} kg
                </td>

                <td className="p-3">
                  <button
                    onClick={() => excluir(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}