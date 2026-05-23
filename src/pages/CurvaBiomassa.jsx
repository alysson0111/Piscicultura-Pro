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

import { supabase } from "../lib/supabase"

export default function CurvaBiomassa({
  user,
}) {

  const [dados, setDados] =
    useState([])

  async function carregarDados() {

    try {

      // 🔥 BIOMETRIA
      const {
        data: biometrias,
        error,
      } = await supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id)
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

      if (!biometrias) {
        setDados([])
        return
      }

      // 🔥 FORMATAR
      const formatado =
        biometrias.map((item) => {

          // BIOMASSA
          const biomassa =
            (
              Number(
                item.quantidade || 0
              ) *
              Number(
                item.peso_medio || 0
              )
            ) / 1000

          return {

            data:
              item.data_biometria,

            peso:
              Number(
                item.peso_medio || 0
              ),

            biomassa:
              biomassa,

            tanque:
              item.tanque,
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

  }, [user])

  return (

    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        📈 Curva de Biomassa
      </h1>

      {/* SEM DADOS */}
      {dados.length === 0 && (

        <div className="bg-yellow-100 p-6 rounded-2xl">

          <p className="font-bold">
            Nenhuma biometria encontrada.
          </p>

        </div>

      )}

      {/* GRÁFICO */}
      <div className="bg-white p-6 rounded-2xl shadow">

        <div className="h-[500px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={dados}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="data"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              {/* PESO */}
              <Line
                type="monotone"
                dataKey="peso"
                name="Peso Médio (g)"
                stroke="#2563eb"
                strokeWidth={3}
              />

              {/* BIOMASSA */}
              <Line
                type="monotone"
                dataKey="biomassa"
                name="Biomassa (kg)"
                stroke="#16a34a"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* TABELA */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left p-3">
                Data
              </th>

              <th className="text-left p-3">
                Tanque
              </th>

              <th className="text-left p-3">
                Peso Médio
              </th>

              <th className="text-left p-3">
                Biomassa
              </th>

            </tr>

          </thead>

          <tbody>

            {dados.map((item, index) => (

              <tr
                key={index}
                className="border-b"
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

                <td className="p-3">
                  {Number(
                    item.biomassa
                  ).toFixed(2)} kg
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}