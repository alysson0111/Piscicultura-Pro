import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Parametros({ user }) {
  const [tanques, setTanques] = useState([])
  const [dados, setDados] = useState([])

  const [tanque, setTanque] = useState("")
  const [dataMedicao, setDataMedicao] = useState("")
  const [amonia, setAmonia] = useState("")
  const [nitrito, setNitrito] = useState("")
  const [nitrato, setNitrato] = useState("")
  const [dureza, setDureza] = useState("")
  const [ph, setPh] = useState("")
  const [temperatura, setTemperatura] = useState("")
  const [oxigenio, setOxigenio] = useState("")
  const [outros, setOutros] = useState("")

  const [loading, setLoading] = useState(false)
  const [editando, setEditando] = useState(null)

  function formatar(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

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

      const { data: parametros, error } = await supabase
        .from("parametros")
        .select("*")
        .eq("user_id", user.id)
        .order("data_medicao", { ascending: false })

      if (error) {
        console.log(error)
        setDados([])
        return
      }

      setDados(parametros || [])
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
      data_medicao: dataMedicao,
      amonia: Number(amonia || 0),
      nitrito: Number(nitrito || 0),
      nitrato: Number(nitrato || 0),
      dureza: Number(dureza || 0),
      ph: Number(ph || 0),
      temperatura: Number(temperatura || 0),
      oxigenio_dissolvido: Number(oxigenio || 0),
      outros,
    }

    const query = editando
      ? supabase
          .from("parametros")
          .update(payload)
          .eq("id", editando)
      : supabase
          .from("parametros")
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

    alert(editando ? "Parâmetros atualizados!" : "Parâmetros salvos!")
  }

  function editar(item) {
    setEditando(item.id)
    setTanque(item.tanque || "")
    setDataMedicao(item.data_medicao || "")
    setAmonia(item.amonia || "")
    setNitrito(item.nitrito || "")
    setNitrato(item.nitrato || "")
    setDureza(item.dureza || "")
    setPh(item.ph || "")
    setTemperatura(item.temperatura || "")
    setOxigenio(item.oxigenio_dissolvido || "")
    setOutros(item.outros || "")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  function limpar() {
    setEditando(null)
    setTanque("")
    setDataMedicao("")
    setAmonia("")
    setNitrito("")
    setNitrato("")
    setDureza("")
    setPh("")
    setTemperatura("")
    setOxigenio("")
    setOutros("")
  }

  async function excluir(id) {
    if (!confirm("Excluir parâmetros?")) return

    const { error } = await supabase
      .from("parametros")
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
        <h1 className="text-3xl font-bold">Parâmetros</h1>
        <p className="text-gray-500 mt-1">
          Controle dos parâmetros de qualidade da água
        </p>
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
          <label className="font-bold">Data</label>
          <input
            type="date"
            value={dataMedicao}
            onChange={(e) => setDataMedicao(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            required
          />
        </div>

        <div>
          <label className="font-bold">Amônia</label>
          <input
            type="number"
            step="0.01"
            value={amonia}
            onChange={(e) => setAmonia(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="mg/L"
          />
        </div>

        <div>
          <label className="font-bold">Nitrito</label>
          <input
            type="number"
            step="0.01"
            value={nitrito}
            onChange={(e) => setNitrito(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="mg/L"
          />
        </div>

        <div>
          <label className="font-bold">Nitrato</label>
          <input
            type="number"
            step="0.01"
            value={nitrato}
            onChange={(e) => setNitrato(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="mg/L"
          />
        </div>

        <div>
          <label className="font-bold">Dureza</label>
          <input
            type="number"
            step="0.01"
            value={dureza}
            onChange={(e) => setDureza(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="mg/L"
          />
        </div>

        <div>
          <label className="font-bold">pH</label>
          <input
            type="number"
            step="0.01"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Ex: 7.20"
          />
        </div>

        <div>
          <label className="font-bold">Temperatura</label>
          <input
            type="number"
            step="0.01"
            value={temperatura}
            onChange={(e) => setTemperatura(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="°C"
          />
        </div>

        <div>
          <label className="font-bold">Oxigênio dissolvido</label>
          <input
            type="number"
            step="0.01"
            value={oxigenio}
            onChange={(e) => setOxigenio(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="mg/L"
          />
        </div>

        <div className="md:col-span-2">
          <label className="font-bold">Outros</label>
          <input
            type="text"
            value={outros}
            onChange={(e) => setOutros(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Observações ou outros parâmetros"
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
          Parâmetros registrados
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tanque</th>
              <th className="p-3 text-left">Amônia</th>
              <th className="p-3 text-left">Nitrito</th>
              <th className="p-3 text-left">Nitrato</th>
              <th className="p-3 text-left">Dureza</th>
              <th className="p-3 text-left">pH</th>
              <th className="p-3 text-left">Temperatura</th>
              <th className="p-3 text-left">Oxigênio</th>
              <th className="p-3 text-left">Outros</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{dataBR(item.data_medicao)}</td>
                <td className="p-3 font-bold">{item.tanque}</td>
                <td className="p-3">{formatar(item.amonia)}</td>
                <td className="p-3">{formatar(item.nitrito)}</td>
                <td className="p-3">{formatar(item.nitrato)}</td>
                <td className="p-3">{formatar(item.dureza)}</td>
                <td className="p-3 font-bold text-blue-700">
                  {formatar(item.ph)}
                </td>
                <td className="p-3">
                  {formatar(item.temperatura)} °C
                </td>
                <td className="p-3">
                  {formatar(item.oxigenio_dissolvido)} mg/L
                </td>
                <td className="p-3 min-w-[220px]">{item.outros || "-"}</td>
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
