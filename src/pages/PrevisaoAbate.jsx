import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function PrevisaoAbate({
  user,
}) {

  const [dados, setDados] =
    useState([])

  const PESO_ABATE = 900

  async function carregarDados() {

    try {

      // 🔥 LOTES
      const {
        data: lotes,
        error: erroLotes,
      } = await supabase
        .from("lotes")
        .select("*")
        .eq("user_id", user.id)

      if (erroLotes) {
        console.log(erroLotes)
        return
      }

      // 🔥 BIOMETRIAS
      const {
        data: biometrias,
        error: erroBiometria,
      } = await supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id)

      if (erroBiometria) {
        console.log(erroBiometria)
        return
      }

      if (!lotes || !biometrias) {
        setDados([])
        return
      }

      // 🔥 PROCESSAR
      const resultado =
        lotes.map((lote) => {

          // 🔥 ÚLTIMA BIOMETRIA
          const biometria =
            biometrias
              .filter(
                (b) =>
                  b.tanque ===
                  lote.tanque
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.data_biometria || 0
                  ) -
                  new Date(
                    a.data_biometria || 0
                  )
              )[0]

          // 🔥 SEM BIOMETRIA
          if (!biometria) {

            return {
              ...lote,
              peso_atual: 0,
              crescimento: 0,
              dias_restantes: 0,
              previsao: "-",
              biomassa_futura: 0,
            }
          }

          // 🔥 DATAS
          const inicio =
            new Date(
              lote.data_povoamento
            )

          const atual =
            new Date(
              biometria.data_biometria
            )

          // 🔥 DIAS
          const diasCultivo =
            Math.max(
              1,
              Math.floor(
                (
                  atual -
                  inicio
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
              biometria.peso_medio || 0
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
          let diasRestantes = 0

          if (
            crescimento > 0 &&
            pesoAtual < PESO_ABATE
          ) {

            diasRestantes =
              Math.ceil(
                (
                  PESO_ABATE -
                  pesoAtual
                ) / crescimento
              )
          }

          // 🔥 DATA PREVISTA
          let previsao = "-"

          if (diasRestantes > 0) {

            const dataPrevista =
              new Date()

            dataPrevista.setDate(
              dataPrevista.getDate() +
              diasRestantes
            )

            previsao =
              dataPrevista
                .toISOString()
                .split("T")[0]
          }

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

            previsao,

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

      <h1 className="text-3xl font-bold">
        🔮 Previsão de Abate
      </h1>

      {/* SEM DADOS */}
      {dados.length === 0 && (

        <div className="bg-yellow-100 p-6 rounded-2xl">

          <p className="font-bold">
            Nenhum dado encontrado.
          </p>

          <p>
            Cadastre lotes e biometria.
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

            {/* CARDS */}
            <div className="grid grid-cols-5 gap-4 mt-5">

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