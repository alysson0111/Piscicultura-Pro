import {
  useEffect,
  useState,
} from "react"

import { supabase }
from "../lib/supabase"

export default function PrevisaoAbate({
  user,
}) {

  const [dados, setDados] =
    useState([])

  // 🔥 PESO META ABATE
  const PESO_ABATE = 900

  // 🔥 CARREGAR DADOS
  async function carregarDados() {

    try {

      // 🔥 LOTES
      const {
        data: lotes,
        error: erroLotes,
      } = await supabase
        .from("lotes")
        .select("*")
        .eq(
          "user_id",
          user.id
        )

      // 🔥 BIOMETRIA
      const {
        data: biometrias,
        error: erroBiometria,
      } = await supabase
        .from("biometria")
        .select("*")
        .eq(
          "user_id",
          user.id
        )

      if (erroLotes) {

        console.log(
          erroLotes
        )

        return
      }

      if (erroBiometria) {

        console.log(
          erroBiometria
        )

        return
      }

      if (
        !lotes ||
        !biometrias
      ) {

        setDados([])

        return
      }

      // 🔥 PROCESSAR
      const resultado =
        lotes.map((lote) => {

          // 🔥 PEGAR BIOMETRIAS DO TANQUE
          const biometriaTanque =
            biometrias
              .filter(
                (b) =>
                  b.tanque ===
                  lote.tanque
              )
              .sort(
                (a, b) =>

                  new Date(
                    b.data_biometria
                  ) -

                  new Date(
                    a.data_biometria
                  )

              )

          // 🔥 SEM BIOMETRIA
          if (
            biometriaTanque.length === 0
          ) {

            return {

              ...lote,

              peso_atual: 0,

              crescimento: 0,

              dias_restantes: 0,

              previsao: "-",

              biomassa_futura: 0,

            }
          }

          // 🔥 ÚLTIMA BIOMETRIA
          const ultima =
            biometriaTanque[0]

          // 🔥 DATAS
          const dataInicial =
            new Date(
              lote.data_povoamento
            )

          const dataAtual =
            new Date(
              ultima.data_biometria
            )

          // 🔥 DIAS CULTIVO
          const diasCultivo =
            Math.max(
              1,
              Math.floor(
                (
                  dataAtual -
                  dataInicial
                ) /
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
              )
            )

          // 🔥 PESOS
          const pesoInicial =
            Number(
              lote.peso_inicial || 0
            )

          const pesoAtual =
            Number(
              ultima.peso_medio || 0
            )

          // 🔥 CRESCIMENTO
          const crescimento =
            diasCultivo > 0
              ? (
                  pesoAtual -
                  pesoInicial
                ) / diasCultivo
              : 0

          // 🔥 DIAS RESTANTES
          const diasRestantes =
            crescimento > 0
              ? Math.ceil(
                  (
                    PESO_ABATE -
                    pesoAtual
                  ) / crescimento
                )
              : 0

          // 🔥 PREVISÃO
          const previsao =
            new Date()

          previsao.setDate(
            previsao.getDate() +
            diasRestantes
          )

          // 🔥 BIOMASSA FUTURA
          const biomassaFutura =
            (
              Number(
                lote.quantidade_inicial || 0
              ) *
              PESO_ABATE
            ) / 1000

          return {

            ...lote,

            peso_atual:
              pesoAtual,

            crescimento,

            dias_restantes:
              diasRestantes,

            previsao:
              previsao
                .toISOString()
                .split("T")[0],

            biomassa_futura:
              biomassaFutura,

          }

        })

      setDados(resultado)

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

      {/* TÍTULO */}
      <div>

        <h1 className="text-3xl font-bold">
          🔮 Previsão de Abate
        </h1>

        <p className="text-gray-500 mt-2">
          Estimativa baseada no crescimento
        </p>

      </div>

      {/* SEM DADOS */}
      {dados.length === 0 && (

        <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-2xl">

          <p className="font-bold">
            Nenhum lote encontrado.
          </p>

        </div>

      )}

      {/* LISTA */}
      <div className="space-y-4">

        {dados.map((item) => (

          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >

            {/* TOPO */}
            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-bold">
                  {item.nome_lote}
                </h2>

                <p className="text-gray-500">
                  Tanque:
                  {" "}
                  {item.tanque}
                </p>

              </div>

            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">

              {/* PESO */}
              <div className="bg-blue-100 p-4 rounded-xl">

                <p className="text-sm text-blue-700">
                  Peso Atual
                </p>

                <h3 className="text-xl font-bold text-blue-700">
                  {Number(
                    item.peso_atual || 0
                  ).toFixed(2)} g
                </h3>

              </div>

              {/* CRESCIMENTO */}
              <div className="bg-green-100 p-4 rounded-xl">

                <p className="text-sm text-green-700">
                  Crescimento
                </p>

                <h3 className="text-xl font-bold text-green-700">
                  {Number(
                    item.crescimento || 0
                  ).toFixed(2)} g/dia
                </h3>

              </div>

              {/* DIAS */}
              <div className="bg-yellow-100 p-4 rounded-xl">

                <p className="text-sm text-yellow-700">
                  Dias Restantes
                </p>

                <h3 className="text-xl font-bold text-yellow-700">
                  {item.dias_restantes}
                </h3>

              </div>

              {/* PREVISÃO */}
              <div className="bg-purple-100 p-4 rounded-xl">

                <p className="text-sm text-purple-700">
                  Data Prevista
                </p>

                <h3 className="text-xl font-bold text-purple-700">
                  {item.previsao}
                </h3>

              </div>

              {/* BIOMASSA */}
              <div className="bg-red-100 p-4 rounded-xl">

                <p className="text-sm text-red-700">
                  Biomassa Futura
                </p>

                <h3 className="text-xl font-bold text-red-700">
                  {Number(
                    item.biomassa_futura || 0
                  ).toFixed(2)} kg
                </h3>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}