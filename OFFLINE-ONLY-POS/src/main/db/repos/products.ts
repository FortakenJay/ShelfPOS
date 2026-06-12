import { getDb } from '../index'
import { localNow } from '../helpers'
import { getAppSettings } from './settings'
import type { Product, ProductFilters, StockAlert } from '../../../shared/types'

export function getProduct(id: number): Product | undefined {
  return getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined
}

export function getProductByBarcode(barcode: string): Product | undefined {
  return getDb().prepare('SELECT * FROM products WHERE barcode = ?').get(barcode) as
    | Product
    | undefined
}

export function listProducts(filters: ProductFilters): Product[] {
  const def = getAppSettings().stockThresholdDefault
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

  const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY name COLLATE NOCASE`
  return getDb().prepare(sql).all(params) as Product[]
}

export function searchProducts(query: string, limit = 20): Product[] {
  return getDb()
    .prepare(
      'SELECT * FROM products WHERE name LIKE ? OR barcode LIKE ? ORDER BY name COLLATE NOCASE LIMIT ?'
    )
    .all(`%${query}%`, `%${query}%`, limit) as Product[]
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
  const def = getAppSettings().stockThresholdDefault
  const alerts: StockAlert[] = []
  for (const id of new Set(productIds)) {
    const p = getProduct(id)
    if (!p) continue
    const threshold = p.stock_threshold ?? def
    if (p.stock <= 0) {
      alerts.push({ productId: p.id, name: p.name, stock: p.stock, threshold, level: 'out' })
    } else if (p.stock <= threshold) {
      alerts.push({ productId: p.id, name: p.name, stock: p.stock, threshold, level: 'low' })
    }
  }
  return alerts
}
