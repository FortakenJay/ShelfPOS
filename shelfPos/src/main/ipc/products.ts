import { handle } from './helpers'
import { AppError } from '../errors'
import { dialog } from 'electron'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import {
  alertsForProducts,
  applyStockDelta,
  enqueueProductSync,
  getProduct,
  getProductByBarcode,
  insertProductRow,
  listCategories,
  listProducts,
  listStockProviders,
  releaseBarcodeForReuse,
  searchProducts,
  softDeleteProduct,
  updateProductCatalogFields
} from '../db/repos/products'
import { currentLanguage, receiptLanguage } from '../db/repos/settings'
import { session } from '../services/session'
import { writeAudit } from '../db/repos/audit'
import { exportProductsToCsv } from '../services/productCsvExport'
import { buildProductBarcodeLabelLines, buildShelfLabelLines } from '../services/printTemplates'
import { labelPrintPayload } from '../services/labelPrintLines'
import type { PrintLine } from '../../shared/types'
import { insertPrintJob } from '../db/repos/printJobs'
import { attemptPrintJob, probePrinter } from '../services/printer'
import { barcodePrintValue, isPrintableCode128Barcode } from '../../shared/barcode'
import { MAX_LABEL_COPIES } from '../../shared/printLimits'
import {
  applyProductImport,
  buildProductImportPreview,
  readProductCsv,
  validateProductInput
} from '../services/productCsvImport'
import { readEfacturaXlsx } from '../services/productEfacturaImport'
import {
  applySupplierInvoiceImport,
  buildSupplierInvoicePreview
} from '../services/productSupplierInvoicePdf'
import type {
  AdjustStockInput,
  Product,
  ProductFilters,
  ProductListResult,
  ProductImportPreview,
  ProductImportResult,
  ProductImportStockMode,
  ProductInput,
  PrintStatus,
  StockAlert,
  SupplierInvoiceConfirmInput,
  SupplierInvoicePreview,
  SupplierInvoiceResult
} from '../../shared/types'

const MANAGE: ('product_manager' | 'admin')[] = ['product_manager', 'admin']
const MAX_BATCH_LABEL_PRODUCTS = 200

function normalizeBatchPrintItems(
  items: { productId: number; copies?: number }[]
): { productId: number; copies: number }[] {
  const seen = new Set<number>()
  const normalized: { productId: number; copies: number }[] = []
  for (const raw of items) {
    const productId = Math.trunc(raw.productId)
    if (productId <= 0 || seen.has(productId)) continue
    seen.add(productId)
    normalized.push({
      productId,
      copies: Math.max(1, Math.min(MAX_LABEL_COPIES, Math.trunc(raw.copies ?? 1))),
    })
  }
  return normalized
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && err.message.includes('UNIQUE constraint failed')
}

function mapProductDbError(err: unknown): never {
  if (isUniqueViolation(err)) throw new AppError('errors.barcodeExists')
  if (err instanceof Error && err.message.includes('FOREIGN KEY constraint failed')) {
    throw new AppError('errors.productInUse')
  }
  throw new AppError('errors.dbOperationFailed')
}

function productIncludesCost(): boolean {
  return session.get()?.role !== 'sales'
}

type ProductPrintKind = 'shelf' | 'barcode'

function assignProductBarcode(productId: number, barcode: string): Product {
  const db = getDb()
  const now = localNow()
  try {
    db.transaction(() => {
      releaseBarcodeForReuse(db, barcode)
      db.prepare('UPDATE products SET barcode = ?, updated_at = ? WHERE id = ?').run(barcode, now, productId)
      enqueueProductSync(productId, 'update', db)
    })()
  } catch (err) {
    mapProductDbError(err)
  }
  const product = getProduct(productId)
  if (!product) throw new AppError('errors.productNotFound')
  return product
}

/** Assign numeric id as barcode when missing so printed stickers scan at POS. */
function productForBarcodePrint(productId: number): Product {
  const product = getProduct(productId)
  if (!product) throw new AppError('errors.productNotFound')
  const cleaned = product.barcode.replace(/[^\x20-\x7e]/g, '').trim()
  if (cleaned && isPrintableCode128Barcode(cleaned)) return product
  return assignProductBarcode(productId, barcodePrintValue(product))
}

function labelLinesForProduct(
  product: Product,
  kind: ProductPrintKind,
  lang: ReturnType<typeof receiptLanguage>,
): PrintLine[] {
  if (kind === 'barcode') {
    return buildProductBarcodeLabelLines({ barcode: barcodePrintValue(product) }, lang)
  }
  return buildShelfLabelLines(
    { productName: product.name, price: product.price, barcode: product.barcode },
    lang
  )
}

async function printProductLabel(
  productId: number,
  copies: number,
  lang: ReturnType<typeof receiptLanguage>,
  kind: ProductPrintKind,
): Promise<{ printStatus: PrintStatus; printedCopies: number }> {
  const product = getProduct(productId)
  if (!product) throw new AppError('errors.productNotFound')
  const productForPrint = kind === 'barcode' ? productForBarcodePrint(productId) : product
  if (kind !== 'barcode' && !productForPrint.name.trim()) {
    throw new AppError('errors.invalidInput')
  }

  const labelCopies = Math.max(1, Math.min(MAX_LABEL_COPIES, Math.trunc(copies)))
  let printStatus: PrintStatus = 'printed'
  let printedCopies = 0
  const lines = labelLinesForProduct(productForPrint, kind, lang)
  for (let i = 0; i < labelCopies; i++) {
    const printJobId = insertPrintJob('label', null, labelPrintPayload(productId, kind, lang, lines))
    if ((await attemptPrintJob(printJobId)) === 'printed') printedCopies++
    else printStatus = 'failed'
  }
  if (printedCopies > 0) {
    writeAudit(kind === 'barcode' ? 'product_barcode_printed' : 'product_label_printed', {
      entity: 'product',
      entityId: productId,
      detail: `${product.name} x${printedCopies}`,
    })
  }
  return { printStatus, printedCopies }
}

async function printLabelForProduct(
  productId: number,
  copies: number,
  lang: ReturnType<typeof receiptLanguage>,
): Promise<{ printStatus: PrintStatus; printedCopies: number }> {
  return printProductLabel(productId, copies, lang, 'shelf')
}

type BatchPrintMode = 'label' | 'barcode'

async function runBatchPrint(
  items: { productId: number; copies?: number }[],
  mode: BatchPrintMode
): Promise<{ printStatus: PrintStatus; printed: number; failed: number; total: number }> {
  const normalized = normalizeBatchPrintItems(items)
  if (normalized.length === 0 || normalized.length > MAX_BATCH_LABEL_PRODUCTS) {
    throw new AppError('errors.invalidInput')
  }

  await probePrinter()
  const lang = receiptLanguage()
  let printed = 0
  let failed = 0

  for (const { productId, copies } of normalized) {
    try {
      const result =
        mode === 'label'
          ? await printLabelForProduct(productId, copies, lang)
          : await printProductLabel(productId, copies, lang, 'barcode')
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
    total: normalized.length
  }
}

const EMPTY_IMPORT_PREVIEW: ProductImportPreview = {
  canceled: true,
  toCreate: [],
  toUpdate: [],
  unchanged: [],
  errors: []
}

async function openImportFilePath(
  filters: { name: string; extensions: string[] }[]
): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters
  })
  if (result.canceled || !result.filePaths[0]) return null
  return result.filePaths[0]
}

async function confirmProductImport(
  filePath: string,
  format: 'csv' | 'efactura',
  stockMode: ProductImportStockMode,
  userId: number
): Promise<ProductImportResult> {
  if (!filePath?.trim()) throw new AppError('errors.invalidInput')
  const path = filePath.trim()
  if (format === 'efactura') {
    return applyProductImport(await readEfacturaXlsx(path), userId, stockMode)
  }
  return applyProductImport(path, userId, stockMode)
}

export function registerProductHandlers(): void {
  handle<ProductFilters, ProductListResult>('products:list', 'authed', (filters) =>
    listProducts(filters ?? {}, productIncludesCost())
  )

  handle<void, string[]>('products:categories', 'authed', () => listCategories())

  handle<void, string[]>('products:stockProviders', 'authed', () => listStockProviders())

  handle<{ barcode: string }, Product | null>('products:byBarcode', 'authed', ({ barcode }) =>
    getProductByBarcode(barcode.trim(), false, productIncludesCost()) ?? null
  )

  handle<{ query: string }, Product[]>('products:search', 'authed', ({ query }) =>
    query?.trim() ? searchProducts(query.trim(), 20, productIncludesCost()) : []
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

  handle<{ productId: number; copies?: number }, { printStatus: PrintStatus }>(
    'products:printBarcode',
    MANAGE,
    async ({ productId, copies }) => {
      await probePrinter()
      const lang = receiptLanguage()
      const { printStatus } = await printProductLabel(productId, copies ?? 1, lang, 'barcode')
      return { printStatus }
    },
  )

  handle<
    { items: { productId: number; copies?: number }[] },
    { printStatus: PrintStatus; printed: number; failed: number; total: number }
  >('products:printLabelBatch', MANAGE, async ({ items }) => runBatchPrint(items, 'label'))

  handle<
    { items: { productId: number; copies?: number }[] },
    { printStatus: PrintStatus; printed: number; failed: number; total: number }
  >('products:printBarcodeBatch', MANAGE, async ({ items }) => runBatchPrint(items, 'barcode'))

  handle<ProductInput, Product>('products:create', MANAGE, (input) => {
    validateProductInput(input)
    const user = session.require()
    const db = getDb()
    const now = localNow()
    try {
      return db.transaction(() => {
        const id = insertProductRow(db, input, now)
        if (input.stock) applyStockDelta(id, Math.floor(input.stock), user.id, 'initial_stock')
        else enqueueProductSync(id, 'insert', db)
        writeAudit('product_created', { entity: 'product', entityId: id, detail: input.name.trim() })
        return getProduct(id) as Product
      })()
    } catch (err) {
      mapProductDbError(err)
    }
  })

  handle<{ id: number } & ProductInput, Product>('products:update', MANAGE, (input) => {
    validateProductInput(input)
    if (!getProduct(input.id)) throw new AppError('errors.productNotFound')
    try {
      const db = getDb()
      db.transaction(() => {
        updateProductCatalogFields(db, input.id, input)
        enqueueProductSync(input.id, 'update', db)
      })()
    } catch (err) {
      mapProductDbError(err)
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
      mapProductDbError(err)
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
      await exportProductsToCsv(result.filePath, lang, Boolean(template))
      return { canceled: false, path: result.filePath }
    }
  )

  handle<void, ProductImportPreview>('products:importCsvPreview', MANAGE, async () => {
    const filePath = await openImportFilePath([{ name: 'CSV', extensions: ['csv'] }])
    if (!filePath) return EMPTY_IMPORT_PREVIEW
    return buildProductImportPreview(readProductCsv(filePath))
  })

  handle<void, ProductImportPreview>('products:importEfacturaPreview', MANAGE, async () => {
    const filePath = await openImportFilePath([{ name: 'Excel (eFactura)', extensions: ['xlsx'] }])
    if (!filePath) return EMPTY_IMPORT_PREVIEW
    return buildProductImportPreview(await readEfacturaXlsx(filePath))
  })

  handle<{ filePath: string; stockMode?: 'add' | 'replace' }, ProductImportResult>(
    'products:importEfacturaConfirm',
    MANAGE,
    async ({ filePath, stockMode }) => {
      const user = session.require()
      return confirmProductImport(filePath, 'efactura', stockMode ?? 'add', user.id)
    }
  )

  handle<{ filePath: string; stockMode?: 'add' | 'replace' }, ProductImportResult>(
    'products:importCsvConfirm',
    MANAGE,
    ({ filePath, stockMode }) => {
      const user = session.require()
      return confirmProductImport(filePath, 'csv', stockMode ?? 'add', user.id)
    }
  )

  handle<void, SupplierInvoicePreview>('products:importSupplierInvoicePreview', MANAGE, async () => {
    const filePath = await openImportFilePath([{ name: 'PDF', extensions: ['pdf'] }])
    if (!filePath) {
      return { canceled: true, restock: [], newItems: [], errors: [] }
    }
    return buildSupplierInvoicePreview(filePath)
  })

  handle<SupplierInvoiceConfirmInput, SupplierInvoiceResult>(
    'products:importSupplierInvoiceConfirm',
    MANAGE,
    (input) => {
      const user = session.require()
      return applySupplierInvoiceImport(input, user.id)
    }
  )
}
