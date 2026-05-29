import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export default function Relatorios({ user }) {
  const [tanqueSelecionado, setTanqueSelecionado] = useState("todos")
  const [tanques, setTanques] = useState([])
  const [biometrias, setBiometrias] = useState([])

  const [relatorio, setRelatorio] = useState({
    biomassa: 0,
    peixes: 0,
    mortalidade: 0,
    custos: 0,
    vendas: 0,
    lucro: 0,
    racao: 0,
    rca: 0,
  })

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function dataBR(data) {
    if (!data) return "-"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  function normalizar(texto) {
    return String(texto || "").trim().toLowerCase()
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

      const biometriaFiltrada = filtrarTanque(biometria)
      const mortalidadeFiltrada = filtrarTanque(mortalidade)
      const custosFiltrados = filtrarTanque(custos)
      const vendasFiltradas = filtrarTanque(vendas)

      let biomassa = 0
      let peixes = 0

      if (tanqueSelecionado === "todos") {
        nomesTanques.forEach((nomeTanque) => {
          const ultima = biometriaFiltrada
            .filter((b) => normalizar(b.tanque) === normalizar(nomeTanque))
            .sort(
              (a, b) =>
                new Date(b.data_biometria) - new Date(a.data_biometria)
            )[0]

          biomassa += Number(ultima?.biomassa || 0)
          peixes += Number(ultima?.quantidade || 0)
        })
      } else {
        const ultima = biometriaFiltrada.sort(
          (a, b) =>
            new Date(b.data_biometria) - new Date(a.data_biometria)
        )[0]

        biomassa = Number(ultima?.biomassa || 0)
        peixes = Number(ultima?.quantidade || 0)
      }

      const totalMortalidade = mortalidadeFiltrada.reduce(
        (acc, item) => acc + Number(item.quantidade || 0),
        0
      )

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

      const lucro = totalVendas - totalCustos
      const rca = biomassa > 0 && totalRacao > 0 ? totalRacao / biomassa : 0

      setRelatorio({
        biomassa,
        peixes,
        mortalidade: totalMortalidade,
        custos: totalCustos,
        vendas: totalVendas,
        lucro,
        racao: totalRacao,
        rca,
      })

      // Datas crescentes de baixo para cima:
      // mais antiga embaixo, mais recente em cima
      const biometriasOrdenadas = [...biometriaFiltrada].sort(
        (a, b) =>
          new Date(b.data_biometria) - new Date(a.data_biometria)
      )

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
      head: [["Indicador", "Valor"]],
      body: [
        ["Biomassa Total", `${moeda(relatorio.biomassa)} kg`],
        ["Peixes", relatorio.peixes],
        ["Mortalidade", relatorio.mortalidade],
        ["Custos", `R$ ${moeda(relatorio.custos)}`],
        ["Vendas", `R$ ${moeda(relatorio.vendas)}`],
        ["Lucro", `R$ ${moeda(relatorio.lucro)}`],
        ["Ração", `${moeda(relatorio.racao)} kg`],
        ["RCA", moeda(relatorio.rca)],
      ],
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

        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tanque</th>
              <th className="p-3 text-left">Quantidade</th>
              <th className="p-3 text-left">Peso Médio</th>
              <th className="p-3 text-left">Biomassa</th>
            </tr>
          </thead>

          <tbody>
            {biometrias.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{dataBR(item.data_biometria)}</td>
                <td className="p-3">{item.tanque}</td>
                <td className="p-3">{item.quantidade}</td>
                <td className="p-3">
                  {Number(item.peso_medio || 0).toFixed(2)} g
                </td>
                <td className="p-3">
                  {Number(item.biomassa || 0).toFixed(2)} kg
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