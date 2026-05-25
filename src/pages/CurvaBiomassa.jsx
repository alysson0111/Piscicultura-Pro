import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

import {
  useEffect,
  useState,
} from "react"

import { supabase }
from "../lib/supabase"

export default function CurvaBiomassa({
  user,
}) {

  const [dados, setDados] =
    useState([])

  const [tanques, setTanques] =
    useState([])

  const [
    tanqueSelecionado,
    setTanqueSelecionado,
  ] = useState("todos")

  async function carregarDados() {

    try {

      const {
        data: biometrias,
        error,
      } = await supabase
        .from("biometria")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "data_biometria",
          {
            ascending: true,
          }
        )

      if (error) {
        console.log(error)
        return
      }

      const {
        data: dadosTanques,
        error: erroTanques,
      } = await supabase
        .from("tanques")
        .select("nome")
        .eq(
          "user_id",
          user.id
        )

      if (erroTanques) {
        console.log(erroTanques)
        return
      }

      const nomesTanques =
        dadosTanques?.map(
          (item) => item.nome
        ) || []

      setTanques(nomesTanques)

      const lista =
        biometrias || []

      const filtrado =
        tanqueSelecionado === "todos"
          ? lista
          : lista.filter(
              (item) =>
                item.tanque ===
                tanqueSelecionado
            )

      const formatado =
        filtrado.map((item, index) => {

          const peso =
            Number(
              item.peso_medio || 0
            )

          const quantidade =
            Number(
              item.quantidade || 0
            )

          const biomassa =
            quantidade > 0
              ? (
                  quantidade *
                  peso
                ) / 1000
              : Number(
                  item.biomassa || 0
                )

          const anterior =
            filtrado[index - 1]

          const pesoAnterior =
            anterior
              ? Number(
                  anterior.peso_medio || 0
                )
              : peso

          const ganhoPeso =
            peso - pesoAnterior

          return {
            data:
              item.data_biometria,

            tanque:
              item.tanque || "-",

            peso,

            biomassa,

            ganho:
              ganhoPeso > 0
                ? ganhoPeso
                : 0,
          }
        })

      setDados(formatado)

    } catch (erro) {
      console.log(erro)
    }
  }

  useEffect(() => {
    if (user) {
      carregarDados()
    }
  }, [user, tanqueSelecionado])

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold">
            📈 Curva de Biomassa
          </h1>

          <p className="text-gray-500 mt-1">
            Evolução do peso, biomassa e ganho de peso
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow min-w-[250px]">

          <label className="font-bold">
            Selecionar Tanque
          </label>

          <select
            value={tanqueSelecionado}
            onChange={(e) =>
              setTanqueSelecionado(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
          >

            <option value="todos">
              Todos os Tanques
            </option>

            {tanques.map(
              (tanque, index) => (
                <option
                  key={index}
                  value={tanque}
                >
                  {tanque}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {dados.length === 0 && (
        <div className="bg-yellow-100 p-6 rounded-2xl">
          <p className="font-bold">
            Nenhuma biometria encontrada.
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow">

        <div className="h-[500px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart data={dados}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="data" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="peso"
                name="Peso Médio (g)"
                stroke="#2563eb"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="biomassa"
                name="Biomassa (kg)"
                stroke="#16a34a"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="ganho"
                name="Ganho de Peso (g)"
                stroke="#f59e0b"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

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
                Peso Médio
              </th>

              <th className="p-3 text-left">
                Ganho Peso
              </th>

              <th className="p-3 text-left">
                Biomassa
              </th>

            </tr>
          </thead>

          <tbody>
            {dados.map(
              (item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-3">
                    {item.data}
                  </td>

                  <td className="p-3">
                    {item.tanque}
                  </td>

                  <td className="p-3">
                    {Number(
                      item.peso
                    ).toFixed(2)} g
                  </td>

                  <td className="p-3 font-bold text-orange-600">
                    {Number(
                      item.ganho
                    ).toFixed(2)} g
                  </td>

                  <td className="p-3 font-bold text-green-700">
                    {Number(
                      item.biomassa
                    ).toFixed(2)} kg
                  </td>

                </tr>
              )
            )}
          </tbody>

        </table>

      </div>

    </div>
  )
}