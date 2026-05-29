import { useEffect, useState } from "react"

import { supabase } from "../lib/supabase"

export default function PrevisaoAbate({
  user,
}) {
  const [dados, setDados] =
    useState([])

  const PESO_ABATE = 900
  const MS_DIA = 1000 * 60 * 60 * 24

  function calcularBiomassaPorData(
    item,
    dataRetirada
  ) {
    const quantidade =
      Number(
        item.quantidade_lote ||
        item.quantidade ||
        item.quantidade_inicial ||
        0
      )

    if (!dataRetirada) {
      return {
        peso_futuro: PESO_ABATE,
        biomassa_futura:
          (
            quantidade *
            PESO_ABATE
          ) / 1000,
      }
    }

    const dataBase =
      new Date(
        item.data_base_previsao ||
        item.data_povoamento ||
        new Date()
      )

    const dataFinal =
      new Date(dataRetirada)

    const dias =
      Math.max(
        0,
        Math.floor(
          (
            dataFinal -
            dataBase
          ) / MS_DIA
        )
      )

    const pesoBase =
      Number(
        item.peso_atual ||
        item.peso_inicial ||
        0
      )

    const crescimento =
      Number(item.crescimento || 0)

    const pesoFuturo =
      Math.max(
        0,
        pesoBase +
        crescimento * dias
      )

    return {
      peso_futuro: pesoFuturo,
      biomassa_futura:
        (
          quantidade *
          pesoFuturo
        ) / 1000,
    }
  }

  function atualizarDataRetirada(
    id,
    dataRetirada
  ) {
    setDados((lista) =>
      lista.map((item) => {
        if (item.id !== id) {
          return item
        }

        const calculo =
          calcularBiomassaPorData(
            item,
            dataRetirada
          )

        return {
          ...item,
          data_prevista_retirada:
            dataRetirada,
          ...calculo,
        }
      })
    )
  }

  async function salvarDataRetirada(
    item
  ) {
    const { error } =
      await supabase
        .from("lotes")
        .update({
          data_prevista_retirada:
            item.data_prevista_retirada || null,
        })
        .eq("id", item.id)

    if (error) {
      alert(error.message)
      return
    }

    alert("Data prevista salva!")
  }

  async function carregarDados() {
    try {
      const {
        data: tanques,
      } = await supabase
        .from("tanques")
        .select("nome")
        .eq(
          "user_id",
          user.id
        )

      const nomesTanques =
        tanques?.map(
          (tanque) => tanque.nome
        ) || []

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
        console.log(erroLotes)
        return
      }

      if (erroBiometria) {
        console.log(erroBiometria)
        return
      }

      if (!lotes || !biometrias) {
        setDados([])
        return
      }

      const lotesValidos =
        lotes.filter(
          (lote) =>
            nomesTanques.includes(
              lote.tanque
            )
        )

      const resultado =
        lotesValidos.map((lote) => {
          const quantidadeLote =
            Number(
              lote.quantidade ||
              lote.quantidade_inicial ||
              0
            )

          const dataRetirada =
            lote.data_prevista_retirada || ""

          const biometriaTanque =
            biometrias
              .filter(
                (b) =>
                  b.tanque === lote.tanque
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

          if (biometriaTanque.length === 0) {
            const baseSemBiometria = {
              ...lote,
              quantidade_lote:
                quantidadeLote,
              peso_atual:
                Number(lote.peso_inicial || 0),
              crescimento: 0,
              data_base_previsao:
                lote.data_povoamento,
            }

            const calculo =
              calcularBiomassaPorData(
                baseSemBiometria,
                dataRetirada
              )

            return {
              ...baseSemBiometria,
              data_prevista_retirada:
                dataRetirada,
              peso_futuro:
                calculo.peso_futuro,
              dias_restantes: 0,
              previsao: "-",
              biomassa_futura:
                calculo.biomassa_futura,
            }
          }

          const ultima =
            biometriaTanque[0]

          const dataInicial =
            new Date(
              lote.data_povoamento
            )

          const dataAtual =
            new Date(
              ultima.data_biometria
            )

          const diasCultivo =
            Math.max(
              1,
              Math.floor(
                (
                  dataAtual -
                  dataInicial
                ) / MS_DIA
              )
            )

          const pesoInicial =
            Number(
              lote.peso_inicial || 0
            )

          const pesoAtual =
            Number(
              ultima.peso_medio || 0
            )

          const crescimento =
            diasCultivo > 0
              ? (
                  pesoAtual -
                  pesoInicial
                ) / diasCultivo
              : 0

          const diasRestantes =
            crescimento > 0
              ? Math.ceil(
                  (
                    PESO_ABATE -
                    pesoAtual
                  ) / crescimento
                )
              : 0

          const previsao =
            new Date()

          previsao.setDate(
            previsao.getDate() +
            diasRestantes
          )

          const baseComBiometria = {
            ...lote,
            quantidade_lote:
              quantidadeLote,
            peso_atual:
              pesoAtual,
            crescimento,
            data_base_previsao:
              ultima.data_biometria,
          }

          const calculo =
            calcularBiomassaPorData(
              baseComBiometria,
              dataRetirada
            )

          return {
            ...baseComBiometria,
            data_prevista_retirada:
              dataRetirada,
            peso_futuro:
              calculo.peso_futuro,
            dias_restantes:
              diasRestantes,
            previsao:
              previsao
                .toISOString()
                .split("T")[0],
            biomassa_futura:
              calculo.biomassa_futura,
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
      <div>
        <h1 className="text-3xl font-bold">
          Previsão de Abate
        </h1>

        <p className="text-gray-500 mt-2">
          Estimativa baseada no crescimento e na data prevista de retirada
        </p>
      </div>

      {dados.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-300 p-6 rounded-2xl">
          <p className="font-bold">
            Nenhum lote encontrado.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {dados.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {item.nome_lote}
                </h2>

                <p className="text-gray-500">
                  Tanque: {item.tanque}
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] lg:max-w-xl">
                <div>
                  <label className="font-bold">
                    Data prevista para retirada
                  </label>

                  <input
                    type="date"
                    value={
                      item.data_prevista_retirada || ""
                    }
                    onChange={(e) =>
                      atualizarDataRetirada(
                        item.id,
                        e.target.value
                      )
                    }
                    className="w-full border p-3 rounded-xl mt-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    salvarDataRetirada(item)
                  }
                  className="self-end bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
                >
                  Salvar data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 mt-5">
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

              <div className="bg-yellow-100 p-4 rounded-xl">
                <p className="text-sm text-yellow-700">
                  Dias Restantes
                </p>

                <h3 className="text-xl font-bold text-yellow-700">
                  {item.dias_restantes}
                </h3>
              </div>

              <div className="bg-purple-100 p-4 rounded-xl">
                <p className="text-sm text-purple-700">
                  Data da Retirada
                </p>

                <h3 className="text-xl font-bold text-purple-700">
                  {item.data_prevista_retirada || item.previsao}
                </h3>
              </div>

              <div className="bg-cyan-100 p-4 rounded-xl">
                <p className="text-sm text-cyan-700">
                  Peso na Retirada
                </p>

                <h3 className="text-xl font-bold text-cyan-700">
                  {Number(
                    item.peso_futuro || 0
                  ).toFixed(2)} g
                </h3>
              </div>

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
