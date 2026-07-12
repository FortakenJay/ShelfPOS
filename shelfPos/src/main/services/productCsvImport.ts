import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { basename } from 'node:path'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import { applyStockDelta, getProduct, getProductByBarcode, insertProductRow, updateProductCatalogFields } from '../db/repos/products'
import { writeAudit } from '../db/repos/audit'
import { parseCsv } from './csv'
import { parseSpreadsheetText } from './csvSpreadsheet'
import { mapProductCsvHeaders, parseFacturaNegativo, type ProductCsvKey } from './csvColumns'
import { toProductImportError } from './productImportErrors'
import type {
  Product,
  ProductImportError,
  ProductImportPreview,
  ProductImportPreviewRow,
  ProductImportResult,
  ProductImportStockMode,
  ProductInput
} from '../../shared/types'
import {
  normalizeProductInput,
  validateProductBusinessRules
} from '../../shared/productValidation'
import { parseMachineNumber } from '../../shared/money'

const STANDARD_TAX: ProductInput['taxCategory'] = 'standard'

export function validateProductInput(input: ProductInput): ProductInput {
  const normalized = normalizeProductInput(input)
  if (!validateProductBusinessRules(normalized)) {
    throw new AppError('errors.invalidInput')
  }
  return normalized
}

function cell(row: string[], index: number | undefined): string {
  if (index == null) return ''
  return (row[index] ?? '').trim()
}

export function parseProductRow(
  row: string[],
  columns: Partial<Record<ProductCsvKey, number>>
): ProductInput {
  const barcode = parseSpreadsheetText(cell(row, columns.barcode))
  const name = cell(row, columns.name)
  const priceRaw = cell(row, columns.price)
  const price = parseMachineNumber(priceRaw)
  if (!barcode || !name || price == null || price < 0) {
    throw new AppError('errors.invalidInput')
  }
  const price2Raw = cell(row, columns.price2)
  const price2 = parseMachineNumber(price2Raw)
  if (price2Raw !== '' && (price2 == null || price2 <= 0)) {
    throw new AppError('errors.invalidInput')
  }
  const price3Raw = cell(row, columns.price3)
  const price3 = parseMachineNumber(price3Raw)
  if (price3Raw !== '' && (price3 == null || price3 <= 0)) {
    throw new AppError('errors.invalidInput')
  }

  const bulkQtyRaw = cell(row, columns.bulk_qty)
  const bulkPriceRaw = cell(row, columns.bulk_price)
  const hasBulk = bulkQtyRaw !== '' || bulkPriceRaw !== ''
  let bulkQty: number | null = null
  let bulkPrice: number | null = null
  if (hasBulk) {
    bulkQty = bulkQtyRaw === '' ? null : Number(bulkQtyRaw)
    bulkPrice = parseMachineNumber(bulkPriceRaw)
    if (bulkQty == null || bulkQty < 2 || bulkPrice == null || bulkPrice < 0) {
      throw new AppError('products.csv.invalidBulk')
    }
  }

  const stockRaw = cell(row, columns.stock)
  const stock = stockRaw === '' ? 0 : Math.trunc(Number(stockRaw))
  const thresholdRaw = cell(row, columns.stock_threshold)
  const threshold = thresholdRaw === '' ? null : Math.trunc(Number(thresholdRaw))

  return {
    barcode,
    name,
    price,
    price2,
    price3,
    costPrice: parseMachineNumber(cell(row, columns.cost_price)),
    category: cell(row, columns.category) || null,
    stockProvider: null,
    stock,
    stockThreshold: threshold,
    taxCategory: STANDARD_TAX,
    bulkQty,
    bulkPrice,
    facturaNegativo: parseFacturaNegativo(cell(row, columns.factura_negativo))
  }
}

function productInputDiffers(existing: Product, input: ProductInput): boolean {
  return (
    existing.name !== input.name.trim() ||
    existing.price !== input.price ||
    (existing.price2 ?? null) !== input.price2 ||
    (existing.price3 ?? null) !== input.price3 ||
    (existing.cost_price ?? null) !== input.costPrice ||
    (existing.category ?? null) !== (input.category?.trim() || null) ||
    (existing.stock_threshold ?? null) !== input.stockThreshold ||
    (existing.bulk_qty ?? null) !== input.bulkQty ||
    (existing.bulk_price ?? null) !== input.bulkPrice ||
    Boolean(existing.factura_negativo) !== input.facturaNegativo
  )
}

export function preserveAlternatePricesWhenColumnsAreOmitted(
  input: ProductInput,
  existing: Product,
  columns: Partial<Record<ProductCsvKey, number>>
): ProductInput {
  return {
    ...input,
    price2: columns.price2 == null ? existing.price2 : input.price2,
    price3: columns.price3 == null ? existing.price3 : input.price3
  }
}

function previewRow(
  row: number,
  input: ProductInput,
  existing?: Product
): ProductImportPreviewRow {
  const base: ProductImportPreviewRow = {
    row,
    barcode: input.barcode,
    name: input.name,
    price: input.price,
    category: input.category,
    stock: input.stock,
    taxCategory: input.taxCategory
  }
  if (existing) {
    base.currentName = existing.name
    base.currentPrice = existing.price
    base.currentStock = existing.stock
  }
  return base
}

export interface ParsedCsv {
  filePath: string
  fileName: string
  sourceVersion: string
  columns: Partial<Record<ProductCsvKey, number>>
  rows: string[][]
}

export function productImportSourceVersion(content: Buffer | string): string {
  return createHash('sha256').update(content).digest('hex')
}

export function assertProductImportSourceVersion(
  content: Buffer | string,
  expectedVersion: string
): void {
  if (
    !expectedVersion ||
    productImportSourceVersion(content) !== expectedVersion
  ) {
    throw new AppError('errors.productImportSourceChanged')
  }
}

export function readProductImportSource(
  filePath: string,
  expectedVersion?: string
): Buffer {
  try {
    const content = readFileSync(filePath)
    if (expectedVersion) {
      assertProductImportSourceVersion(content, expectedVersion)
    }
    return content
  } catch (err) {
    if (expectedVersion) {
      throw new AppError('errors.productImportSourceChanged')
    }
    throw err
  }
}

export function verifyProductImportSourceVersion(
  filePath: string,
  expectedVersion: string
): void {
  readProductImportSource(filePath, expectedVersion)
}

export function readProductCsv(
  filePath: string,
  expectedVersion?: string
): ParsedCsv {
  const content = readProductImportSource(filePath, expectedVersion)
  const parsed = parseCsv(content.toString('utf8'))
  if (parsed.length < 1) throw new AppError('products.csv.empty')

  const columns = mapProductCsvHeaders(parsed[0])
  if (columns.barcode == null || columns.name == null || columns.price == null) {
    throw new AppError('products.csv.missingColumns')
  }

  return {
    filePath,
    fileName: basename(filePath),
    sourceVersion: productImportSourceVersion(content),
    columns,
    rows: parsed
  }
}

export type ProductImportDecision =
  | { action: 'create'; row: number; input: ProductInput }
  | { action: 'update' | 'unchanged'; row: number; input: ProductInput; existing: Product }

export interface AnalyzedProductImport {
  filePath: string
  fileName: string
  sourceVersion: string
  decisions: ProductImportDecision[]
  errors: ProductImportError[]
}

export function analyzeProductImport(
  parsed: ParsedCsv,
  findExisting: (barcode: string) => Product | undefined = getProductByBarcode
): AnalyzedProductImport {
  const decisions: ProductImportDecision[] = []
  const errors: ProductImportError[] = []
  const seenBarcodes = new Set<string>()

  for (let i = 1; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]
    if (row.every((c) => !c.trim())) continue

    try {
      const input = validateProductInput(parseProductRow(row, parsed.columns))
      const barcodeKey = input.barcode.trim().toLowerCase()
      if (seenBarcodes.has(barcodeKey)) {
        errors.push({ row: i + 1, key: 'products.csv.duplicateInFile' })
        continue
      }
      seenBarcodes.add(barcodeKey)

      const existing = findExisting(input.barcode)
      if (!existing) {
        decisions.push({ action: 'create', row: i + 1, input })
        continue
      }
      const effectiveInput = preserveAlternatePricesWhenColumnsAreOmitted(
        input,
        existing,
        parsed.columns
      )
      if (productInputDiffers(existing, effectiveInput)) {
        decisions.push({ action: 'update', row: i + 1, input: effectiveInput, existing })
      } else {
        decisions.push({ action: 'unchanged', row: i + 1, input: effectiveInput, existing })
      }
    } catch (err) {
      errors.push(toProductImportError(i + 1, err))
    }
  }

  return {
    filePath: parsed.filePath,
    fileName: parsed.fileName,
    sourceVersion: parsed.sourceVersion,
    decisions,
    errors
  }
}

export function buildProductImportPreview(
  analysis: AnalyzedProductImport
): ProductImportPreview {
  const rowsFor = (
    action: ProductImportDecision['action']
  ): ProductImportPreviewRow[] =>
    analysis.decisions
      .filter((decision) => decision.action === action)
      .map((decision) =>
        previewRow(
          decision.row,
          decision.input,
          decision.action === 'create' ? undefined : decision.existing
        )
      )

  return {
    canceled: false,
    filePath: analysis.filePath,
    fileName: analysis.fileName,
    sourceVersion: analysis.sourceVersion,
    toCreate: rowsFor('create'),
    toUpdate: rowsFor('update'),
    unchanged: rowsFor('unchanged'),
    errors: analysis.errors
  }
}

export function applyImportStock(
  productId: number,
  importStock: number,
  stockMode: ProductImportStockMode,
  userId: number
): boolean {
  const product = getProduct(productId)
  if (!product) return false
  const delta = productImportStockDelta(product.stock, importStock, stockMode)
  if (delta === 0) return false
  applyStockDelta(productId, delta, userId, 'csv_import')
  return true
}

export function productImportStockDelta(
  currentStock: number,
  importStock: number,
  stockMode: ProductImportStockMode
): number {
  return stockMode === 'add' ? importStock : importStock - currentStock
}

export function applyProductImport(
  analysis: AnalyzedProductImport,
  userId: number,
  stockMode: ProductImportStockMode = 'add'
): ProductImportResult {
  const db = getDb()
  const errors: ProductImportError[] = [...analysis.errors]
  let created = 0
  let updated = 0

  const insertRow = (input: ProductInput, row: number): void => {
    try {
      db.transaction(() => {
        const now = localNow()
        const id = insertProductRow(db, { ...input, stockProvider: input.stockProvider ?? null }, now)
        if (input.stock) applyStockDelta(id, input.stock, userId, 'csv_import')
        writeAudit('product_created', {
          entity: 'product',
          entityId: id,
          detail: `${input.name} (csv)`
        })
      })()
      created++
    } catch (err) {
      errors.push(toProductImportError(row, err))
    }
  }

  const updateRow = (existing: Product, input: ProductInput, row: number): void => {
    try {
      db.transaction(() => {
        updateProductCatalogFields(db, existing.id, input, { includeStockProvider: false })
        applyImportStock(existing.id, input.stock, stockMode, userId)
        writeAudit('product_updated', {
          entity: 'product',
          entityId: existing.id,
          detail: `${input.name} (csv)`
        })
      })()
      updated++
    } catch (err) {
      errors.push(toProductImportError(row, err))
    }
  }

  const applyStockOnlyRow = (existing: Product, input: ProductInput, row: number): void => {
    try {
      let stockChanged = false
      db.transaction(() => {
        stockChanged = applyImportStock(existing.id, input.stock, stockMode, userId)
      })()
      if (stockChanged) updated++
    } catch (err) {
      errors.push(toProductImportError(row, err))
    }
  }

  for (const decision of analysis.decisions) {
    if (decision.action === 'create') {
      insertRow(decision.input, decision.row)
    } else if (decision.action === 'update') {
      updateRow(decision.existing, decision.input, decision.row)
    } else {
      applyStockOnlyRow(decision.existing, decision.input, decision.row)
    }
  }

  return { canceled: false, created, updated, errors }
}
