import { rename, unlink } from 'node:fs/promises'
import { getDb } from '../db'
import { ACTIVE_PRODUCT_SQL } from '../db/repos/products'
import { csvEscape } from './csv'
import { asSpreadsheetText } from './csvSpreadsheet'
import { PRODUCT_CSV_KEYS, productCsvHeaders } from './csvColumns'
import { closeWriteStream, openUtf8CsvWriteStream, writeToStream } from './csvStream'
import type { Language } from '../../shared/types'

/** Rows fetched per DB round-trip — balances memory and query count at 100k+ scale. */
const EXPORT_BATCH_SIZE = 1000

/** Lines buffered per disk write — fewer syscalls without large memory spikes. */
const WRITE_BUFFER_LINES = 256

const PRODUCT_EXPORT_COLUMNS = `
  id, barcode, name, price, cost_price, category, stock, stock_threshold, bulk_qty, bulk_price, factura_negativo
`.trim()

export type ProductExportRow = {
  id: number
  barcode: string
  name: string
  price: number
  cost_price: number | null
  category: string | null
  stock: number
  stock_threshold: number | null
  bulk_qty: number | null
  bulk_price: number | null
  factura_negativo: number
}

function formatProductExportLine(row: ProductExportRow): string {
  const values: Record<(typeof PRODUCT_CSV_KEYS)[number], unknown> = {
    barcode: asSpreadsheetText(row.barcode ?? ''),
    name: row.name,
    price: row.price,
    cost_price: row.cost_price ?? '',
    category: row.category ?? '',
    stock: row.stock,
    stock_threshold: row.stock_threshold ?? '',
    bulk_qty: row.bulk_qty ?? '',
    bulk_price: row.bulk_price ?? '',
    factura_negativo: row.factura_negativo ? '1' : '0'
  }
  return `${PRODUCT_CSV_KEYS.map((key) => csvEscape(values[key])).join(',')}\r\n`
}

function createExportBatchStatement() {
  return getDb().prepare(
    `SELECT ${PRODUCT_EXPORT_COLUMNS}
     FROM products
     WHERE ${ACTIVE_PRODUCT_SQL} AND id > ?
     ORDER BY id
     LIMIT ?`
  )
}

async function flushLines(stream: ReturnType<typeof openUtf8CsvWriteStream>, lines: string[]): Promise<void> {
  if (lines.length === 0) return
  await writeToStream(stream, lines.join(''))
  lines.length = 0
}

/**
 * Streams the full active catalog to a UTF-8 CSV file.
 * Keyset pagination + buffered writes keep memory flat for large inventories.
 */
export async function exportProductsToCsv(
  filePath: string,
  lang: Language,
  template = false
): Promise<void> {
  const tempPath = `${filePath}.tmp`
  const stream = openUtf8CsvWriteStream(tempPath)
  const lineBuffer: string[] = []

  try {
    await writeToStream(stream, '\uFEFF')
    await writeToStream(stream, `${productCsvHeaders(lang).map(csvEscape).join(',')}`)

    if (template) {
      await closeWriteStream(stream)
      await rename(tempPath, filePath)
      return
    }

    await writeToStream(stream, '\r\n')

    const listBatch = createExportBatchStatement()
    let lastId = 0
    while (true) {
      const rows = listBatch.all(lastId, EXPORT_BATCH_SIZE) as ProductExportRow[]
      if (rows.length === 0) break

      for (const row of rows) {
        lineBuffer.push(formatProductExportLine(row))
        if (lineBuffer.length >= WRITE_BUFFER_LINES) {
          await flushLines(stream, lineBuffer)
        }
      }

      lastId = rows[rows.length - 1].id
    }

    await flushLines(stream, lineBuffer)
    await closeWriteStream(stream)
    await rename(tempPath, filePath)
  } catch (err) {
    stream.destroy()
    await unlink(tempPath).catch(() => undefined)
    throw err
  }
}
