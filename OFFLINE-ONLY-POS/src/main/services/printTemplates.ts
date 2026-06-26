import { t } from './i18n'
import { formatDate, formatMoney } from './format'
import { localNow } from '../db/helpers'
import type {
  AppSettings,
  CierreDiscountReport,
  CierreDiscardedTabsReport,
  CierrePriceOverrideReport,
  IdType,
  ItemizedSalesReport,
  InventoryRow,
  Language,
  PaymentMethod,
  PaymentMethodReport,
  PrintLine,
  SaleCustomer,
  SalePaymentSnapshot,
  SalesSummaryReport,
  TaxBreakdownRow,
  TaxRegime,
  TopProductRow,
  TransactionLogReport
} from '../../shared/types'

export { buildShelfLabelLines } from './shelfLabelLines'

export function emisorFromSettings(s: AppSettings): EmisorInfo {
  return {
    storeName: s.storeName,
    legalName: s.storeLegalName,
    idType: s.storeIdType,
    id: s.storeId,
    phone: s.storePhone,
    email: s.storeEmail,
    activityCode: s.storeActivityCode,
    province: s.storeProvince,
    canton: s.storeCanton,
    district: s.storeDistrict,
    address: s.storeAddress
  }
}

export interface EmisorInfo {
  storeName: string
  legalName: string
  idType: IdType
  id: string
  phone: string
  email: string
  activityCode: string
  province: string
  canton: string
  district: string
  address: string
}

export interface ReceiptItemLine {
  name: string
  quantity: number
  unitPrice: number
  catalogUnitPrice?: number | null
  discount: number
  lineTotal: number
}

export interface ReceiptPaymentLine {
  method: PaymentMethod
  amount: number
  ref: string | null
}

export interface ReceiptArgs {
  emisor: EmisorInfo
  consecutivo: string
  saleId: number
  createdAt: string
  cashier: string
  items: ReceiptItemLine[]
  subtotal: number
  discountTotal: number
  total: number
  payments: ReceiptPaymentLine[]
  tendered: number | null
  change: number | null
  customer: SaleCustomer | null
  footer: string
  /** Provided only under régimen tradicional; omitted/empty under simplificado. */
  taxBreakdown?: TaxBreakdownRow[]
}

/** Sample catalog for printer diagnostics — same line layout as live sales. */
const PRINTER_TEST_RECEIPT_CATALOG: readonly {
  name: string
  price: number
  qty?: number
  discount?: number
}[] = [
  { name: 'ARROZ EXTRA 1KG', price: 1450, qty: 2 },
  { name: 'FRIJOLES NEGROS 800G', price: 980 },
  { name: 'ATUN EN AGUA 170G', price: 1250, qty: 3 },
  { name: 'LECHE ENTERA 1L', price: 890, qty: 2 },
  { name: 'HUEVOS DOCENA', price: 3200 },
  { name: 'PAN BLANCO BOLSA', price: 1750 },
  { name: 'QUESO TURRIALBA 500G', price: 2890 },
  { name: 'JAMON COCIDO 200G', price: 1650 },
  { name: 'TOMATE KG', price: 1200, qty: 2 },
  { name: 'CEBOLLA KG', price: 980 },
  { name: 'PAPA KG', price: 850, qty: 3 },
  { name: 'ZANAHORIA KG', price: 720 },
  { name: 'PLATANO MADURO', price: 650, qty: 4 },
  { name: 'MANZANA ROJA KG', price: 2100 },
  { name: 'NARANJA KG', price: 890, qty: 2 },
  { name: 'COCA COLA 2L', price: 2450 },
  { name: 'JUGO NARANJA 1L', price: 1350, qty: 2 },
  { name: 'AGUA PURA 600ML', price: 450, qty: 6 },
  { name: 'GALLETAS MARIA 200G', price: 780 },
  { name: 'CHOCOLATE TALCA 100G', price: 920, qty: 2 },
  { name: 'DETERGENTE LIQUIDO 1L', price: 3200 },
  { name: 'PAPEL HIGIENICO 4 ROLLOS', price: 1890 },
  { name: 'JABON DE TOCADOR', price: 650, qty: 3 },
  { name: 'SHAMPOO 400ML', price: 2750 },
  { name: 'CREMA DENTAL 100G', price: 1450 },
  { name: 'BATERIAS AA 4PK', price: 2100 },
  { name: 'LIMPIADOR MULTIUSO', price: 1680 },
  { name: 'BOLSA REUTILIZABLE', price: 350, qty: 2, discount: 100 }
]

function receiptItemsFromCatalog(
  catalog: readonly { name: string; price: number; qty?: number; discount?: number }[]
): ReceiptItemLine[] {
  return catalog.map((row) => {
    const qty = row.qty ?? 1
    const discount = row.discount ?? 0
    const gross = row.price * qty
    return {
      name: row.name,
      quantity: qty,
      unitPrice: row.price,
      discount,
      lineTotal: gross - discount
    }
  })
}

/** Multi-item diagnostic tiquete — identical template to checkout receipts. */
export function buildPrinterTestReceiptLines(
  emisor: EmisorInfo,
  lang: Language,
  footer: string
): PrintLine[] {
  const items = receiptItemsFromCatalog(PRINTER_TEST_RECEIPT_CATALOG)
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
  const discountTotal = items.reduce((acc, i) => acc + i.discount, 0)
  const total = subtotal - discountTotal
  const tendered = Math.ceil(total / 1000) * 1000
  const change = tendered - total

  return buildReceiptLines(
    {
      emisor,
      consecutivo: '0000000000',
      saleId: 0,
      createdAt: localNow(),
      cashier: 'PRUEBA',
      items,
      subtotal,
      discountTotal,
      total,
      payments: [{ method: 'cash', amount: total, ref: null }],
      tendered,
      change,
      customer: null,
      footer
    },
    lang
  )
}

const methodLabel = (lang: Language, m: PaymentMethod): string => t(lang, `pos.methods.${m}`)
const idTypeLabel = (lang: Language, idt: IdType): string => t(lang, `idTypes.${idt}`)

function emisorLines(emisor: EmisorInfo, lang: Language): PrintLine[] {
  const lines: PrintLine[] = [
    { t: 'text', v: emisor.storeName, align: 'ct', bold: true, big: true }
  ]
  if (emisor.legalName && emisor.legalName !== emisor.storeName) {
    lines.push({ t: 'text', v: emisor.legalName, align: 'ct' })
  }
  if (emisor.id) {
    lines.push({ t: 'text', v: `${idTypeLabel(lang, emisor.idType)}: ${emisor.id}`, align: 'ct' })
  }
  const location = [emisor.province, emisor.canton, emisor.district].filter(Boolean).join(', ')
  if (location) lines.push({ t: 'text', v: location, align: 'ct' })
  if (emisor.address) lines.push({ t: 'text', v: emisor.address, align: 'ct' })
  if (emisor.phone) {
    lines.push({ t: 'text', v: `${t(lang, 'print.receipt.phone')}: ${emisor.phone}`, align: 'ct' })
  }
  if (emisor.email) lines.push({ t: 'text', v: emisor.email, align: 'ct' })
  if (emisor.activityCode) {
    lines.push({
      t: 'text',
      v: `${t(lang, 'print.receipt.activity')}: ${emisor.activityCode}`,
      align: 'ct'
    })
  }
  return lines
}

function customerLines(customer: SaleCustomer, lang: Language): PrintLine[] {
  const lines: PrintLine[] = [{ t: 'text', v: t(lang, 'print.receipt.customer'), bold: true }]
  lines.push({ t: 'text', v: customer.name || t(lang, 'print.receipt.finalConsumer') })
  if (customer.id) {
    const label = customer.idType ? idTypeLabel(lang, customer.idType) : t(lang, 'print.receipt.id')
    lines.push({ t: 'row', l: label, r: customer.id })
  }
  if (customer.phone) lines.push({ t: 'row', l: t(lang, 'print.receipt.phone'), r: customer.phone })
  if (customer.email) lines.push({ t: 'text', v: customer.email })
  if (customer.activityCode) {
    lines.push({ t: 'row', l: t(lang, 'print.receipt.activity'), r: customer.activityCode })
  }
  return lines
}

function hasCustomerData(c: SaleCustomer | null): boolean {
  return !!c && !!(c.name || c.id || c.phone || c.email || c.activityCode)
}

export function buildReceiptLines(args: ReceiptArgs, lang: Language): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  const lines: PrintLine[] = [...emisorLines(args.emisor, lang), { t: 'feed', n: 1 }]

  lines.push({ t: 'text', v: t(lang, 'print.receipt.docTitle'), align: 'ct', bold: true })
  lines.push({ t: 'row', l: t(lang, 'print.receipt.consecutivo'), r: args.consecutivo })
  lines.push({ t: 'row', l: t(lang, 'print.receipt.saleId'), r: `#${args.saleId}` })
  lines.push({ t: 'row', l: t(lang, 'common.date'), r: formatDate(args.createdAt, lang, true) })
  lines.push({ t: 'row', l: t(lang, 'print.receipt.cashier'), r: args.cashier })
  lines.push({ t: 'hr' })

  for (const item of args.items) {
    lines.push({ t: 'text', v: item.name, bold: true })
    lines.push({
      t: 'row',
      l: `  ${item.quantity} x ${money(item.unitPrice)}`,
      r: money(item.unitPrice * item.quantity)
    })
    if (
      item.catalogUnitPrice != null &&
      Math.abs(item.catalogUnitPrice - item.unitPrice) >= 0.01
    ) {
      lines.push({
        t: 'row',
        l: `  ${t(lang, 'print.receipt.catalogPrice')}`,
        r: money(item.catalogUnitPrice)
      })
      lines.push({
        t: 'row',
        l: `  ${t(lang, 'print.receipt.priceOverride')}`,
        r: money(item.unitPrice)
      })
    }
    if (item.discount > 0) {
      lines.push({ t: 'row', l: `  ${t(lang, 'print.receipt.discount')}`, r: `-${money(item.discount)}` })
      lines.push({ t: 'row', l: '', r: money(item.lineTotal) })
    }
  }
  lines.push({ t: 'hr' })
  lines.push({ t: 'row', l: t(lang, 'print.receipt.subtotal'), r: money(args.subtotal) })
  if (args.discountTotal > 0) {
    lines.push({ t: 'row', l: t(lang, 'print.receipt.discountTotal'), r: `-${money(args.discountTotal)}` })
  }

  // Régimen tradicional: show IVA breakdown reverse-calculated from the inclusive total.
  if (args.taxBreakdown && args.taxBreakdown.length > 0) {
    lines.push({ t: 'row', l: t(lang, 'print.receipt.taxBase'), r: money(taxSum(args.taxBreakdown, 'base')) })
    for (const row of args.taxBreakdown) {
      if (row.iva <= 0) continue
      lines.push({
        t: 'row',
        l: `${t(lang, 'print.receipt.iva')} ${Math.round(row.rate * 100)}%`,
        r: money(row.iva)
      })
    }
  }

  lines.push({ t: 'hr' })
  lines.push({
    t: 'row',
    l: t(lang, 'print.receipt.total'),
    r: money(args.total),
    bold: true,
    big: true
  })
  lines.push({ t: 'feed', n: 1 })

  // Payment breakdown (supports split payments).
  for (const pay of args.payments) {
    const label = pay.ref
      ? `${methodLabel(lang, pay.method)} (${pay.ref})`
      : methodLabel(lang, pay.method)
    lines.push({ t: 'row', l: label, r: money(pay.amount) })
  }
  if (args.tendered != null && args.change != null) {
    lines.push({ t: 'row', l: t(lang, 'print.receipt.tendered'), r: money(args.tendered) })
    lines.push({ t: 'row', l: t(lang, 'print.receipt.change'), r: money(args.change) })
  }

  if (hasCustomerData(args.customer)) {
    lines.push({ t: 'hr' })
    lines.push(...customerLines(args.customer as SaleCustomer, lang))
  }

  lines.push({ t: 'feed', n: 1 })
  lines.push({ t: 'text', v: t(lang, 'print.receipt.thanks'), align: 'ct' })
  if (args.footer) {
    for (const fl of args.footer.split('\n')) {
      lines.push({ t: 'text', v: fl, align: 'ct' })
    }
  }
  return lines
}

function taxSum(rows: TaxBreakdownRow[], field: 'base' | 'iva' | 'gross'): number {
  return rows.reduce((acc, r) => acc + r[field], 0)
}

function reportHeader(title: string, rangeLabel: string, lang: Language, storeName: string): PrintLine[] {
  return [
    { t: 'text', v: storeName, align: 'ct', bold: true, big: true },
    { t: 'text', v: title, align: 'ct', bold: true },
    { t: 'feed', n: 1 },
    { t: 'row', l: t(lang, 'print.report.range'), r: rangeLabel },
    { t: 'row', l: t(lang, 'print.report.generated'), r: formatDate(localNow(), lang, true) },
    { t: 'hr' }
  ]
}

function paymentLines(lang: Language, totals: PaymentMethodReport): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  return [
    { t: 'text', v: t(lang, 'print.report.byPayment'), bold: true },
    { t: 'row', l: `${methodLabel(lang, 'cash')} (${totals.countCash})`, r: money(totals.cash) },
    { t: 'row', l: `${methodLabel(lang, 'card')} (${totals.countCard})`, r: money(totals.card) },
    { t: 'row', l: `${methodLabel(lang, 'sinpe')} (${totals.countSinpe})`, r: money(totals.sinpe) },
    { t: 'row', l: t(lang, 'common.total'), r: money(totals.total), bold: true }
  ]
}

function topProductLines(lang: Language, rows: TopProductRow[]): PrintLine[] {
  const lines: PrintLine[] = [{ t: 'text', v: t(lang, 'print.report.topProducts'), bold: true }]
  if (rows.length === 0) {
    lines.push({ t: 'text', v: t(lang, 'common.noData') })
  }
  for (const row of rows) {
    const profit =
      row.marginPct != null
        ? ` · ${t(lang, 'reports.top.profit')} ${formatMoney(row.profit, lang)} (${row.marginPct}%)`
        : ''
    lines.push({
      t: 'row',
      l: `${row.name} x${row.quantity}`,
      r: `${formatMoney(row.revenue, lang)}${profit}`
    })
  }
  return lines
}

function summaryMetricLines(lang: Language, data: SalesSummaryReport): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  return [
    { t: 'row', l: t(lang, 'print.report.revenue'), r: money(data.totalRevenue), bold: true },
    { t: 'row', l: t(lang, 'print.report.totalDiscount'), r: `-${money(data.totalDiscount)}` },
    { t: 'row', l: t(lang, 'print.report.transactions'), r: String(data.txCount) },
    { t: 'row', l: t(lang, 'print.report.itemsSold'), r: String(data.itemsSold) },
    { t: 'row', l: t(lang, 'print.report.returns'), r: String(data.returnsCount) },
    { t: 'row', l: t(lang, 'print.report.avgTicket'), r: money(data.avgTicket) },
    { t: 'row', l: t(lang, 'reports.summary.grossProfit'), r: money(data.grossProfit) },
    { t: 'hr' },
    { t: 'text', v: t(lang, 'print.cierre.cashTitle'), bold: true },
    { t: 'row', l: t(lang, 'cash.openingFloat'), r: money(data.cash.openingFloat) },
    { t: 'row', l: t(lang, 'cash.cashSales'), r: money(data.cash.cashSales) },
    { t: 'row', l: t(lang, 'cash.cashIn'), r: money(data.cash.cashIn) },
    { t: 'row', l: t(lang, 'cash.cashOut'), r: `-${money(data.cash.cashOut)}` }
  ]
}

export function buildSummaryReportLines(
  data: SalesSummaryReport,
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  return [
    ...reportHeader(t(lang, 'reports.types.summary'), rangeLabel, lang, storeName),
    ...summaryMetricLines(lang, data)
  ]
}

export function buildMultiDaySummaryReportLines(
  days: { date: string; data: SalesSummaryReport }[],
  total: SalesSummaryReport,
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  const lines = reportHeader(t(lang, 'reports.types.summary'), rangeLabel, lang, storeName)
  for (const day of days) {
    lines.push({ t: 'hr' })
    lines.push({
      t: 'text',
      v: t(lang, 'print.report.daySection', { date: formatDate(day.date, lang) }),
      bold: true
    })
    lines.push(...summaryMetricLines(lang, day.data))
  }
  lines.push({ t: 'hr' })
  lines.push({ t: 'text', v: t(lang, 'print.report.periodTotal'), bold: true, big: true })
  lines.push(...summaryMetricLines(lang, total))
  return lines
}

export function buildMultiDayPaymentReportLines(
  days: { date: string; data: PaymentMethodReport }[],
  total: PaymentMethodReport,
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  const lines = reportHeader(t(lang, 'reports.types.byPayment'), rangeLabel, lang, storeName)
  for (const day of days) {
    lines.push({ t: 'hr' })
    lines.push({
      t: 'text',
      v: t(lang, 'print.report.daySection', { date: formatDate(day.date, lang) }),
      bold: true
    })
    lines.push(...paymentLines(lang, day.data))
  }
  lines.push({ t: 'hr' })
  lines.push({ t: 'text', v: t(lang, 'print.report.periodTotal'), bold: true, big: true })
  lines.push(...paymentLines(lang, total))
  return lines
}

export function buildPaymentReportLines(
  data: PaymentMethodReport,
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  return [
    ...reportHeader(t(lang, 'reports.types.byPayment'), rangeLabel, lang, storeName),
    ...paymentLines(lang, data)
  ]
}

export function buildTopProductsReportLines(
  data: TopProductRow[],
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  return [
    ...reportHeader(t(lang, 'reports.types.topProducts'), rangeLabel, lang, storeName),
    ...topProductLines(lang, data)
  ]
}

export function buildInventoryReportLines(
  data: InventoryRow[],
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  const lines = reportHeader(t(lang, 'reports.types.inventory'), rangeLabel, lang, storeName)
  const totalValue = data.reduce((acc, r) => acc + r.value, 0)
  lines.push({ t: 'row', l: t(lang, 'print.report.inventoryCount'), r: String(data.length) })
  lines.push({ t: 'row', l: t(lang, 'print.report.inventoryValue'), r: money(totalValue), bold: true })
  lines.push({ t: 'hr' })
  for (const row of data) {
    lines.push({ t: 'row', l: row.name, r: `${row.stock}` })
  }
  return lines
}

export interface CierreCashArgs {
  openingFloat: number
  cashIn: number
  cashOut: number
  cashSales: number
  expectedCash: number
  countedCash: number | null
  difference: number | null
}

export interface CierrePrintArgs {
  rangeLabel: string
  shiftLabel: string
  closedBy: string
  totals: PaymentMethodReport
  txCount: number
  returnsCount: number
  topProducts: TopProductRow[]
  discounts: CierreDiscountReport
  priceOverrides: CierrePriceOverrideReport
  discardedTabs: CierreDiscardedTabsReport
  storeName: string
  cash: CierreCashArgs
}

function cierreCashLines(lang: Language, cash: CierreCashArgs): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  const lines: PrintLine[] = [
    { t: 'text', v: t(lang, 'print.cierre.cashTitle'), bold: true },
    { t: 'row', l: t(lang, 'cash.openingFloat'), r: money(cash.openingFloat) },
    { t: 'row', l: t(lang, 'cash.cashSales'), r: money(cash.cashSales) },
    { t: 'row', l: t(lang, 'cash.cashIn'), r: money(cash.cashIn) },
    { t: 'row', l: t(lang, 'cash.cashOut'), r: `-${money(cash.cashOut)}` },
    { t: 'row', l: t(lang, 'cash.expectedCash'), r: money(cash.expectedCash), bold: true }
  ]
  if (cash.countedCash != null) {
    lines.push({ t: 'row', l: t(lang, 'cash.countedCash'), r: money(cash.countedCash) })
    lines.push({
      t: 'row',
      l: t(lang, 'cash.difference'),
      r: money(cash.difference ?? 0),
      bold: true
    })
  }
  return lines
}

function cierreDiscountLines(lang: Language, discounts: CierreDiscountReport): PrintLine[] {
  if (discounts.sales.length === 0) return []
  const money = (n: number): string => formatMoney(n, lang)
  const lines: PrintLine[] = [
    { t: 'hr' },
    { t: 'text', v: t(lang, 'print.cierre.discountsTitle'), bold: true },
    {
      t: 'row',
      l: t(lang, 'print.cierre.discountTotal'),
      r: `-${money(discounts.totalDiscount)}`,
      bold: true
    },
    {
      t: 'row',
      l: t(lang, 'print.cierre.cartDiscountTotal'),
      r: `-${money(discounts.totalCartDiscount)}`
    },
    {
      t: 'row',
      l: t(lang, 'print.cierre.lineDiscountTotal'),
      r: `-${money(discounts.totalLineDiscount)}`
    }
  ]
  for (const sale of discounts.sales) {
    const saleRef = sale.consecutivo ?? `#${sale.saleId}`
    lines.push({ t: 'hr' })
    lines.push({ t: 'text', v: saleRef, bold: true })
    if (sale.cartDiscount > 0) {
      lines.push({
        t: 'row',
        l: t(lang, 'print.cierre.cartDiscount'),
        r: `-${money(sale.cartDiscount)}`
      })
    }
    for (const item of sale.items) {
      lines.push({
        t: 'row',
        l: `  ${item.productName} x${item.quantity}`,
        r: `-${money(item.lineDiscount)}`
      })
    }
    lines.push({
      t: 'row',
      l: t(lang, 'print.cierre.saleDiscountTotal'),
      r: `-${money(sale.discountTotal)}`
    })
  }
  return lines
}

function cierrePriceOverrideLines(
  lang: Language,
  priceOverrides: CierrePriceOverrideReport
): PrintLine[] {
  if (priceOverrides.sales.length === 0) return []
  const money = (n: number): string => formatMoney(n, lang)
  const lines: PrintLine[] = [
    { t: 'hr' },
    { t: 'text', v: t(lang, 'print.cierre.priceOverridesTitle'), bold: true },
    {
      t: 'row',
      l: t(lang, 'print.cierre.priceOverrideTotal'),
      r: money(priceOverrides.totalVariance),
      bold: true
    }
  ]
  for (const sale of priceOverrides.sales) {
    lines.push({
      t: 'row',
      l: sale.consecutivo ?? `#${sale.saleId}`,
      r: formatDate(sale.createdAt, lang, true)
    })
    lines.push({ t: 'text', v: `  ${sale.cashier}` })
    for (const item of sale.items) {
      lines.push({
        t: 'row',
        l: `  ${item.productName} x${item.quantity}`,
        r: `${money(item.catalogUnitPrice)}→${money(item.unitPrice)}`
      })
      lines.push({
        t: 'row',
        l: `  ${t(lang, 'print.cierre.priceOverrideVariance')}`,
        r: money(item.lineVariance)
      })
    }
  }
  return lines
}

function cierreDiscardedTabLines(
  lang: Language,
  discardedTabs: CierreDiscardedTabsReport
): PrintLine[] {
  if (discardedTabs.rows.length === 0) return []
  const money = (n: number): string => formatMoney(n, lang)
  const lines: PrintLine[] = [
    { t: 'hr' },
    { t: 'text', v: t(lang, 'print.cierre.discardedTabsTitle'), bold: true },
    {
      t: 'row',
      l: t(lang, 'print.cierre.discardedTabsTotal'),
      r: money(discardedTabs.totalDiscarded),
      bold: true
    }
  ]
  for (const row of discardedTabs.rows) {
    const label = row.label.trim() || t(lang, 'print.cierre.discardedTabUnnamed')
    const auth =
      row.authType === 'caja'
        ? t(lang, 'print.cierre.discardedTabAuthCaja')
        : t(lang, 'print.cierre.discardedTabAuthManager')
    lines.push({
      t: 'row',
      l: label,
      r: money(row.total)
    })
    lines.push({
      t: 'text',
      v: `  ${row.cashier} · ${auth} · ${formatDate(row.createdAt, lang, true)}`
    })
  }
  return lines
}

export function buildCierreLines(args: CierrePrintArgs, lang: Language): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  return [
    ...reportHeader(t(lang, 'print.cierre.title'), args.rangeLabel, lang, args.storeName),
    { t: 'row', l: t(lang, 'print.cierre.shift'), r: args.shiftLabel },
    { t: 'row', l: t(lang, 'print.cierre.closedBy'), r: args.closedBy },
    { t: 'row', l: t(lang, 'print.report.transactions'), r: String(args.txCount) },
    { t: 'row', l: t(lang, 'print.report.returns'), r: String(args.returnsCount) },
    { t: 'hr' },
    ...paymentLines(lang, args.totals),
    ...cierreDiscountLines(lang, args.discounts),
    ...cierrePriceOverrideLines(lang, args.priceOverrides),
    ...cierreDiscardedTabLines(lang, args.discardedTabs),
    { t: 'hr' },
    ...cierreCashLines(lang, args.cash),
    { t: 'hr' },
    { t: 'text', v: t(lang, 'common.total'), align: 'ct' },
    { t: 'text', v: money(args.totals.total), align: 'ct', bold: true, big: true },
    { t: 'feed', n: 1 },
    ...topProductLines(lang, args.topProducts)
  ]
}

export function buildTaxReportLines(
  rows: TaxBreakdownRow[],
  regime: TaxRegime,
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  const lines = reportHeader(t(lang, 'reports.types.taxBreakdown'), rangeLabel, lang, storeName)
  lines.push({ t: 'row', l: t(lang, 'reports.tax.regime'), r: t(lang, `tax.regime.${regime}`) })
  lines.push({ t: 'hr' })
  if (rows.length === 0) {
    lines.push({ t: 'text', v: t(lang, 'common.noData') })
    return lines
  }
  for (const row of rows) {
    lines.push({ t: 'text', v: `${t(lang, `tax.categories.${row.taxCategory}`)} (${Math.round(row.rate * 100)}%)`, bold: true })
    lines.push({ t: 'row', l: t(lang, 'reports.tax.gross'), r: money(row.gross) })
    lines.push({ t: 'row', l: t(lang, 'reports.tax.base'), r: money(row.base) })
    lines.push({ t: 'row', l: t(lang, 'reports.tax.iva'), r: money(row.iva) })
  }
  lines.push({ t: 'hr' })
  lines.push({ t: 'row', l: t(lang, 'reports.tax.totalBase'), r: money(taxSum(rows, 'base')), bold: true })
  lines.push({ t: 'row', l: t(lang, 'reports.tax.totalIva'), r: money(taxSum(rows, 'iva')), bold: true })
  lines.push({ t: 'row', l: t(lang, 'reports.tax.totalGross'), r: money(taxSum(rows, 'gross')), bold: true })
  return lines
}

function salePaymentSummaryLines(
  lang: Language,
  payments: SalePaymentSnapshot[]
): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  if (payments.length === 0) return [{ t: 'text', v: '—' }]
  return payments.map((pay) => {
    const label =
      pay.method === 'sinpe' && pay.ref
        ? `${methodLabel(lang, pay.method)} (${pay.ref})`
        : methodLabel(lang, pay.method)
    return { t: 'row', l: label, r: money(pay.amount) }
  })
}

export function buildTransactionLogReportLines(
  data: TransactionLogReport,
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  const lines = reportHeader(t(lang, 'reports.types.transactionLog'), rangeLabel, lang, storeName)
  lines.push({
    t: 'row',
    l: t(lang, 'print.report.transactions'),
    r: String(data.txCount),
    bold: true
  })
  lines.push({
    t: 'row',
    l: t(lang, 'print.report.revenue'),
    r: money(data.totalRevenue),
    bold: true
  })
  lines.push({ t: 'hr' })

  if (data.rows.length === 0) {
    lines.push({ t: 'text', v: t(lang, 'common.noData') })
    return lines
  }

  for (const row of data.rows) {
    const label = row.consecutivo ?? `#${row.saleId}`
    lines.push({
      t: 'row',
      l: label,
      r: formatDate(row.createdAt, lang, true)
    })
    lines.push({ t: 'text', v: `${row.cashier}${row.customerName ? ` · ${row.customerName}` : ''}` })
    lines.push(...salePaymentSummaryLines(lang, row.payments))
    if (row.discountTotal > 0) {
      lines.push({
        t: 'row',
        l: t(lang, 'print.receipt.discountTotal'),
        r: `-${money(row.discountTotal)}`
      })
    }
    lines.push({ t: 'row', l: t(lang, 'common.total'), r: money(row.total), bold: true })
    lines.push({ t: 'feed', n: 1 })
  }
  return lines
}

export function buildItemizedSalesReportLines(
  data: ItemizedSalesReport,
  rangeLabel: string,
  lang: Language,
  storeName: string
): PrintLine[] {
  const money = (n: number): string => formatMoney(n, lang)
  const lines = reportHeader(t(lang, 'reports.types.itemizedSales'), rangeLabel, lang, storeName)
  lines.push({
    t: 'row',
    l: t(lang, 'print.report.transactions'),
    r: String(data.sales.length),
    bold: true
  })
  lines.push({
    t: 'row',
    l: t(lang, 'print.report.itemsSold'),
    r: String(data.itemsSold),
    bold: true
  })
  lines.push({
    t: 'row',
    l: t(lang, 'print.report.revenue'),
    r: money(data.totalRevenue),
    bold: true
  })
  lines.push({ t: 'hr' })

  if (data.sales.length === 0) {
    lines.push({ t: 'text', v: t(lang, 'common.noData') })
    return lines
  }

  for (const sale of data.sales) {
    const label = sale.consecutivo ?? `#${sale.saleId}`
    lines.push({
      t: 'row',
      l: label,
      r: formatDate(sale.createdAt, lang, true)
    })
    lines.push({
      t: 'text',
      v: `${sale.cashier}${sale.customerName ? ` · ${sale.customerName}` : ''}`
    })
    lines.push(...salePaymentSummaryLines(lang, sale.payments))
    if (sale.cartDiscount > 0) {
      lines.push({
        t: 'row',
        l: t(lang, 'print.cierre.cartDiscount'),
        r: `-${money(sale.cartDiscount)}`
      })
    }
    for (const item of sale.items) {
      const barcode = item.barcode ? ` [${item.barcode}]` : ''
      lines.push({
        t: 'row',
        l: `${item.productName}${barcode} x${item.quantity}`,
        r: money(item.lineTotal)
      })
      if (item.lineDiscount > 0) {
        lines.push({
          t: 'row',
          l: `  ${t(lang, 'print.receipt.discount')}`,
          r: `-${money(item.lineDiscount)}`
        })
      }
    }
    lines.push({ t: 'row', l: t(lang, 'common.total'), r: money(sale.total), bold: true })
    lines.push({ t: 'hr' })
  }
  return lines
}

const PRODUCT_BARCODE_HEIGHT = 100
const PRODUCT_BARCODE_WIDTH = 3

/** Product sticker: large scannable CODE128 with digits below (standard retail style). */
export function buildProductBarcodeLabelLines(args: { barcode: string }, _lang: Language): PrintLine[] {
  const barcode = args.barcode.trim()
  return [
    {
      t: 'barcode',
      v: barcode,
      h: PRODUCT_BARCODE_HEIGHT,
      w: PRODUCT_BARCODE_WIDTH,
      align: 'ct',
      hri: true
    }
  ]
}

const PIN_CARD_BARCODE_HEIGHT = 72
const PIN_CARD_BARCODE_WIDTH = 3

/** Scannable PIN card: manager PIN under admin label, caja PIN under username. */
export function buildPinCardLines(args: {
  storeName: string
  adminLabel: string
  managerPin: string
  username: string
  cajaPin: string
  scanHint: string
}): PrintLine[] {
  return [
    { t: 'text', v: args.storeName.trim(), align: 'ct', bold: true, big: true },
    { t: 'feed', n: 1 },
    { t: 'text', v: args.adminLabel, align: 'ct', bold: true, big: true },
    {
      t: 'barcode',
      v: args.managerPin,
      h: PIN_CARD_BARCODE_HEIGHT,
      w: PIN_CARD_BARCODE_WIDTH,
      align: 'ct'
    },
    { t: 'feed', n: 2 },
    { t: 'hr' },
    { t: 'feed', n: 1 },
    { t: 'text', v: args.username.trim().toUpperCase(), align: 'ct', bold: true, big: true },
    {
      t: 'barcode',
      v: args.cajaPin,
      h: PIN_CARD_BARCODE_HEIGHT,
      w: PIN_CARD_BARCODE_WIDTH,
      align: 'ct'
    },
    { t: 'feed', n: 1 },
    { t: 'text', v: args.scanHint, align: 'ct' }
  ]
}
