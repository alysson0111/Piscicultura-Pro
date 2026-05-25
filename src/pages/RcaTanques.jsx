import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function RcaTanques({ user }) {
  const [dados, setDados] = useState([])
  const [tanques, setTanques] = useState([])
  const [tanqueSelecionado, setTanqueSelecionado] = useState("todos")

  function formatar(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  async function carregarDados() {
    try {
      const { data: tanquesData } = await supabase
        .from("tanques")
        .select("*")
        .eq("user_id", user.id)

      const { data: biometrias } = await supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id)

      const { data: custos } = await supabase
        .from("custos")
        .select("*")
        .eq("user_id", user.id)

      const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("user_id", user.id)

      const listaTanques = tanquesData || []
      const listaBiometrias = biometrias || []
      const listaCustos = custos || []
      const listaLotes = lotes || []

      setTanques(listaTanques)

      const tanquesFiltrados =
        tanqueSelecionado === "todos"
          ? listaTanques
          : listaTanques.filter(
              (t) =>
                String(t.nome || "").trim().toLowerCase() ===
                String(tanqueSelecionado || "").trim().toLowerCase()
            )

      const resultado = tanquesFiltrados.map((tanque) => {
        const nomeTanque = String(tanque.nome || "").trim().toLowerCase()

        const loteTanque = listaLotes
          .filter(
            (l) =>
              String(l.tanque || "").trim().toLowerCase() === nomeTanque
          )
          .sort(
            (a, b) =>
              new Date(b.data_povoamento) -
              new Date(a.data_povoamento)
          )[0]

        const biomassaInicial = Number(loteTanque?.biomassa || 0)

        const ultimaBiometria = listaBiometrias
          .filter(
            (b) =>
              String(b.tanque || "").trim().toLowerCase() === nomeTanque
          )
          .sort(
            (a, b) =>
              new Date(b.data_biometria) -
              new Date(a.data_biometria)
          )[0]

        const biomassaAtual = Number(ultimaBiometria?.biomassa || 0)

        const ganhoBiomassa =
          biomassaAtual - biomassaInicial > 0
            ? biomassaAtual - biomassaInicial
            : 0

        const racao = listaCustos
          .filter(
            (c) =>
              String(c.tanque || "").trim().toLowerCase() === nomeTanque &&
              String(c.categoria || "").trim().toLowerCase() === "ração"
          )
          .reduce(
            (acc, item) =>
              acc +
              Number(
                item.peso_total_baixa ||
                  item.quantidade_racao ||
                  0
              ),
            0
          )

        const rca =
          ganhoBiomassa > 0
            ? racao / ganhoBiomassa
            : 0

        return {
          tanque: tanque.nome,
          biomassaInicial,
          biomassaAtual,
          ganhoBiomassa,
          racao,
          rca,
        }
      })

      setDados(resultado)
    } catch (erro) {
      console.log(erro)
    }
  }

  useEffect(() => {
    if (user) carregarDados()
  }, [user, tanqueSelecionado])

  const biomassaTotal = dados.reduce(
    (acc, item) => acc + Number(item.biomassaAtual || 0),
    0
  )

  const racaoTotal = dados.reduce(
    (acc, item) => acc + Number(item.racao || 0),
    0
  )

  const ganhoTotal = dados.reduce(
    (acc, item) => acc + Number(item.ganhoBiomassa || 0),
    0
  )

  const rcaMedio =
    ganhoTotal > 0
      ? racaoTotal / ganhoTotal
      : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            🧮 RCA por Tanque
          </h1>

          <p className="text-gray-500 mt-2">
            Relação Conversão Alimentar
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow min-w-[260px]">
          <label className="font-bold">
            Selecionar Tanque
          </label>

          <select
            value={tanqueSelecionado}
            onChange={(e) => setTanqueSelecionado(e.target.value)}
            className="w-full border p-3 rounded-xl mt-2"
          >
            <option value="todos">
              Todos os Tanques
            </option>

            {tanques.map((tanque) => (
              <option key={tanque.id} value={tanque.nome}>
                {tanque.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-5 rounded-2xl shadow">
          <p className="text-blue-700">
            Biomassa Total
          </p>

          <h2 className="text-3xl font-bold text-blue-700 mt-2">
            {formatar(biomassaTotal)} kg
          </h2>
        </div>

        <div className="bg-green-100 p-5 rounded-2xl shadow">
          <p className="text-green-700">
            Ração Total
          </p>

          <h2 className="text-3xl font-bold text-green-700 mt-2">
            {formatar(racaoTotal)} kg
          </h2>
        </div>

        <div className="bg-purple-100 p-5 rounded-2xl shadow">
          <p className="text-purple-700">
            RCA Médio
          </p>

          <h2 className="text-3xl font-bold text-purple-700 mt-2">
            {formatar(rcaMedio)}
          </h2>
        </div>
      </div>

      {dados.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-2xl">
          <p className="font-bold">
            Nenhum dado encontrado.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-4 text-left">Tanque</th>
              <th className="p-4 text-left">Biomassa Inicial</th>
              <th className="p-4 text-left">Biomassa Atual</th>
              <th className="p-4 text-left">Ganho Biomassa</th>
              <th className="p-4 text-left">Ração</th>
              <th className="p-4 text-left">RCA</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item, index) => (
              <tr key={index} className="border-b hover:bg-slate-50">
                <td className="p-4 font-bold">{item.tanque}</td>

                <td className="p-4">
                  {formatar(item.biomassaInicial)} kg
                </td>

                <td className="p-4">
                  {formatar(item.biomassaAtual)} kg
                </td>

                <td className="p-4">
                  {formatar(item.ganhoBiomassa)} kg
                </td>

                <td className="p-4">
                  {formatar(item.racao)} kg
                </td>

                <td className="p-4 font-bold">
                  {formatar(item.rca)}
                </td>

                <td className="p-4">
                  {item.rca <= 1.5 && item.rca > 0 && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl font-bold">
                      Excelente
                    </span>
                  )}

                  {item.rca > 1.5 && item.rca <= 2 && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl font-bold">
                      Bom
                    </span>
                  )}

                  {item.rca > 2 && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl font-bold">
                      Alto
                    </span>
                  )}

                  {item.rca === 0 && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-bold">
                      Sem dados
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}