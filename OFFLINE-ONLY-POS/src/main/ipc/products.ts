import { handle } from './helpers'
import { AppError } from '../errors'
import { dialog } from 'electron'
import { writeFileSync } from 'node:fs'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import {
  alertsForProducts,
  applyStockDelta,
  enqueueProductSync,
  getProduct,
  getProductByBarcode,
  listCategories,
  listProducts,
  searchProducts,
  softDeleteProduct
} from '../db/repos/products'
import { currentLanguage, receiptLanguage } from '../db/repos/settings'
import { session } from '../services/session'
import { writeAudit } from '../db/repos/audit'
import { buildCsv } from '../services/csv'
import { PRODUCT_CSV_KEYS, productCsvHeaders } from '../services/csvColumns'
import { buildShelfLabelLines } from '../services/printTemplates'
import { insertPrintJob } from '../db/repos/printJobs'
import { attemptPrintJob, probePrinter, isPrintableCode128Barcode } from '../services/printer'
import {
  applyProductImport,
  buildProductImportPreview,
  readProductCsv,
  validateProductInput
} from '../services/productCsvImport'
import { readEfacturaXlsx } from '../services/productEfacturaImport'
import type {
  AdjustStockInput,
  Product,
  ProductFilters,
  ProductListResult,
  ProductImportPreview,
  ProductImportResult,
  ProductInput,
  PrintStatus,
  StockAlert
} from '../../shared/types'

const MANAGE: ('product_manager' | 'admin')[] = ['product_manager', 'admin']
const MAX_LABEL_COPIES = 20
const MAX_BATCH_LABEL_PRODUCTS = 200

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && err.message.includes('UNIQUE constraint failed')
}

async function printLabelForProduct(
  productId: number,
  copies: number,
  lang: ReturnType<typeof receiptLanguage>,
): Promise<{ printStatus: PrintStatus; printedCopies: number }> {
  const product = getProduct(productId)
  if (!product) throw new AppError('errors.productNotFound')
  if (!product.barcode.trim()) throw new AppError('errors.invalidInput')
  if (!isPrintableCode128Barcode(product.barcode)) throw new AppError('errors.invalidInput')

  const labelCopies = Math.max(1, Math.min(MAX_LABEL_COPIES, Math.trunc(copies)))
  let printStatus: PrintStatus = 'printed'
  let printedCopies = 0
  for (let i = 0; i < labelCopies; i++) {
    const printJobId = insertPrintJob('label', null, {
      lang,
      lines: buildShelfLabelLines(
        {
          productName: product.name,
          price: product.price,
          barcode: product.barcode,
        },
        lang,
      ),
    })
    if ((await attemptPrintJob(printJobId)) === 'printed') printedCopies++
    else printStatus = 'failed'
  }
  if (printedCopies > 0) {
    writeAudit('product_label_printed', {
      entity: 'product',
      entityId: productId,
      detail: `${product.name} x${printedCopies}`,
    })
  }
  return { printStatus, printedCopies }
}

export function registerProductHandlers(): void {
  handle<ProductFilters, ProductListResult>('products:list', 'authed', (filters) =>
    listProducts(filters ?? {})
  )

  handle<void, string[]>('products:categories', 'authed', () => listCategories())

  handle<{ barcode: string }, Product | null>('products:byBarcode', 'authed', ({ barcode }) =>
    getProductByBarcode(barcode.trim()) ?? null
  )

  handle<{ query: string }, Product[]>('products:search', 'authed', ({ query }) =>
    query?.trim() ? searchProducts(query.trim()) : []
  )

  handle<{ productId: number; copies?: number }, { printStatus: PrintStatus }>(
    'products:printLabel',
    MANAGE,
    async ({ productId, copies }) => {
      await probePrinter()
      const lang = receiptLanguage()
      const { printStatus } = await printLabelForProduct(productId, copies ?? 1, lang)
      return { printStatus }
    },
  )

  handle<
    { productIds: number[] },
    { printStatus: PrintStatus; printed: number; failed: number; total: number }
  >('products:printLabelBatch', MANAGE, async ({ productIds }) => {
    const seen = new Set<number>()
    const ids: number[] = []
    for (const raw of productIds) {
      const id = Math.trunc(raw)
      if (id > 0 && !seen.has(id)) {
        seen.add(id)
        ids.push(id)
      }
    }
    if (ids.length === 0 || ids.length > MAX_BATCH_LABEL_PRODUCTS) {
      throw new AppError('errors.invalidInput')
    }

    await probePrinter()
    const lang = receiptLanguage()
    let printed = 0
    let failed = 0

    for (const productId of ids) {
      try {
        const result = await printLabelForProduct(productId, 1, lang)
        if (result.printStatus === 'printed') printed++
        else failed++
      } catch {
        failed++
      }
    }

    return {
      printStatus: failed === 0 ? 'printed' : 'failed',
      printed,
      failed,
      total: ids.length,
    }
  })

  handle<ProductInput, Product>('products:create', MANAGE, (input) => {
    validateProductInput(input)
    const user = session.require()
    const db = getDb()
    const now = localNow()
    try {
      return db.transaction(() => {
        const result = db
          .prepare(
            `INSERT INTO products (barcode, name, price, cost_price, category, stock, stock_threshold, tax_category, bulk_qty, bulk_price, factura_negativo, created_at, updated_at)
             VALUES (?,?,?,?,?,0,?,?,?,?,?,?,?)`
          )
          .run(
            input.barcode.trim(),
            input.name.trim(),
            input.price,
            input.costPrice ?? null,
            input.category?.trim() || null,
            input.stockThreshold ?? null,
            'standard',
            input.bulkQty ?? null,
            input.bulkPrice ?? null,
            input.facturaNegativo ? 1 : 0,
            now,
            now
          )
        const id = Number(result.lastInsertRowid)
        if (input.stock) applyStockDelta(id, Math.floor(input.stock), user.id, 'initial_stock')
        else enqueueProductSync(id, 'insert', db)
        writeAudit('product_created', { entity: 'product', entityId: id, detail: input.name.trim() })
        return getProduct(id) as Product
      })()
    } catch (err) {
      if (isUniqueViolation(err)) throw new AppError('errors.barcodeExists')
      throw err
    }
  })

  handle<{ id: number } & ProductInput, Product>('products:update', MANAGE, (input) => {
    validateProductInput(input)
    if (!getProduct(input.id)) throw new AppError('errors.productNotFound')
    try {
      const db = getDb()
      db.transaction(() => {
        db.prepare(
          `UPDATE products SET barcode = ?, name = ?, price = ?, cost_price = ?, category = ?, stock_threshold = ?, tax_category = ?, bulk_qty = ?, bulk_price = ?, factura_negativo = ?, updated_at = ?
           WHERE id = ?`
        ).run(
          input.barcode.trim(),
          input.name.trim(),
          input.price,
          input.costPrice ?? null,
          input.category?.trim() || null,
          input.stockThreshold ?? null,
          'standard',
          input.bulkQty ?? null,
          input.bulkPrice ?? null,
          input.facturaNegativo ? 1 : 0,
          localNow(),
          input.id
        )
        enqueueProductSync(input.id, 'update', db)
      })()
    } catch (err) {
      if (isUniqueViolation(err)) throw new AppError('errors.barcodeExists')
      throw err
    }
    writeAudit('product_updated', { entity: 'product', entityId: input.id, detail: input.name.trim() })
    return getProduct(input.id) as Product
  })

  handle<{ id: number }, null>('products:delete', MANAGE, ({ id }) => {
    if (!getProduct(id, true)) throw new AppError('errors.productNotFound')
    try {
      getDb().transaction(() => {
        softDeleteProduct(id)
        writeAudit('product_deleted', { entity: 'product', entityId: id })
      })()
    } catch (err) {
      if (err instanceof Error && err.message.includes('FOREIGN KEY constraint failed')) {
        throw new AppError('errors.productInUse')
      }
      throw err
    }
    return null
  })

  handle<AdjustStockInput, { product: Product; stockAlerts: StockAlert[] }>(
    'products:adjustStock',
    MANAGE,
    (input) => {
      const user = session.require()
      const delta = Math.trunc(input.delta)
      if (!delta) throw new AppError('errors.invalidInput')
      if (!getProduct(input.productId)) throw new AppError('errors.productNotFound')
      const db = getDb()
      db.transaction(() => {
        applyStockDelta(input.productId, delta, user.id, input.reason || 'manual_correction')
        writeAudit('stock_adjusted', {
          entity: 'product',
          entityId: input.productId,
          detail: `${delta > 0 ? '+' : ''}${delta} (${input.reason || 'manual_correction'})`
        })
      })()
      return {
        product: getProduct(input.productId) as Product,
        stockAlerts: alertsForProducts([input.productId])
      }
    }
  )

  handle<{ template?: boolean }, { canceled: boolean; path?: string }>(
    'products:exportCsv',
    MANAGE,
    async ({ template }) => {
      const lang = currentLanguage()
      const result = await dialog.showSaveDialog({
        defaultPath: template ? 'plantilla-productos.csv' : 'productos.csv',
        filters: [{ name: 'CSV', extensions: ['csv'] }]
      })
      if (result.canceled || !result.filePath) return { canceled: true }

      const rows = template
        ? []
        : listProducts({}).items.map((p) => ({
            barcode: p.barcode,
            name: p.name,
            price: p.price,
            cost_price: p.cost_price ?? '',
            category: p.category ?? '',
            stock: p.stock,
            stock_threshold: p.stock_threshold ?? '',
            bulk_qty: p.bulk_qty ?? '',
            bulk_price: p.bulk_price ?? '',
            factura_negativo: p.factura_negativo ? '1' : '0'
          }))

      const csv = buildCsv(productCsvHeaders(lang), [...PRODUCT_CSV_KEYS], rows)
      writeFileSync(result.filePath, csv, 'utf8')
      return { canceled: false, path: result.filePath }
    }
  )

  handle<void, ProductImportPreview>('products:importCsvPreview', MANAGE, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (result.canceled || !result.filePaths[0]) {
      return { canceled: true, toCreate: [], toUpdate: [], unchanged: [], errors: [] }
    }
    return buildProductImportPreview(readProductCsv(result.filePaths[0]))
  })

  handle<void, ProductImportPreview>('products:importEfacturaPreview', MANAGE, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Excel (eFactura)', extensions: ['xlsx'] }]
    })
    if (result.canceled || !result.filePaths[0]) {
      return { canceled: true, toCreate: [], toUpdate: [], unchanged: [], errors: [] }
    }
    return buildProductImportPreview(await readEfacturaXlsx(result.filePaths[0]))
  })

  handle<{ filePath: string; stockMode?: 'add' | 'replace' }, ProductImportResult>(
    'products:importEfacturaConfirm',
    MANAGE,
    async ({ filePath, stockMode }) => {
      const user = session.require()
      if (!filePath?.trim()) throw new AppError('errors.invalidInput')
      return applyProductImport(await readEfacturaXlsx(filePath.trim()), user.id, stockMode ?? 'add')
    }
  )

  handle<{ filePath: string; stockMode?: 'add' | 'replace' }, ProductImportResult>(
    'products:importCsvConfirm',
    MANAGE,
    ({ filePath, stockMode }) => {
      const user = session.require()
      if (!filePath?.trim()) throw new AppError('errors.invalidInput')
      return applyProductImport(filePath.trim(), user.id, stockMode ?? 'add')
    }
  )
}
