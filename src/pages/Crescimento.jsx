import {
  useEffect,
  useState,
} from "react"

import { supabase }
from "../lib/supabase"

export default function Crescimento({
  user,
}) {

  const [dados, setDados] =
    useState([])

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

      // LOTES
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

      // BIOMETRIA
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

      // SEGURANÇA
      const listaLotes =
        lotes?.filter(
          (lote) =>
            nomesTanques.includes(
              lote.tanque
            )
        ) || []

      const listaBiometrias =
        biometrias || []

      const resultado =
        listaLotes.map(
          (lote) => {

            // ÚLTIMA BIOMETRIA
            const biometria =
              listaBiometrias
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
                )[0]

            // SEM BIOMETRIA
            if (!biometria) {

              return {

                ...lote,

                peso_atual: 0,

                crescimento: 0,

                dias: 0,

              }
            }

            // DATAS
            const inicio =
              new Date(
                lote.data_povoamento
              )

            const atual =
              new Date(
                biometria.data_biometria
              )

            // DIAS
            const dias =
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

            // PESOS
            const pesoInicial =
              Number(
                lote.peso_inicial || 0
              )

            const pesoAtual =
              Number(
                biometria.peso_medio || 0
              )

            // CRESCIMENTO
            const crescimento =
              (
                pesoAtual -
                pesoInicial
              ) / dias

            return {

              ...lote,

              peso_atual:
                pesoAtual,

              crescimento:
                crescimento > 0
                  ? crescimento
                  : 0,

              dias,

            }
          }
        )

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

      {/* LISTA */}
      <div className="space-y-4">

        {dados.map((item) => (

          <div
            key={item.id}
            className="bg-white p-6 rounded-2xl shadow"
          >

            <h2 className="text-2xl font-bold">
              {item.nome_lote || "Lote"}
            </h2>

            <p className="text-gray-500">
              Tanque:
              {" "}
              {item.tanque || "-"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

              <div className="bg-slate-100 p-4 rounded-xl">

                <p className="text-sm text-gray-500">
                  Peso Inicial
                </p>

                <h3 className="text-2xl font-bold">
                  {Number(
                    item.peso_inicial || 0
                  ).toFixed(2)} g
                </h3>

              </div>

              <div className="bg-blue-100 p-4 rounded-xl">

                <p className="text-sm text-blue-700">
                  Peso Atual
                </p>

                <h3 className="text-2xl font-bold text-blue-700">
                  {Number(
                    item.peso_atual || 0
                  ).toFixed(2)} g
                </h3>

              </div>

              <div className="bg-yellow-100 p-4 rounded-xl">

                <p className="text-sm text-yellow-700">
                  Dias
                </p>

                <h3 className="text-2xl font-bold text-yellow-700">
                  {item.dias || 0}
                </h3>

              </div>

              <div className="bg-green-100 p-4 rounded-xl">

                <p className="text-sm text-green-700">
                  Crescimento Diário
                </p>

                <h3 className="text-2xl font-bold text-green-700">
                  {Number(
                    item.crescimento || 0
                  ).toFixed(2)} g/dia
                </h3>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}
