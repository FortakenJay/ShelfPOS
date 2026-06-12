import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import {
  alertsForProducts,
  applyStockDelta,
  getProduct,
  getProductByBarcode,
  listCategories,
  listProducts,
  searchProducts
} from '../db/repos/products'
import { session } from '../services/session'
import { writeAudit } from '../db/repos/audit'
import type {
  AdjustStockInput,
  Product,
  ProductFilters,
  ProductInput,
  StockAlert,
  TaxCategory
} from '../../shared/types'

const MANAGE: ('product_manager' | 'admin')[] = ['product_manager', 'admin']
const TAX_CATEGORIES: TaxCategory[] = ['exempt', 'canasta_basica', 'standard']

function validateProductInput(input: ProductInput): void {
  if (!input.barcode?.trim() || !input.name?.trim()) throw new AppError('errors.invalidInput')
  if (!Number.isFinite(input.price) || input.price < 0) throw new AppError('errors.invalidInput')
  if (!TAX_CATEGORIES.includes(input.taxCategory)) throw new AppError('errors.invalidInput')
  // Bulk pricing is all-or-nothing: need both a threshold quantity and a bulk price.
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
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && err.message.includes('UNIQUE constraint failed')
}

export function registerProductHandlers(): void {
  handle<ProductFilters, Product[]>('products:list', 'authed', (filters) =>
    listProducts(filters ?? {})
  )

  handle<void, string[]>('products:categories', 'authed', () => listCategories())

  handle<{ barcode: string }, Product | null>('products:byBarcode', 'authed', ({ barcode }) =>
    getProductByBarcode(barcode.trim()) ?? null
  )

  handle<{ query: string }, Product[]>('products:search', 'authed', ({ query }) =>
    query?.trim() ? searchProducts(query.trim()) : []
  )

  handle<ProductInput, Product>('products:create', MANAGE, (input) => {
    validateProductInput(input)
    const user = session.require()
    const db = getDb()
    const now = localNow()
    try {
      return db.transaction(() => {
        const result = db
          .prepare(
            `INSERT INTO products (barcode, name, price, cost_price, category, stock, stock_threshold, tax_category, bulk_qty, bulk_price, created_at, updated_at)
             VALUES (?,?,?,?,?,0,?,?,?,?,?,?)`
          )
          .run(
            input.barcode.trim(),
            input.name.trim(),
            input.price,
            input.costPrice ?? null,
            input.category?.trim() || null,
            input.stockThreshold ?? null,
            input.taxCategory,
            input.bulkQty ?? null,
            input.bulkPrice ?? null,
            now,
            now
          )
        const id = Number(result.lastInsertRowid)
        if (input.stock) applyStockDelta(id, Math.floor(input.stock), user.id, 'initial_stock')
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
      getDb()
        .prepare(
          `UPDATE products SET barcode = ?, name = ?, price = ?, cost_price = ?, category = ?, stock_threshold = ?, tax_category = ?, bulk_qty = ?, bulk_price = ?, updated_at = ?
           WHERE id = ?`
        )
        .run(
          input.barcode.trim(),
          input.name.trim(),
          input.price,
          input.costPrice ?? null,
          input.category?.trim() || null,
          input.stockThreshold ?? null,
          input.taxCategory,
          input.bulkQty ?? null,
          input.bulkPrice ?? null,
          localNow(),
          input.id
        )
    } catch (err) {
      if (isUniqueViolation(err)) throw new AppError('errors.barcodeExists')
      throw err
    }
    writeAudit('product_updated', { entity: 'product', entityId: input.id, detail: input.name.trim() })
    return getProduct(input.id) as Product
  })

  handle<{ id: number }, null>('products:delete', MANAGE, ({ id }) => {
    const db = getDb()
    try {
      db.transaction(() => {
        db.prepare('DELETE FROM stock_adjustments WHERE product_id = ?').run(id)
        db.prepare('DELETE FROM products WHERE id = ?').run(id)
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
}
