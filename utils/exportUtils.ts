import * as XLSX from "xlsx"

export const exportToExcel = (data: any[], filename: string, sheetName = "Sheet1") => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToXML = (data: any[], filename: string, rootElement = "data") => {
  if (data.length === 0) return

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<${rootElement}>
${data
  .map((item) => {
    const itemName = rootElement.slice(0, -1) // Remove 's' from plural
    return `  <${itemName}>
${Object.entries(item)
  .map(([key, value]) => `    <${key}>${value}</${key}>`)
  .join("\n")}
  </${itemName}>`
  })
  .join("\n")}
</${rootElement}>`

  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.xml`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportMultipleSheets = (sheets: { name: string; data: any[] }[], filename: string) => {
  const workbook = XLSX.utils.book_new()

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export const exportMultipleFormats = (
  data: any[],
  filename: string,
  formats: ("excel" | "csv" | "xml")[] = ["excel", "csv", "xml"],
) => {
  formats.forEach((format) => {
    switch (format) {
      case "excel":
        exportToExcel(data, filename)
        break
      case "csv":
        exportToCSV(data, filename)
        break
      case "xml":
        exportToXML(data, filename)
        break
    }
  })
}

export const exportMultipleSheetsAllFormats = (
  sheets: { name: string; data: any[] }[],
  filename: string,
  formats: ("excel" | "csv" | "xml")[] = ["excel", "csv", "xml"],
) => {
  formats.forEach((format) => {
    if (format === "excel") {
      exportMultipleSheets(sheets, filename)
    } else {
      sheets.forEach((sheet) => {
        const sheetFilename = `${filename}-${sheet.name.toLowerCase().replace(/\s+/g, "-")}`
        if (format === "csv") {
          exportToCSV(sheet.data, sheetFilename)
        } else if (format === "xml") {
          exportToXML(sheet.data, sheetFilename, sheet.name.toLowerCase())
        }
      })
    }
  })
}
