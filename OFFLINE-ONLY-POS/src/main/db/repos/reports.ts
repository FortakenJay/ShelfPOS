import { getDb } from '../index'
import { ACTIVE_PRODUCT_SQL } from './products'
import { getAppSettings, ivaRateFor } from './settings'
import { localNow, round2 } from '../helpers'
import type {
  InventoryReport,
  InventoryRow,
  ItemizedSalesReport,
  PeriodCashTotals,
  PaymentMethod,
  PaymentMethodReport,
  SalePaymentSnapshot,
  SalesSummaryReport,
  TaxBreakdownReport,
  TaxBreakdownRow,
  TaxCategory,
  TopProductRow,
  TransactionLogReport
} from '../../../shared/types'

const TAX_CATEGORY_ORDER = new Map<TaxCategory, number>([['standard', 0]])

function cashMovementTotalsForFilter(filter: SaleFilter): {
  openingFloat: number
  cashIn: number
  cashOut: number
} {
  const conditions: string[] = []
  const params: Record<string, unknown> = {}
  if (filter.fromTs) {
    conditions.push('created_at >= @fromTs')
    params.fromTs = filter.fromTs
  }
  if (filter.toTs) {
    conditions.push('created_at <= @toTs')
    params.toTs = filter.toTs
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = getDb()
    .prepare(
      `SELECT type, COALESCE(SUM(amount), 0) AS amount
       FROM cash_movements ${where} GROUP BY type`
    )
    .all(params) as { type: string; amount: number }[]

  let openingFloat = 0
  let cashIn = 0
  let cashOut = 0
  for (const row of rows) {
    if (row.type === 'opening_float') openingFloat = round2(row.amount)
    else if (row.type === 'cash_in') cashIn = round2(row.amount)
    else if (row.type === 'cash_out') cashOut = round2(row.amount)
  }
  return { openingFloat, cashIn, cashOut }
}

interface SaleFilter {
  fromTs?: string
  toTs?: string
  cierrePending?: boolean
  cierreId?: number
}

function saleWhere(filter: SaleFilter): { where: string; params: Record<string, unknown> } {
  const conditions: string[] = []
  const params: Record<string, unknown> = {}
  if (filter.fromTs) {
    conditions.push('s.created_at >= @fromTs')
    params.fromTs = filter.fromTs
  }
  if (filter.toTs) {
    conditions.push('s.created_at <= @toTs')
    params.toTs = filter.toTs
  }
  if (filter.cierrePending) {
    conditions.push('s.cierre_id IS NULL')
  }
  if (filter.cierreId != null) {
    conditions.push('s.cierre_id = @cierreId')
    params.cierreId = filter.cierreId
  }
  return { where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '', params }
}

/** Payment breakdown from sale_payments (supports split payments). */
export function paymentTotals(filter: SaleFilter): PaymentMethodReport {
  const { where, params } = saleWhere(filter)
  const rows = getDb()
    .prepare(
      `SELECT sp.method AS method, COALESCE(SUM(sp.amount), 0) AS amount,
              COUNT(DISTINCT sp.sale_id) AS count
       FROM sale_payments sp JOIN sales s ON s.id = sp.sale_id
       ${where} GROUP BY sp.method`
    )
    .all(params) as { method: string; amount: number; count: number }[]
  const result: PaymentMethodReport = {
    cash: 0,
    card: 0,
    sinpe: 0,
    total: 0,
    countCash: 0,
    countCard: 0,
    countSinpe: 0
  }
  for (const row of rows) {
    if (row.method === 'cash') {
      result.cash = round2(row.amount)
      result.countCash = row.count
    } else if (row.method === 'card') {
      result.card = round2(row.amount)
      result.countCard = row.count
    } else if (row.method === 'sinpe') {
      result.sinpe = round2(row.amount)
      result.countSinpe = row.count
    }
  }
  result.total = round2(result.cash + result.card + result.sinpe)
  return result
}

/** Number of distinct sales matching the filter (used for cierre tx count). */
export function salesCount(filter: SaleFilter): number {
  const { where, params } = saleWhere(filter)
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS count FROM sales s ${where}`)
    .get(params) as { count: number }
  return row.count
}

/**
 * IVA breakdown by tax category, reverse-calculated from IVA-inclusive line totals.
 * Under régimen simplificado this is informational only (not shown on customer receipts).
 */
export function taxBreakdown(filter: SaleFilter): TaxBreakdownReport {
  const { where, params } = saleWhere(filter)
  const rows = getDb()
    .prepare(
      `SELECT si.tax_category AS taxCategory, COALESCE(SUM(si.line_total), 0) AS gross
       FROM sale_items si JOIN sales s ON s.id = si.sale_id
       ${where} GROUP BY si.tax_category`
    )
    .all(params) as { taxCategory: TaxCategory; gross: number }[]

  const result: TaxBreakdownRow[] = rows
    .map((r) => {
      const rate = ivaRateFor(r.taxCategory)
      const gross = round2(r.gross)
      const base = round2(gross / (1 + rate))
      return { taxCategory: r.taxCategory, rate, gross, base, iva: round2(gross - base) }
    })
    .sort(
      (a, b) =>
        (TAX_CATEGORY_ORDER.get(a.taxCategory) ?? 99) - (TAX_CATEGORY_ORDER.get(b.taxCategory) ?? 99)
    )

  return {
    regime: getAppSettings().taxRegime,
    rows: result,
    totalGross: round2(result.reduce((acc, r) => acc + r.gross, 0)),
    totalBase: round2(result.reduce((acc, r) => acc + r.base, 0)),
    totalIva: round2(result.reduce((acc, r) => acc + r.iva, 0))
  }
}

function returnFilterClause(filter: SaleFilter): {
  where: string
  params: Record<string, unknown>
} {
  const conditions: string[] = []
  const params: Record<string, unknown> = {}
  if (filter.fromTs) {
    conditions.push('created_at >= @fromTs')
    params.fromTs = filter.fromTs
  }
  if (filter.toTs) {
    conditions.push('created_at <= @toTs')
    params.toTs = filter.toTs
  }
  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  }
}

function returnTotals(filter: SaleFilter): { count: number; amount: number; quantity: number } {
  const { where, params } = returnFilterClause(filter)
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count,
              COALESCE(SUM(line_total), 0) AS amount,
              COALESCE(SUM(quantity), 0) AS quantity
       FROM return_items ${where}`
    )
    .get(params) as { count: number; amount: number; quantity: number }
  return {
    count: row.count,
    amount: round2(row.amount),
    quantity: row.quantity
  }
}

export function salesSummary(filter: SaleFilter): SalesSummaryReport {
  const db = getDb()
  const { where, params } = saleWhere(filter)
  const sales = db
    .prepare(
      `SELECT COALESCE(SUM(s.total), 0) AS revenue, COUNT(*) AS txCount FROM sales s ${where}`
    )
    .get(params) as { revenue: number; txCount: number }
  const items = db
    .prepare(
      `SELECT COALESCE(SUM(si.quantity), 0) AS itemsSold
       FROM sale_items si JOIN sales s ON s.id = si.sale_id ${where}`
    )
    .get(params) as { itemsSold: number }
  const returns = returnTotals(filter)
  const discounts = cierreDiscounts(filter)
  const cashMovements = cashMovementTotalsForFilter(filter)
  const cashSales = paymentTotals(filter).cash
  const profitRow = db
    .prepare(
      `SELECT COALESCE(SUM(
         si.line_total - CASE
           WHEN si.product_id IS NULL THEN 0
           ELSE COALESCE(p.cost_price, 0) * si.quantity
         END
       ), 0) AS profit
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       LEFT JOIN products p ON p.id = si.product_id
       ${where}`
    )
    .get(params) as { profit: number }
  const cash: PeriodCashTotals = {
    openingFloat: cashMovements.openingFloat,
    cashIn: cashMovements.cashIn,
    cashOut: cashMovements.cashOut,
    cashSales
  }
  return {
    totalRevenue: round2(Math.max(0, sales.revenue - returns.amount)),
    txCount: sales.txCount,
    itemsSold: Math.max(0, items.itemsSold - returns.quantity),
    returnsCount: returns.count,
    avgTicket: sales.txCount > 0 ? round2(sales.revenue / sales.txCount) : 0,
    totalDiscount: discounts.totalDiscount,
    grossProfit: round2(profitRow.profit),
    cash
  }
}

export function topProducts(filter: SaleFilter, limit = 10): TopProductRow[] {
  const { where, params } = saleWhere(filter)
  const rows = getDb()
    .prepare(
      `SELECT COALESCE(p.id, 0) AS productId,
              COALESCE(si.product_name_snapshot, p.name) AS name,
              COALESCE(p.barcode, '') AS barcode,
              SUM(si.quantity) AS quantity,
              COALESCE(SUM(si.line_total), 0) AS revenue,
              COALESCE(SUM(si.line_total - COALESCE(p.cost_price, 0) * si.quantity), 0) AS profit
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       LEFT JOIN products p ON p.id = si.product_id
       ${where}
       GROUP BY COALESCE(p.id, 0), COALESCE(si.product_name_snapshot, p.name)
       ORDER BY revenue DESC LIMIT @limit`
    )
    .all({ ...params, limit }) as {
    productId: number
    name: string
    barcode: string
    quantity: number
    revenue: number
    profit: number
  }[]

  return rows.map((r) => {
    const revenue = round2(r.revenue)
    const profit = round2(r.profit)
    return {
      productId: r.productId,
      name: r.name,
      barcode: r.barcode,
      quantity: r.quantity,
      revenue,
      profit,
      marginPct: revenue > 0 ? round2((profit / revenue) * 100) : null
    }
  })
}

const INVENTORY_PAGE_SIZE_MAX = 200

const INVENTORY_SELECT = `
  SELECT id, barcode, name, category, stock,
         COALESCE(stock_threshold, @def) AS threshold,
         price, ROUND(max(stock, 0) * price, 2) AS value
  FROM products
  WHERE ${ACTIVE_PRODUCT_SQL}
`

function inventoryTotals(): { total: number; totalValue: number } {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS total, ROUND(SUM(max(stock, 0) * price), 2) AS totalValue
       FROM products WHERE ${ACTIVE_PRODUCT_SQL}`
    )
    .get() as { total: number; totalValue: number | null }
  return { total: row.total, totalValue: round2(row.totalValue ?? 0) }
}

export function inventorySnapshot(): InventoryRow[] {
  const def = getAppSettings().stockThresholdDefault
  return getDb()
    .prepare(`${INVENTORY_SELECT} ORDER BY name COLLATE NOCASE`)
    .all({ def }) as InventoryRow[]
}

export function inventorySnapshotPage(page: number, pageSize = 50): InventoryReport {
  const def = getAppSettings().stockThresholdDefault
  const safePageSize = Math.min(
    Math.max(Math.trunc(pageSize), 1),
    INVENTORY_PAGE_SIZE_MAX
  )
  const safePage = Math.max(Math.trunc(page), 1)
  const offset = (safePage - 1) * safePageSize
  const { total, totalValue } = inventoryTotals()
  const rows = getDb()
    .prepare(
      `${INVENTORY_SELECT} ORDER BY name COLLATE NOCASE LIMIT @limit OFFSET @offset`
    )
    .all({ def, limit: safePageSize, offset }) as InventoryRow[]
  return { rows, total, totalValue, page: safePage, pageSize: safePageSize }
}

/** Start of the current (un-cierred) period: last cierre close, else first pending activity, else now. */
export function periodOpenedAt(): string {
  const db = getDb()
  const lastCierre = db.prepare('SELECT MAX(closed_at) AS ts FROM cierres').get() as {
    ts: string | null
  }
  if (lastCierre.ts) return lastCierre.ts
  const firstSale = db
    .prepare('SELECT MIN(created_at) AS ts FROM sales WHERE cierre_id IS NULL')
    .get() as { ts: string | null }
  if (firstSale.ts) return firstSale.ts
  const firstMovement = db
    .prepare('SELECT MIN(created_at) AS ts FROM cash_movements WHERE cierre_id IS NULL')
    .get() as { ts: string | null }
  return firstMovement.ts ?? localNow()
}

export function returnsCountSince(fromTs: string): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS count FROM return_items WHERE created_at >= ?')
    .get(fromTs) as { count: number }
  return row.count
}

export function returnsCountBetween(fromTs: string, toTs: string): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS count FROM return_items WHERE created_at >= ? AND created_at <= ?')
    .get(fromTs, toTs) as { count: number }
  return row.count
}

interface DiscountSaleRow {
  saleId: number
  consecutivo: string | null
  createdAt: string
  cartDiscount: number
  discountTotal: number
  cashier: string
}

interface DiscountItemRow {
  saleId: number
  saleItemId: number
  productName: string
  quantity: number
  lineDiscount: number
}

/** Cart-level and per-line discounts for cierre (admin review + print). */
export function cierreDiscounts(filter: SaleFilter): {
  totalDiscount: number
  totalCartDiscount: number
  totalLineDiscount: number
  sales: {
    saleId: number
    consecutivo: string | null
    createdAt: string
    cashier: string
    cartDiscount: number
    lineDiscountTotal: number
    discountTotal: number
    items: { saleItemId: number; productName: string; quantity: number; lineDiscount: number }[]
  }[]
} {
  const { where, params } = saleWhere(filter)
  const discountWhere = where
    ? `${where} AND s.discount_total > 0`
    : 'WHERE s.discount_total > 0'

  const salesRows = getDb()
    .prepare(
      `SELECT s.id AS saleId, s.consecutivo, s.created_at AS createdAt,
              s.cart_discount AS cartDiscount, s.discount_total AS discountTotal,
              u.username AS cashier
       FROM sales s JOIN users u ON u.id = s.user_id
       ${discountWhere}
       ORDER BY s.created_at`
    )
    .all(params) as DiscountSaleRow[]

  if (salesRows.length === 0) {
    return { totalDiscount: 0, totalCartDiscount: 0, totalLineDiscount: 0, sales: [] }
  }

  const itemWhere = where
    ? `${where} AND si.line_discount > 0`
    : 'WHERE si.line_discount > 0'

  const itemRows = getDb()
    .prepare(
      `SELECT si.sale_id AS saleId, si.id AS saleItemId,
              COALESCE(si.product_name_snapshot, p.name) AS productName, si.quantity,
              si.line_discount AS lineDiscount
       FROM sale_items si
       LEFT JOIN products p ON p.id = si.product_id
       JOIN sales s ON s.id = si.sale_id
       ${itemWhere}
       ORDER BY si.sale_id, si.id`
    )
    .all(params) as DiscountItemRow[]

  const itemsBySale = new Map<number, DiscountItemRow[]>()
  for (const row of itemRows) {
    const list = itemsBySale.get(row.saleId) ?? []
    list.push(row)
    itemsBySale.set(row.saleId, list)
  }

  let totalCartDiscount = 0
  let totalLineDiscount = 0
  const sales = salesRows.map((sale) => {
    const items = (itemsBySale.get(sale.saleId) ?? []).map((item) => ({
      saleItemId: item.saleItemId,
      productName: item.productName,
      quantity: item.quantity,
      lineDiscount: round2(item.lineDiscount)
    }))
    const lineDiscountTotal = round2(items.reduce((acc, i) => acc + i.lineDiscount, 0))
    const cartDiscount = round2(sale.cartDiscount)
    totalCartDiscount = round2(totalCartDiscount + cartDiscount)
    totalLineDiscount = round2(totalLineDiscount + lineDiscountTotal)
    return {
      saleId: sale.saleId,
      consecutivo: sale.consecutivo,
      createdAt: sale.createdAt,
      cashier: sale.cashier,
      cartDiscount,
      lineDiscountTotal,
      discountTotal: round2(sale.discountTotal),
      items
    }
  })

  return {
    totalDiscount: round2(sales.reduce((acc, s) => acc + s.discountTotal, 0)),
    totalCartDiscount,
    totalLineDiscount,
    sales
  }
}

interface PriceOverrideSaleRow {
  saleId: number
  consecutivo: string | null
  createdAt: string
  cashier: string
}

interface PriceOverrideItemRow {
  saleId: number
  saleItemId: number
  productName: string
  quantity: number
  catalogUnitPrice: number
  unitPrice: number
}

/** Custom unit prices applied during the shift (admin review + cierre print). */
export function cierrePriceOverrides(filter: SaleFilter): {
  totalVariance: number
  sales: {
    saleId: number
    consecutivo: string | null
    createdAt: string
    cashier: string
    items: {
      saleItemId: number
      productName: string
      quantity: number
      catalogUnitPrice: number
      unitPrice: number
      lineVariance: number
    }[]
  }[]
} {
  const { where, params } = saleWhere(filter)
  const overrideWhere = where
    ? `${where} AND si.catalog_unit_price IS NOT NULL`
    : 'WHERE si.catalog_unit_price IS NOT NULL'

  const itemRows = getDb()
    .prepare(
      `SELECT si.sale_id AS saleId, si.id AS saleItemId,
              COALESCE(si.product_name_snapshot, p.name) AS productName, si.quantity,
              si.catalog_unit_price AS catalogUnitPrice, si.unit_price AS unitPrice
       FROM sale_items si
       LEFT JOIN products p ON p.id = si.product_id
       JOIN sales s ON s.id = si.sale_id
       ${overrideWhere}
       ORDER BY si.sale_id, si.id`
    )
    .all(params) as PriceOverrideItemRow[]

  if (itemRows.length === 0) {
    return { totalVariance: 0, sales: [] }
  }

  const saleIds = [...new Set(itemRows.map((r) => r.saleId))]
  const salePlaceholders = saleIds.map((_, i) => `@sid${i}`).join(',')
  const saleParams: Record<string, unknown> = { ...params }
  saleIds.forEach((id, i) => {
    saleParams[`sid${i}`] = id
  })

  const salesRows = getDb()
    .prepare(
      `SELECT s.id AS saleId, s.consecutivo, s.created_at AS createdAt, u.username AS cashier
       FROM sales s JOIN users u ON u.id = s.user_id
       WHERE s.id IN (${salePlaceholders})
       ORDER BY s.created_at`
    )
    .all(saleParams) as PriceOverrideSaleRow[]

  const itemsBySale = new Map<number, PriceOverrideItemRow[]>()
  for (const row of itemRows) {
    const list = itemsBySale.get(row.saleId) ?? []
    list.push(row)
    itemsBySale.set(row.saleId, list)
  }

  let totalVariance = 0
  const sales = salesRows.map((sale) => {
    const items = (itemsBySale.get(sale.saleId) ?? []).map((item) => {
      const catalogUnitPrice = round2(item.catalogUnitPrice)
      const unitPrice = round2(item.unitPrice)
      const lineVariance = round2((catalogUnitPrice - unitPrice) * item.quantity)
      totalVariance = round2(totalVariance + lineVariance)
      return {
        saleItemId: item.saleItemId,
        productName: item.productName,
        quantity: item.quantity,
        catalogUnitPrice,
        unitPrice,
        lineVariance
      }
    })
    return {
      saleId: sale.saleId,
      consecutivo: sale.consecutivo,
      createdAt: sale.createdAt,
      cashier: sale.cashier,
      items
    }
  })

  return { totalVariance, sales }
}

interface SaleHeaderRow {
  saleId: number
  consecutivo: string | null
  createdAt: string
  cashier: string
  total: number
  discountTotal: number
  cartDiscount: number
  customerName: string | null
}

interface SalePaymentRow {
  saleId: number
  method: PaymentMethod
  amount: number
  ref: string | null
}

interface SaleItemReportRow {
  saleId: number
  saleItemId: number
  productName: string
  barcode: string | null
  quantity: number
  unitPrice: number
  lineDiscount: number
  lineTotal: number
}

function listSaleHeaders(filter: SaleFilter): SaleHeaderRow[] {
  const { where, params } = saleWhere(filter)
  return getDb()
    .prepare(
      `SELECT s.id AS saleId, s.consecutivo, s.created_at AS createdAt,
              u.username AS cashier, s.total, s.discount_total AS discountTotal,
              s.cart_discount AS cartDiscount, s.customer_name AS customerName
       FROM sales s JOIN users u ON u.id = s.user_id
       ${where}
       ORDER BY s.created_at, s.id`
    )
    .all(params) as SaleHeaderRow[]
}

function listSalePayments(filter: SaleFilter): SalePaymentRow[] {
  const { where, params } = saleWhere(filter)
  return getDb()
    .prepare(
      `SELECT sp.sale_id AS saleId, sp.method, sp.amount, sp.ref
       FROM sale_payments sp JOIN sales s ON s.id = sp.sale_id
       ${where}
       ORDER BY sp.sale_id, sp.id`
    )
    .all(params) as SalePaymentRow[]
}

function paymentsBySale(paymentRows: SalePaymentRow[]): Map<number, SalePaymentSnapshot[]> {
  const map = new Map<number, SalePaymentSnapshot[]>()
  for (const row of paymentRows) {
    const list = map.get(row.saleId) ?? []
    list.push({
      method: row.method,
      amount: round2(row.amount),
      ref: row.ref
    })
    map.set(row.saleId, list)
  }
  return map
}

/** Chronological register of every sale in the period (invoice / receipt log). */
export function transactionLog(filter: SaleFilter): TransactionLogReport {
  const salesRows = listSaleHeaders(filter)
  const paymentMap = paymentsBySale(listSalePayments(filter))

  const rows = salesRows.map((sale) => ({
    saleId: sale.saleId,
    consecutivo: sale.consecutivo,
    createdAt: sale.createdAt,
    cashier: sale.cashier,
    total: round2(sale.total),
    discountTotal: round2(sale.discountTotal),
    customerName: sale.customerName,
    payments: paymentMap.get(sale.saleId) ?? []
  }))

  const totalRevenue = round2(rows.reduce((acc, row) => acc + row.total, 0))
  return { rows, totalRevenue, txCount: rows.length }
}

/** Every sale with line-item detail for the period. */
export function itemizedSales(filter: SaleFilter): ItemizedSalesReport {
  const salesRows = listSaleHeaders(filter)
  const paymentMap = paymentsBySale(listSalePayments(filter))
  const { where, params } = saleWhere(filter)

  const itemRows = getDb()
    .prepare(
      `SELECT si.sale_id AS saleId, si.id AS saleItemId,
              COALESCE(si.product_name_snapshot, p.name) AS productName,
              p.barcode, si.quantity, si.unit_price AS unitPrice,
              si.line_discount AS lineDiscount, si.line_total AS lineTotal
       FROM sale_items si
       LEFT JOIN products p ON p.id = si.product_id
       JOIN sales s ON s.id = si.sale_id
       ${where}
       ORDER BY si.sale_id, si.id`
    )
    .all(params) as SaleItemReportRow[]

  const itemsBySale = new Map<number, ItemizedSalesReport['sales'][number]['items']>()
  let itemsSold = 0
  for (const row of itemRows) {
    const list = itemsBySale.get(row.saleId) ?? []
    list.push({
      saleItemId: row.saleItemId,
      productName: row.productName,
      barcode: row.barcode,
      quantity: row.quantity,
      unitPrice: round2(row.unitPrice),
      lineDiscount: round2(row.lineDiscount),
      lineTotal: round2(row.lineTotal)
    })
    itemsBySale.set(row.saleId, list)
    itemsSold += row.quantity
  }

  const sales = salesRows.map((sale) => ({
    saleId: sale.saleId,
    consecutivo: sale.consecutivo,
    createdAt: sale.createdAt,
    cashier: sale.cashier,
    total: round2(sale.total),
    discountTotal: round2(sale.discountTotal),
    cartDiscount: round2(sale.cartDiscount),
    customerName: sale.customerName,
    payments: paymentMap.get(sale.saleId) ?? [],
    items: itemsBySale.get(sale.saleId) ?? []
  }))

  const totalRevenue = round2(sales.reduce((acc, sale) => acc + sale.total, 0))
  return { sales, totalRevenue, itemsSold }
}
