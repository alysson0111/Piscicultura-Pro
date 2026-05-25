import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Mortalidade({ user }) {
  const [tanques, setTanques] = useState([])
  const [dados, setDados] = useState([])

  const [tanque, setTanque] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [pesoMedio, setPesoMedio] = useState("")
  const [causa, setCausa] = useState("")
  const [observacao, setObservacao] = useState("")
  const [dataMortalidade, setDataMortalidade] = useState("")

  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  const biomassaPerdida =
    (Number(quantidade || 0) * Number(pesoMedio || 0)) / 1000

  function formatar(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  async function carregarDados() {
    try {
      const { data: dadosTanques } = await supabase
        .from("tanques")
        .select("nome")
        .eq("user_id", user.id)

      const nomesTanques = dadosTanques?.map((t) => t.nome) || []

      setTanques(dadosTanques || [])

      const { data: mortalidades } = await supabase
        .from("mortalidade")
        .select("*")
        .eq("user_id", user.id)
        .order("data_mortalidade", { ascending: false })

      const validas =
        mortalidades?.filter((item) =>
          nomesTanques.includes(item.tanque)
        ) || []

      const invalidas =
        mortalidades?.filter((item) =>
          !nomesTanques.includes(item.tanque)
        ) || []

      if (invalidas.length > 0) {
        const ids = invalidas.map((item) => item.id)

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
      quantidade: Number(quantidade),
      peso_medio: Number(pesoMedio),
      biomassa_perdida: Number(biomassaPerdida),
      causa,
      observacao,
      data_mortalidade: dataMortalidade,
    }

    const query = editando
      ? supabase.from("mortalidade").update(payload).eq("id", editando)
      : supabase.from("mortalidade").insert([payload])

    const { error } = await query

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    limpar()
    carregarDados()
    setLoading(false)

    alert(editando ? "Registro atualizado!" : "Registro salvo!")
  }

  function editar(item) {
    setEditando(item.id)
    setTanque(item.tanque || "")
    setQuantidade(item.quantidade || "")
    setPesoMedio(item.peso_medio || "")
    setCausa(item.causa || "")
    setObservacao(item.observacao || "")
    setDataMortalidade(item.data_mortalidade || "")

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function limpar() {
    setEditando(null)
    setTanque("")
    setQuantidade("")
    setPesoMedio("")
    setCausa("")
    setObservacao("")
    setDataMortalidade("")
  }

  async function excluir(id) {
    if (!confirm("Excluir registro?")) return

    await supabase
      .from("mortalidade")
      .delete()
      .eq("id", id)

    carregarDados()
  }

  useEffect(() => {
    if (user) carregarDados()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">☠️ Mortalidade</h1>
        <p className="text-gray-500 mt-1">Controle de perdas da produção</p>
      </div>

      <form
        onSubmit={salvar}
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
          <label className="font-bold">Biomassa Perdida</label>
          <input
            type="text"
            readOnly
            value={`${formatar(biomassaPerdida)} kg`}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-red-700"
          />
        </div>

        <div>
          <label className="font-bold">Causa</label>
          <input
            type="text"
            value={causa}
            onChange={(e) => setCausa(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
          />
        </div>

        <div>
          <label className="font-bold">Data</label>
          <input
            type="date"
            value={dataMortalidade}
            onChange={(e) => setDataMortalidade(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div className="lg:col-span-3">
          <label className="font-bold">Observação</label>
          <input
            type="text"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl"
          >
            {loading ? "Salvando..." : editando ? "Atualizar" : "Salvar"}
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

      <div className="bg-white p-6 rounded-2xl shadow overflow-auto">
        <h2 className="text-2xl font-bold mb-4">📋 Histórico</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tanque</th>
              <th className="p-3 text-left">Quantidade</th>
              <th className="p-3 text-left">Peso Médio</th>
              <th className="p-3 text-left">Biomassa</th>
              <th className="p-3 text-left">Causa</th>
              <th className="p-3 text-left">Observação</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{item.data_mortalidade}</td>
                <td className="p-3">{item.tanque}</td>
                <td className="p-3">{item.quantidade}</td>
                <td className="p-3">{formatar(item.peso_medio)} g</td>
                <td className="p-3 font-bold text-red-700">
                  {formatar(item.biomassa_perdida)} kg
                </td>
                <td className="p-3">{item.causa}</td>
                <td className="p-3">{item.observacao || "-"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => editar(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluir(item.id)}
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