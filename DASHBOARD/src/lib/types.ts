export interface DashboardKpiTrend {
  value: number
  previousValue: number
  changePct: number | null
}

export interface DashboardKpis {
  todaySales: DashboardKpiTrend
  monthlySales: DashboardKpiTrend
  todayTransactions: DashboardKpiTrend
  avgTicketToday: DashboardKpiTrend
  lowStockAlerts: DashboardKpiTrend
  outOfStock: DashboardKpiTrend
}

export interface PaymentMethodReport {
  cash: number
  card: number
  sinpe: number
  cashCount: number
  cardCount: number
  sinpeCount: number
  total: number
}

export interface SalesTrendPoint {
  date: string
  revenue: number
  transactions: number
}

export interface ProductPerformanceRow {
  productId: number
  name: string
  sku: string
  unitsSold: number
  revenue: number
  stock: number
  category: string | null
}

export interface InventorySummary {
  totalProducts: number
  lowStock: number
  outOfStock: number
  retailValue: number
}

export interface InventoryProductRow {
  productId: number
  name: string
  sku: string
  stock: number
  minimum: number
  status: 'healthy' | 'low' | 'critical'
}

export interface SalesByHourPoint {
  hour: number
  transactions: number
  revenue: number
}

export interface CategoryPerformanceRow {
  category: string
  revenue: number
  units: number
}

export interface DashboardData {
  generatedAt: string
  kpis: DashboardKpis
  salesTrend: SalesTrendPoint[]
  salesByHour: SalesByHourPoint[]
  paymentToday: PaymentMethodReport
  paymentMonth: PaymentMethodReport
  topProducts: ProductPerformanceRow[]
  categoryPerformance: CategoryPerformanceRow[]
  inventory: InventorySummary
  lowStockProducts: InventoryProductRow[]
  outOfStockProducts: InventoryProductRow[]
  recentAudit: AuditRow[]
  cashierPerformance: CashierPerformanceRow[]
  activeUsernames: number
}

export interface CashierPerformanceRow {
  username: string
  cierreCount: number
  totalSales: number
  avgTicket: number
}

export interface CashMovementRow {
  id: number
  store_id: string
  type: string | null
  amount: number | null
  reason: string | null
  user_id: number | null
  created_at: string | null
  cierre_id: number | null
}

export interface CierreRow {
  id: number
  store_id: string
  opened_at: string | null
  closed_at: string | null
  closed_by_username: string | null
  shift_label: string | null
  total_cash: number | null
  total_card: number | null
  total_sinpe: number | null
  total_sales: number | null
  cash_difference: number | null
  notes: string | null
}

export interface AuditRow {
  id: number
  store_id: string
  username: string | null
  action: string
  entity: string | null
  entity_id: string | null
  detail: string | null
  created_at: string
}

export interface StorePresence {
  storeId: string
  label: string
  lastSeenAt: string | null
  online: boolean
}

export type ReportPeriod = 'today' | 'week' | 'month'

export interface SalesSummaryReport {
  txCount: number
  totalRevenue: number
  avgTicket: number
  discountTotal: number
}
