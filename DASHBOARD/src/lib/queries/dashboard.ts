import {
  dayBounds,
  daysAgoLocal,
  daysInRange,
  dbTimestampDay,
  dbTimestampHour,
  monthStartLocal,
  rangeBounds,
  todayLocal,
} from '#/lib/dates'
import { round2 } from '#/lib/money'
import { getSupabase } from '#/lib/supabase'
import { fetchAllPages, fetchInChunks } from '#/lib/supabase-page'
import type { StoreId } from '#/lib/stores'
import type {
  AuditRow,
  CashierPerformanceRow,
  CategoryPerformanceRow,
  DashboardData,
  DashboardKpiTrend,
  InventoryProductRow,
  InventorySummary,
  PaymentMethodReport,
  ProductPerformanceRow,
  SalesByHourPoint,
  SalesTrendPoint,
} from '#/lib/types'

function kpiTrend(current: number, previous: number): DashboardKpiTrend {
  const value = round2(current)
  const previousValue = round2(previous)
  if (previousValue === 0) {
    return { value, previousValue, changePct: current > 0 ? 100 : null }
  }
  return {
    value,
    previousValue,
    changePct: round2(((current - previousValue) / previousValue) * 100),
  }
}

type SaleRow = { id: number; total: number | null; discount_total?: number | null; created_at?: string }
type SalePaymentRow = { sale_id: number | null; method: string | null; amount: number | null }
type ProductLookupRow = {
  id: number
  name: string | null
  barcode: string | null
  stock: number | null
  stock_threshold: number | null
  price: number | null
  category: string | null
  deleted_at: string | null
}

const DASHBOARD_CHUNK_SIZE = 500

async function salesInRange(
  storeId: StoreId,
  from: string,
  to: string,
): Promise<SaleRow[]> {
  return fetchAllPages(async (offset, limit) => {
    const { data, error } = await getSupabase()
      .from('sales')
      .select('id, total, discount_total, created_at')
      .eq('store_id', storeId)
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)
    if (error) throw error
    return data
  })
}

function summarizeSales(
  rows: { total: number | null; discount_total?: number | null }[],
) {
  const txCount = rows.length
  const totalRevenue = round2(rows.reduce((s, r) => s + (r.total ?? 0), 0))
  const discountTotal = round2(
    rows.reduce((s, r) => s + (r.discount_total ?? 0), 0),
  )
  const avgTicket = txCount > 0 ? round2(totalRevenue / txCount) : 0
  return { txCount, totalRevenue, avgTicket, discountTotal }
}

async function paymentsForSaleIds(
  storeId: StoreId,
  saleIds: number[],
): Promise<SalePaymentRow[]> {
  if (saleIds.length === 0) {
    return []
  }

  return fetchInChunks(saleIds, DASHBOARD_CHUNK_SIZE, async (chunk) => {
    const { data, error } = await getSupabase()
      .from('sale_payments')
      .select('sale_id, method, amount')
      .eq('store_id', storeId)
      .in('sale_id', chunk)
    if (error) throw error
    return data
  })
}

function summarizePayments(
  pays: SalePaymentRow[],
  onlySaleIds?: Set<number>,
): PaymentMethodReport {
  const report: PaymentMethodReport = {
    cash: 0,
    card: 0,
    sinpe: 0,
    cashCount: 0,
    cardCount: 0,
    sinpeCount: 0,
    total: 0,
  }
  for (const p of pays) {
    const saleId = Number(p.sale_id)
    if (onlySaleIds && !onlySaleIds.has(saleId)) continue
    const amt = p.amount ?? 0
    report.total = round2(report.total + amt)
    if (p.method === 'cash') {
      report.cash = round2(report.cash + amt)
      report.cashCount++
    } else if (p.method === 'card') {
      report.card = round2(report.card + amt)
      report.cardCount++
    } else if (p.method === 'sinpe') {
      report.sinpe = round2(report.sinpe + amt)
      report.sinpeCount++
    }
  }
  return report
}

function normalizeDbTs(value: string | null | undefined): string {
  if (!value) return ''
  return value.includes('T') ? value.replace('T', ' ') : value
}

function salesInDbRange(rows: SaleRow[], from: string, to: string): SaleRow[] {
  return rows.filter((row) => {
    const ts = normalizeDbTs(row.created_at)
    return ts !== '' && ts >= from && ts <= to
  })
}

function buildSalesTrend(
  rows: SaleRow[],
  fromDate: string,
  toDate: string,
): SalesTrendPoint[] {
  const byDay = new Map<string, { revenue: number; transactions: number }>()
  for (const day of daysInRange(fromDate, toDate)) {
    byDay.set(day, { revenue: 0, transactions: 0 })
  }
  for (const row of rows) {
    if (!row.created_at) continue
    const day = dbTimestampDay(row.created_at)
    const bucket = byDay.get(day)
    if (!bucket) continue
    bucket.revenue = round2(bucket.revenue + (row.total ?? 0))
    bucket.transactions++
  }
  return [...byDay.entries()].map(([date, v]) => ({ date, ...v }))
}

function buildSalesByHour(rows: SaleRow[]): SalesByHourPoint[] {
  const byHour = new Map<number, { transactions: number; revenue: number }>()
  for (let h = 0; h < 24; h++) {
    byHour.set(h, { transactions: 0, revenue: 0 })
  }
  for (const row of rows) {
    if (!row.created_at) continue
    const hour = dbTimestampHour(row.created_at)
    const bucket = byHour.get(hour)
    if (!bucket) continue
    bucket.transactions++
    bucket.revenue = round2(bucket.revenue + (row.total ?? 0))
  }
  return [...byHour.entries()]
    .toSorted(([a], [b]) => a - b)
    .map(([hour, v]) => ({ hour, ...v }))
}

async function productPerformanceForSales(
  storeId: StoreId,
  sales: SaleRow[],
  products: ProductLookupRow[],
): Promise<{
  topProducts: ProductPerformanceRow[]
  categoryPerformance: CategoryPerformanceRow[]
}> {
  const saleIds = sales.map((s) => s.id)
  if (saleIds.length === 0) {
    return { topProducts: [], categoryPerformance: [] }
  }

  const items = await fetchInChunks(saleIds, DASHBOARD_CHUNK_SIZE, async (chunk) => {
    const { data, error } = await getSupabase()
      .from('sale_items')
      .select('product_id, product_name_snapshot, quantity, line_total')
      .eq('store_id', storeId)
      .in('sale_id', chunk)
    if (error) throw error
    return data
  })

  const productMap = new Map(products.map((p) => [p.id, p]))
  const agg = new Map<number, ProductPerformanceRow>()

  for (const item of items) {
    const pid = item.product_id as number
    const p = productMap.get(pid)
    const existing = agg.get(pid) ?? {
      productId: pid,
      name: (item.product_name_snapshot as string) || `Producto #${pid}`,
      sku: p ? String(p.barcode) : '—',
      unitsSold: 0,
      revenue: 0,
      stock: p ? Number(p.stock) : 0,
      category: p ? p.category : null,
    }
    existing.unitsSold += item.quantity ?? 0
    existing.revenue = round2(existing.revenue + (item.line_total ?? 0))
    agg.set(pid, existing)
  }

  const all = [...agg.values()]
  return {
    topProducts: all.sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    categoryPerformance: categoryPerformance(all),
  }
}

function categoryPerformance(
  products: ProductPerformanceRow[],
): CategoryPerformanceRow[] {
  const byCat = new Map<string, { revenue: number; units: number }>()
  for (const p of products) {
    const cat = p.category?.trim() || '—'
    const existing = byCat.get(cat) ?? { revenue: 0, units: 0 }
    existing.revenue = round2(existing.revenue + p.revenue)
    existing.units += p.unitsSold
    byCat.set(cat, existing)
  }
  return [...byCat.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
}

async function loadProducts(storeId: StoreId): Promise<ProductLookupRow[]> {
  const { data, error } = await getSupabase()
    .from('products')
    .select('id, name, barcode, stock, stock_threshold, price, category, deleted_at')
    .eq('store_id', storeId)
  if (error) throw error
  return data
}

function inventorySummaryFromProducts(products: ProductLookupRow[]): {
  inventory: InventorySummary
  lowStockProducts: InventoryProductRow[]
  outOfStockProducts: InventoryProductRow[]
} {
  const rows = products.filter((p) => p.deleted_at == null)
  const def = 5
  let lowStock = 0
  let outOfStock = 0
  let retailValue = 0
  const low: InventoryProductRow[] = []
  const out: InventoryProductRow[] = []

  for (const p of rows) {
    const stock = p.stock ?? 0
    const threshold = p.stock_threshold ?? def
    retailValue = round2(retailValue + stock * (p.price ?? 0))
    const base = {
      productId: p.id,
      name: p.name as string,
      sku: String(p.barcode ?? '—'),
      stock,
      minimum: threshold,
    }
    if (stock <= 0) {
      outOfStock++
      out.push({ ...base, status: 'critical' })
    } else if (stock <= threshold) {
      lowStock++
      low.push({ ...base, status: 'low' })
    }
  }

  low.sort((a, b) => a.stock - b.stock)
  out.sort((a, b) => a.name.localeCompare(b.name))

  return {
    inventory: {
      totalProducts: rows.length,
      lowStock,
      outOfStock,
      retailValue,
    },
    lowStockProducts: low.slice(0, 12),
    outOfStockProducts: out.slice(0, 12),
  }
}

async function recentAudit(storeId: StoreId, limit = 15): Promise<AuditRow[]> {
  const { data, error } = await getSupabase()
    .from('audit_log')
    .select('id, store_id, username, action, entity, entity_id, detail, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

async function cashierPerformance(
  storeId: StoreId,
  monthFrom: string,
): Promise<CashierPerformanceRow[]> {
  const { from } = rangeBounds(monthFrom, todayLocal())
  const { data, error } = await getSupabase()
    .from('cierres')
    .select('closed_by_username, total_sales')
    .eq('store_id', storeId)
    .gte('closed_at', from)
  if (error) throw error

  const byUser = new Map<string, { cierreCount: number; totalSales: number }>()
  for (const row of data) {
    const username = (row.closed_by_username as string | null)?.trim()
    if (!username) continue
    const existing = byUser.get(username) ?? { cierreCount: 0, totalSales: 0 }
    existing.cierreCount++
    existing.totalSales = round2(
      existing.totalSales + (Number(row.total_sales) || 0),
    )
    byUser.set(username, existing)
  }

  return [...byUser.entries()]
    .map(([username, stats]) => ({
      username,
      cierreCount: stats.cierreCount,
      totalSales: stats.totalSales,
      avgTicket:
        stats.cierreCount > 0
          ? round2(stats.totalSales / stats.cierreCount)
          : 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
}

async function activeUsernames(storeId: StoreId, since: string): Promise<number> {
  const { data, error } = await getSupabase()
    .from('audit_log')
    .select('username')
    .eq('store_id', storeId)
    .gte('created_at', since)
  if (error) throw error
  const names = new Set<string>()
  for (const row of data) {
    const name = (row.username as string | null)?.trim()
    if (name) names.add(name)
  }
  return names.size
}

export async function fetchDashboard(storeId: StoreId): Promise<DashboardData> {
  const today = todayLocal()
  const yesterday = daysAgoLocal(1)
  const monthFrom = monthStartLocal(0)
  const lastMonthFrom = monthStartLocal(1)
  const trendFromDate = daysAgoLocal(29)

  const todayB = dayBounds(today)
  const yesterdayB = dayBounds(yesterday)
  const monthB = rangeBounds(monthFrom, today)
  const trendB = rangeBounds(trendFromDate, today)
  const lastMonthLastDay = (() => {
    const d = new Date(`${monthFrom}T12:00:00`)
    d.setDate(0)
    return d.toISOString().slice(0, 10)
  })()
  const lastMonthB = rangeBounds(lastMonthFrom, lastMonthLastDay)

  const overallFrom = lastMonthB.from < trendB.from ? lastMonthB.from : trendB.from
  const overallTo = todayB.to

  const [
    allSales,
    products,
    auditRows,
    cashiers,
    activeUsers,
  ] = await Promise.all([
    salesInRange(storeId, overallFrom, overallTo),
    loadProducts(storeId),
    recentAudit(storeId),
    cashierPerformance(storeId, monthFrom),
    activeUsernames(storeId, rangeBounds(daysAgoLocal(30), today).from),
  ])

  const todaySales = salesInDbRange(allSales, todayB.from, todayB.to)
  const yesterdaySales = salesInDbRange(allSales, yesterdayB.from, yesterdayB.to)
  const monthSales = salesInDbRange(allSales, monthB.from, monthB.to)
  const lastMonthSales = salesInDbRange(allSales, lastMonthB.from, lastMonthB.to)
  const trendSales = salesInDbRange(allSales, trendB.from, trendB.to)
  const inv = inventorySummaryFromProducts(products)

  const [monthPaymentRows, monthPerf] = await Promise.all([
    paymentsForSaleIds(
      storeId,
      monthSales.map((s) => s.id),
    ),
    productPerformanceForSales(storeId, monthSales, products),
  ])

  const paymentMonth = summarizePayments(monthPaymentRows)
  const paymentToday = summarizePayments(
    monthPaymentRows,
    new Set(todaySales.map((s) => s.id)),
  )

  const todayS = summarizeSales(todaySales)
  const yesterdayS = summarizeSales(yesterdaySales)
  const monthS = summarizeSales(monthSales)
  const lastMonthS = summarizeSales(lastMonthSales)
  const salesTrend = buildSalesTrend(trendSales, trendFromDate, today)
  const salesByHour = buildSalesByHour(todaySales)

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      todaySales: kpiTrend(todayS.totalRevenue, yesterdayS.totalRevenue),
      monthlySales: kpiTrend(monthS.totalRevenue, lastMonthS.totalRevenue),
      todayTransactions: kpiTrend(todayS.txCount, yesterdayS.txCount),
      avgTicketToday: kpiTrend(todayS.avgTicket, yesterdayS.avgTicket),
      lowStockAlerts: kpiTrend(inv.inventory.lowStock, inv.inventory.lowStock),
      outOfStock: kpiTrend(inv.inventory.outOfStock, inv.inventory.outOfStock),
    },
    salesTrend,
    salesByHour,
    paymentToday,
    paymentMonth,
    topProducts: monthPerf.topProducts,
    categoryPerformance: monthPerf.categoryPerformance,
    inventory: inv.inventory,
    lowStockProducts: inv.lowStockProducts,
    outOfStockProducts: inv.outOfStockProducts,
    recentAudit: auditRows,
    cashierPerformance: cashiers,
    activeUsernames: activeUsers,
  }
}

export async function fetchSalesSummary(
  storeId: StoreId,
  from: string,
  to: string,
): Promise<ReturnType<typeof summarizeSales>> {
  const rows = await salesInRange(storeId, from, to)
  return summarizeSales(rows)
}
