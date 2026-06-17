export type Role = 'sales' | 'product_manager' | 'admin'
export type PaymentMethod = 'cash' | 'card' | 'sinpe'
export type Language = 'es' | 'zh-CN'
export type StockStatus = 'all' | 'low' | 'zero' | 'negative'
export type PrintJobStatus = 'pending' | 'printed' | 'failed'
export type PrintJobType = 'receipt' | 'report' | 'cierre'
export type PrintStatus = 'printed' | 'failed'
export type ReportType = 'summary' | 'byPayment' | 'topProducts' | 'inventory' | 'taxBreakdown'

/** URL preset for report date ranges (matches dashboard KPI periods). */
export type ReportPeriodPreset = 'today' | 'week' | 'month'

/** All products use the standard IVA rate. Stored on sale lines for audit. */
export type TaxCategory = 'standard'
export type TaxRegime = 'simplificado' | 'tradicional'
/** Costa Rica identification document types. */
export type IdType = 'fisica' | 'juridica' | 'dimex' | 'nite'
export type CashMovementType = 'opening_float' | 'cash_in' | 'cash_out'

export interface SessionUser {
  id: number
  username: string
  role: Role
}

export interface AppSettings {
  language: Language | null
  storeName: string
  stockThresholdDefault: number
  scannerBurstMs: number
  firstRunComplete: boolean
  cajaPinConfigured: boolean
  // Tax regime + IVA rate mapping (IVA dormant while regime is 'simplificado').
  taxRegime: TaxRegime
  ivaRateStandard: number
  // Emisor (store) data for Costa Rica receipts.
  branchCode: string
  terminalCode: string
  storeLegalName: string
  storeIdType: IdType
  storeId: string
  storePhone: string
  storeEmail: string
  storeActivityCode: string
  storeProvince: string
  storeCanton: string
  storeDistrict: string
  storeAddress: string
  receiptFooter: string
}

export interface Product {
  id: number
  barcode: string
  name: string
  price: number
  cost_price: number | null
  category: string | null
  stock: number
  stock_threshold: number | null
  tax_category: TaxCategory
  bulk_qty: number | null
  bulk_price: number | null
  /** 1 = allow sales when stock is insufficient (eFactura "facturar negativo"). */
  factura_negativo: number
  created_at: string
  updated_at: string
}

export interface ProductInput {
  barcode: string
  name: string
  price: number
  costPrice: number | null
  category: string | null
  stock: number
  stockThreshold: number | null
  taxCategory: TaxCategory
  bulkQty: number | null
  bulkPrice: number | null
  facturaNegativo: boolean
}

export interface ProductFilters {
  search?: string
  category?: string
  stockStatus?: StockStatus
  page?: number
  pageSize?: number
}

export interface ProductListResult {
  items: Product[]
  total: number
  page: number
  pageSize: number
}

export interface ProductImportError {
  row: number
  key: string
  detail?: string
}

export type ProductImportStockMode = 'add' | 'replace'

export interface ProductImportPreviewRow {
  row: number
  barcode: string
  name: string
  price: number
  category: string | null
  stock: number
  taxCategory: TaxCategory
  currentName?: string
  currentPrice?: number
  currentStock?: number
}

export interface ProductImportPreview {
  canceled: boolean
  filePath?: string
  fileName?: string
  toCreate: ProductImportPreviewRow[]
  toUpdate: ProductImportPreviewRow[]
  unchanged: ProductImportPreviewRow[]
  errors: ProductImportError[]
}

export interface ProductImportResult {
  canceled: boolean
  created?: number
  updated?: number
  errors?: ProductImportError[]
}

export interface StockAlert {
  productId: number
  name: string
  stock: number
  threshold: number
  level: 'low' | 'out'
}

export interface AdjustStockInput {
  productId: number
  delta: number
  reason: string
}

/** A single tender. Amounts must sum to the sale total (cash may be over-tendered via `tendered`). */
export interface SalePaymentInput {
  method: PaymentMethod
  amount: number
  ref?: string
}

export interface CustomerInput {
  name?: string
  idType?: IdType
  id?: string
  phone?: string
  email?: string
  activityCode?: string
}

export interface CreateSaleItemInput {
  productId: number
  quantity: number
  /** Absolute discount (₡) applied to this line, after any bulk price. */
  discount?: number
  /** Overrides catalog/bulk unit price for this line when charging a different amount. */
  unitPrice?: number
}

export interface CreateSaleInput {
  items: CreateSaleItemInput[]
  payments: SalePaymentInput[]
  /** Absolute discount (₡) applied to the whole cart, on top of line discounts. */
  cartDiscount?: number
  customer?: CustomerInput
  /** Physical cash handed over (for change). Only relevant when a cash payment exists. */
  tendered?: number
  /** Required when any line or cart discount is applied. Caja or manager PIN. */
  discountPin?: string
}

export interface CreateSaleResult {
  saleId: number
  consecutivo: string
  total: number
  change: number | null
  stockAlerts: StockAlert[]
  printJobId: number
  printStatus: PrintStatus
}

export interface SalePaymentDetail {
  method: PaymentMethod
  amount: number
  ref: string | null
}

export interface SaleItemDetail {
  productId: number
  name: string
  barcode: string
  quantity: number
  unitPrice: number
  discount: number
  lineTotal: number
  taxCategory: TaxCategory
  returnedQty: number
}

export interface SaleCustomer {
  name: string | null
  idType: IdType | null
  id: string | null
  phone: string | null
  email: string | null
  activityCode: string | null
}

export interface SaleDetail {
  id: number
  consecutivo: string | null
  createdAt: string
  cashier: string
  paymentMethod: PaymentMethod
  payments: SalePaymentDetail[]
  subtotal: number
  discountTotal: number
  total: number
  sinpeRef: string | null
  cierreId: number | null
  customer: SaleCustomer
  items: SaleItemDetail[]
}

export interface CreateReturnInput {
  saleId: number
  items: { productId: number; quantity: number }[]
  restock: boolean
  pin: string
}

export interface CreateReturnResult {
  stockAlerts: StockAlert[]
}

export interface DateRange {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
}

export interface PeriodCashTotals {
  openingFloat: number
  cashIn: number
  cashOut: number
  cashSales: number
}

export interface SalesSummaryReport {
  totalRevenue: number
  txCount: number
  itemsSold: number
  returnsCount: number
  avgTicket: number
  totalDiscount: number
  grossProfit: number
  cash: PeriodCashTotals
}

export interface PaymentMethodReport {
  cash: number
  card: number
  sinpe: number
  total: number
  countCash: number
  countCard: number
  countSinpe: number
}

export interface TopProductRow {
  productId: number
  name: string
  barcode: string
  quantity: number
  revenue: number
  profit: number
  marginPct: number | null
}

export interface InventoryRow {
  id: number
  barcode: string
  name: string
  category: string | null
  stock: number
  threshold: number
  price: number
  value: number
}

export interface TaxBreakdownRow {
  taxCategory: TaxCategory
  rate: number
  gross: number
  base: number
  iva: number
}

export interface TaxBreakdownReport {
  regime: TaxRegime
  rows: TaxBreakdownRow[]
  totalGross: number
  totalBase: number
  totalIva: number
}

export type ReportData =
  | { type: 'summary'; data: SalesSummaryReport }
  | { type: 'byPayment'; data: PaymentMethodReport }
  | { type: 'topProducts'; data: TopProductRow[] }
  | { type: 'inventory'; data: InventoryRow[] }
  | { type: 'taxBreakdown'; data: TaxBreakdownReport }

// --- admin dashboard ---

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
  grossProfitToday: DashboardKpiTrend
  totalProducts: DashboardKpiTrend
  lowStockAlerts: DashboardKpiTrend
  outOfStock: DashboardKpiTrend
}

export interface DashboardSalesTrendPoint {
  date: string
  revenue: number
  transactions: number
}

export interface DashboardSalesByHour {
  hour: number
  transactions: number
  revenue: number
}

export type DashboardStockStatus = 'healthy' | 'low' | 'critical'

export interface DashboardCategoryRow {
  category: string
  revenue: number
  unitsSold: number
  productCount: number
}

export interface DashboardProductPerformanceRow {
  productId: number
  name: string
  sku: string
  unitsSold: number
  revenue: number
  profit: number
  marginPct: number | null
  stock: number
  category: string | null
}

export interface DashboardInventorySummary {
  totalProducts: number
  activeProducts: number
  lowStock: number
  outOfStock: number
  negativeStock: number
  costValue: number
  retailValue: number
}

export interface DashboardInventoryHealth {
  healthy: number
  low: number
  critical: number
  negative: number
}

export interface DashboardStockMovementPoint {
  date: string
  adjustmentCount: number
  netDelta: number
}

export interface DashboardInventoryProductRow {
  productId: number
  name: string
  sku: string
  stock: number
  minimum: number
  status: DashboardStockStatus
  updatedAt: string
  category: string | null
}

export interface DashboardEmployeeOverview {
  totalEmployees: number
  activeEmployees: number
  roleCounts: { role: Role; count: number }[]
}

export interface DashboardEmployeePerformanceRow {
  userId: number
  username: string
  role: Role
  transactions: number
  salesVolume: number
  avgTicket: number
}

export interface DashboardRoleSummary {
  role: Role
  count: number
  descriptionKey: string
}

export type DashboardActivityKind =
  | 'sale'
  | 'product_create'
  | 'product_update'
  | 'stock_adjust'
  | 'employee'
  | 'other'

export interface DashboardActivityItem {
  id: string
  kind: DashboardActivityKind
  messageKey: string
  detail: string
  username: string | null
  createdAt: string
  linkTo?: string
}

export type DashboardAlertKind =
  | 'low_stock'
  | 'out_of_stock'
  | 'negative_stock'
  | 'cierre_discrepancy'
  | 'print_failed'
  | 'print_pending'

export interface DashboardAlert {
  kind: DashboardAlertKind
  messageKey: string
  count: number
  severity: 'info' | 'warning' | 'danger'
  linkTo?: string
}

export interface DashboardOverview {
  storeName: string
  generatedAt: string
  kpis: DashboardKpis
  salesTrend: DashboardSalesTrendPoint[]
  salesByHour: DashboardSalesByHour[]
  paymentToday: PaymentMethodReport
  paymentMonth: PaymentMethodReport
  topProducts: DashboardProductPerformanceRow[]
  slowProducts: DashboardProductPerformanceRow[]
  worstSellers: DashboardProductPerformanceRow[]
  categoryPerformance: DashboardCategoryRow[]
  recentlyAddedProducts: DashboardProductPerformanceRow[]
  inventory: DashboardInventorySummary
  inventoryHealth: DashboardInventoryHealth
  stockMovementTrend: DashboardStockMovementPoint[]
  lowStockProducts: DashboardInventoryProductRow[]
  outOfStockProducts: DashboardInventoryProductRow[]
  recentlyUpdatedInventory: DashboardInventoryProductRow[]
  employees: DashboardEmployeeOverview
  employeePerformance: DashboardEmployeePerformanceRow[]
  roleSummaries: DashboardRoleSummary[]
  recentEmployeeActivity: AuditLogRow[]
  recentActivity: DashboardActivityItem[]
  alerts: DashboardAlert[]
  taxSummary: TaxBreakdownReport
  taxableSales: number
  exemptSales: number
}

/** Cash drawer state for the current (un-cierred) period. */
export interface CashSummary {
  floatOpened: boolean
  openingFloat: number
  cashIn: number
  cashOut: number
  cashSales: number
  expectedCash: number
}

export interface CierreDiscountItem {
  saleItemId: number
  productName: string
  quantity: number
  lineDiscount: number
}

export interface CierreDiscountSale {
  saleId: number
  consecutivo: string | null
  createdAt: string
  cashier: string
  cartDiscount: number
  lineDiscountTotal: number
  discountTotal: number
  items: CierreDiscountItem[]
}

export interface CierreDiscountReport {
  totalDiscount: number
  totalCartDiscount: number
  totalLineDiscount: number
  sales: CierreDiscountSale[]
}

export interface CierrePriceOverrideItem {
  saleItemId: number
  productName: string
  quantity: number
  catalogUnitPrice: number
  unitPrice: number
  lineVariance: number
}

export interface CierrePriceOverrideSale {
  saleId: number
  consecutivo: string | null
  createdAt: string
  cashier: string
  items: CierrePriceOverrideItem[]
}

export interface CierrePriceOverrideReport {
  totalVariance: number
  sales: CierrePriceOverrideSale[]
}

export interface CierrePreview {
  pendingSales: number
  /** Full totals for admin; cajero may receive only `{ sinpe }`. */
  totals?: Partial<PaymentMethodReport> & Pick<PaymentMethodReport, 'sinpe'>
  /** Admin-only. */
  openedAt?: string
  returnsCount?: number
  /** Drawer reconciliation — includes `expectedCash` for cajero at cierre. */
  cash?: CashSummary
  /** Admin-only. */
  discounts?: CierreDiscountReport
  /** Admin-only. */
  priceOverrides?: CierrePriceOverrideReport
}

export interface CierreRecord {
  id: number
  opened_at: string
  closed_at: string
  shift_label: string | null
  total_cash: number
  total_card: number
  total_sinpe: number
  total_sales: number
  opening_float: number
  cash_in: number
  cash_out: number
  expected_cash: number
  counted_cash: number | null
  cash_difference: number | null
  closed_by: string
  notes: string | null
}

/** Recent cierre where counted cash did not match expected (sobra o falta). */
export interface CierreDiscrepancyAlert {
  id: number
  closed_at: string
  shift_label: string | null
  closed_by: string
  expected_cash: number
  counted_cash: number
  cash_difference: number
}

export interface CierreConfirmInput {
  /** Optional override; defaults to cierre date/time on the server. */
  shiftLabel?: string
  notes?: string
  /** Physically counted cash in the drawer — required before cierre. */
  countedCash: number
}

export interface CierreConfirmResult {
  cierreId: number
  printStatus: PrintStatus
}

export interface PrintJobRow {
  id: number
  sale_id: number | null
  job_type: PrintJobType
  status: PrintJobStatus
  created_at: string
  printed_at: string | null
}

export interface FirstRunStatus {
  needed: boolean
  language: Language | null
  dbPath: string
  backupDir: string
}

export interface DiscountAuthorizeInput {
  pin: string
  kind: 'line' | 'cart'
  amount: number
  productName?: string
}

export interface PriceOverrideAuthorizeInput {
  pin: string
  productId: number
  productName: string
  catalogUnitPrice: number
  overrideUnitPrice: number
  quantity: number
}

export interface FirstRunSetupInput {
  username: string
  password: string
  pin: string
}

export interface AppUserRow {
  id: number
  username: string
  role: Role
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface UserCreateInput {
  username: string
  password: string
  role: Role
}

export interface UserUpdateInput {
  id: number
  username?: string
  password?: string
  role?: Role
  isActive?: boolean
}

export interface BackupInfo {
  dbPath: string
  backupDir: string
  backups: string[]
}

export interface SettingsUpdateInput {
  storeName?: string
  stockThresholdDefault?: number
  scannerBurstMs?: number
  ivaRateStandard?: number
  branchCode?: string
  terminalCode?: string
  storeLegalName?: string
  storeIdType?: IdType
  storeId?: string
  storePhone?: string
  storeEmail?: string
  storeActivityCode?: string
  storeProvince?: string
  storeCanton?: string
  storeDistrict?: string
  storeAddress?: string
  receiptFooter?: string
}

// --- cash drawer ---

export interface CashMovementRow {
  id: number
  type: CashMovementType
  amount: number
  reason: string | null
  created_at: string
  username: string
}

export interface CashDrawerStatus extends CashSummary {
  openedAt: string
  movements: CashMovementRow[]
}

export interface OpenFloatInput {
  amount: number
}

export interface CashMovementInput {
  type: 'cash_in' | 'cash_out'
  amount: number
  reason?: string
  pin: string
}

// --- audit log ---

export interface AuditLogRow {
  id: number
  user_id: number | null
  username: string | null
  action: string
  entity: string | null
  entity_id: string | null
  detail: string | null
  created_at: string
}

export interface AuditLogFilter {
  range?: DateRange
  userId?: number
  action?: string
  limit?: number
  offset?: number
}

export interface AuditLogPage {
  rows: AuditLogRow[]
  total: number
  limit: number
  offset: number
}

export interface AuditUser {
  id: number
  username: string
}

// --- printing ---

export type PrintLine =
  | { t: 'text'; v: string; align?: 'lt' | 'ct' | 'rt'; bold?: boolean; big?: boolean }
  | { t: 'row'; l: string; r: string; bold?: boolean }
  | { t: 'hr' }
  | { t: 'feed'; n?: number }

export interface PrintPayload {
  lang: Language
  lines: PrintLine[]
}

// --- IPC ---

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; message?: string; vars?: Record<string, string | number> }

export interface LicenseStatus {
  valid: boolean
  clientName: string | null
  expiresAt: string | null
  machineId: string
  error?: string
}

export const IPC_CHANNELS = [
  'license:activate',
  'license:status',
  'firstRun:status',
  'firstRun:setLanguage',
  'firstRun:complete',
  'auth:login',
  'auth:logout',
  'auth:session',
  'settings:get',
  'settings:update',
  'settings:setLanguage',
  'settings:changePin',
  'settings:changeCajaPin',
  'products:list',
  'products:categories',
  'products:create',
  'products:update',
  'products:delete',
  'products:adjustStock',
  'products:exportCsv',
  'products:importCsvPreview',
  'products:importCsvConfirm',
  'products:importEfacturaPreview',
  'products:importEfacturaConfirm',
  'products:byBarcode',
  'products:search',
  'sales:create',
  'sales:findForReturn',
  'returns:create',
  'discount:authorize',
  'priceOverride:authorize',
  'reports:run',
  'reports:print',
  'reports:exportPdf',
  'dashboard:overview',
  'cierre:preview',
  'cierre:confirm',
  'cierre:history',
  'cierre:discrepancyAlerts',
  'cierre:exportPdf',
  'cash:status',
  'cash:openFloat',
  'cash:movement',
  'cash:listMovements',
  'audit:list',
  'audit:users',
  'audit:actions',
  'users:list',
  'users:create',
  'users:update',
  'users:delete',
  'printQueue:list',
  'printQueue:retry',
  'backup:info',
  'backup:runManual',
  'backup:exportCsv'
] as const

export type IpcChannel = (typeof IPC_CHANNELS)[number]
