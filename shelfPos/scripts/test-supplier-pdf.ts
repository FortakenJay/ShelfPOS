import { readFileSync } from 'node:fs'
import { PDFParse } from 'pdf-parse'
import { parseSupplierInvoiceText } from '../src/main/services/productSupplierInvoicePdf'

async function main(): Promise<void> {
  const buf = readFileSync('C:/Users/Jay/Downloads/0000297335940.pdf')
  const parser = new PDFParse({ data: buf })
  const result = await parser.getText()
  await parser.destroy()
  const parsed = parseSupplierInvoiceText(result.text)
  console.log('invoice', parsed.invoiceNumber)
  console.log('lines', parsed.lines.length)
  console.log('errors', parsed.errors.length)
  console.log('parsed rows', parsed.lines.map((l) => l.row).join(','))
  console.log('error rows', parsed.errors.map((e) => e.row).join(','))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
