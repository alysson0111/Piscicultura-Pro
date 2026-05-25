import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Estoque({ user }) {
  const [produto, setProduto] = useState("")
  const [categoria, setCategoria] = useState("")
  const [quantidade, setQuantidade] = useState("")
  const [pesoEmbalagem, setPesoEmbalagem] = useState("")
  const [unidade, setUnidade] = useState("sacos")
  const [valorUnitario, setValorUnitario] = useState("")
  const [dataEntrada, setDataEntrada] = useState("")

  const [dados, setDados] = useState([])
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  const pesoTotal =
    Number(quantidade || 0) *
    Number(pesoEmbalagem || 0)

  const valorTotal =
    Number(quantidade || 0) *
    Number(valorUnitario || 0)

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  async function carregarDados() {
    const { data, error } = await supabase
      .from("estoque")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setDados(data || [])
  }

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      user_id: user.id,
      produto,
      categoria,
      quantidade: Number(quantidade),
      peso_embalagem: Number(pesoEmbalagem || 0),
      unidade,
      valor_unitario: Number(valorUnitario),
      valor_total: Number(valorTotal),
      peso_total: Number(pesoTotal),
      data_entrada: dataEntrada,
    }

    const query = editando
      ? supabase.from("estoque").update(payload).eq("id", editando)
      : supabase.from("estoque").insert([payload])

    const { error } = await query

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    limpar()
    carregarDados()
    setLoading(false)

    alert(editando ? "Item atualizado!" : "Item salvo!")
  }

  function editar(item) {
    setEditando(item.id)
    setProduto(item.produto || "")
    setCategoria(item.categoria || "")
    setQuantidade(item.quantidade || "")
    setPesoEmbalagem(item.peso_embalagem || "")
    setUnidade(item.unidade || "sacos")
    setValorUnitario(item.valor_unitario || "")
    setDataEntrada(item.data_entrada || "")

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function limpar() {
    setEditando(null)
    setProduto("")
    setCategoria("")
    setQuantidade("")
    setPesoEmbalagem("")
    setUnidade("sacos")
    setValorUnitario("")
    setDataEntrada("")
  }

  async function excluir(id) {
    if (!confirm("Excluir item do estoque?")) return

    const { error } = await supabase
      .from("estoque")
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
        <h1 className="text-3xl font-bold">📦 Estoque</h1>
        <p className="text-gray-500 mt-1">
          Controle de estoque da piscicultura
        </p>
      </div>

      <form
        onSubmit={salvar}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="font-bold">Produto</label>
          <input
            type="text"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          >
            <option value="">Selecione</option>
            <option value="Ração">Ração</option>
            <option value="Medicamento">Medicamento</option>
            <option value="Equipamento">Equipamento</option>
            <option value="Químico">Químico</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div>
          <label className="font-bold">Quantidade de Sacos</label>
          <input
            type="number"
            step="0.01"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Ex: 20"
            required
          />
        </div>

        <div>
          <label className="font-bold">Peso por Saco (kg)</label>
          <input
            type="number"
            step="0.01"
            value={pesoEmbalagem}
            onChange={(e) => setPesoEmbalagem(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Ex: 25"
            required
          />
        </div>

        <div>
          <label className="font-bold">Peso Total</label>
          <input
            type="text"
            readOnly
            value={`${pesoTotal.toFixed(2)} kg`}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-blue-700"
          />
        </div>

        <div>
          <label className="font-bold">Unidade</label>
          <input
            type="text"
            value="sacos"
            readOnly
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100"
          />
        </div>

        <div>
          <label className="font-bold">Valor por Saco</label>
          <input
            type="number"
            step="0.01"
            value={valorUnitario}
            onChange={(e) => setValorUnitario(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">Valor Total</label>
          <input
            type="text"
            readOnly
            value={`R$ ${moeda(valorTotal)}`}
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-green-700"
          />
        </div>

        <div>
          <label className="font-bold">Data de Entrada</label>
          <input
            type="date"
            value={dataEntrada}
            onChange={(e) => setDataEntrada(e.target.value)}
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
        <h2 className="text-2xl font-bold mb-4">📋 Itens em Estoque</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Produto</th>
              <th className="p-3 text-left">Categoria</th>
              <th className="p-3 text-left">Sacos</th>
              <th className="p-3 text-left">Kg/Saco</th>
              <th className="p-3 text-left">Total Kg</th>
              <th className="p-3 text-left">Valor/Saco</th>
              <th className="p-3 text-left">Valor Total</th>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{item.produto}</td>
                <td className="p-3">{item.categoria}</td>
                <td className="p-3">{item.quantidade}</td>
                <td className="p-3">
                  {Number(item.peso_embalagem || 0).toFixed(2)} kg
                </td>
                <td className="p-3 font-bold text-blue-700">
                  {Number(item.peso_total || 0).toFixed(2)} kg
                </td>
                <td className="p-3">R$ {moeda(item.valor_unitario)}</td>
                <td className="p-3 font-bold text-green-700">
                  R$ {moeda(item.valor_total)}
                </td>
                <td className="p-3">{item.data_entrada}</td>
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