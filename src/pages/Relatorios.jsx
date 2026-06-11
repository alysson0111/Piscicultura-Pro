import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export default function Relatorios({ user }) {
  const PESO_META = 900
  const MS_DIA = 1000 * 60 * 60 * 24

  const [tanqueSelecionado, setTanqueSelecionado] = useState("todos")
  const [tanques, setTanques] = useState([])
  const [biometrias, setBiometrias] = useState([])
  const [custosDetalhados, setCustosDetalhados] = useState([])
  const [custosPorCategoria, setCustosPorCategoria] = useState([])

  const [relatorio, setRelatorio] = useState({
    biomassa: 0,
    peixes: 0,
    mortalidade: 0,
    custos: 0,
    vendas: 0,
    lucro: 0,
    racao: 0,
    valorRacao: 0,
    rca: 0,
    valorKgProduzido: 0,
  })

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function formatarPeso(valorGramas) {
    const gramas = Number(valorGramas || 0)

    if (Math.abs(gramas) >= 1000) {
      return `${moeda(gramas / 1000)} kg`
    }

    return `${moeda(gramas)} g`
  }

  function dataBR(data) {
    if (!data) return "-"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  function normalizar(texto) {
    return String(texto || "").trim().toLowerCase()
  }

  function dataLocal(data) {
    if (!data) return null

    const valor =
      String(data).includes("T")
        ? new Date(data)
        : new Date(`${data}T00:00:00`)

    if (Number.isNaN(valor.getTime())) {
      return null
    }

    return new Date(
      valor.getFullYear(),
      valor.getMonth(),
      valor.getDate()
    )
  }

  function diferencaDias(inicio, fim) {
    const dataInicio = dataLocal(inicio)
    const dataFim = dataLocal(fim)

    if (!dataInicio || !dataFim) return 0

    return Math.max(
      0,
      Math.floor(
        (dataFim - dataInicio) / MS_DIA
      )
    )
  }

  function faixaEsperada(diasCultivo) {
    const referencias = [
      { dias: 0, minimo: 0, maximo: 0 },
      { dias: 30, minimo: 5, maximo: 20 },
      { dias: 60, minimo: 30, maximo: 80 },
      { dias: 90, minimo: 100, maximo: 200 },
      { dias: 120, minimo: 250, maximo: 400 },
      { dias: 150, minimo: 500, maximo: 700 },
      { dias: 180, minimo: 700, maximo: 900 },
      { dias: 210, minimo: 900, maximo: 1100 },
    ]

    if (diasCultivo >= 210) {
      return referencias[
        referencias.length - 1
      ]
    }

    const indiceSuperior =
      referencias.findIndex(
        (referencia) =>
          diasCultivo <= referencia.dias
      )

    const superior =
      referencias[indiceSuperior]

    const inferior =
      referencias[
        Math.max(0, indiceSuperior - 1)
      ]

    const intervalo =
      superior.dias - inferior.dias

    const progresso =
      intervalo > 0
        ? (
            diasCultivo -
            inferior.dias
          ) / intervalo
        : 0

    return {
      dias: diasCultivo,
      minimo:
        inferior.minimo +
        (
          superior.minimo -
          inferior.minimo
        ) * progresso,
      maximo:
        inferior.maximo +
        (
          superior.maximo -
          inferior.maximo
        ) * progresso,
    }
  }

  function analisarBiometria(biometria, lote) {
    const pesoAtual =
      Number(biometria.peso_medio || 0)

    const faltaMeta =
      Math.max(0, PESO_META - pesoAtual)

    if (!lote?.data_povoamento) {
      return {
        diasCultivo: null,
        faixaEsperada: null,
        faltaMeta,
        status: "Sem povoamento",
        recomendacao:
          "Cadastre a data de povoamento do lote.",
        cor: "bg-slate-100 text-slate-700",
      }
    }

    const diasCultivo =
      Math.max(
        1,
        diferencaDias(
          lote.data_povoamento,
          biometria.data_biometria
        )
      )

    const faixa =
      faixaEsperada(diasCultivo)

    const faixaTexto =
      `${moeda(faixa.minimo)} a ${moeda(faixa.maximo)} g`

    if (pesoAtual > faixa.maximo) {
      return {
        diasCultivo,
        faixaEsperada: faixaTexto,
        faltaMeta,
        status: "Acima do esperado",
        recomendacao:
          `${moeda(pesoAtual - faixa.maximo)} g acima do limite superior da faixa.`,
        cor: "bg-blue-100 text-blue-800",
      }
    }

    if (pesoAtual >= faixa.minimo) {
      return {
        diasCultivo,
        faixaEsperada: faixaTexto,
        faltaMeta,
        status: "Dentro do esperado",
        recomendacao:
          "O peso está dentro da faixa esperada para este período.",
        cor: "bg-emerald-100 text-emerald-800",
      }
    }

    const faltaFaixa =
      faixa.minimo - pesoAtual

    const desempenhoMinimo =
      faixa.minimo > 0
        ? pesoAtual / faixa.minimo
        : 1

    if (desempenhoMinimo >= 0.85) {
      return {
        diasCultivo,
        faixaEsperada: faixaTexto,
        faltaMeta,
        status: "Atenção",
        recomendacao:
          `Faltam ${moeda(faltaFaixa)} g para alcançar o mínimo esperado no período.`,
        cor: "bg-yellow-100 text-yellow-800",
      }
    }

    return {
      diasCultivo,
      faixaEsperada: faixaTexto,
      faltaMeta,
      status: "Pode melhorar",
      recomendacao:
        `Faltam ${moeda(faltaFaixa)} g para alcançar o mínimo esperado. Revise alimentação, qualidade da água e manejo.`,
      cor: "bg-red-100 text-red-700",
    }
  }

  async function carregarDados() {
    try {
      const { data: dadosTanques } = await supabase
        .from("tanques")
        .select("nome")
        .eq("user_id", user.id)

      const nomesTanques = dadosTanques?.map((t) => t.nome) || []
      setTanques(dadosTanques || [])

      const { data: biometria } = await supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id)

      const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("user_id", user.id)

      const { data: mortalidade } = await supabase
        .from("mortalidade")
        .select("*")
        .eq("user_id", user.id)

      const { data: custos } = await supabase
        .from("custos")
        .select("*")
        .eq("user_id", user.id)

      const { data: vendas } = await supabase
        .from("vendas")
        .select("*")
        .eq("user_id", user.id)

      function filtrarTanque(lista) {
        const somenteExistentes = (lista || []).filter((item) =>
          nomesTanques.some(
            (nome) => normalizar(nome) === normalizar(item.tanque)
          )
        )

        if (tanqueSelecionado === "todos") return somenteExistentes

        return somenteExistentes.filter(
          (item) => normalizar(item.tanque) === normalizar(tanqueSelecionado)
        )
      }

      function filtrarCustos(lista) {
        const todosCustos = lista || []

        if (tanqueSelecionado === "todos") {
          return todosCustos
        }

        return todosCustos.filter(
          (item) => normalizar(item.tanque) === normalizar(tanqueSelecionado)
        )
      }

      const biometriaFiltrada = filtrarTanque(biometria)
      const lotesFiltrados = filtrarTanque(lotes)
      const mortalidadeFiltrada = filtrarTanque(mortalidade)
      const custosFiltrados = filtrarCustos(custos)
      const vendasFiltradas = filtrarTanque(vendas)

      const totalMortalidade = mortalidadeFiltrada.reduce(
        (acc, item) => acc + Number(item.quantidade || 0),
        0
      )

      function calcularBiomassaTanque(nomeTanque) {
        const lotesTanque = lotesFiltrados.filter(
          (lote) => normalizar(lote.tanque) === normalizar(nomeTanque)
        )

        const mortalidadeTanque = mortalidadeFiltrada
          .filter((item) => normalizar(item.tanque) === normalizar(nomeTanque))
          .reduce((acc, item) => acc + Number(item.quantidade || 0), 0)

        const quantidadePovoada = lotesTanque.reduce(
          (acc, lote) =>
            acc + Number(lote.quantidade || lote.quantidade_inicial || 0),
          0
        )

        const peixesVivos = Math.max(0, quantidadePovoada - mortalidadeTanque)

        const ultima = biometriaFiltrada
          .filter((b) => normalizar(b.tanque) === normalizar(nomeTanque))
          .sort(
            (a, b) =>
              new Date(b.data_biometria) - new Date(a.data_biometria)
          )[0]

        const pesoMedio = Number(ultima?.peso_medio || 0)

        if (pesoMedio > 0) {
          return {
            biomassa: (peixesVivos * pesoMedio) / 1000,
            peixes: peixesVivos,
          }
        }

        return {
          biomassa: lotesTanque.reduce(
            (acc, lote) => acc + Number(lote.biomassa || 0),
            0
          ),
          peixes: peixesVivos,
        }
      }

      let biomassa = 0
      let peixes = 0

      if (tanqueSelecionado === "todos") {
        nomesTanques.forEach((nomeTanque) => {
          const resultadoTanque = calcularBiomassaTanque(nomeTanque)

          biomassa += resultadoTanque.biomassa
          peixes += resultadoTanque.peixes
        })
      } else {
        const resultadoTanque = calcularBiomassaTanque(tanqueSelecionado)

        biomassa = resultadoTanque.biomassa
        peixes = resultadoTanque.peixes
      }

      const totalCustos = custosFiltrados.reduce(
        (acc, item) => acc + Number(item.valor_total || item.valor || 0),
        0
      )

      const totalVendas = vendasFiltradas.reduce(
        (acc, item) => acc + Number(item.valor_total || item.total || 0),
        0
      )

      const totalRacao = custosFiltrados
        .filter((item) => normalizar(item.categoria) === "ração")
        .reduce(
          (acc, item) =>
            acc +
            Number(item.peso_total_baixa || item.quantidade_racao || 0),
          0
        )

      const valorRacao = custosFiltrados
        .filter((item) => normalizar(item.categoria) === "ração")
        .reduce(
          (acc, item) =>
            acc +
            Number(item.valor_total || item.valor || 0),
          0
        )

      const resumoCustos = Object.values(
        custosFiltrados.reduce((acc, item) => {
          const categoriaBase = item.categoria || "Outros"
          const categoria =
            normalizar(categoriaBase) === "outros" &&
            item.descricao
              ? `Outros - ${item.descricao}`
              : categoriaBase

          if (!acc[categoria]) {
            acc[categoria] = {
              categoria,
              kg: 0,
              valor: 0,
            }
          }

          acc[categoria].kg += Number(
            item.peso_total_baixa ||
              item.quantidade_racao ||
              0
          )

          acc[categoria].valor += Number(
            item.valor_total ||
              item.valor ||
              0
          )

          return acc
        }, {})
      ).sort((a, b) =>
        a.categoria.localeCompare(b.categoria)
      )

      const lucro = totalVendas - totalCustos
      const rca = biomassa > 0 && totalRacao > 0 ? totalRacao / biomassa : 0

      const valorKgProduzido =
        biomassa > 0
          ? totalCustos / biomassa
          : 0

      setRelatorio({
        biomassa,
        peixes,
        mortalidade: totalMortalidade,
        custos: totalCustos,
        vendas: totalVendas,
        lucro,
        racao: totalRacao,
        valorRacao,
        rca,
        valorKgProduzido,
      })

      const custosOrdenados = [...custosFiltrados].sort(
        (a, b) =>
          new Date(b.data_custo || b.created_at || 0) -
          new Date(a.data_custo || a.created_at || 0)
      )

      setCustosDetalhados(custosOrdenados)
      setCustosPorCategoria(resumoCustos)

      // Datas crescentes de baixo para cima:
      // mais antiga embaixo, mais recente em cima
      const biometriasOrdenadas =
        [...biometriaFiltrada]
          .sort(
            (a, b) =>
              new Date(b.data_biometria) -
              new Date(a.data_biometria)
          )
          .map((item) => {
            const dataBiometria =
              dataLocal(item.data_biometria)

            const lotesDoTanque =
              lotesFiltrados
                .filter(
                  (lote) =>
                    normalizar(lote.tanque) ===
                    normalizar(item.tanque)
                )
                .sort(
                  (a, b) =>
                    new Date(
                      b.data_povoamento ||
                      b.created_at ||
                      0
                    ) -
                    new Date(
                      a.data_povoamento ||
                      a.created_at ||
                      0
                    )
                )

            const lote =
              lotesDoTanque.find(
                (registro) => {
                  const povoamento =
                    dataLocal(
                      registro.data_povoamento
                    )

                  return (
                    !povoamento ||
                    !dataBiometria ||
                    povoamento <= dataBiometria
                  )
                }
              ) ||
              lotesDoTanque[0]

            return {
              ...item,
              analise:
                analisarBiometria(
                  item,
                  lote
                ),
            }
          })

      setBiometrias(biometriasOrdenadas)
    } catch (erro) {
      console.log(erro)
    }
  }

  function gerarPDF() {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("Relatório Piscicultura PRO", 14, 20)

    doc.setFontSize(11)
    doc.text(
      `Tanque: ${
        tanqueSelecionado === "todos" ? "Todos os Tanques" : tanqueSelecionado
      }`,
      14,
      28
    )

    autoTable(doc, {
      startY: 35,
      head: [["Indicador financeiro", "Kg / Quantidade", "Valor"]],
      body: [
        ...custosPorCategoria.map((item) => [
          item.categoria,
          item.kg > 0 ? `${moeda(item.kg)} kg` : "-",
          `R$ ${moeda(item.valor)}`,
        ]),
        ["Vendas", "-", `R$ ${moeda(relatorio.vendas)}`],
        ["Lucro", "-", `R$ ${moeda(relatorio.lucro)}`],
        ["Custo Total", "-", `R$ ${moeda(relatorio.custos)}`],
      ],
    })

    const yOperacional =
      (doc.lastAutoTable?.finalY || 35) + 12

    doc.setFontSize(14)
    doc.text("Indicadores operacionais", 14, yOperacional)

    autoTable(doc, {
      startY: yOperacional + 5,
      head: [["Indicador", "Quantidade"]],
      body: [
        ["Biomassa Total", `${moeda(relatorio.biomassa)} kg`],
        ["Peixes", relatorio.peixes],
        ["Mortalidade", relatorio.mortalidade],
        ["RCA", moeda(relatorio.rca)],
        ["Valor kg peixe produzido", `R$ ${moeda(relatorio.valorKgProduzido)}`],
      ],
    })

    const yCustos =
      (doc.lastAutoTable?.finalY || 35) + 12

    doc.setFontSize(14)
    doc.text("Custos cadastrados", 14, yCustos)

    autoTable(doc, {
      startY: yCustos + 5,
      head: [[
        "Data",
        "Tanque",
        "Categoria",
        "Descrição",
        "Baixa",
        "Peso",
        "Valor",
      ]],
      body:
        custosDetalhados.length > 0
          ? custosDetalhados.map((item) => [
              dataBR(item.data_custo),
              item.tanque || "Geral",
              item.categoria || "-",
              item.descricao || "-",
              `${Number(item.quantidade_baixa || 0).toFixed(2)} sacos`,
              `${Number(item.peso_total_baixa || 0).toFixed(2)} kg`,
              `R$ ${moeda(item.valor_total || item.valor)}`,
            ])
          : [[
              "-",
              "-",
              "-",
              "Nenhum custo cadastrado",
              "-",
              "-",
              "-",
            ]],
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [37, 99, 235],
      },
      columnStyles: {
        3: {
          cellWidth: 45,
        },
      },
    })

    doc.save("relatorio.pdf")
  }

  function gerarExcel() {
    const dados = [
      { Indicador: "Biomassa", Valor: relatorio.biomassa },
      { Indicador: "Peixes", Valor: relatorio.peixes },
      { Indicador: "Mortalidade", Valor: relatorio.mortalidade },
      { Indicador: "Custos", Valor: relatorio.custos },
      { Indicador: "Vendas", Valor: relatorio.vendas },
      { Indicador: "Lucro", Valor: relatorio.lucro },
      { Indicador: "Ração", Valor: relatorio.racao },
      { Indicador: "RCA", Valor: relatorio.rca },
    ]

    const worksheet = XLSX.utils.json_to_sheet(dados)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório")
    XLSX.writeFile(workbook, "relatorio.xlsx")
  }

  useEffect(() => {
    if (user) carregarDados()
  }, [user, tanqueSelecionado])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">📊 Relatórios</h1>
          <p className="text-gray-500">Indicadores da produção</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div>
            <label className="font-bold">Selecionar Tanque</label>

            <select
              value={tanqueSelecionado}
              onChange={(e) => setTanqueSelecionado(e.target.value)}
              className="border p-3 rounded-xl mt-2"
            >
              <option value="todos">Todos os Tanques</option>

              {tanques.map((item, index) => (
                <option key={index} value={item.nome}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={gerarPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold"
            >
              PDF
            </button>

            <button
              onClick={gerarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card titulo="Biomassa" valor={`${moeda(relatorio.biomassa)} kg`} cor="bg-blue-100" />
        <Card titulo="Peixes" valor={relatorio.peixes} cor="bg-green-100" />
        <Card titulo="Mortalidade" valor={relatorio.mortalidade} cor="bg-red-100" />
        <Card titulo="Custos" valor={`R$ ${moeda(relatorio.custos)}`} cor="bg-yellow-100" />
        <Card titulo="Vendas" valor={`R$ ${moeda(relatorio.vendas)}`} cor="bg-purple-100" />
        <Card titulo="Lucro" valor={`R$ ${moeda(relatorio.lucro)}`} cor="bg-emerald-100" />
        <Card titulo="Ração" valor={`${moeda(relatorio.racao)} kg`} cor="bg-orange-100" />
        <Card titulo="RCA" valor={moeda(relatorio.rca)} cor="bg-cyan-100" />
      </div>

      <div className="bg-white rounded-2xl shadow p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">📋 Histórico Biometria</h2>
        <p className="mb-4 max-w-4xl text-sm leading-6 text-slate-600">
          A análise calcula proporcionalmente a faixa esperada na data exata da biometria, usando como referência os períodos de 30, 60, 90, 120, 150, 180 e 210 dias após o povoamento.
        </p>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tanque</th>
              <th className="p-3 text-left">Peixes pesados</th>
              <th className="p-3 text-left">Peso médio</th>
              <th className="p-3 text-left">Biomassa da amostra</th>
              <th className="p-3 text-left">Dias de cultivo</th>
              <th className="p-3 text-left">Faixa esperada</th>
              <th className="p-3 text-left">Análise inteligente</th>
              <th className="p-3 text-left">Falta para 900 g</th>
            </tr>
          </thead>

          <tbody>
            {biometrias.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{dataBR(item.data_biometria)}</td>
                <td className="p-3">{item.tanque}</td>
                <td className="p-3">{item.quantidade}</td>
                <td className="p-3">
                  {formatarPeso(item.peso_medio)}
                </td>
                <td className="p-3">
                  {formatarPeso(
                    Number(
                      item.peso_total ||
                      Number(item.biomassa || 0) * 1000
                    )
                  )}
                </td>
                <td className="p-3">
                  {item.analise?.diasCultivo ?? "-"}
                </td>
                <td className="p-3">
                  {item.analise?.faixaEsperada || "-"}
                </td>
                <td className="min-w-64 p-3">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${item.analise?.cor}`}
                  >
                    {item.analise?.status}
                  </span>
                  <p className="mt-2 whitespace-normal text-xs leading-5 text-slate-600">
                    {item.analise?.recomendacao}
                  </p>
                </td>
                <td className="p-3">
                  {formatarPeso(
                    item.analise?.faltaMeta
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

function Card({ titulo, valor, cor }) {
  return (
    <div className={`${cor} p-5 rounded-2xl shadow`}>
      <p className="text-gray-600">{titulo}</p>
      <h2 className="text-3xl font-bold mt-2">{valor}</h2>
    </div>
  )
}
