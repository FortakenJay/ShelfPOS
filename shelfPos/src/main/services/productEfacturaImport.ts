import { basename } from 'node:path'
import ExcelJS from 'exceljs'
import { AppError } from '../errors'
import { parseMachineNumber } from '../../shared/money'
import { IMPORT_STOCK_GARBAGE_THRESHOLD } from '../../shared/schemas/primitives'
import {
  productImportSourceVersion,
  readProductImportSource,
  type ParsedCsv
} from './productCsvImport'
import type { ProductCsvKey } from './csvColumns'

/** eFactura product export column letters (header row). */
const EFACTURA_HEADERS = new Set(['a', 'b', 'p1'])

function normalizeCell(value: unknown): string {
  if (value == null) return ''
  return String(value).trim()
}

function cellToValue(value: ExcelJS.CellValue): unknown {
  if (value == null || value === '') return ''
  if (typeof value === 'object') {
    if ('result' in value) return value.result ?? ''
    if ('richText' in value) return value.richText.map((part) => part.text).join('')
    if ('text' in value && typeof value.text === 'string') return value.text
    if (value instanceof Date) return value.toISOString()
  }
  return value
}

function worksheetToMatrix(sheet: ExcelJS.Worksheet): unknown[][] {
  const matrix: unknown[][] = []
  const rowCount = sheet.rowCount
  for (let rowIndex = 1; rowIndex <= rowCount; rowIndex++) {
    const row = sheet.getRow(rowIndex)
    const cells: unknown[] = []
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      while (cells.length < colNumber - 1) cells.push('')
      cells.push(cellToValue(cell.value))
    })
    matrix.push(cells)
  }
  return matrix
}

function findHeaderRow(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const letters = new Set(rows[i].map((c) => normalizeCell(c).toLowerCase()))
    if ([...EFACTURA_HEADERS].every((h) => letters.has(h))) return i
  }
  throw new AppError('products.efactura.missingHeaders')
}

function mapLetterColumns(headerRow: unknown[]): Record<string, number> {
  const map: Record<string, number> = {}
  headerRow.forEach((cell, index) => {
    const key = normalizeCell(cell).toLowerCase()
    if (key) map[key] = index
  })
  return map
}

function cell(row: unknown[], cols: Record<string, number>, letter: string): string {
  const index = cols[letter]
  if (index == null) return ''
  return normalizeCell(row[index])
}

function parseEfacturaStock(raw: string): number {
  if (!raw.trim()) return 0
  const n = Math.trunc(parseMachineNumber(raw) ?? 0)
  if (!Number.isFinite(n) || n < 0 || n > IMPORT_STOCK_GARBAGE_THRESHOLD) return 0
  return n
}

function efacturaRowToProductCsvRow(
  row: unknown[],
  cols: Record<string, number>
): string[] | null {
  const active = cell(row, cols, 'e')
  if (active && active !== '1') return null

  const barcode = cell(row, cols, 'a') || cell(row, cols, 'k')
  const name = cell(row, cols, 'b')
  const priceRaw = cell(row, cols, 'p1')
  if (!barcode || !name || !priceRaw) return null

  const price = parseMachineNumber(priceRaw)
  if (price == null || price < 0) return null

  const costRaw = cell(row, cols, 'h')
  const cost = parseMachineNumber(costRaw)
  const costPrice = cost != null && cost > 0 ? String(cost) : ''

  const stockRaw = cell(row, cols, 'c')
  const stock = String(parseEfacturaStock(stockRaw))

  const bulkQtyRaw = cell(row, cols, 'p2a')
  const bulkPriceRaw = cell(row, cols, 'p2')
  const bulkQty = bulkQtyRaw === '' ? '' : String(Math.trunc(Number(bulkQtyRaw) || 0))
  const bulkPrice =
    bulkPriceRaw === '' ? '' : String(parseMachineNumber(bulkPriceRaw) ?? '')

  const facturaNegativo = cell(row, cols, 'g') === '1' ? '1' : '0'

  return [
    barcode,
    name,
    String(price),
    costPrice,
    '',
    stock,
    '',
    bulkQty,
    bulkPrice,
    facturaNegativo
  ]
}

/** eFactura has no alternate-price columns — omit them so CSV import preserves existing values. */
const NORMALIZED_CSV_COLUMNS: Partial<Record<ProductCsvKey, number>> = {
  barcode: 0,
  name: 1,
  price: 2,
  cost_price: 3,
  category: 4,
  stock: 5,
  stock_threshold: 6,
  bulk_qty: 7,
  bulk_price: 8,
  factura_negativo: 9
}

/**
 * Reads an eFactura "productos" XLSX and normalizes rows for the existing CSV import pipeline.
 *
 * Mapped: a/k→barcode, b→name, p1→price, h→cost, c→stock, g→factura negativo, p2/p2a→mayorista.
 * Stock above 10,000,000 is treated as 0 (corrupt eFactura values).
 */
export async function readEfacturaXlsx(
  filePath: string,
  expectedVersion?: string
): Promise<ParsedCsv> {
  const buffer = readProductImportSource(filePath, expectedVersion)
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer)

  const sheet = workbook.worksheets[0]
  if (!sheet) throw new AppError('products.efactura.empty')

  const matrix = worksheetToMatrix(sheet)
  if (matrix.length < 2) throw new AppError('products.efactura.empty')

  const headerIndex = findHeaderRow(matrix)
  const letterCols = mapLetterColumns(matrix[headerIndex])
  if (letterCols.a == null && letterCols.k == null) {
    throw new AppError('products.efactura.missingHeaders')
  }
  if (letterCols.b == null || letterCols.p1 == null) {
    throw new AppError('products.efactura.missingHeaders')
  }

  const normalizedRows: string[][] = [Object.keys(NORMALIZED_CSV_COLUMNS).map((k) => k)]
  for (let i = headerIndex + 1; i < matrix.length; i++) {
    const row = matrix[i]
    if (!row || row.every((c) => !normalizeCell(c))) continue
    const converted = efacturaRowToProductCsvRow(row, letterCols)
    if (converted) normalizedRows.push(converted)
  }

  if (normalizedRows.length < 2) throw new AppError('products.efactura.noRows')

  return {
    filePath,
    fileName: basename(filePath),
    sourceVersion: productImportSourceVersion(buffer),
    columns: NORMALIZED_CSV_COLUMNS,
    rows: normalizedRows
  }
}
