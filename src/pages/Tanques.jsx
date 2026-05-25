import {
  useEffect,
  useState,
} from "react"

import { supabase }
from "../lib/supabase"

export default function Tanques({
  user,
}) {

  // STATES
  const [nome, setNome] =
    useState("")

  const [tipo, setTipo] =
    useState("")

  const [produto, setProduto] =
    useState("Tilápia")

  const [volume, setVolume] =
    useState("")

  const [quantidade, setQuantidade] =
    useState("")

  const [peso, setPeso] =
    useState("")

  const [densidade, setDensidade] =
    useState(0)

  const [status, setStatus] =
    useState("Ativo")

  const [dados, setDados] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [editando, setEditando] =
    useState(null)

  // 🔥 CALCULAR DENSIDADE
  function calcularDensidade(
    qtd,
    pesoMedio,
    volumeTanque
  ) {

    const quantidadePeixes =
      Number(qtd || 0)

    const pesoPeixe =
      Number(pesoMedio || 0)

    const volume =
      Number(volumeTanque || 0)

    if (
      quantidadePeixes <= 0 ||
      pesoPeixe <= 0 ||
      volume <= 0
    ) {
      return 0
    }

    // 🔥 BIOMASSA TOTAL
    const biomassaKg =
      (
        quantidadePeixes *
        pesoPeixe
      ) / 1000

    // 🔥 DENSIDADE
    return (
      biomassaKg / volume
    ).toFixed(2)
  }

  // 🔥 CARREGAR
  async function carregarDados() {

    try {

      const {
        data,
        error,
      } = await supabase
        .from("tanques")
        .select("*")
        .eq(
          "user_id",
          user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )

      if (error) {

        console.log(error)

        return
      }

      setDados(data || [])

    } catch (erro) {

      console.log(erro)

    }
  }

  // 🔥 SALVAR
  async function salvarTanque(
    e
  ) {

    e.preventDefault()

    try {

      setLoading(true)

      const densidadeCalculada =
        calcularDensidade(
          quantidade,
          peso,
          volume
        )

      // 🔥 EDITAR
      if (editando) {

        const {
          error,
        } = await supabase
          .from("tanques")
          .update({

            nome,

            tipo,

            produto,

            volume:
              Number(volume),

            quantidade:
              Number(quantidade),

            peso:
              Number(peso),

            densidade:
              Number(
                densidadeCalculada
              ),

            status,

          })
          .eq(
            "id",
            editando
          )

        if (error) {

          console.log(error)

          alert(
            error.message
          )

          return
        }

        alert(
          "Tanque atualizado!"
        )

      }

      // 🔥 NOVO
      else {

        const {
          error,
        } = await supabase
          .from("tanques")
          .insert([
            {

              user_id:
                user.id,

              nome,

              tipo,

              produto,

              volume:
                Number(volume),

              quantidade:
                Number(quantidade),

              peso:
                Number(peso),

              densidade:
                Number(
                  densidadeCalculada
                ),

              status,

            },
          ])

        if (error) {

          console.log(error)

          alert(
            error.message
          )

          return
        }

        alert(
          "Tanque salvo!"
        )

      }

      limparFormulario()

      carregarDados()

    } catch (erro) {

      console.log(erro)

    } finally {

      setLoading(false)

    }
  }

  // 🔥 EDITAR
  function editarTanque(
    item
  ) {

    setEditando(item.id)

    setNome(item.nome)

    setTipo(item.tipo)

    setProduto(
      item.produto
    )

    setVolume(item.volume)

    setQuantidade(
      item.quantidade
    )

    setPeso(
      item.peso
    )

    setDensidade(
      item.densidade
    )

    setStatus(item.status)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // 🔥 LIMPAR
  function limparFormulario() {

    setEditando(null)

    setNome("")

    setTipo("")

    setProduto(
      "Tilápia"
    )

    setVolume("")

    setQuantidade("")

    setPeso("")

    setDensidade(0)

    setStatus("Ativo")
  }

  // 🔥 EXCLUIR
  async function excluir(
    id
  ) {

    const confirmar =
      confirm(
        "Excluir tanque?"
      )

    if (!confirmar)
      return

    try {

      const {
        error,
      } = await supabase
        .from("tanques")
        .delete()
        .eq("id", id)

      if (error) {

        console.log(error)

        return
      }

      carregarDados()

    } catch (erro) {

      console.log(erro)

    }
  }

  useEffect(() => {

    if (user) {

      carregarDados()

    }

  }, [user])

  // 🔥 AUTO DENSIDADE
  useEffect(() => {

    const resultado =
      calcularDensidade(
        quantidade,
        peso,
        volume
      )

    setDensidade(resultado)

  }, [
    quantidade,
    peso,
    volume,
  ])

  return (

    <div className="space-y-6">

      {/* TOPO */}
      <div>

        <h1 className="text-3xl font-bold">
          🐟 Tanques
        </h1>

        <p className="text-gray-500 mt-1">
          Controle dos tanques da fazenda
        </p>

      </div>

      {/* FORM */}
      <form
        onSubmit={salvarTanque}
        className="bg-white p-6 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >

        {/* NOME */}
        <div>

          <label className="font-bold">
            Nome do Tanque
          </label>

          <input
            type="text"
            value={nome}
            onChange={(e) =>
              setNome(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            placeholder="Tanque 01"
            required
          />

        </div>

        {/* TIPO */}
        <div>

          <label className="font-bold">
            Tipo
          </label>

          <select
            value={tipo}
            onChange={(e) =>
              setTipo(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          >

            <option value="">
              Selecione
            </option>

            <option value="Escavado">
              Escavado
            </option>

            <option value="Geomembrana">
              Geomembrana
            </option>

            <option value="Circular">
              Circular
            </option>

            <option value="Raceway">
              Raceway
            </option>

            <option value="Caixa d'água">
              Caixa d'água
            </option>

            <option value="Alumínio">
              Alumínio
            </option>

            <option value="Ferrocimento">
              Ferrocimento
            </option>

          </select>

        </div>

        {/* PRODUTO */}
        <div>

          <label className="font-bold">
            Produto
          </label>

          <select
            value={produto}
            onChange={(e) =>
              setProduto(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
          >

            <option value="Tilápia">
              Tilápia
            </option>

            <option value="Tambaqui">
              Tambaqui
            </option>

            <option value="Lambari">
              Lambari
            </option>

            <option value="Pirarucu">
              Pirarucu
            </option>

            <option value="Outros">
              Outros
            </option>

          </select>

        </div>

        {/* VOLUME */}
        <div>

          <label className="font-bold">
            Volume (m³)
          </label>

          <input
            type="number"
            step="0.01"
            value={volume}
            onChange={(e) =>
              setVolume(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        {/* QUANTIDADE */}
        <div>

          <label className="font-bold">
            Quantidade de Peixes
          </label>

          <input
            type="number"
            value={quantidade}
            onChange={(e) =>
              setQuantidade(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        {/* PESO */}
        <div>

          <label className="font-bold">
            Peso Médio (g)
          </label>

          <input
            type="number"
            step="0.01"
            value={peso}
            onChange={(e) =>
              setPeso(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
            required
          />

        </div>

        {/* DENSIDADE */}
        <div>

          <label className="font-bold">
            Densidade Atual
          </label>

          <input
            type="number"
            value={densidade}
            readOnly
            className="w-full border p-3 rounded-xl mt-2 bg-slate-100 font-bold"
          />

        </div>

        {/* STATUS */}
        <div>

          <label className="font-bold">
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="w-full border p-3 rounded-xl mt-2"
          >

            <option value="Ativo">
              Ativo
            </option>

            <option value="Em manutenção">
              Em manutenção
            </option>

            <option value="Desativado">
              Desativado
            </option>

          </select>

        </div>

        {/* BOTÕES */}
        <div className="flex items-end gap-2">

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl"
          >

            {loading
              ? "Salvando..."
              : editando
              ? "Atualizar"
              : "Salvar"}

          </button>

          {editando && (

            <button
              type="button"
              onClick={
                limparFormulario
              }
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold p-3 rounded-xl"
            >
              Cancelar
            </button>

          )}

        </div>

      </form>

      {/* TABELA */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-auto">

        <h2 className="text-2xl font-bold mb-4">
          📋 Tanques Cadastrados
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b bg-slate-100">

              <th className="p-3 text-left">
                Nome
              </th>

              <th className="p-3 text-left">
                Tipo
              </th>

              <th className="p-3 text-left">
                Produto
              </th>

              <th className="p-3 text-left">
                Volume
              </th>

              <th className="p-3 text-left">
                Quantidade
              </th>

              <th className="p-3 text-left">
                Peso
              </th>

              <th className="p-3 text-left">
                Densidade
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {dados.map((item) => (

              <tr
                key={item.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-3 font-bold">
                  {item.nome}
                </td>

                <td className="p-3">
                  {item.tipo}
                </td>

                <td className="p-3">
                  {item.produto}
                </td>

                <td className="p-3">
                  {Number(
                    item.volume || 0
                  ).toFixed(2)} m³
                </td>

                <td className="p-3">
                  {item.quantidade}
                </td>

                <td className="p-3">
                  {Number(
                    item.peso || 0
                  ).toFixed(2)} g
                </td>

                <td className="p-3 font-bold text-blue-700">
                  {Number(
                    item.densidade || 0
                  ).toFixed(2)} kg/m³
                </td>

                <td className="p-3">

                  {item.status ===
                  "Ativo" ? (

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl font-bold">
                      Ativo
                    </span>

                  ) : item.status ===
                    "Em manutenção" ? (

                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl font-bold">
                      Manutenção
                    </span>

                  ) : (

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl font-bold">
                      Desativado
                    </span>

                  )}

                </td>

                <td className="p-3">

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        editarTanque(
                          item
                        )
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        excluir(
                          item.id
                        )
                      }
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