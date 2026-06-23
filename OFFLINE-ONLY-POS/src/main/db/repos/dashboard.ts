import { getDb } from '../index'
import { HIDDEN_OPERATOR_USERNAME } from '../../../shared/operator-account'

const HIDDEN_USER_SQL = `lower(username) <> lower('${HIDDEN_OPERATOR_USERNAME}')`
import { daysAgoLocal, daysInRange, localNow, rangeBounds, round2, todayLocal } from '../helpers'
import { ACTIVE_PRODUCT_SQL } from './products'
import { getAppSettings, getSetting, SETTING_KEYS } from './settings'
import { listAudit } from './audit'
import { listQueuedPrintJobs } from './printJobs'
import { paymentTotals, salesSummary, taxBreakdown } from './reports'
import type {
  AuditLogRow,
  DashboardActivityItem,
  DashboardAlert,
  DashboardCategoryRow,
  DashboardEmployeeOverview,
  DashboardEmployeePerformanceRow,
  DashboardInventoryHealth,
  DashboardInventoryProductRow,
  DashboardInventorySummary,
  DashboardKpiTrend,
  DashboardOverview,
  DashboardProductPerformanceRow,
  DashboardRoleSummary,
  DashboardSalesByHour,
  DashboardSalesTrendPoint,
  DashboardStockMovementPoint,
  DashboardStockStatus,
  DateRange,
  PaymentMethodReport,
  Role,
  TaxBreakdownReport
} from '../../../shared/types'

function kpiTrend(current: number, previous: number): DashboardKpiTrend {
  let changePct: number | null = null
  if (previous > 0) changePct = round2(((current - previous) / previous) * 100)
  else if (current > 0) changePct = 100
  return { value: round2(current), previousValue: round2(previous), changePct }
}

function monthRange(monthsAgo: number): DateRange {
  const now = new Date()
  now.setMonth(now.getMonth() - monthsAgo)
  const pad = (n: number): string => String(n).padStart(2, '0')
  const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  if (monthsAgo === 0) return { from, to: todayLocal() }
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const to = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
  return { from, to }
}

function grossProfit(filter: { fromTs: string; toTs: string }): number {
  const row = getDb()
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
       WHERE s.created_at >= @fromTs AND s.created_at <= @toTs`
    )
    .get(filter) as { profit: number }
  return round2(row.profit)
}

function salesTrendLast30Days(): DashboardSalesTrendPoint[] {
  const range: DateRange = { from: daysAgoLocal(29), to: todayLocal() }
  const [fromTs, toTs] = rangeBounds(range)
  const rows = getDb()
    .prepare(
      `SELECT SUBSTR(s.created_at, 1, 10) AS day,
              COALESCE(SUM(s.total), 0) AS revenue,
              COUNT(*) AS transactions
       FROM sales s
       WHERE s.created_at >= @fromTs AND s.created_at <= @toTs
       GROUP BY day
       ORDER BY day`
    )
    .all({ fromTs, toTs }) as { day: string; revenue: number; transactions: number }[]

  const byDay = new Map(rows.map((r) => [r.day, r]))
  return daysInRange(range).map((date) => {
    const row = byDay.get(date)
    return {
      date,
      revenue: round2(row?.revenue ?? 0),
      transactions: row?.transactions ?? 0
    }
  })
}

function salesByHourToday(): DashboardSalesByHour[] {
  const [fromTs, toTs] = rangeBounds({ from: todayLocal(), to: todayLocal() })
  const rows = getDb()
    .prepare(
      `SELECT CAST(SUBSTR(s.created_at, 12, 2) AS INTEGER) AS hour,
              COUNT(*) AS transactions,
              COALESCE(SUM(s.total), 0) AS revenue
       FROM sales s
       WHERE s.created_at >= @fromTs AND s.created_at <= @toTs
       GROUP BY hour
       ORDER BY hour`
    )
    .all({ fromTs, toTs }) as { hour: number; transactions: number; revenue: number }[]

  const byHour = new Map(rows.map((r) => [r.hour, r]))
  return Array.from({ length: 24 }, (_, hour) => {
    const row = byHour.get(hour)
    return {
      hour,
      transactions: row?.transactions ?? 0,
      revenue: round2(row?.revenue ?? 0)
    }
  })
}

function stockStatus(stock: number, minimum: number): DashboardStockStatus {
  if (stock < 0) return 'critical'
  if (stock <= 0) return 'critical'
  if (stock <= minimum) return 'low'
  return 'healthy'
}

function inventorySummary(): DashboardInventorySummary {
  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS totalProducts,
              COALESCE(SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END), 0) AS activeProducts,
              COALESCE(SUM(max(stock, 0) * COALESCE(cost_price, 0)), 0) AS costValue,
              COALESCE(SUM(max(stock, 0) * price), 0) AS retailValue,
              COALESCE(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) AS outOfStock,
              COALESCE(SUM(CASE WHEN stock < 0 THEN 1 ELSE 0 END), 0) AS negativeStock,
              COALESCE(SUM(CASE WHEN stock > 0 AND stock <= COALESCE(stock_threshold, @def) THEN 1 ELSE 0 END), 0) AS lowStock
       FROM products
       WHERE ${ACTIVE_PRODUCT_SQL}`
    )
    .get({ def }) as DashboardInventorySummary
  return {
    totalProducts: row.totalProducts,
    activeProducts: row.activeProducts,
    lowStock: row.lowStock,
    outOfStock: row.outOfStock,
    negativeStock: row.negativeStock,
    costValue: round2(row.costValue),
    retailValue: round2(row.retailValue)
  }
}

function inventoryHealth(): DashboardInventoryHealth {
  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const row = getDb()
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN stock < 0 THEN 1 ELSE 0 END), 0) AS negative,
         COALESCE(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) AS critical,
         COALESCE(SUM(CASE WHEN stock > 0 AND stock <= COALESCE(stock_threshold, @def) THEN 1 ELSE 0 END), 0) AS low,
         COALESCE(SUM(CASE WHEN stock > COALESCE(stock_threshold, @def) THEN 1 ELSE 0 END), 0) AS healthy
       FROM products
       WHERE ${ACTIVE_PRODUCT_SQL}`
    )
    .get({ def }) as DashboardInventoryHealth
  return row
}

function inventoryProductRows(
  whereSql: string,
  limit: number,
  orderBy: string
): DashboardInventoryProductRow[] {
  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const rows = getDb()
    .prepare(
      `SELECT id, name, barcode, stock, category, updated_at,
              COALESCE(stock_threshold, @def) AS minimum
       FROM products
       WHERE ${whereSql}
       ORDER BY ${orderBy}
       LIMIT @limit`
    )
    .all({ def, limit }) as {
    id: number
    name: string
    barcode: string
    stock: number
    category: string | null
    updated_at: string
    minimum: number
  }[]

  return rows.map((r) => ({
    productId: r.id,
    name: r.name,
    sku: r.barcode,
    stock: r.stock,
    minimum: r.minimum,
    status: stockStatus(r.stock, r.minimum),
    updatedAt: r.updated_at,
    category: r.category
  }))
}

function productPerformance(
  filter: { fromTs: string; toTs: string },
  order: 'revenue_desc' | 'revenue_asc' | 'units_asc',
  limit: number,
  requireSales = true
): DashboardProductPerformanceRow[] {
  const orderClause =
    order === 'revenue_desc'
      ? 'revenue DESC'
      : order === 'revenue_asc'
        ? 'revenue ASC'
        : 'unitsSold ASC'

  const having = requireSales ? 'HAVING unitsSold > 0' : ''

  const rows = getDb()
    .prepare(
      `SELECT p.id AS productId, p.name AS name, p.barcode AS sku, p.stock, p.category,
              COALESCE(SUM(si.quantity), 0) AS unitsSold,
              COALESCE(SUM(si.line_total), 0) AS revenue,
              COALESCE(SUM(si.line_total - COALESCE(p.cost_price, 0) * si.quantity), 0) AS profit
       FROM products p
       LEFT JOIN sale_items si ON si.product_id = p.id
       LEFT JOIN sales s ON s.id = si.sale_id
         AND s.created_at >= @fromTs AND s.created_at <= @toTs
       GROUP BY p.id
       ${having}
       ORDER BY ${orderClause}
       LIMIT @limit`
    )
    .all({ ...filter, limit }) as {
    productId: number
    name: string
    sku: string
    stock: number
    category: string | null
    unitsSold: number
    revenue: number
    profit: number
  }[]

  return rows.map((r) => {
    const revenue = round2(r.revenue)
    const profit = round2(r.profit)
    return {
      productId: r.productId,
      name: r.name,
      sku: r.sku,
      stock: r.stock,
      category: r.category,
      unitsSold: r.unitsSold,
      revenue,
      profit,
      marginPct: revenue > 0 ? round2((profit / revenue) * 100) : null
    }
  })
}

function categoryPerformance(filter: { fromTs: string; toTs: string }): DashboardCategoryRow[] {
  const rows = getDb()
    .prepare(
      `SELECT COALESCE(NULLIF(TRIM(p.category), ''), @uncategorized) AS category,
              COUNT(DISTINCT p.id) AS productCount,
              COALESCE(SUM(si.quantity), 0) AS unitsSold,
              COALESCE(SUM(si.line_total), 0) AS revenue
       FROM products p
       LEFT JOIN sale_items si ON si.product_id = p.id
       LEFT JOIN sales s ON s.id = si.sale_id
         AND s.created_at >= @fromTs AND s.created_at <= @toTs
       GROUP BY category
       ORDER BY revenue DESC`
    )
    .all({ ...filter, uncategorized: '—' }) as DashboardCategoryRow[]

  return rows.map((r) => ({
    category: r.category,
    productCount: r.productCount,
    unitsSold: r.unitsSold,
    revenue: round2(r.revenue)
  }))
}

function stockMovementTrend(): DashboardStockMovementPoint[] {
  const range: DateRange = { from: daysAgoLocal(29), to: todayLocal() }
  const [fromTs, toTs] = rangeBounds(range)
  const rows = getDb()
    .prepare(
      `SELECT SUBSTR(created_at, 1, 10) AS day,
              COUNT(*) AS adjustmentCount,
              COALESCE(SUM(delta), 0) AS netDelta
       FROM stock_adjustments
       WHERE created_at >= @fromTs AND created_at <= @toTs
       GROUP BY day
       ORDER BY day`
    )
    .all({ fromTs, toTs }) as { day: string; adjustmentCount: number; netDelta: number }[]

  const byDay = new Map(rows.map((r) => [r.day, r]))
  return daysInRange(range).map((date) => {
    const row = byDay.get(date)
    return {
      date,
      adjustmentCount: row?.adjustmentCount ?? 0,
      netDelta: row?.netDelta ?? 0
    }
  })
}

function employeeOverview(): DashboardEmployeeOverview {
  const rows = getDb()
    .prepare(
      `SELECT role, COUNT(*) AS count
       FROM users
       WHERE is_active = 1 AND ${HIDDEN_USER_SQL}
       GROUP BY role`
    )
    .all() as { role: Role; count: number }[]

  const total = rows.reduce((sum, r) => sum + r.count, 0)
  return {
    totalEmployees: total,
    activeEmployees: total,
    roleCounts: rows
  }
}

function employeePerformance(filter: { fromTs: string; toTs: string }): DashboardEmployeePerformanceRow[] {
  return getDb()
    .prepare(
      `SELECT u.id AS userId, u.username AS username, u.role AS role,
              COUNT(s.id) AS transactions,
              COALESCE(SUM(s.total), 0) AS salesVolume,
              COALESCE(AVG(s.total), 0) AS avgTicket
       FROM users u
       LEFT JOIN sales s ON s.user_id = u.id
         AND s.created_at >= @fromTs AND s.created_at <= @toTs
       WHERE u.is_active = 1 AND u.role = 'sales' AND lower(u.username) <> lower('${HIDDEN_OPERATOR_USERNAME}')
       GROUP BY u.id
       ORDER BY salesVolume DESC`
    )
    .all(filter) as DashboardEmployeePerformanceRow[]
}

function roleSummaries(): DashboardRoleSummary[] {
  const counts = getDb()
    .prepare(
      `SELECT role, COUNT(*) AS count FROM users WHERE is_active = 1 AND ${HIDDEN_USER_SQL} GROUP BY role`
    )
    .all() as { role: Role; count: number }[]

  const keys: Record<Role, string> = {
    admin: 'dashboard.roles.adminDesc',
    sales: 'dashboard.roles.salesDesc',
    product_manager: 'dashboard.roles.pmDesc'
  }

  return counts.map((c) => ({
    role: c.role,
    count: c.count,
    descriptionKey: keys[c.role]
  }))
}

function taxableSalesTotal(report: TaxBreakdownReport): number {
  return round2(report.rows.reduce((sum, row) => sum + row.gross, 0))
}

function mapAuditToActivity(row: AuditLogRow): DashboardActivityItem {
  const action = row.action
  let kind: DashboardActivityItem['kind'] = 'other'
  const messageKey = `audit.actions.${action}`
  let linkTo: string | undefined

  if (action.startsWith('product.')) {
    kind = action.includes('create') ? 'product_create' : 'product_update'
    linkTo = '/products'
  } else if (action.startsWith('stock.')) {
    kind = 'stock_adjust'
    linkTo = '/products'
  } else if (action.startsWith('sale.')) {
    kind = 'sale'
  } else if (action.includes('user') || action.includes('login')) {
    kind = 'employee'
    linkTo = '/admin/audit'
  }

  return {
    id: `audit-${row.id}`,
    kind,
    messageKey,
    detail: row.detail ?? row.entity ?? '',
    username: row.username,
    createdAt: row.created_at,
    linkTo
  }
}

function recentActivityFeed(): DashboardActivityItem[] {
  const auditRows = listAudit({ limit: 20 })
  const salesRows = getDb()
    .prepare(
      `SELECT s.id, s.total, s.created_at, u.username
       FROM sales s JOIN users u ON u.id = s.user_id
       ORDER BY s.id DESC LIMIT 8`
    )
    .all() as { id: number; total: number; created_at: string; username: string }[]

  const saleItems: DashboardActivityItem[] = salesRows.map((s) => ({
    id: `sale-${s.id}`,
    kind: 'sale',
    messageKey: 'dashboard.activity.sale',
    detail: String(s.total),
    username: s.username,
    createdAt: s.created_at,
    linkTo: '/admin/reports'
  }))

  const auditItems = auditRows.map(mapAuditToActivity)
  return [...saleItems, ...auditItems]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 24)
}

function buildAlerts(inventory: DashboardInventorySummary, cierreAlerts: number): DashboardAlert[] {
  const alerts: DashboardAlert[] = []
  const queued = listQueuedPrintJobs()
  const printFailed = queued.filter((j) => j.status === 'failed').length
  const printPending = queued.filter((j) => j.status === 'pending').length

  if (inventory.lowStock > 0) {
    alerts.push({
      kind: 'low_stock',
      messageKey: 'dashboard.alerts.lowStock',
      count: inventory.lowStock,
      severity: 'warning',
      linkTo: '/products'
    })
  }
  if (inventory.outOfStock > 0) {
    alerts.push({
      kind: 'out_of_stock',
      messageKey: 'dashboard.alerts.outOfStock',
      count: inventory.outOfStock,
      severity: 'danger',
      linkTo: '/products'
    })
  }
  if (inventory.negativeStock > 0) {
    alerts.push({
      kind: 'negative_stock',
      messageKey: 'dashboard.alerts.negativeStock',
      count: inventory.negativeStock,
      severity: 'danger',
      linkTo: '/products'
    })
  }
  if (cierreAlerts > 0) {
    alerts.push({
      kind: 'cierre_discrepancy',
      messageKey: 'dashboard.alerts.cierreDiscrepancy',
      count: cierreAlerts,
      severity: 'warning',
      linkTo: '/admin/audit'
    })
  }
  if (printPending > 0) {
    alerts.push({
      kind: 'print_pending',
      messageKey: 'dashboard.alerts.printPending',
      count: printPending,
      severity: 'info',
      linkTo: '/admin/print-queue'
    })
  }
  if (printFailed > 0) {
    alerts.push({
      kind: 'print_failed',
      messageKey: 'dashboard.alerts.printFailed',
      count: printFailed,
      severity: 'danger',
      linkTo: '/admin/print-queue'
    })
  }
  return alerts
}

function productCountAt(monthStart: string): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS count FROM products WHERE created_at < @monthStart')
    .get({ monthStart: `${monthStart} 00:00:00` }) as { count: number }
  return row.count
}

function lowStockCountWeekAgo(): number {
  const def = Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5')
  const weekAgo = `${daysAgoLocal(7)} 23:59:59`
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count
       FROM products p
       WHERE p.stock > 0 AND p.stock <= COALESCE(p.stock_threshold, @def)
         AND p.updated_at <= @weekAgo`
    )
    .get({ def, weekAgo }) as { count: number }
  return row.count
}

function outOfStockWeekAgo(): number {
  const weekAgo = `${daysAgoLocal(7)} 23:59:59`
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count FROM products WHERE stock = 0 AND updated_at <= @weekAgo`
    )
    .get({ weekAgo }) as { count: number }
  return row.count
}

/** Aggregated admin dashboard payload from live SQLite data. */
export function dashboardOverview(): DashboardOverview {
  const today: DateRange = { from: todayLocal(), to: todayLocal() }
  const yesterday: DateRange = { from: daysAgoLocal(1), to: daysAgoLocal(1) }
  const thisMonth = monthRange(0)
  const lastMonth = monthRange(1)

  const [todayFrom, todayTo] = rangeBounds(today)
  const [yesterdayFrom, yesterdayTo] = rangeBounds(yesterday)
  const [monthFrom, monthTo] = rangeBounds(thisMonth)
  const [lastMonthFrom, lastMonthTo] = rangeBounds(lastMonth)

  const todaySummary = salesSummary({ fromTs: todayFrom, toTs: todayTo })
  const yesterdaySummary = salesSummary({ fromTs: yesterdayFrom, toTs: yesterdayTo })
  const monthSummary = salesSummary({ fromTs: monthFrom, toTs: monthTo })
  const lastMonthSummary = salesSummary({ fromTs: lastMonthFrom, toTs: lastMonthTo })

  const profitToday = grossProfit({ fromTs: todayFrom, toTs: todayTo })
  const profitYesterday = grossProfit({ fromTs: yesterdayFrom, toTs: yesterdayTo })

  const inventory = inventorySummary()
  const taxSummary = taxBreakdown({ fromTs: monthFrom, toTs: monthTo })
  const taxable = taxableSalesTotal(taxSummary)

  const cierreAlertCount = (
    getDb()
      .prepare(
        `SELECT COUNT(*) AS count FROM cierres
         WHERE cash_difference IS NOT NULL AND cash_difference != 0
           AND closed_at >= @fromTs`
      )
      .get({ fromTs: daysAgoLocal(30) + ' 00:00:00' }) as { count: number }
  ).count

  const paymentToday: PaymentMethodReport = paymentTotals({ fromTs: todayFrom, toTs: todayTo })
  const paymentMonth: PaymentMethodReport = paymentTotals({ fromTs: monthFrom, toTs: monthTo })

  const monthFilter = { fromTs: monthFrom, toTs: monthTo }

  return {
    storeName: getAppSettings().storeName,
    generatedAt: localNow(),
    kpis: {
      todaySales: kpiTrend(todaySummary.totalRevenue, yesterdaySummary.totalRevenue),
      monthlySales: kpiTrend(monthSummary.totalRevenue, lastMonthSummary.totalRevenue),
      todayTransactions: kpiTrend(todaySummary.txCount, yesterdaySummary.txCount),
      avgTicketToday: kpiTrend(todaySummary.avgTicket, yesterdaySummary.avgTicket),
      grossProfitToday: kpiTrend(profitToday, profitYesterday),
      totalProducts: kpiTrend(inventory.totalProducts, productCountAt(thisMonth.from)),
      lowStockAlerts: kpiTrend(inventory.lowStock, lowStockCountWeekAgo()),
      outOfStock: kpiTrend(inventory.outOfStock, outOfStockWeekAgo())
    },
    salesTrend: salesTrendLast30Days(),
    salesByHour: salesByHourToday(),
    paymentToday,
    paymentMonth,
    topProducts: productPerformance(monthFilter, 'revenue_desc', 10),
    slowProducts: productPerformance(monthFilter, 'units_asc', 10, false).filter(
      (p) => p.stock > 0
    ),
    worstSellers: productPerformance(monthFilter, 'revenue_asc', 10),
    categoryPerformance: categoryPerformance(monthFilter),
    recentlyAddedProducts: (
      getDb()
        .prepare(
          `SELECT id AS productId, name, barcode AS sku, stock, category,
                  0 AS unitsSold, 0 AS revenue, 0 AS profit
           FROM products ORDER BY created_at DESC LIMIT 8`
        )
        .all() as Omit<DashboardProductPerformanceRow, 'marginPct'>[]
    ).map((r) => ({ ...r, marginPct: null })),
    inventory,
    inventoryHealth: inventoryHealth(),
    stockMovementTrend: stockMovementTrend(),
    lowStockProducts: inventoryProductRows(
      'stock > 0 AND stock <= COALESCE(stock_threshold, @def)',
      12,
      'stock ASC, name COLLATE NOCASE'
    ),
    outOfStockProducts: inventoryProductRows('stock = 0', 12, 'name COLLATE NOCASE'),
    recentlyUpdatedInventory: inventoryProductRows('1=1', 10, 'updated_at DESC'),
    employees: employeeOverview(),
    employeePerformance: employeePerformance(monthFilter).map((r) => ({
      ...r,
      salesVolume: round2(r.salesVolume),
      avgTicket: round2(r.avgTicket)
    })),
    roleSummaries: roleSummaries(),
    recentEmployeeActivity: listAudit({ limit: 10 }),
    recentActivity: recentActivityFeed(),
    alerts: buildAlerts(inventory, cierreAlertCount),
    taxSummary,
    taxableSales: taxable,
    exemptSales: 0
  }
}
