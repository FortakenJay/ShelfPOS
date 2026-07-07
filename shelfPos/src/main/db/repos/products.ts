import type Database from 'better-sqlite3'
import { getDb } from '../index'
import { PRODUCT_COLUMNS } from '../columns'
import { localNow } from '../helpers'
import { getSetting, SETTING_KEYS } from './settings'
import { enqueueSync } from './syncQueue'
import type { Product, ProductFilters, ProductInput, ProductListResult, StockAlert } from '../../../shared/types'

const productSelect = `SELECT ${PRODUCT_COLUMNS} FROM products`

/** Active catalog rows only — soft-deleted products are excluded from POS/inventory lists. */
export const ACTIVE_PRODUCT_SQL = 'deleted_at IS NULL'

/** Prefix for barcodes tombstoned on soft-delete so the real code can be reused. */
export const DELETED_BARCODE_PREFIX = '@deleted:'

export function isTombstoneBarcode(barcode: string): boolean {
  return barcode.startsWith(DELETED_BARCODE_PREFIX)
}

export function tombstoneBarcodeValue(productId: number, barcode: string): string {
  return `${DELETED_BARCODE_PREFIX}${productId}:${barcode}`
}

/** Frees a barcode held by a soft-deleted row so a new product can reuse it. */
export function releaseBarcodeForReuse(db: Database.Database, barcode: string): void {
  const trimmed = barcode.trim()
  const row = db
    .prepare(`SELECT id, barcode FROM products WHERE barcode = ? AND deleted_at IS NOT NULL`)
    .get(trimmed) as { id: number; barcode: string } | undefined
  if (!row || isTombstoneBarcode(row.barcode)) return
  const now = localNow()
  db.prepare('UPDATE products SET barcode = ?, updated_at = ? WHERE id = ?').run(
    tombstoneBarcodeValue(row.id, row.barcode),
    now,
    row.id
  )
}

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

function buildProductListWhere(filters: ProductFilters): {
  whereSql: string
  params: Record<string, unknown>
} {
  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const where: string[] = [ACTIVE_PRODUCT_SQL]
  const params: Record<string, unknown> = { def }

  if (filters.search) {
    where.push('(name LIKE @q OR barcode LIKE @q)')
    params.q = `%${filters.search}%`
  }
  if (filters.category) {
    where.push('category = @category')
    params.category = filters.category
  }
  if (filters.stockProvider) {
    where.push('stock_provider = @stockProvider')
    params.stockProvider = filters.stockProvider
  }
  switch (filters.stockStatus) {
    case 'low':
      where.push('stock > 0 AND stock <= COALESCE(stock_threshold, @def)')
      break
    case 'zero':
      where.push('stock = 0')
      break
    case 'negative':
      where.push('stock < 0')
      break
  }

  return {
    whereSql: `WHERE ${where.join(' AND ')}`,
    params
  }
}

export function getProduct(id: number, includeDeleted = false): Product | undefined {
  const deletedClause = includeDeleted ? '' : ` AND ${ACTIVE_PRODUCT_SQL}`
  return getDb()
    .prepare(`${productSelect} WHERE id = ?${deletedClause}`)
    .get(id) as Product | undefined
}

export function getProductByBarcode(barcode: string, includeDeleted = false): Product | undefined {
  const deletedClause = includeDeleted ? '' : ` AND ${ACTIVE_PRODUCT_SQL}`
  return getDb()
    .prepare(`${productSelect} WHERE barcode = ?${deletedClause}`)
    .get(barcode) as Product | undefined
}

export function listProducts(filters: ProductFilters): ProductListResult {
  const page = Math.max(1, Math.trunc(filters.page ?? 1))
  const pageSize = Math.min(
    Math.max(Math.trunc(filters.pageSize ?? DEFAULT_PAGE_SIZE), 1),
    MAX_PAGE_SIZE
  )
  const offset = (page - 1) * pageSize
  const { whereSql, params } = buildProductListWhere(filters)
  const db = getDb()

  const total = (
    db.prepare(`SELECT COUNT(*) AS count FROM products ${whereSql}`).get(params) as { count: number }
  ).count

  const items = db
    .prepare(
      `${productSelect} ${whereSql} ORDER BY name COLLATE NOCASE LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: pageSize, offset }) as Product[]

  return { items, total, page, pageSize }
}

export function searchProducts(query: string, limit = 20): Product[] {
  const trimmed = query.trim()
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100)

  const likeResults = getDb()
    .prepare(
      `${productSelect} WHERE ${ACTIVE_PRODUCT_SQL} AND (name LIKE ? OR barcode LIKE ?) ORDER BY name COLLATE NOCASE LIMIT ?`
    )
    .all(`%${trimmed}%`, `%${trimmed}%`, safeLimit) as Product[]

  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed)
    if (Number.isSafeInteger(id) && id > 0) {
      const exact = getProduct(id)
      if (exact && !likeResults.some((p) => p.id === exact.id)) {
        return [exact, ...likeResults].slice(0, safeLimit)
      }
    }
  }

  return likeResults
}

export function listCategories(): string[] {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT category FROM products WHERE ${ACTIVE_PRODUCT_SQL} AND category IS NOT NULL AND category != '' ORDER BY category COLLATE NOCASE`
    )
    .all() as { category: string }[]
  return rows.map((r) => r.category)
}

export function listStockProviders(): string[] {
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT stock_provider FROM products WHERE ${ACTIVE_PRODUCT_SQL} AND stock_provider IS NOT NULL AND stock_provider != '' ORDER BY stock_provider COLLATE NOCASE`
    )
    .all() as { stock_provider: string }[]
  return rows.map((r) => r.stock_provider)
}

/** Applies a stock delta and records the adjustment. Must run inside a transaction. */
export function applyStockDelta(productId: number, delta: number, userId: number, reason: string): void {
  const db = getDb()
  const now = localNow()
  db.prepare('UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?').run(
    delta,
    now,
    productId
  )
  enqueueSync('products', productId, 'update', db)
  const adj = db
    .prepare(
      'INSERT INTO stock_adjustments (product_id, user_id, delta, reason, created_at) VALUES (?,?,?,?,?)'
    )
    .run(productId, userId, delta, reason, now)
  enqueueSync('stock_adjustments', Number(adj.lastInsertRowid), 'insert', db)
}

export function softDeleteProduct(id: number): void {
  const db = getDb()
  const now = localNow()
  const row = db.prepare('SELECT barcode FROM products WHERE id = ?').get(id) as
    | { barcode: string }
    | undefined
  if (row && !isTombstoneBarcode(row.barcode)) {
    db.prepare('UPDATE products SET barcode = ?, updated_at = ? WHERE id = ?').run(
      tombstoneBarcodeValue(id, row.barcode),
      now,
      id
    )
  }
  db.prepare('UPDATE products SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, id)
  enqueueSync('products', id, 'update', db)
}

/** Builds low/out stock alerts for the given product ids based on their current state. */
export function alertsForProducts(productIds: number[]): StockAlert[] {
  const ids = [...new Set(productIds)]
  if (ids.length === 0) return []

  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const placeholders = ids.map(() => '?').join(',')
  const rows = getDb()
    .prepare(
      `SELECT id, name, stock, stock_threshold FROM products WHERE ${ACTIVE_PRODUCT_SQL} AND id IN (${placeholders})`
    )
    .all(...ids) as { id: number; name: string; stock: number; stock_threshold: number | null }[]

  const alerts: StockAlert[] = []
  for (const p of rows) {
    const threshold = p.stock_threshold ?? def
    if (p.stock <= 0) {
      alerts.push({ productId: p.id, name: p.name, stock: p.stock, threshold, level: 'out' })
    } else if (p.stock <= threshold) {
      alerts.push({ productId: p.id, name: p.name, stock: p.stock, threshold, level: 'low' })
    }
  }
  return alerts
}

export function enqueueProductSync(
  productId: number,
  operation: 'insert' | 'update',
  db = getDb()
): void {
  enqueueSync('products', productId, operation, db)
}

const PRODUCT_INSERT_SQL = `INSERT INTO products (barcode, name, price, cost_price, category, stock_provider, stock, stock_threshold, tax_category, bulk_qty, bulk_price, factura_negativo, created_at, updated_at)
 VALUES (?,?,?,?,?,?,0,?,?,?,?,?,?,?)`

/** Insert a product row. Must run inside a transaction. Returns new product id. */
export function insertProductRow(db: Database.Database, input: ProductInput, now: string): number {
  releaseBarcodeForReuse(db, input.barcode)
  const result = db.prepare(PRODUCT_INSERT_SQL).run(
    input.barcode.trim(),
    input.name.trim(),
    input.price,
    input.costPrice ?? null,
    input.category?.trim() || null,
    input.stockProvider?.trim() || null,
    input.stockThreshold ?? null,
    input.taxCategory,
    input.bulkQty ?? null,
    input.bulkPrice ?? null,
    input.facturaNegativo ? 1 : 0,
    now,
    now
  )
  return Number(result.lastInsertRowid)
}

export type UpdateProductCatalogOpts = {
  includeStockProvider?: boolean
}

/** Update catalog fields on an existing product. Must run inside a transaction. */
export function updateProductCatalogFields(
  db: Database.Database,
  productId: number,
  input: ProductInput,
  opts: UpdateProductCatalogOpts = {}
): void {
  releaseBarcodeForReuse(db, input.barcode)
  const includeStockProvider = opts.includeStockProvider ?? true
  if (includeStockProvider) {
    db.prepare(
      `UPDATE products SET barcode = ?, name = ?, price = ?, cost_price = ?, category = ?, stock_provider = ?, stock_threshold = ?, tax_category = ?, bulk_qty = ?, bulk_price = ?, factura_negativo = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      input.barcode.trim(),
      input.name.trim(),
      input.price,
      input.costPrice ?? null,
      input.category?.trim() || null,
      input.stockProvider?.trim() || null,
      input.stockThreshold ?? null,
      input.taxCategory,
      input.bulkQty ?? null,
      input.bulkPrice ?? null,
      input.facturaNegativo ? 1 : 0,
      localNow(),
      productId
    )
  } else {
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
      input.taxCategory,
      input.bulkQty ?? null,
      input.bulkPrice ?? null,
      input.facturaNegativo ? 1 : 0,
      localNow(),
      productId
    )
  }
}

export function updateProductCostPrice(
  db: Database.Database,
  productId: number,
  costPrice: number,
  now = localNow()
): void {
  db.prepare('UPDATE products SET cost_price = ?, updated_at = ? WHERE id = ?').run(
    costPrice,
    now,
    productId
  )
}
