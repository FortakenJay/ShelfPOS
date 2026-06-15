import { getDb } from '../index'
import { PRODUCT_COLUMNS } from '../columns'
import { localNow } from '../helpers'
import { getSetting, SETTING_KEYS } from './settings'
import type { Product, ProductFilters, ProductListResult, StockAlert } from '../../../shared/types'

const productSelect = `SELECT ${PRODUCT_COLUMNS} FROM products`

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

function buildProductListWhere(filters: ProductFilters): {
  whereSql: string
  params: Record<string, unknown>
} {
  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const where: string[] = []
  const params: Record<string, unknown> = { def }

  if (filters.search) {
    where.push('(name LIKE @q OR barcode LIKE @q)')
    params.q = `%${filters.search}%`
  }
  if (filters.category) {
    where.push('category = @category')
    params.category = filters.category
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
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params
  }
}

export function getProduct(id: number): Product | undefined {
  return getDb().prepare(`${productSelect} WHERE id = ?`).get(id) as Product | undefined
}

export function getProductByBarcode(barcode: string): Product | undefined {
  return getDb().prepare(`${productSelect} WHERE barcode = ?`).get(barcode) as
    | Product
    | undefined
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
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100)
  return getDb()
    .prepare(
      `${productSelect} WHERE name LIKE ? OR barcode LIKE ? ORDER BY name COLLATE NOCASE LIMIT ?`
    )
    .all(`%${query}%`, `%${query}%`, safeLimit) as Product[]
}

export function listCategories(): string[] {
  const rows = getDb()
    .prepare(
      "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category COLLATE NOCASE"
    )
    .all() as { category: string }[]
  return rows.map((r) => r.category)
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
  db.prepare(
    'INSERT INTO stock_adjustments (product_id, user_id, delta, reason, created_at) VALUES (?,?,?,?,?)'
  ).run(productId, userId, delta, reason, now)
}

/** Builds low/out stock alerts for the given product ids based on their current state. */
export function alertsForProducts(productIds: number[]): StockAlert[] {
  const ids = [...new Set(productIds)]
  if (ids.length === 0) return []

  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const placeholders = ids.map(() => '?').join(',')
  const rows = getDb()
    .prepare(
      `SELECT id, name, stock, stock_threshold FROM products WHERE id IN (${placeholders})`
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
