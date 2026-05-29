import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Lotes({ user }) {
  const [tanques, setTanques] = useState([])
  const [dados, setDados] = useState([])

  const [tipoLocal, setTipoLocal] = useState("tanque")
  const [tanque, setTanque] = useState("")
  const [outroLocal, setOutroLocal] = useState("")
  const [dataManutencao, setDataManutencao] = useState("")
  const [servicoExecutado, setServicoExecutado] = useState("")

  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  function dataBR(data) {
    if (!data) return "-"

    const [ano, mes, dia] = String(data).split("-")

    if (!ano || !mes || !dia) return data

    return `${dia}/${mes}/${ano}`
  }

  async function carregarDados() {
    try {
      const { data: dadosTanques } = await supabase
        .from("tanques")
        .select("nome")
        .eq("user_id", user.id)
        .order("nome", { ascending: true })

      setTanques(dadosTanques || [])

      const { data: manutencoes, error } = await supabase
        .from("manutencao")
        .select("*")
        .eq("user_id", user.id)
        .order("data_manutencao", { ascending: false })

      if (error) {
        console.log(error)
        setDados([])
        return
      }

      setDados(manutencoes || [])
    } catch (erro) {
      console.log(erro)
    }
  }

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    const local =
      tipoLocal === "tanque"
        ? tanque
        : outroLocal

    const payload = {
      user_id: user.id,
      tipo_local: tipoLocal,
      tanque: tipoLocal === "tanque" ? tanque : null,
      outro_local: tipoLocal === "outros" ? outroLocal : null,
      local,
      data_manutencao: dataManutencao,
      servico_executado: servicoExecutado,
    }

    const query = editando
      ? supabase
          .from("manutencao")
          .update(payload)
          .eq("id", editando)
      : supabase
          .from("manutencao")
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

    alert(editando ? "Manutenção atualizada!" : "Manutenção salva!")
  }

  function editar(item) {
    const tipo =
      item.tipo_local ||
      (item.tanque ? "tanque" : "outros")

    setEditando(item.id)
    setTipoLocal(tipo)
    setTanque(item.tanque || "")
    setOutroLocal(item.outro_local || item.local || "")
    setDataManutencao(item.data_manutencao || "")
    setServicoExecutado(item.servico_executado || "")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function limpar() {
    setEditando(null)
    setTipoLocal("tanque")
    setTanque("")
    setOutroLocal("")
    setDataManutencao("")
    setServicoExecutado("")
  }

  async function excluir(id) {
    if (!confirm("Excluir manutenção?")) return

    const { error } = await supabase
      .from("manutencao")
      .delete()
      .eq("id", id)

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
        <h1 className="text-3xl font-bold">Manutenção</h1>
        <p className="text-gray-500 mt-1">
          Registro de serviços executados nos tanques ou em outros pontos da operação
        </p>
      </div>

      <form
        onSubmit={salvar}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div>
          <label className="font-bold">Local</label>
          <select
            value={tipoLocal}
            onChange={(e) => {
              setTipoLocal(e.target.value)
              setTanque("")
              setOutroLocal("")
            }}
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="tanque">Tanque</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        {tipoLocal === "tanque" ? (
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
        ) : (
          <div>
            <label className="font-bold">Outro local</label>
            <input
              type="text"
              value={outroLocal}
              onChange={(e) => setOutroLocal(e.target.value)}
              className="w-full border p-3 rounded-xl mt-2"
              placeholder="Ex: bomba, filtro, galpão"
              required
            />
          </div>
        )}

        <div>
          <label className="font-bold">Data</label>
          <input
            type="date"
            value={dataManutencao}
            onChange={(e) => setDataManutencao(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="font-bold">Serviço executado</label>
          <textarea
            value={servicoExecutado}
            onChange={(e) => setServicoExecutado(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2 min-h-28"
            placeholder="Descreva o serviço realizado"
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
        <h2 className="text-2xl font-bold mb-4">
          Manutenções registradas
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Local</th>
              <th className="p-3 text-left">Serviço executado</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{dataBR(item.data_manutencao)}</td>
                <td className="p-3 font-bold">
                  {item.local || item.tanque || item.outro_local || "-"}
                </td>
                <td className="p-3 min-w-[320px]">
                  {item.servico_executado}
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
