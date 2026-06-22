import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import { applyStockDelta, getProduct, getProductByBarcode } from '../db/repos/products'
import { writeAudit } from '../db/repos/audit'
import { parseCsv } from './csv'
import { mapProductCsvHeaders, parseFacturaNegativo, type ProductCsvKey } from './csvColumns'
import type {
  Product,
  ProductImportError,
  ProductImportPreview,
  ProductImportPreviewRow,
  ProductImportResult,
  ProductImportStockMode,
  ProductInput
} from '../../shared/types'
import { roundColones } from '../../shared/money'
import { MAX_PRODUCT_STOCK } from '../../shared/schemas/primitives'

const STANDARD_TAX: ProductInput['taxCategory'] = 'standard'

export function validateProductInput(input: ProductInput): void {
  if (!input.barcode?.trim() || !input.name?.trim()) throw new AppError('errors.invalidInput')
  if (!Number.isFinite(input.price) || input.price < 0) throw new AppError('errors.invalidInput')
  if (
    !Number.isInteger(input.stock) ||
    input.stock < 0 ||
    input.stock > MAX_PRODUCT_STOCK
  ) {
    throw new AppError('errors.invalidInput')
  }
  if (input.taxCategory !== STANDARD_TAX) throw new AppError('errors.invalidInput')
  const hasQty = input.bulkQty != null
  const hasPrice = input.bulkPrice != null
  if (hasQty !== hasPrice) throw new AppError('errors.invalidInput')
  if (hasQty) {
    if (!Number.isInteger(input.bulkQty) || (input.bulkQty as number) < 2) {
      throw new AppError('errors.invalidInput')
    }
    if (!Number.isFinite(input.bulkPrice as number) || (input.bulkPrice as number) < 0) {
      throw new AppError('errors.invalidInput')
    }
  }
  input.price = roundColones(input.price)
  if (input.bulkPrice != null) input.bulkPrice = roundColones(input.bulkPrice)
}

function cell(row: string[], index: number | undefined): string {
  if (index == null) return ''
  return (row[index] ?? '').trim()
}

function parseOptionalNumber(raw: string): number | null {
  if (!raw.trim()) return null
  const n = Number(raw.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

export function parseProductRow(
  row: string[],
  columns: Partial<Record<ProductCsvKey, number>>
): ProductInput {
  const barcode = cell(row, columns.barcode)
  const name = cell(row, columns.name)
  const priceRaw = cell(row, columns.price)
  const price = parseOptionalNumber(priceRaw)
  if (!barcode || !name || price == null || price < 0) {
    throw new AppError('errors.invalidInput')
  }

  const bulkQtyRaw = cell(row, columns.bulk_qty)
  const bulkPriceRaw = cell(row, columns.bulk_price)
  const hasBulk = bulkQtyRaw !== '' || bulkPriceRaw !== ''
  let bulkQty: number | null = null
  let bulkPrice: number | null = null
  if (hasBulk) {
    bulkQty = bulkQtyRaw === '' ? null : Math.trunc(Number(bulkQtyRaw))
    bulkPrice = parseOptionalNumber(bulkPriceRaw)
    if (bulkQty == null || bulkQty < 2 || bulkPrice == null || bulkPrice < 0) {
      throw new AppError('products.csv.invalidBulk')
    }
  }

  const stockRaw = cell(row, columns.stock)
  const stock = stockRaw === '' ? 0 : Math.trunc(Number(stockRaw) || 0)
  const thresholdRaw = cell(row, columns.stock_threshold)
  const threshold = thresholdRaw === '' ? null : Math.trunc(Number(thresholdRaw) || 0)

  return {
    barcode,
    name,
    price,
    costPrice: parseOptionalNumber(cell(row, columns.cost_price)),
    category: cell(row, columns.category) || null,
    stock: stock < 0 ? 0 : stock,
    stockThreshold: threshold != null && threshold >= 0 ? threshold : null,
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
    (existing.cost_price ?? null) !== input.costPrice ||
    (existing.category ?? null) !== (input.category?.trim() || null) ||
    (existing.stock_threshold ?? null) !== input.stockThreshold ||
    (existing.bulk_qty ?? null) !== input.bulkQty ||
    (existing.bulk_price ?? null) !== input.bulkPrice ||
    Boolean(existing.factura_negativo) !== input.facturaNegativo
  )
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
  columns: Partial<Record<ProductCsvKey, number>>
  rows: string[][]
}

export function readProductCsv(filePath: string): ParsedCsv {
  const parsed = parseCsv(readFileSync(filePath, 'utf8'))
  if (parsed.length < 1) throw new AppError('products.csv.empty')

  const columns = mapProductCsvHeaders(parsed[0])
  if (columns.barcode == null || columns.name == null || columns.price == null) {
    throw new AppError('products.csv.missingColumns')
  }

  return { filePath, fileName: basename(filePath), columns, rows: parsed }
}

export function buildProductImportPreview(parsed: ParsedCsv): ProductImportPreview {
  const toCreate: ProductImportPreviewRow[] = []
  const toUpdate: ProductImportPreviewRow[] = []
  const unchanged: ProductImportPreviewRow[] = []
  const errors: ProductImportError[] = []
  const seenBarcodes = new Set<string>()

  for (let i = 1; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]
    if (row.every((c) => !c.trim())) continue

    try {
      const input = parseProductRow(row, parsed.columns)
      validateProductInput(input)
      const barcodeKey = input.barcode.trim().toLowerCase()
      if (seenBarcodes.has(barcodeKey)) {
        errors.push({ row: i + 1, key: 'products.csv.duplicateInFile' })
        continue
      }
      seenBarcodes.add(barcodeKey)

      const existing = getProductByBarcode(input.barcode)
      if (!existing) {
        toCreate.push(previewRow(i + 1, input))
        continue
      }
      if (productInputDiffers(existing, input)) {
        toUpdate.push(previewRow(i + 1, input, existing))
      } else {
        unchanged.push(previewRow(i + 1, input, existing))
      }
    } catch (err) {
      const key = err instanceof AppError ? err.key : 'errors.unknown'
      const detail = err instanceof Error && !(err instanceof AppError) ? err.message : undefined
      errors.push({ row: i + 1, key, detail })
    }
  }

  return {
    canceled: false,
    filePath: parsed.filePath,
    fileName: parsed.fileName,
    toCreate,
    toUpdate,
    unchanged,
    errors
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
  const delta = stockMode === 'add' ? importStock : importStock - product.stock
  if (delta === 0) return false
  applyStockDelta(productId, delta, userId, 'csv_import')
  return true
}

export function applyProductImport(
  filePathOrParsed: string | ParsedCsv,
  userId: number,
  stockMode: ProductImportStockMode = 'add'
): ProductImportResult {
  const parsed = typeof filePathOrParsed === 'string' ? readProductCsv(filePathOrParsed) : filePathOrParsed
  const preview = buildProductImportPreview(parsed)
  const db = getDb()
  const errors: ProductImportError[] = [...preview.errors]
  let created = 0
  let updated = 0

  const insertRow = (input: ProductInput, row: number): void => {
    try {
      db.transaction(() => {
        const now = localNow()
        const insert = db
          .prepare(
            `INSERT INTO products (barcode, name, price, cost_price, category, stock, stock_threshold, tax_category, bulk_qty, bulk_price, factura_negativo, created_at, updated_at)
             VALUES (?,?,?,?,?,0,?,?,?,?,?,?,?)`
          )
          .run(
            input.barcode.trim(),
            input.name.trim(),
            input.price,
            input.costPrice,
            input.category,
            input.stockThreshold,
            input.taxCategory,
            input.bulkQty,
            input.bulkPrice,
            input.facturaNegativo ? 1 : 0,
            now,
            now
          )
        const id = Number(insert.lastInsertRowid)
        if (input.stock) applyStockDelta(id, input.stock, userId, 'csv_import')
        writeAudit('product_created', {
          entity: 'product',
          entityId: id,
          detail: `${input.name} (csv)`
        })
      })()
      created++
    } catch (err) {
      const key = err instanceof AppError ? err.key : 'errors.unknown'
      const detail = err instanceof Error && !(err instanceof AppError) ? err.message : undefined
      errors.push({ row, key, detail })
    }
  }

  const updateRow = (existing: Product, input: ProductInput, row: number): void => {
    try {
      db.transaction(() => {
        getDb()
          .prepare(
            `UPDATE products SET barcode = ?, name = ?, price = ?, cost_price = ?, category = ?, stock_threshold = ?, tax_category = ?, bulk_qty = ?, bulk_price = ?, factura_negativo = ?, updated_at = ?
             WHERE id = ?`
          )
          .run(
            input.barcode.trim(),
            input.name.trim(),
            input.price,
            input.costPrice,
            input.category,
            input.stockThreshold,
            input.taxCategory,
            input.bulkQty,
            input.bulkPrice,
            input.facturaNegativo ? 1 : 0,
            localNow(),
            existing.id
          )
        applyImportStock(existing.id, input.stock, stockMode, userId)
        writeAudit('product_updated', {
          entity: 'product',
          entityId: existing.id,
          detail: `${input.name} (csv)`
        })
      })()
      updated++
    } catch (err) {
      const key = err instanceof AppError ? err.key : 'errors.unknown'
      const detail = err instanceof Error && !(err instanceof AppError) ? err.message : undefined
      errors.push({ row, key, detail })
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
      const key = err instanceof AppError ? err.key : 'errors.unknown'
      const detail = err instanceof Error && !(err instanceof AppError) ? err.message : undefined
      errors.push({ row, key, detail })
    }
  }

  const seenBarcodes = new Set<string>()

  for (let i = 1; i < parsed.rows.length; i++) {
    const row = parsed.rows[i]
    if (row.every((c) => !c.trim())) continue

    try {
      const input = parseProductRow(row, parsed.columns)
      validateProductInput(input)
      const barcodeKey = input.barcode.trim().toLowerCase()
      if (seenBarcodes.has(barcodeKey)) continue
      seenBarcodes.add(barcodeKey)

      const existing = getProductByBarcode(input.barcode)
      if (!existing) {
        insertRow(input, i + 1)
      } else if (productInputDiffers(existing, input)) {
        updateRow(existing, input, i + 1)
      } else {
        applyStockOnlyRow(existing, input, i + 1)
      }
    } catch {
      // Already captured in preview.errors; skip invalid rows on apply.
    }
  }

  return { canceled: false, created, updated, errors }
}
