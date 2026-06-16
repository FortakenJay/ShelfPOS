import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow, round2 } from '../db/helpers'
import { alertsForProducts, getProduct } from '../db/repos/products'
import { hasOpeningFloat } from '../db/repos/cash'
import { assertSaleStock } from '../db/repos/stock'
import { insertPrintJob } from '../db/repos/printJobs'
import { getAppSettings, receiptLanguage, getSetting, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import { schedulePrintJob } from '../services/printer'
import { buildReceiptLines, emisorFromSettings } from '../services/printTemplates'
import type { ReceiptPaymentLine } from '../services/printTemplates'
import type {
  CreateSaleInput,
  CreateSaleResult,
  IdType,
  PaymentMethod,
  Product,
  SaleCustomer,
  SaleDetail,
  SaleItemDetail,
  SalePaymentDetail,
  TaxCategory
} from '../../shared/types'

const SELL: 'sales'[] = ['sales']
const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']
const PAYMENT_METHODS = new Set<PaymentMethod>(['cash', 'card', 'sinpe'])

/** Effective unit price: bulk price when the line qualifies for the bulk tier. */
function effectiveUnitPrice(product: Product, quantity: number): number {
  if (product.bulk_qty != null && product.bulk_price != null && quantity >= product.bulk_qty) {
    return product.bulk_price
  }
  return product.price
}

/** Builds the next consecutivo (CR structure: sucursal 3 + caja 5 + tipoDoc 2 + secuencia 10). */
function nextConsecutivo(): string {
  const branch = (getSetting(SETTING_KEYS.branchCode) ?? '001').padStart(3, '0').slice(-3)
  const terminal = (getSetting(SETTING_KEYS.terminalCode) ?? '00001').padStart(5, '0').slice(-5)
  const seq = Number(getSetting(SETTING_KEYS.consecutivoNext) ?? '1')
  setSetting(SETTING_KEYS.consecutivoNext, String(seq + 1))
  const tipoDoc = '04' // tiquete
  return `${branch}${terminal}${tipoDoc}${String(seq).padStart(10, '0')}`
}

function cleanText(v: string | undefined): string | null {
  const t = v?.trim()
  return t ? t : null
}

export function registerSalesHandlers(): void {
  handle<CreateSaleInput, CreateSaleResult>('sales:create', SELL, async (input) => {
    const user = session.require()
    if (!hasOpeningFloat()) throw new AppError('errors.cashNotOpened')
    if (!input?.items?.length) throw new AppError('errors.invalidInput')
    if (!input?.payments?.length) throw new AppError('errors.invalidInput')
    for (const item of input.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new AppError('errors.invalidInput')
      }
      if (item.discount != null && (!Number.isFinite(item.discount) || item.discount < 0)) {
        throw new AppError('errors.invalidInput')
      }
    }
    for (const pay of input.payments) {
      if (!PAYMENT_METHODS.has(pay.method)) throw new AppError('errors.invalidInput')
      if (!Number.isFinite(pay.amount) || pay.amount <= 0) throw new AppError('errors.invalidInput')
    }
    const condition = 'contado' as const

    const hasDiscount =
      (input.cartDiscount ?? 0) > 0 || input.items.some((item) => (item.discount ?? 0) > 0)
    if (hasDiscount) {
      if (!input.discountPin?.trim()) throw new AppError('errors.discountPinRequired')
      await session.verifyDiscountPin(input.discountPin.trim())
    }

    const db = getDb()
    const settings = getAppSettings()
    const lang = receiptLanguage()
    const now = localNow()

    const result = db.transaction((): Omit<CreateSaleResult, 'printStatus'> => {
      // 1. Price each line (bulk tier) and apply the explicit per-line discount.
      const lines = input.items.map((item) => {
        const product = getProduct(item.productId)
        if (!product) throw new AppError('errors.productNotFound')
        assertSaleStock(product, item.quantity)
        const unitPrice = effectiveUnitPrice(product, item.quantity)
        const gross = round2(unitPrice * item.quantity)
        const lineDiscount = round2(Math.min(item.discount ?? 0, gross))
        return {
          product,
          quantity: item.quantity,
          unitPrice,
          gross,
          lineDiscount,
          afterLineDiscount: round2(gross - lineDiscount)
        }
      })

      const subtotal = round2(lines.reduce((acc, l) => acc + l.gross, 0))
      const afterLineDiscounts = round2(lines.reduce((acc, l) => acc + l.afterLineDiscount, 0))

      // 2. Distribute the cart-level discount proportionally so per-line totals stay exact.
      const cartDiscount = round2(Math.min(Math.max(input.cartDiscount ?? 0, 0), afterLineDiscounts))
      let distributed = 0
      const finalized = lines.map((l, idx) => {
        let share: number
        if (cartDiscount <= 0 || afterLineDiscounts <= 0) {
          share = 0
        } else if (idx === lines.length - 1) {
          share = round2(cartDiscount - distributed)
        } else {
          share = round2((cartDiscount * l.afterLineDiscount) / afterLineDiscounts)
          distributed = round2(distributed + share)
        }
        const lineTotal = round2(l.afterLineDiscount - share)
        return {
          ...l,
          lineDiscount: l.lineDiscount,
          discount: round2(l.gross - lineTotal),
          lineTotal,
          taxCategory: l.product.tax_category as TaxCategory
        }
      })

      const total = round2(finalized.reduce((acc, l) => acc + l.lineTotal, 0))
      const discountTotal = round2(subtotal - total)

      // 3. Validate payments cover exactly the total.
      const paid = round2(input.payments.reduce((acc, p) => acc + p.amount, 0))
      if (paid < total) throw new AppError('pos.insufficient')
      if (Math.abs(paid - total) > 0.01) throw new AppError('errors.paymentMismatch')

      const cashPayment = input.payments.find((p) => p.method === 'cash')
      const change =
        cashPayment && input.tendered != null
          ? round2(input.tendered - cashPayment.amount)
          : null
      if (change != null && change < 0) throw new AppError('pos.insufficient')

      // Legacy single-method column: the largest tender is the "primary" method.
      const primary = input.payments.reduce((best, p) => (p.amount > best.amount ? p : best))
      const sinpeRef = input.payments.find((p) => p.method === 'sinpe' && p.ref?.trim())?.ref?.trim()

      const customer: SaleCustomer = {
        name: cleanText(input.customer?.name),
        idType:
          input.customer?.idType && ID_TYPES.includes(input.customer.idType)
            ? input.customer.idType
            : null,
        id: cleanText(input.customer?.id),
        phone: cleanText(input.customer?.phone),
        email: cleanText(input.customer?.email),
        activityCode: cleanText(input.customer?.activityCode)
      }

      const consecutivo = nextConsecutivo()

      const saleId = Number(
        db
          .prepare(
            `INSERT INTO sales
               (user_id, payment_method, subtotal, discount_total, cart_discount, total, sale_condition, consecutivo,
                sinpe_ref, customer_name, customer_id_type, customer_id, customer_phone, customer_email,
                customer_activity_code, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
          )
          .run(
            user.id,
            primary.method,
            subtotal,
            discountTotal,
            cartDiscount,
            total,
            condition,
            consecutivo,
            sinpeRef ?? null,
            customer.name,
            customer.idType,
            customer.id,
            customer.phone,
            customer.email,
            customer.activityCode,
            now
          ).lastInsertRowid
      )

      const insertItem = db.prepare(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, line_discount, line_total, tax_category) VALUES (?,?,?,?,?,?,?,?)'
      )
      const insertPayment = db.prepare(
        'INSERT INTO sale_payments (sale_id, method, amount, ref) VALUES (?,?,?,?)'
      )
      const decrementStock = db.prepare(
        'UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?'
      )
      const decrementStockUnlimited = db.prepare(
        'UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?'
      )
      for (const line of finalized) {
        const productId = line.product.id
        insertItem.run(
          saleId,
          productId,
          line.quantity,
          line.unitPrice,
          line.discount,
          line.lineDiscount,
          line.lineTotal,
          line.taxCategory
        )
        const stockStmt =
          line.product.factura_negativo === 1 ? decrementStockUnlimited : decrementStock
        const stockResult =
          line.product.factura_negativo === 1
            ? stockStmt.run(line.quantity, now, productId)
            : stockStmt.run(line.quantity, now, productId, line.quantity)
        if (stockResult.changes === 0) {
          const current = getProduct(productId) ?? line.product
          assertSaleStock(current, line.quantity)
        }
      }
      for (const pay of input.payments) {
        insertPayment.run(saleId, pay.method, round2(pay.amount), cleanText(pay.ref))
      }

      const receiptLines = buildReceiptLines(
        {
          emisor: emisorFromSettings(settings),
          consecutivo,
          saleId,
          createdAt: now,
          cashier: user.username,
          items: finalized.map((l) => ({
            name: l.product.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discount: l.discount,
            lineTotal: l.lineTotal
          })),
          subtotal,
          discountTotal,
          total,
          payments: input.payments.map(
            (p): ReceiptPaymentLine => ({
              method: p.method,
              amount: round2(p.amount),
              ref: cleanText(p.ref)
            })
          ),
          tendered: input.tendered ?? null,
          change,
          customer,
          footer: settings.receiptFooter
        },
        lang
      )
      const printJobId = insertPrintJob('receipt', saleId, { lang, lines: receiptLines })

      writeAudit('sale_created', {
        entity: 'sale',
        entityId: saleId,
        detail:
          discountTotal > 0
            ? `${consecutivo} · ${total} · desc ${discountTotal}`
            : `${consecutivo} · ${total}`
      })

      return {
        saleId,
        consecutivo,
        total,
        change,
        stockAlerts: alertsForProducts(finalized.map((l) => l.product.id)),
        printJobId
      }
    })()

    const printStatus = schedulePrintJob(result.printJobId)
    return { ...result, printStatus }
  })

  handle<{ saleId?: number; date?: string }, SaleDetail[]>(
    'sales:findForReturn',
    SELL,
    ({ saleId, date }) => {
      const db = getDb()
      interface SaleRow {
        id: number
        consecutivo: string | null
        created_at: string
        payment_method: PaymentMethod
        subtotal: number
        discount_total: number
        total: number
        sale_condition: string
        sinpe_ref: string | null
        cierre_id: number | null
        cashier: string
        customer_name: string | null
        customer_id_type: IdType | null
        customer_id: string | null
        customer_phone: string | null
        customer_email: string | null
        customer_activity_code: string | null
      }
      let saleRows: SaleRow[] = []
      const baseSelect = `SELECT s.id, s.consecutivo, s.created_at, s.payment_method, s.subtotal, s.discount_total,
                                 s.total, s.sale_condition, s.sinpe_ref, s.cierre_id, u.username AS cashier,
                                 s.customer_name, s.customer_id_type, s.customer_id, s.customer_phone,
                                 s.customer_email, s.customer_activity_code
                          FROM sales s JOIN users u ON u.id = s.user_id`
      if (saleId) {
        saleRows = db.prepare(`${baseSelect} WHERE s.id = ?`).all(saleId) as SaleRow[]
      } else if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        saleRows = db
          .prepare(`${baseSelect} WHERE s.created_at LIKE ? ORDER BY s.id DESC LIMIT 50`)
          .all(`${date}%`) as SaleRow[]
      } else {
        throw new AppError('errors.invalidInput')
      }

      const itemsStmt = db.prepare(
        `SELECT si.product_id AS productId, p.name AS name, p.barcode AS barcode,
                si.quantity AS quantity, si.unit_price AS unitPrice, si.discount AS discount,
                si.line_total AS lineTotal, si.tax_category AS taxCategory,
                COALESCE((SELECT SUM(ri.quantity) FROM return_items ri
                          WHERE ri.sale_id = si.sale_id AND ri.product_id = si.product_id), 0) AS returnedQty
         FROM sale_items si JOIN products p ON p.id = si.product_id
         WHERE si.sale_id = ?`
      )
      const paymentsStmt = db.prepare(
        'SELECT method, amount, ref FROM sale_payments WHERE sale_id = ?'
      )
      return saleRows.map((sale) => ({
        id: sale.id,
        consecutivo: sale.consecutivo,
        createdAt: sale.created_at,
        cashier: sale.cashier,
        paymentMethod: sale.payment_method,
        payments: paymentsStmt.all(sale.id) as SalePaymentDetail[],
        subtotal: sale.subtotal,
        discountTotal: sale.discount_total,
        total: sale.total,
        sinpeRef: sale.sinpe_ref,
        cierreId: sale.cierre_id,
        customer: {
          name: sale.customer_name,
          idType: sale.customer_id_type,
          id: sale.customer_id,
          phone: sale.customer_phone,
          email: sale.customer_email,
          activityCode: sale.customer_activity_code
        },
        items: itemsStmt.all(sale.id) as SaleItemDetail[]
      }))
    }
  )
}
