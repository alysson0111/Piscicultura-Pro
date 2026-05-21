import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import * as XLSX from "xlsx"

export default function Relatorios({ user }) {

  const [vendas, setVendas] = useState([])
  const [custos, setCustos] = useState([])
  const [biometrias, setBiometrias] =
    useState([])

  // 🔥 CARREGAR DADOS
  async function carregarDados() {

    // 🔥 VENDAS
    const { data: vendasData } =
      await supabase
        .from("vendas")
        .select("*")
        .eq("user_id", user.id)

    // 🔥 CUSTOS
    const { data: custosData } =
      await supabase
        .from("custos")
        .select("*")
        .eq("user_id", user.id)

    // 🔥 BIOMETRIAS
    const { data: biometriaData } =
      await supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })

    setVendas(vendasData || [])
    setCustos(custosData || [])
    setBiometrias(
      biometriaData || []
    )
  }

  useEffect(() => {
    if (user) {
      carregarDados()
    }
  }, [user])

  // 🔥 TOTAL VENDAS
  const totalVendas =
    vendas.reduce(
      (acc, item) =>
        acc +
        Number(item.total || 0),
      0
    )

  // 🔥 TOTAL CUSTOS
  const totalCustos =
    custos.reduce(
      (acc, item) =>
        acc +
        Number(item.valor || 0),
      0
    )

  // 🔥 LUCRO
  const lucro =
    totalVendas - totalCustos

  // 🔥 ÚLTIMA BIOMETRIA
  const ultimaBiometria =
    biometrias.length > 0
      ? biometrias[0]
      : null

  // 🔥 BIOMASSA ATUAL
  const biomassaAtual =
    ultimaBiometria
      ? Number(
          ultimaBiometria.biomassa
        )
      : 0

  // 🔥 TOTAL RAÇÃO
  const totalRacao =
    custos
      .filter(
        (item) =>
          item.tipo === "Ração"
      )
      .reduce(
        (acc, item) =>
          acc +
          Number(item.valor || 0),
        0
      )

  // 🔥 RCA
  const rca =
    biomassaAtual > 0
      ? totalRacao /
        biomassaAtual
      : 0

  // 🔥 PDF
  function gerarPDF() {

    const doc = new jsPDF()

    doc.setFontSize(20)

    doc.text(
      "Relatório Piscicultura PRO",
      14,
      20
    )

    autoTable(doc, {
      startY: 35,

      head: [["Indicador", "Valor"]],

      body: [

        [
          "Total Vendas",
          `R$ ${totalVendas.toFixed(2)}`,
        ],

        [
          "Total Custos",
          `R$ ${totalCustos.toFixed(2)}`,
        ],

        [
          "Lucro Líquido",
          `R$ ${lucro.toFixed(2)}`,
        ],

        [
          "Biomassa Atual",
          `${biomassaAtual.toFixed(2)} kg`,
        ],

        [
          "RCA",
          rca.toFixed(2),
        ],

      ],
    })

    doc.save("relatorio.pdf")
  }

  // 🔥 EXCEL
  function gerarExcel() {

    const dados = [

      {
        Indicador:
          "Total Vendas",
        Valor: totalVendas,
      },

      {
        Indicador:
          "Total Custos",
        Valor: totalCustos,
      },

      {
        Indicador:
          "Lucro Líquido",
        Valor: lucro,
      },

      {
        Indicador:
          "Biomassa Atual",
        Valor:
          biomassaAtual,
      },

      {
        Indicador:
          "RCA",
        Valor: rca,
      },

    ]

    const worksheet =
      XLSX.utils.json_to_sheet(
        dados
      )

    const workbook =
      XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Relatório"
    )

    XLSX.writeFile(
      workbook,
      "relatorio.xlsx"
    )
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        📊 Relatórios
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* VENDAS */}
        <div className="bg-green-100 p-6 rounded-2xl shadow">

          <p className="text-green-700">
            Total Vendas
          </p>

          <h2 className="text-3xl font-bold text-green-700">
            R$ {totalVendas.toFixed(2)}
          </h2>

        </div>

        {/* CUSTOS */}
        <div className="bg-red-100 p-6 rounded-2xl shadow">

          <p className="text-red-700">
            Total Custos
          </p>

          <h2 className="text-3xl font-bold text-red-700">
            R$ {totalCustos.toFixed(2)}
          </h2>

        </div>

        {/* LUCRO */}
        <div className="bg-blue-100 p-6 rounded-2xl shadow">

          <p className="text-blue-700">
            Lucro Líquido
          </p>

          <h2 className="text-3xl font-bold text-blue-700">
            R$ {lucro.toFixed(2)}
          </h2>

        </div>

        {/* BIOMASSA */}
        <div className="bg-yellow-100 p-6 rounded-2xl shadow">

          <p className="text-yellow-700">
            Biomassa Atual
          </p>

          <h2 className="text-3xl font-bold text-yellow-700">
            {biomassaAtual.toFixed(2)} kg
          </h2>

        </div>

        {/* RCA */}
        <div className="bg-purple-100 p-6 rounded-2xl shadow">

          <p className="text-purple-700">
            RCA
          </p>

          <h2 className="text-3xl font-bold text-purple-700">
            {rca.toFixed(2)}
          </h2>

        </div>

      </div>

      {/* BOTÕES */}
      <div className="flex gap-4">

        <button
          onClick={gerarPDF}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Gerar PDF
        </button>

        <button
          onClick={gerarExcel}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Gerar Excel
        </button>

      </div>

    </div>
  )
}