import { AppError } from '../../errors'
import { buildReceiptLines, emisorFromSettings } from '../../services/printTemplates'
import type { ReceiptPaymentLine } from '../../services/printTemplates'
import { attemptPrintJob, probePrinter } from '../../services/printer'
import { getDb } from '../index'
import { insertPrintJob } from './printJobs'
import { getAppSettings, receiptLanguage } from './settings'
import type { IdType, PaymentMethod, PrintStatus, SaleReprintRow } from '../../../shared/types'

interface SaleReceiptRow {
  id: number
  consecutivo: string | null
  created_at: string
  subtotal: number
  discount_total: number
  total: number
  cashier: string
  customer_name: string | null
  customer_id_type: IdType | null
  customer_id: string | null
  customer_phone: string | null
  customer_email: string | null
  customer_activity_code: string | null
}

interface ItemReceiptRow {
  name: string
  quantity: number
  unitPrice: number
  catalogUnitPrice: number | null
  discount: number
  lineTotal: number
}

interface PaymentReceiptRow {
  method: PaymentMethod
  amount: number
  ref: string | null
}

/** Sales not yet assigned to a closed cierre (current open shift). */
export function listPendingCierreSalesForReprint(): SaleReprintRow[] {
  return getDb()
    .prepare(
      `SELECT s.id AS saleId, s.consecutivo, s.total, s.created_at AS createdAt, u.username AS cashier
       FROM sales s
       JOIN users u ON u.id = s.user_id
       WHERE s.cierre_id IS NULL
       ORDER BY s.id DESC
       LIMIT 100`
    )
    .all() as SaleReprintRow[]
}

function loadPendingCierreSaleForReceipt(saleId: number): {
  sale: SaleReceiptRow
  items: ItemReceiptRow[]
  payments: PaymentReceiptRow[]
} {
  const sale = getDb()
    .prepare(
      `SELECT s.id, s.consecutivo, s.created_at, s.subtotal, s.discount_total, s.total,
              u.username AS cashier,
              s.customer_name, s.customer_id_type, s.customer_id, s.customer_phone,
              s.customer_email, s.customer_activity_code
       FROM sales s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.cierre_id IS NULL`
    )
    .get(saleId) as SaleReceiptRow | undefined
  if (!sale) throw new AppError('errors.saleNotFound')

  const items = getDb()
    .prepare(
      `SELECT COALESCE(si.product_name_snapshot, p.name) AS name,
              si.quantity AS quantity,
              si.unit_price AS unitPrice,
              si.catalog_unit_price AS catalogUnitPrice,
              si.discount AS discount,
              si.line_total AS lineTotal
       FROM sale_items si
       LEFT JOIN products p ON p.id = si.product_id
       WHERE si.sale_id = ?
       ORDER BY si.id ASC`
    )
    .all(saleId) as ItemReceiptRow[]

  const payments = getDb()
    .prepare('SELECT method, amount, ref FROM sale_payments WHERE sale_id = ? ORDER BY id ASC')
    .all(saleId) as PaymentReceiptRow[]

  return { sale, items, payments }
}

export async function reprintSaleReceipt(
  saleId: number
): Promise<{ printJobId: number; printStatus: PrintStatus }> {
  const { sale, items, payments } = loadPendingCierreSaleForReceipt(saleId)
  const settings = getAppSettings()
  const lang = receiptLanguage()

  const receiptLines = buildReceiptLines(
    {
      emisor: emisorFromSettings(settings),
      consecutivo: sale.consecutivo ?? `#${sale.id}`,
      saleId: sale.id,
      createdAt: sale.created_at,
      cashier: sale.cashier,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        catalogUnitPrice: item.catalogUnitPrice,
        discount: item.discount,
        lineTotal: item.lineTotal
      })),
      subtotal: sale.subtotal,
      discountTotal: sale.discount_total,
      total: sale.total,
      payments: payments.map(
        (p): ReceiptPaymentLine => ({
          method: p.method,
          amount: p.amount,
          ref: p.ref
        })
      ),
      tendered: null,
      change: null,
      customer: {
        name: sale.customer_name,
        idType: sale.customer_id_type,
        id: sale.customer_id,
        phone: sale.customer_phone,
        email: sale.customer_email,
        activityCode: sale.customer_activity_code
      },
      footer: settings.receiptFooter
    },
    lang
  )

  const printJobId = insertPrintJob('receipt', saleId, { lang, lines: receiptLines })
  await probePrinter()
  const printStatus = await attemptPrintJob(printJobId)
  return { printJobId, printStatus }
}
