import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Custos({ user }) {
  const [tipoCusto, setTipoCusto] = useState("estoque")
  const [categoria, setCategoria] = useState("Ração")
  const [descricao, setDescricao] = useState("")
  const [tanque, setTanque] = useState("")
  const [dataCusto, setDataCusto] = useState("")
  const [estoqueId, setEstoqueId] = useState("")
  const [quantidadeBaixa, setQuantidadeBaixa] = useState("")
  const [valorManual, setValorManual] = useState("")
  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  const [dados, setDados] = useState([])
  const [tanques, setTanques] = useState([])
  const [estoque, setEstoque] = useState([])

  const itemEstoque = estoque.find((item) => item.id === estoqueId)

  const pesoTotalBaixa =
    Number(quantidadeBaixa || 0) *
    Number(itemEstoque?.peso_embalagem || 0)

  const valorEstoque =
    Number(quantidadeBaixa || 0) *
    Number(itemEstoque?.valor_unitario || 0)

  const valorTotal =
    tipoCusto === "estoque"
      ? valorEstoque
      : Number(valorManual || 0)

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  async function carregarDados() {
    const { data: custos } = await supabase
      .from("custos")
      .select("*")
      .eq("user_id", user.id)
      .order("data_custo", { ascending: false })

    const { data: dadosTanques } = await supabase
      .from("tanques")
      .select("nome")
      .eq("user_id", user.id)

    const { data: dadosEstoque } = await supabase
      .from("estoque")
      .select("*")
      .eq("user_id", user.id)
      .order("produto", { ascending: true })

    setDados(custos || [])
    setTanques(dadosTanques || [])
    setEstoque(dadosEstoque || [])
  }

  function selecionarProduto(id) {
    setEstoqueId(id)

    const item = estoque.find((e) => e.id === id)

    if (item) {
      setDescricao(item.produto)
      setCategoria(item.categoria || "Ração")
    }
  }

  async function salvarCusto(e) {
    e.preventDefault()
    setLoading(true)

    if (tipoCusto === "estoque") {
      if (!itemEstoque) {
        alert("Selecione um produto do estoque.")
        setLoading(false)
        return
      }

      if (!editando && Number(quantidadeBaixa) > Number(itemEstoque.quantidade)) {
        alert("Quantidade maior que o saldo em estoque.")
        setLoading(false)
        return
      }
    }

    const payload = {
      user_id: user.id,
      tipo_custo: tipoCusto,
      categoria,
      descricao,
      tanque,
      data_custo: dataCusto,
      estoque_id: tipoCusto === "estoque" ? estoqueId : null,
      quantidade_baixa:
        tipoCusto === "estoque" ? Number(quantidadeBaixa) : 0,
      peso_total_baixa:
        tipoCusto === "estoque" ? Number(pesoTotalBaixa) : 0,
      quantidade_racao:
        categoria === "Ração" ? Number(pesoTotalBaixa) : 0,
      valor_unitario:
        tipoCusto === "estoque"
          ? Number(itemEstoque?.valor_unitario || 0)
          : Number(valorManual || 0),
      valor: Number(valorTotal),
      valor_total: Number(valorTotal),
    }

    const query = editando
      ? supabase.from("custos").update(payload).eq("id", editando)
      : supabase.from("custos").insert([payload])

    const { error } = await query

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (tipoCusto === "estoque" && !editando) {
      const novoSaldo =
        Number(itemEstoque.quantidade || 0) -
        Number(quantidadeBaixa || 0)

      const novoPesoTotal =
        novoSaldo *
        Number(itemEstoque.peso_embalagem || 0)

      if (novoSaldo <= 0) {
        await supabase
          .from("estoque")
          .delete()
          .eq("id", estoqueId)
      } else {
        await supabase
          .from("estoque")
          .update({
            quantidade: novoSaldo,
            peso_total: novoPesoTotal,
          })
          .eq("id", estoqueId)
      }
    }

    limpar()
    await carregarDados()
    setLoading(false)

    alert(editando ? "Custo atualizado!" : "Custo salvo com sucesso!")
  }

  function editar(item) {
    setEditando(item.id)
    setTipoCusto(item.tipo_custo || "estoque")
    setCategoria(item.categoria || "Ração")
    setDescricao(item.descricao || "")
    setTanque(item.tanque || "")
    setDataCusto(item.data_custo || "")
    setEstoqueId(item.estoque_id || "")
    setQuantidadeBaixa(item.quantidade_baixa || "")
    setValorManual(item.valor_total || item.valor || "")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function limpar() {
    setEditando(null)
    setTipoCusto("estoque")
    setCategoria("Ração")
    setDescricao("")
    setTanque("")
    setDataCusto("")
    setEstoqueId("")
    setQuantidadeBaixa("")
    setValorManual("")
  }

  async function excluir(item) {
    if (!confirm("Excluir custo?")) return

    if (item.tipo_custo === "estoque" && item.estoque_id) {
      const { data: produtoEstoque } = await supabase
        .from("estoque")
        .select("*")
        .eq("id", item.estoque_id)
        .maybeSingle()

      const quantidadeVoltar =
        Number(item.quantidade_baixa || 0)

      const pesoVoltar =
        Number(item.peso_total_baixa || 0)

      const pesoEmbalagem =
        quantidadeVoltar > 0
          ? pesoVoltar / quantidadeVoltar
          : 0

      if (produtoEstoque) {
        const novoSaldo =
          Number(produtoEstoque.quantidade || 0) +
          quantidadeVoltar

        const novoPesoTotal =
          novoSaldo *
          Number(produtoEstoque.peso_embalagem || pesoEmbalagem || 0)

        await supabase
          .from("estoque")
          .update({
            quantidade: novoSaldo,
            peso_total: novoPesoTotal,
          })
          .eq("id", item.estoque_id)
      } else {
        await supabase
          .from("estoque")
          .insert([
            {
              id: item.estoque_id,
              user_id: user.id,
              produto: item.descricao,
              categoria: item.categoria,
              quantidade: quantidadeVoltar,
              peso_embalagem: pesoEmbalagem,
              peso_total: pesoVoltar,
              unidade: "sacos",
              valor_unitario: Number(item.valor_unitario || 0),
              valor_total:
                quantidadeVoltar *
                Number(item.valor_unitario || 0),
              data_entrada: item.data_custo,
            },
          ])
      }
    }

    const { error } = await supabase
      .from("custos")
      .delete()
      .eq("id", item.id)

    if (error) {
      alert(error.message)
      return
    }

    carregarDados()
  }

  useEffect(() => {
    if (user) carregarDados()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">💰 Custos</h1>
        <p className="text-gray-500 mt-1">
          Baixa de estoque e outros custos da produção
        </p>
      </div>

      <form
        onSubmit={salvarCusto}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="font-bold">Tipo de Custo</label>
          <select
            value={tipoCusto}
            onChange={(e) => setTipoCusto(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="estoque">Baixa do Estoque</option>
            <option value="manual">Outro Custo</option>
          </select>
        </div>

        <div>
          <label className="font-bold">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          >
            <option value="Ração">Ração</option>
            <option value="Medicamento">Medicamento</option>
            <option value="Energia">Energia</option>
            <option value="Funcionários">Funcionários</option>
            <option value="Equipamentos">Equipamentos</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        {tipoCusto === "estoque" && (
          <div>
            <label className="font-bold">Produto do Estoque</label>
            <select
              value={estoqueId}
              onChange={(e) => selecionarProduto(e.target.value)}
              className="w-full border p-3 rounded-xl mt-2"
              required
            >
              <option value="">Selecione</option>

              {estoque.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.produto} — {item.quantidade} sacos
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="font-bold">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        {tipoCusto === "estoque" && (
          <>
            <div>
              <label className="font-bold">
                Quantidade de Sacos para Baixa
              </label>
              <input
                type="number"
                step="0.01"
                value={quantidadeBaixa}
                onChange={(e) => setQuantidadeBaixa(e.target.value)}
                className="w-full border p-3 rounded-xl mt-2"
                required
              />
            </div>

            <div>
              <label className="font-bold">Peso Total da Baixa</label>
              <input
                type="text"
                readOnly
                value={`${pesoTotalBaixa.toFixed(2)} kg`}
                className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="font-bold">Valor Total</label>
              <input
                type="text"
                readOnly
                value={`R$ ${moeda(valorEstoque)}`}
                className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold text-green-700"
              />
            </div>
          </>
        )}

        {tipoCusto === "manual" && (
          <div>
            <label className="font-bold">Valor do Custo</label>
            <input
              type="number"
              step="0.01"
              value={valorManual}
              onChange={(e) => setValorManual(e.target.value)}
              className="w-full border p-3 rounded-xl mt-2"
              required
            />
          </div>
        )}

        <div>
          <label className="font-bold">Tanque</label>
          <select
            value={tanque}
            onChange={(e) => setTanque(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="">Geral / Sem tanque</option>

            {tanques.map((item, index) => (
              <option key={index} value={item.nome}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold">Data</label>
          <input
            type="date"
            value={dataCusto}
            onChange={(e) => setDataCusto(e.target.value)}
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
        <h2 className="text-2xl font-bold mb-4">📋 Histórico</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Categoria</th>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-left">Tanque</th>
              <th className="p-3 text-left">Baixa</th>
              <th className="p-3 text-left">Peso</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{item.data_custo}</td>
                <td className="p-3">{item.tipo_custo}</td>
                <td className="p-3">{item.categoria}</td>
                <td className="p-3">{item.descricao}</td>
                <td className="p-3">{item.tanque || "-"}</td>
                <td className="p-3">
                  {Number(item.quantidade_baixa || 0).toFixed(2)} sacos
                </td>
                <td className="p-3">
                  {Number(item.peso_total_baixa || 0).toFixed(2)} kg
                </td>
                <td className="p-3 font-bold text-green-700">
                  R$ {moeda(item.valor_total || item.valor)}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => editar(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => excluir(item)}
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