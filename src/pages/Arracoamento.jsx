import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Fish,
  Scale,
  Sparkles,
  Wheat,
} from "lucide-react"

import { supabase } from "../lib/supabase"

const TABELA_ARRACOAMENTO = [
  { ate: 5, taxa: 25, tratos: 6, proteina: 55, granulometria: "Farelada" },
  { ate: 15, taxa: 10, tratos: 4, proteina: 42, granulometria: "1 a 2 mm" },
  { ate: 25, taxa: 7, tratos: 4, proteina: 42, granulometria: "1 a 2 mm" },
  { ate: 45, taxa: 6, tratos: 4, proteina: 36, granulometria: "2 a 4 mm" },
  { ate: 75, taxa: 5, tratos: 4, proteina: 36, granulometria: "2 a 4 mm" },
  { ate: 175, taxa: 4, tratos: 4, proteina: 32, granulometria: "4 a 6 mm" },
  { ate: 350, taxa: 3, tratos: 4, proteina: 32, granulometria: "4 a 6 mm" },
  { ate: 700, taxa: 2, tratos: 4, proteina: 32, granulometria: "6 a 8 mm" },
  { ate: Infinity, taxa: 1, tratos: 2, proteina: 32, granulometria: "8 a 10 mm" },
]

const SISTEMAS = {
  ras: {
    nome: "RAS",
    descricao:
      "Considera a carga sobre o biofiltro, a remoção de sólidos e a oxigenação contínua.",
  },
  tanqueRede: {
    nome: "Tanque-rede",
    descricao:
      "Considera circulação da água, oxigênio, temperatura e perdas de ração fora da gaiola.",
  },
  tanqueEscavado: {
    nome: "Tanque escavado",
    descricao:
      "Considera oxigênio, temperatura, qualidade da água e resposta do ambiente natural do viveiro.",
  },
}

function normalizar(valor) {
  return String(valor || "").trim().toLowerCase()
}

function chaveDoSistema(valor) {
  const sistema = normalizar(valor)

  if (
    sistema === "tanque-rede" ||
    sistema === "tanque rede"
  ) {
    return "tanqueRede"
  }

  if (
    sistema === "tanque escavado" ||
    sistema === "tanque-escavado"
  ) {
    return "tanqueEscavado"
  }

  return "ras"
}

function numero(valor) {
  return Number(valor || 0)
}

function formatar(valor, casas = 2) {
  return numero(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

function dataBR(data) {
  if (!data) return "-"

  const valor = String(data).includes("T")
    ? new Date(data)
    : new Date(`${data}T00:00:00`)

  return Number.isNaN(valor.getTime())
    ? "-"
    : valor.toLocaleDateString("pt-BR")
}

function recomendacaoPorPeso(pesoMedio) {
  return (
    TABELA_ARRACOAMENTO.find(
      (faixa) => pesoMedio <= faixa.ate
    ) ||
    TABELA_ARRACOAMENTO[
      TABELA_ARRACOAMENTO.length - 1
    ]
  )
}

function avaliarRAS(parametro) {
  if (!parametro) {
    return {
      nivel: "sem-dados",
      fator: 0.75,
      titulo: "RAS sem leitura recente",
      texto:
        "A recomendação foi limitada a 75%. Meça pH, amônia, nitrito, temperatura e oxigênio antes de completar o trato.",
    }
  }

  const ph = numero(parametro.ph)
  const amonia = numero(parametro.amonia)
  const nitrito = numero(parametro.nitrito)
  const temperatura = numero(parametro.temperatura)
  const oxigenio = numero(
    parametro.oxigenio_dissolvido
  )

  const alertas = []
  let fator = 1

  if (oxigenio <= 0) {
    fator = Math.min(fator, 0.75)
    alertas.push("oxigênio dissolvido não informado")
  } else if (oxigenio < 3) {
    fator = 0
    alertas.push(`oxigênio crítico: ${formatar(oxigenio)} mg/L`)
  } else if (oxigenio < 5) {
    fator = Math.min(fator, 0.5)
    alertas.push(`oxigênio baixo: ${formatar(oxigenio)} mg/L`)
  } else if (oxigenio < 6) {
    fator = Math.min(fator, 0.75)
    alertas.push(`oxigênio abaixo da meta: ${formatar(oxigenio)} mg/L`)
  }

  if (temperatura <= 0) {
    fator = Math.min(fator, 0.75)
    alertas.push("temperatura não informada")
  } else if (temperatura < 20 || temperatura > 32) {
    fator = Math.min(fator, 0.5)
    alertas.push(`temperatura crítica para alimentação: ${formatar(temperatura)} °C`)
  } else if (
    temperatura < 25 ||
    temperatura > 30
  ) {
    fator = Math.min(fator, 0.75)
    alertas.push(`temperatura fora da faixa de melhor consumo: ${formatar(temperatura)} °C`)
  }

  if (ph > 0 && (ph < 6.5 || ph > 9)) {
    fator = 0
    alertas.push(`pH crítico: ${formatar(ph)}`)
  } else if (ph > 0 && (ph < 7 || ph > 8.5)) {
    fator = Math.min(fator, 0.75)
    alertas.push(`pH fora da faixa operacional: ${formatar(ph)}`)
  }

  if (amonia >= 1) {
    fator = 0
    alertas.push(`amônia elevada: ${formatar(amonia)} mg/L`)
  } else if (amonia >= 0.5) {
    fator = Math.min(fator, 0.5)
    alertas.push(`amônia em alerta: ${formatar(amonia)} mg/L`)
  } else if (amonia >= 0.2) {
    fator = Math.min(fator, 0.75)
    alertas.push(`amônia acima da meta do RAS: ${formatar(amonia)} mg/L`)
  }

  if (nitrito >= 2) {
    fator = 0
    alertas.push(`nitrito elevado: ${formatar(nitrito)} mg/L`)
  } else if (nitrito >= 1) {
    fator = Math.min(fator, 0.5)
    alertas.push(`nitrito em alerta: ${formatar(nitrito)} mg/L`)
  } else if (nitrito >= 0.5) {
    fator = Math.min(fator, 0.75)
    alertas.push(`nitrito acima da meta do RAS: ${formatar(nitrito)} mg/L`)
  }

  if (alertas.length > 0) {
    return {
      nivel: fator === 0 ? "suspender" : "atencao",
      fator,
      titulo:
        fator === 0
          ? "Suspender o trato"
          : `Reduzir o trato para ${fator * 100}%`,
      texto:
        `${alertas.join("; ")}. Verifique a oxigenação, remova sólidos e confirme o funcionamento do biofiltro antes de aumentar a alimentação.`,
    }
  }

  return {
    nivel: "adequado",
    fator: 1,
    titulo: "RAS sem alerta registrado",
    texto:
      "Aplique a quantidade gradualmente, monitorando oxigênio, consumo, sólidos, amônia e nitrito após os tratos.",
  }
}

function avaliarSistemaAberto(
  parametro,
  sistema
) {
  const nome =
    SISTEMAS[sistema].nome

  if (!parametro) {
    return {
      nivel: "sem-dados",
      fator: 0.75,
      titulo: `${nome} sem leitura recente`,
      texto:
        "A recomendação foi limitada a 75%. Meça temperatura, oxigênio e pH antes de completar o trato.",
    }
  }

  const ph = numero(parametro.ph)
  const amonia = numero(parametro.amonia)
  const nitrito = numero(parametro.nitrito)
  const temperatura = numero(parametro.temperatura)
  const oxigenio = numero(
    parametro.oxigenio_dissolvido
  )

  const alertas = []
  let fator = 1

  if (oxigenio <= 0) {
    fator = 0.75
    alertas.push("oxigênio não informado")
  } else if (oxigenio < 3) {
    fator = 0
    alertas.push(`oxigênio crítico: ${formatar(oxigenio)} mg/L`)
  } else if (oxigenio < 5) {
    fator = Math.min(fator, 0.5)
    alertas.push(`oxigênio baixo: ${formatar(oxigenio)} mg/L`)
  }

  if (temperatura <= 0) {
    fator = Math.min(fator, 0.75)
    alertas.push("temperatura não informada")
  } else if (temperatura < 20 || temperatura > 32) {
    fator = Math.min(fator, 0.5)
    alertas.push(`temperatura desfavorável: ${formatar(temperatura)} °C`)
  } else if (temperatura < 25 || temperatura > 30) {
    fator = Math.min(fator, 0.75)
    alertas.push(`temperatura fora da faixa de melhor consumo: ${formatar(temperatura)} °C`)
  }

  if (ph > 0 && (ph < 6 || ph > 9)) {
    fator = 0
    alertas.push(`pH crítico: ${formatar(ph)}`)
  } else if (ph > 0 && (ph < 6.5 || ph > 8.5)) {
    fator = Math.min(fator, 0.75)
    alertas.push(`pH em atenção: ${formatar(ph)}`)
  }

  if (sistema === "tanqueEscavado") {
    if (amonia >= 1 || nitrito >= 2) {
      fator = 0
      alertas.push("compostos nitrogenados elevados")
    } else if (amonia >= 0.5 || nitrito >= 1) {
      fator = Math.min(fator, 0.5)
      alertas.push("amônia ou nitrito em alerta")
    }
  }

  if (alertas.length > 0) {
    return {
      nivel: fator === 0 ? "suspender" : "atencao",
      fator,
      titulo:
        fator === 0
          ? "Suspender o trato"
          : `Reduzir o trato para ${fator * 100}%`,
      texto:
        `${alertas.join("; ")}. Ajuste a alimentação somente após observar a recuperação das condições e do comportamento do lote.`,
    }
  }

  return {
    nivel: "adequado",
    fator: 1,
    titulo: `${nome} sem alerta registrado`,
    texto:
      "Forneça a ração gradualmente e acompanhe o consumo, o oxigênio e o comportamento dos peixes durante o trato.",
  }
}

function avaliarSistema(
  parametro,
  sistema
) {
  return sistema === "ras"
    ? avaliarRAS(parametro)
    : avaliarSistemaAberto(
        parametro,
        sistema
      )
}

function manejoDoSistema(sistema) {
  if (sistema === "tanqueRede") {
    return [
      "Confirme oxigênio, temperatura, correnteza e integridade da rede antes do trato.",
      "Distribua a ração em vários pontos dentro da gaiola, evitando lançá-la junto à borda.",
      "Alimente no sentido contrário ao vento e à corrente para reduzir perdas fora do tanque-rede.",
      "Pare ao notar sobra, baixa resposta, peixes na superfície ou acúmulo de ração fora da gaiola.",
      "Atualize a biometria a cada 15–20 dias para recalcular a quantidade.",
    ]
  }

  if (sistema === "tanqueEscavado") {
    return [
      "Confirme oxigênio, temperatura, pH e aparência da água antes do primeiro trato.",
      "Use pontos fixos de alimentação ou distribua a ração uniformemente nas áreas de maior atividade.",
      "Evite alimentar após chuva intensa, queda de oxigênio, água excessivamente turva ou mudança brusca de temperatura.",
      "Pare ao notar sobra, baixa resposta ou peixes buscando ar na superfície.",
      "Atualize a biometria a cada 15–20 dias para recalcular a quantidade.",
    ]
  }

  return [
    "Confirme oxigênio, temperatura e circulação antes do primeiro trato.",
    "Divida a ração ao longo do período diurno e distribua em diferentes pontos.",
    "Remova sólidos e confira o biofiltro; sobra de ração aumenta rapidamente amônia e nitrito no RAS.",
    "Pare ao notar sobra, desinteresse, peixe na superfície ou concentração próxima à aeração.",
    "Atualize a biometria a cada 15–20 dias para recalcular a carga alimentar.",
  ]
}

export default function Arracoamento({ user }) {
  const [dados, setDados] = useState([])
  const [tanqueSelecionado, setTanqueSelecionado] =
    useState("todos")
  const [loading, setLoading] = useState(true)

  async function carregarDados() {
    setLoading(true)

    const [
      respostaTanques,
      respostaLotes,
      respostaBiometrias,
      respostaMortalidades,
      respostaParametros,
    ] = await Promise.all([
      supabase
        .from("tanques")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("lotes")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("biometria")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("mortalidade")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("parametros")
        .select("*")
        .eq("user_id", user.id),
    ])

    const erro =
      respostaTanques.error ||
      respostaLotes.error ||
      respostaBiometrias.error ||
      respostaMortalidades.error ||
      respostaParametros.error

    if (erro) {
      console.log(erro)
      setDados([])
      setLoading(false)
      return
    }

    const tanques = respostaTanques.data || []
    const lotes = respostaLotes.data || []
    const biometrias = respostaBiometrias.data || []
    const mortalidades = respostaMortalidades.data || []
    const parametros = respostaParametros.data || []

    const resultado = tanques.map((tanque) => {
      const nomeTanque = tanque.nome

      const lotesTanque = lotes.filter(
        (item) =>
          normalizar(item.tanque) ===
          normalizar(nomeTanque)
      )

      const quantidadePovoada =
        lotesTanque.reduce(
          (total, item) =>
            total +
            numero(
              item.quantidade ||
              item.quantidade_inicial
            ),
          0
        )

      const mortalidade =
        mortalidades
          .filter(
            (item) =>
              normalizar(item.tanque) ===
              normalizar(nomeTanque)
          )
          .reduce(
            (total, item) =>
              total + numero(item.quantidade),
            0
          )

      const peixesVivos =
        Math.max(
          0,
          quantidadePovoada - mortalidade
        )

      const ultimaBiometria =
        biometrias
          .filter(
            (item) =>
              normalizar(item.tanque) ===
              normalizar(nomeTanque)
          )
          .sort(
            (a, b) =>
              new Date(b.data_biometria) -
              new Date(a.data_biometria)
          )[0]

      const ultimoParametro =
        parametros
          .filter(
            (item) =>
              normalizar(item.tanque) ===
              normalizar(nomeTanque)
          )
          .sort(
            (a, b) =>
              new Date(b.data_medicao) -
              new Date(a.data_medicao)
          )[0]

      const pesoMedio =
        numero(
          ultimaBiometria?.peso_medio ||
          lotesTanque[0]?.peso_inicial ||
          tanque.peso
        )

      const biomassa =
        (peixesVivos * pesoMedio) / 1000

      const recomendacao =
        recomendacaoPorPeso(pesoMedio)

      const racaoDiaria =
        biomassa * (recomendacao.taxa / 100)

      const volume =
        numero(tanque.volume)

      return {
        tanque: nomeTanque,
        tipo: tanque.tipo,
        sistemaProducao:
          tanque.sistema_producao || "RAS",
        sistemaChave:
          chaveDoSistema(
            tanque.sistema_producao
          ),
        volume,
        pesoMedio,
        peixesVivos,
        biomassa,
        racaoBase: racaoDiaria,
        biometriaEm:
          ultimaBiometria?.data_biometria,
        parametroEm:
          ultimoParametro?.data_medicao,
        parametro: ultimoParametro,
        recomendacao,
        possuiBiometria: Boolean(ultimaBiometria),
      }
    })

    setDados(resultado)
    setLoading(false)
  }

  useEffect(() => {
    if (user) carregarDados()
  }, [user])

  const tanquesExibidos = useMemo(() => {
    const dadosAjustados = dados.map((item) => {
      const ajuste = avaliarSistema(
        item.parametro,
        item.sistemaChave
      )
      const racaoDiaria =
        item.racaoBase * ajuste.fator

      return {
        ...item,
        ajuste,
        racaoDiaria,
        racaoPorTrato:
          item.recomendacao.tratos > 0
            ? racaoDiaria /
              item.recomendacao.tratos
            : 0,
        cargaRacaoVolume:
          item.volume > 0
            ? racaoDiaria / item.volume
            : 0,
      }
    })

    return tanqueSelecionado === "todos"
      ? dadosAjustados
      : dadosAjustados.filter(
          (item) =>
            item.tanque === tanqueSelecionado
        )
  }, [
    dados,
    tanqueSelecionado,
  ])

  const sistemaSelecionado =
    tanquesExibidos.length === 1
      ? SISTEMAS[
          tanquesExibidos[0].sistemaChave
        ]
      : null

  const totalRacao = tanquesExibidos.reduce(
    (total, item) =>
      total + item.racaoDiaria,
    0
  )

  const totalRacaoBase =
    tanquesExibidos.reduce(
      (total, item) =>
        total + item.racaoBase,
      0
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Wheat className="text-amber-600" />
            Arraçoamento
          </h1>
          <p className="mt-1 text-slate-500">
            Recomendação diária baseada na última biometria e nos peixes vivos.
          </p>
        </div>

        <div className="w-full md:w-72">
          <label className="text-sm font-bold text-slate-700">
            Selecionar tanque
          </label>
          <select
            value={tanqueSelecionado}
            onChange={(e) =>
              setTanqueSelecionado(e.target.value)
            }
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
          >
            <option value="todos">Todos os tanques</option>
            {dados.map((item) => (
              <option key={item.tanque} value={item.tanque}>
                {item.tanque}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Resumo
          icon={Wheat}
          titulo="Ração-base"
          valor={`${formatar(totalRacaoBase)} kg`}
          cor="text-slate-700 bg-slate-50"
        />
        <Resumo
          icon={Scale}
          titulo="Ração ajustada ao sistema"
          valor={`${formatar(totalRacao)} kg`}
          cor="text-amber-700 bg-amber-50"
        />
        <Resumo
          icon={Fish}
          titulo="Tanques analisados"
          valor={tanquesExibidos.length}
          cor="text-teal-700 bg-teal-50"
        />
        <Resumo
          icon={Sparkles}
          titulo="Sistema considerado"
          valor={
            sistemaSelecionado?.nome ||
            "Conforme cadastro"
          }
          cor="text-blue-700 bg-blue-50"
        />
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        {sistemaSelecionado ? (
          <>
            <strong>{sistemaSelecionado.nome}:</strong>{" "}
            {sistemaSelecionado.descricao}
          </>
        ) : (
          <>
            Cada tanque utiliza automaticamente o tipo de sistema informado em seu cadastro.
          </>
        )}{" "}
        A recomendação é ajustada conforme os últimos parâmetros cadastrados e deve ser confirmada pela observação dos peixes e pelo responsável técnico.
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <BookOpen
            className="mt-0.5 shrink-0 text-teal-700"
            size={21}
          />
          <div>
            <h2 className="font-bold text-slate-950">
              Fontes técnicas da recomendação
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Os percentuais de arraçoamento e os cuidados para cada sistema de produção foram estruturados com base nas seguintes publicações:
            </p>

            <div className="mt-4 grid gap-3 text-sm">
              <Fonte
                href="https://www.codevasf.gov.br/acesso-a-informacao/institucional/biblioteca-geraldo-rocha/publicacoes/manuais/manual-de-criacao-de-peixes-em-tanques-rede.pdf"
                titulo="Codevasf — Manual de criação de peixes em tanques-rede"
                texto="Referência para taxa de alimentação, frequência dos tratos, proteína e granulometria por faixa de peso."
              />
              <Fonte
                href="https://srac.msstate.edu/pdfs/Fact%20Sheets/452%20Recirculating%20Aquaculture%20Tank%20Production%20Systems-%20Management%20of%20Recirculating%20Systems.pdf"
                titulo="SRAC — Management of Recirculating Systems"
                texto="Referência para oxigênio, biofiltro, sólidos, amônia, nitrito e manejo da alimentação em RAS."
              />
              <Fonte
                href="https://www.fao.org/fishery/docs/DOCUMENT/aquaculture/CulturedSpecies/file/en/en_niletilapia.htm"
                titulo="FAO — Cultured Aquatic Species: Nile tilapia"
                texto="Referência geral sobre cultivo, alimentação e condições de produção da tilápia-do-nilo."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-5 text-red-900">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 shrink-0 text-red-600"
            size={23}
          />
          <div>
            <h2 className="font-black">
              Observação importante sobre a alimentação
            </h2>
            <p className="mt-2 text-sm leading-6">
              A quantidade informada pelo sistema é apenas uma recomendação e não precisa ser fornecida obrigatoriamente na quantidade indicada. A melhor forma de alimentar os peixes é observar o comportamento do lote todos os dias e fornecer somente a quantidade que eles consigam consumir em aproximadamente 10 minutos. Após esse período, retire do tanque qualquer sobra de ração.
            </p>
            <p className="mt-2 text-sm leading-6">
              O consumo depende de diversos fatores, como qualidade e temperatura da água, oxigênio dissolvido, saúde, tamanho e comportamento dos peixes. Por isso, haverá dias em que o lote poderá consumir mais e outros em que comerá menos. Ajuste o trato conforme a resposta dos peixes e as condições do sistema de produção, seja ele RAS, tanque-rede ou tanque escavado.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center font-semibold text-slate-500">
          Calculando o arraçoamento...
        </div>
      )}

      {!loading && tanquesExibidos.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
          Nenhum tanque disponível para análise.
        </div>
      )}

      <div className="grid gap-5">
        {tanquesExibidos.map((item) => (
          <article
            key={item.tanque}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Tanque {item.tanque}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Biometria: {dataBR(item.biometriaEm)} · Sistema {SISTEMAS[item.sistemaChave].nome}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${
                  item.ajuste.nivel === "adequado"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.ajuste.nivel === "suspender"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.ajuste.nivel === "adequado"
                  ? <CheckCircle2 size={17} />
                  : <AlertTriangle size={17} />}
                {item.ajuste.titulo}
              </span>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              <Metrica titulo="Peso médio" valor={`${formatar(item.pesoMedio)} g`} />
              <Metrica titulo="Peixes vivos" valor={formatar(item.peixesVivos, 0)} />
              <Metrica titulo="Biomassa" valor={`${formatar(item.biomassa)} kg`} />
              <Metrica titulo="Taxa diária" valor={`${formatar(item.recomendacao.taxa)}%`} />
              <Metrica titulo="Ração-base" valor={`${formatar(item.racaoBase)} kg`} />
              <Metrica titulo={`Ajuste do ${SISTEMAS[item.sistemaChave].nome}`} valor={`${formatar(item.ajuste.fator * 100, 0)}%`} />
              <Metrica titulo="Ração ajustada/dia" valor={`${formatar(item.racaoDiaria)} kg`} destaque />
              <Metrica titulo="Tratos por dia" valor={item.recomendacao.tratos} />
              <Metrica titulo="Ração por trato" valor={`${formatar(item.racaoPorTrato)} kg`} destaque />
              <Metrica titulo="Carga por volume" valor={`${formatar(item.cargaRacaoVolume, 3)} kg/m³/dia`} />
              <Metrica titulo="Ração indicada" valor={`${item.recomendacao.proteina}% PB · ${item.recomendacao.granulometria}`} />
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <div>
                <h3 className="font-bold text-slate-900">
                  Manejo sugerido
                </h3>
                <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                  {manejoDoSistema(
                    item.sistemaChave
                  ).map(
                    (orientacao, indice) => (
                      <li key={orientacao}>
                        {indice + 1}. {orientacao}
                      </li>
                    )
                  )}
                </ol>
              </div>

              <div className={`rounded-lg p-4 ${
                item.ajuste.nivel === "suspender"
                  ? "bg-red-50 text-red-800"
                  : item.ajuste.nivel === "atencao" ||
                    item.ajuste.nivel === "sem-dados"
                    ? "bg-amber-50 text-amber-900"
                    : "bg-slate-50 text-slate-700"
              }`}>
                <h3 className="font-bold">
                  Condição para o trato
                </h3>
                <p className="mt-2 text-sm leading-6">
                  {item.ajuste.texto}
                </p>
                <p className="mt-3 text-xs">
                  Último parâmetro: {dataBR(item.parametroEm)}
                </p>
              </div>
            </div>

            {!item.possuiBiometria && (
              <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
                Cadastre uma biometria para tornar a recomendação mais precisa.
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

function Resumo({
  icon: Icon,
  titulo,
  valor,
  cor,
}) {
  return (
    <div className={`rounded-lg border border-slate-200 p-5 ${cor}`}>
      <Icon size={22} />
      <p className="mt-4 text-sm font-semibold">
        {titulo}
      </p>
      <p className="mt-1 text-2xl font-black">
        {valor}
      </p>
    </div>
  )
}

function Metrica({
  titulo,
  valor,
  destaque = false,
}) {
  return (
    <div className="min-w-0 bg-white p-5">
      <p className="text-sm text-slate-500">
        {titulo}
      </p>
      <p className={`mt-2 break-words text-xl font-black ${
        destaque
          ? "text-emerald-700"
          : "text-slate-950"
      }`}>
        {valor}
      </p>
    </div>
  )
}

function Fonte({
  href,
  titulo,
  texto,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-300 hover:bg-teal-50"
    >
      <span>
        <span className="font-bold text-slate-900 group-hover:text-teal-800">
          {titulo}
        </span>
        <span className="mt-1 block leading-5 text-slate-600">
          {texto}
        </span>
      </span>
      <ExternalLink
        className="mt-0.5 shrink-0 text-slate-400 group-hover:text-teal-700"
        size={17}
      />
    </a>
  )
}
