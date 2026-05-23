import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Crescimento({
  user,
}) {

  const [dados, setDados] =
    useState([])

  // 🔥 CARREGAR
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

      // 🔥 BIOMETRIA
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

      // 🔥 PROCESSAR
      const resultado =
        lotes.map((lote) => {

          // PEGAR BIOMETRIA DO TANQUE
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
                    b.data_biometria || 0
                  ) -
                  new Date(
                    a.data_biometria || 0
                  )
              )[0]

          // SEM BIOMETRIA
          if (!biometriaTanque) {

            return {
              ...lote,
              peso_atual: 0,
              dias: 0,
              crescimento: 0,
            }
          }

          // 🔥 DATAS
          const dataInicial =
            new Date(
              lote.data_povoamento
            )

          const dataAtual =
            new Date(
              biometriaTanque.data_biometria
            )

          // 🔥 DIAS
          const dias =
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
              biometriaTanque.peso_medio || 0
            )

          // 🔥 CRESCIMENTO
          const crescimento =
            (
              pesoAtual -
              pesoInicial
            ) / dias

          return {
            ...lote,
            peso_atual:
              pesoAtual,
            dias,
            crescimento,
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
        📈 Crescimento Diário
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
            <div className="flex justify-between">

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
            <div className="grid grid-cols-5 gap-4 mt-5">

              {/* PESO INICIAL */}
              <div className="bg-slate-100 p-4 rounded-xl">

                <p className="text-sm text-gray-500">
                  Peso Inicial
                </p>

                <h3 className="text-xl font-bold">
                  {Number(
                    item.peso_inicial || 0
                  ).toFixed(2)} g
                </h3>

              </div>

              {/* PESO ATUAL */}
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

              {/* DIAS */}
              <div className="bg-slate-100 p-4 rounded-xl">

                <p className="text-sm text-gray-500">
                  Dias Cultivo
                </p>

                <h3 className="text-xl font-bold">
                  {item.dias}
                </h3>

              </div>

              {/* CRESCIMENTO */}
              <div className="bg-green-100 p-4 rounded-xl">

                <p className="text-sm text-green-700">
                  Crescimento Diário
                </p>

                <h3 className="text-xl font-bold text-green-700">
                  {Number(
                    item.crescimento || 0
                  ).toFixed(2)} g/dia
                </h3>

              </div>

              {/* FORNECEDOR */}
              <div className="bg-purple-100 p-4 rounded-xl">

                <p className="text-sm text-purple-700">
                  Fornecedor
                </p>

                <h3 className="text-xl font-bold text-purple-700">
                  {item.fornecedor}
                </h3>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}