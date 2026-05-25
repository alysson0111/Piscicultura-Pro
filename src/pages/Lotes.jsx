import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Lotes({ user }) {
  const [nomeLote, setNomeLote] = useState("")
  const [tanque, setTanque] = useState("")
  const [especie, setEspecie] = useState("Tilápia")
  const [quantidade, setQuantidade] = useState("")
  const [pesoInicial, setPesoInicial] = useState("")
  const [dataPovoamento, setDataPovoamento] = useState("")
  const [fornecedor, setFornecedor] = useState("")

  const [dados, setDados] = useState([])
  const [tanques, setTanques] = useState([])
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  const biomassa =
    (Number(quantidade || 0) * Number(pesoInicial || 0)) / 1000

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

      const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      const lotesValidos =
        lotes?.filter((item) =>
          nomesTanques.includes(item.tanque)
        ) || []

      const lotesInvalidos =
        lotes?.filter((item) =>
          !nomesTanques.includes(item.tanque)
        ) || []

      if (lotesInvalidos.length > 0) {
        const idsInvalidos = lotesInvalidos.map((item) => item.id)

        await supabase
          .from("lotes")
          .delete()
          .in("id", idsInvalidos)
      }

      setDados(lotesValidos)
    } catch (erro) {
      console.log(erro)
    }
  }

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      user_id: user.id,
      nome_lote: nomeLote,
      tanque,
      especie,
      quantidade: Number(quantidade),
      peso_inicial: Number(pesoInicial),
      biomassa: Number(biomassa),
      data_povoamento: dataPovoamento,
      fornecedor,
    }

    const query = editando
      ? supabase.from("lotes").update(payload).eq("id", editando)
      : supabase.from("lotes").insert([payload])

    const { error } = await query

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    limpar()
    carregarDados()
    setLoading(false)

    alert(editando ? "Lote atualizado!" : "Lote salvo!")
  }

  function editar(item) {
    setEditando(item.id)
    setNomeLote(item.nome_lote || "")
    setTanque(item.tanque || "")
    setEspecie(item.especie || "Tilápia")
    setQuantidade(item.quantidade || "")
    setPesoInicial(item.peso_inicial || "")
    setDataPovoamento(item.data_povoamento || "")
    setFornecedor(item.fornecedor || "")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function limpar() {
    setEditando(null)
    setNomeLote("")
    setTanque("")
    setEspecie("Tilápia")
    setQuantidade("")
    setPesoInicial("")
    setDataPovoamento("")
    setFornecedor("")
  }

  async function excluir(id) {
    if (!confirm("Excluir lote?")) return

    const { error } = await supabase
      .from("lotes")
      .delete()
      .eq("id", id)

    if (!error) carregarDados()
  }

  useEffect(() => {
    if (user) carregarDados()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🐟 Lotes</h1>
        <p className="text-gray-500 mt-1">
          Controle de povoamento dos tanques
        </p>
      </div>

      <form
        onSubmit={salvar}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="font-bold">Nome do Lote</label>
          <input
            type="text"
            value={nomeLote}
            onChange={(e) => setNomeLote(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

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
          <label className="font-bold">Espécie</label>
          <select
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="Tilápia">Tilápia</option>
            <option value="Tambaqui">Tambaqui</option>
            <option value="Pirarucu">Pirarucu</option>
            <option value="Lambari">Lambari</option>
            <option value="Outros">Outros</option>
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
          <label className="font-bold">Peso Inicial (g)</label>
          <input
            type="number"
            step="0.01"
            value={pesoInicial}
            onChange={(e) => setPesoInicial(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">Biomassa Inicial</label>
          <input
            type="text"
            readOnly
            value={`${formatar(biomassa)} kg`}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-green-700"
          />
        </div>

        <div>
          <label className="font-bold">Data Povoamento</label>
          <input
            type="date"
            value={dataPovoamento}
            onChange={(e) => setDataPovoamento(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">Fornecedor</label>
          <input
            type="text"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
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
        <h2 className="text-2xl font-bold mb-4">
          📋 Lotes Cadastrados
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Lote</th>
              <th className="p-3 text-left">Tanque</th>
              <th className="p-3 text-left">Espécie</th>
              <th className="p-3 text-left">Quantidade</th>
              <th className="p-3 text-left">Peso Inicial</th>
              <th className="p-3 text-left">Biomassa</th>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Fornecedor</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{item.nome_lote}</td>
                <td className="p-3">{item.tanque}</td>
                <td className="p-3">{item.especie}</td>
                <td className="p-3">{item.quantidade}</td>
                <td className="p-3">{formatar(item.peso_inicial)} g</td>
                <td className="p-3 font-bold text-green-700">
                  {formatar(item.biomassa)} kg
                </td>
                <td className="p-3">{item.data_povoamento}</td>
                <td className="p-3">{item.fornecedor || "-"}</td>
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