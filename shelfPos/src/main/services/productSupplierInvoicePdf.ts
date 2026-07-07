import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { PDFParse } from 'pdf-parse'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import {
  applyStockDelta,
  getProduct,
  getProductByBarcode,
  insertProductRow,
  updateProductCostPrice
} from '../db/repos/products'
import { writeAudit } from '../db/repos/audit'
import { validateProductInput } from './productCsvImport'
import { roundColones } from '../../shared/money'
import type {
  ProductImportError,
  SupplierInvoiceConfirmInput,
  SupplierInvoiceLine,
  SupplierInvoicePreview,
  SupplierInvoiceResult
} from '../../shared/types'

const ITEM_START_RE = /^\s*(\d+)\s+(\d{10,14})\s*$/
const SHORT_CODE_RE = /^\s*(\d{4,9})\s*$/
const TRAILING_NUMBERS_RE =
  /(\d+(?:\.\d+)?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*$/
const INVOICE_NUMBER_RE = /P\s*#\s*(\d+)/i

function normalizePdfText(raw: string): string[] {
  return raw
    .replaceAll('\0', ' ')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
}

function parseMoney(raw: string): number {
  const n = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(n)) throw new AppError('errors.invalidInput')
  return roundColones(n)
}

function guessCategory(name: string): string | null {
  const first = name.split(/\s+/)[0]
  if (!first || first.length < 2) return null
  if (first === first.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(first)) return first
  return null
}

function extractTrailingNumbers(line: string): {
  description: string
  qty: number
  unitPrice: number
  discountPercent: number
  lineTotal: number
} | null {
  const match = line.match(TRAILING_NUMBERS_RE)
  if (!match) return null
  const qty = Number(match[1])
  const unitPrice = parseMoney(match[2])
  const discountPercent = Number(match[3])
  const lineTotal = parseMoney(match[4])
  if (!Number.isFinite(qty) || qty <= 0) return null
  const description = line.slice(0, match.index).trim()
  return { description, qty, unitPrice, discountPercent, lineTotal }
}

export function parseSupplierInvoiceText(text: string): {
  invoiceNumber: string | null
  lines: SupplierInvoiceLine[]
  errors: ProductImportError[]
} {
  const rows = normalizePdfText(text)
  const invoiceMatch = rows.join(' ').match(INVOICE_NUMBER_RE)
  const invoiceNumber = invoiceMatch?.[1] ?? null

  const headerIndex = rows.findIndex((line) =>
    /codigo/i.test(line) && /detalle/i.test(line) && /cant/i.test(line)
  )
  if (headerIndex < 0) {
    throw new AppError('products.supplierInvoice.missingHeaders')
  }

  const lines: SupplierInvoiceLine[] = []
  const errors: ProductImportError[] = []
  let i = headerIndex + 1

  while (i < rows.length) {
    const line = rows[i]
    if (/^subtotal\b/i.test(line)) break
    if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(line)) {
      i++
      continue
    }
    if (/pag\s+\d+\/\d+/i.test(line) && !ITEM_START_RE.test(line)) {
      i++
      continue
    }

    const itemStart = line.match(ITEM_START_RE)
    if (!itemStart) {
      i++
      continue
    }

    const row = Number(itemStart[1])
    const barcode = itemStart[2]
    i++
    if (i < rows.length && SHORT_CODE_RE.test(rows[i]) && !extractTrailingNumbers(rows[i])) {
      i++
    }

    const descriptionParts: string[] = []
    let parsed: ReturnType<typeof extractTrailingNumbers> = null
    while (i < rows.length) {
      const current = rows[i]
      if (ITEM_START_RE.test(current) || /^subtotal\b/i.test(current)) break
      if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(current)) {
        i++
        continue
      }
      if (/pag\s+\d+\/\d+/i.test(current) && !extractTrailingNumbers(current)) {
        i++
        continue
      }

      parsed = extractTrailingNumbers(current)
      if (parsed) {
        i++
        break
      }
      descriptionParts.push(current)
      i++
    }

    if (!parsed) {
      errors.push({ row, key: 'products.supplierInvoice.unparsedLine', detail: barcode })
      continue
    }

    const name = [...descriptionParts, parsed.description].join(' ').replace(/\s+/g, ' ').trim()
    if (!name) {
      errors.push({ row, key: 'products.supplierInvoice.unparsedLine', detail: barcode })
      continue
    }
    const unitCost = roundColones(parsed.lineTotal / parsed.qty)

    lines.push({
      row,
      barcode,
      name,
      qty: Math.trunc(parsed.qty),
      unitCost,
      unitPrice: parsed.unitPrice,
      discountPercent: parsed.discountPercent,
      lineTotal: parsed.lineTotal,
      categoryHint: guessCategory(name)
    })
  }

  if (lines.length === 0) throw new AppError('products.supplierInvoice.noLines')
  return { invoiceNumber, lines, errors }
}

export async function readSupplierInvoicePdf(filePath: string): Promise<{
  filePath: string
  fileName: string
  invoiceNumber: string | null
  lines: SupplierInvoiceLine[]
  errors: ProductImportError[]
}> {
  const buffer = readFileSync(filePath)
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    const parsed = parseSupplierInvoiceText(result.text)
    return {
      filePath,
      fileName: basename(filePath),
      ...parsed
    }
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError('products.supplierInvoice.parseFailed')
  } finally {
    await parser.destroy()
  }
}

export function buildSupplierInvoicePreview(filePath: string): Promise<SupplierInvoicePreview> {
  return readSupplierInvoicePdf(filePath).then((parsed) => {
    const restock: SupplierInvoicePreview['restock'] = []
    const newItems: SupplierInvoicePreview['newItems'] = []
    const errors = [...parsed.errors]
    const seenBarcodes = new Set<string>()

    for (const line of parsed.lines) {
      const barcodeKey = line.barcode.toLowerCase()
      if (seenBarcodes.has(barcodeKey)) {
        errors.push({
          row: line.row,
          key: 'products.csv.duplicateInFile',
          detail: line.barcode
        })
        continue
      }
      seenBarcodes.add(barcodeKey)

      const existing = getProductByBarcode(line.barcode)
      if (existing) {
        restock.push({
          line: line.row,
          productId: existing.id,
          barcode: line.barcode,
          name: existing.name,
          qty: line.qty,
          unitCost: line.unitCost,
          currentStock: existing.stock,
          currentCost: existing.cost_price
        })
      } else {
        newItems.push({
          line: line.row,
          barcode: line.barcode,
          name: line.name,
          qty: line.qty,
          unitCost: line.unitCost,
          category: line.categoryHint,
          price: null
        })
      }
    }

    return {
      canceled: false,
      filePath: parsed.filePath,
      fileName: parsed.fileName,
      invoiceNumber: parsed.invoiceNumber,
      restock,
      newItems,
      errors
    }
  })
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && err.message.includes('UNIQUE constraint failed')
}

export function applySupplierInvoiceImport(
  input: SupplierInvoiceConfirmInput,
  userId: number
): SupplierInvoiceResult {
  const errors: ProductImportError[] = []
  let restocked = 0
  let created = 0
  const db = getDb()

  db.transaction(() => {
    for (const row of input.restock) {
      try {
        const product = getProduct(row.productId)
        if (!product) {
          errors.push({ row: row.line, key: 'errors.productNotFound' })
          continue
        }
        const qty = Math.trunc(row.qty)
        if (qty <= 0) continue
        applyStockDelta(product.id, qty, userId, 'received_shipment')
        if (input.updateCostOnRestock && row.unitCost != null && row.unitCost > 0) {
          updateProductCostPrice(db, product.id, row.unitCost, localNow())
        }
        writeAudit('stock_adjusted', {
          entity: 'product',
          entityId: product.id,
          detail: `+${qty} (supplier_invoice)`
        })
        restocked++
      } catch (err) {
        const key = err instanceof AppError ? err.key : 'errors.unknown'
        errors.push({ row: row.line, key })
      }
    }

    for (const item of input.newItems) {
      try {
        const price = roundColones(item.price)
        if (!Number.isFinite(price) || price < 0) {
          errors.push({ row: item.line, key: 'errors.invalidInput', detail: item.barcode })
          continue
        }
        const productInput = {
          barcode: item.barcode.trim(),
          name: item.name.trim(),
          price,
          costPrice: item.unitCost != null && item.unitCost > 0 ? item.unitCost : null,
          category: item.category?.trim() || null,
          stockProvider: null,
          stock: Math.trunc(item.qty),
          stockThreshold: null,
          taxCategory: 'standard' as const,
          bulkQty: null,
          bulkPrice: null,
          facturaNegativo: false
        }
        validateProductInput(productInput)
        if (getProductByBarcode(productInput.barcode)) {
          errors.push({ row: item.line, key: 'errors.barcodeExists', detail: item.barcode })
          continue
        }

        const now = localNow()
        const id = insertProductRow(db, productInput, now)
        if (productInput.stock > 0) {
          applyStockDelta(id, productInput.stock, userId, 'received_shipment')
        }
        writeAudit('product_created', {
          entity: 'product',
          entityId: id,
          detail: `${productInput.name} (supplier_invoice)`
        })
        created++
      } catch (err) {
        if (isUniqueViolation(err)) {
          errors.push({ row: item.line, key: 'errors.barcodeExists', detail: item.barcode })
          continue
        }
        const key = err instanceof AppError ? err.key : 'errors.unknown'
        errors.push({ row: item.line, key, detail: item.barcode })
      }
    }
  })()

  return {
    canceled: false,
    restocked,
    created,
    errors: errors.length > 0 ? errors : undefined
  }
}
