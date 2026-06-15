export function formatarDataBR(data) {
  if (!data) return "-"

  const valor = String(data)
  const dataSemHorario =
    valor.split("T")[0]

  if (/^\d{4}-\d{2}-\d{2}$/.test(dataSemHorario)) {
    const [ano, mes, dia] =
      dataSemHorario.split("-")

    return `${dia}/${mes}/${ano}`
  }

  const dataConvertida =
    new Date(valor)

  return Number.isNaN(dataConvertida.getTime())
    ? valor
    : dataConvertida.toLocaleDateString("pt-BR")
}

export function criarDataLocal(data) {
  if (!data) return null

  const valor = String(data)
  const dataSemHorario =
    valor.split("T")[0]

  if (/^\d{4}-\d{2}-\d{2}$/.test(dataSemHorario)) {
    const [ano, mes, dia] =
      dataSemHorario.split("-").map(Number)

    return new Date(ano, mes - 1, dia)
  }

  const dataConvertida =
    new Date(valor)

  if (Number.isNaN(dataConvertida.getTime())) {
    return null
  }

  return new Date(
    dataConvertida.getFullYear(),
    dataConvertida.getMonth(),
    dataConvertida.getDate()
  )
}
