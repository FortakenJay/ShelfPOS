import { app } from 'electron'
import { join } from 'node:path'
import { handle, SALES_ACCESS, SALES_OR_ADMIN_ACCESS } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow, round2 } from '../db/helpers'
import { alertsForProducts, enqueueProductSync, getProduct } from '../db/repos/products'
import { enqueueSync } from '../db/repos/syncQueue'
import { getCustomerById } from '../db/repos/customers'
import { applyCustomerBalanceDelta } from '../db/repos/customerCredit'
import { hasOpeningFloat } from '../db/repos/cash'
import { assertSaleStock } from '../db/repos/stock'
import { insertPrintJob } from '../db/repos/printJobs'
import { listPendingCierreSalesForReprint, assertSaleInOpenShift, buildFacturaPdfData, reprintSaleReceipt } from '../db/repos/salesReceipt'
import { getAppSettings, receiptLanguage, getSetting, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import { schedulePrintJob } from '../services/printer'
import { writeFacturaPdf } from '../services/facturaPdf'
import { distributeCartDiscount } from '../services/cartDiscountDistribution'
import { showSaveDialog } from '../window'
import {
  calculateCartTotals,
  clampLineDiscount,
  totalAfterLineDiscount
} from '../../shared/cartTotals'
import {
  catalogUnitPrice as sharedCatalogUnitPrice,
  isCustomPriceOverride,
  moneyEquals
} from '../../shared/pricing'
import { buildReceiptLines, emisorFromSettings } from '../services/printTemplates'
import type { ReceiptPaymentLine } from '../services/printTemplates'
import { t } from '../services/i18n'
import { PAYMENT_METHODS } from '../../shared/types'
import type {
  CreateSaleInput,
  CreateSaleLineInput,
  CreateSaleMiscItemInput,
  CreateSaleResult,
  IdType,
  PaymentMethod,
  Product,
  ReprintReceiptResult,
  SaleCustomer,
  SaleDetail,
  SalePaymentDetail,
  SaleReprintRow,
  TaxCategory
} from '../../shared/types'

const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']
const PAYMENT_METHOD_SET = new Set<PaymentMethod>(PAYMENT_METHODS)

/** Legacy NOT NULL column — sale_payments is the canonical payment source. */
const DEPRECATED_SALE_PAYMENT_METHOD = 'cash'

/**
 * Builds the next consecutivo (CR structure: sucursal 3 + caja 5 + tipoDoc 2 + secuencia 10).
 * Skips sequences already used in sales — self-heals a corrupted/reset counter instead of
 * violating the unique index (migration v23) mid-checkout. Runs inside the sale transaction.
 */
function nextConsecutivo(): string {
  const branch = (getSetting(SETTING_KEYS.branchCode) ?? '001').padStart(3, '0').slice(-3)
  const terminal = (getSetting(SETTING_KEYS.terminalCode) ?? '00001').padStart(5, '0').slice(-5)
  const tipoDoc = '04' // tiquete
  const taken = getDb().prepare('SELECT 1 FROM sales WHERE consecutivo = ?')
  let seq = Number(getSetting(SETTING_KEYS.consecutivoNext) ?? '1')
  let candidate = `${branch}${terminal}${tipoDoc}${String(seq).padStart(10, '0')}`
  let guard = 0
  while (taken.get(candidate)) {
    if (++guard > 10_000) throw new AppError('errors.consecutivoConflict')
    seq += 1
    candidate = `${branch}${terminal}${tipoDoc}${String(seq).padStart(10, '0')}`
  }
  setSetting(SETTING_KEYS.consecutivoNext, String(seq + 1))
  return candidate
}

function cleanText(v: string | undefined): string | null {
  const t = v?.trim()
  return t ? t : null
}

function isMiscSaleLine(item: CreateSaleLineInput): item is CreateSaleMiscItemInput {
  return 'miscItem' in item && item.miscItem === true
}

interface PricedSaleLine {
  product: Product | null
  displayName: string
  quantity: number
  unitPrice: number
  catalogUnitPrice: number | null
  gross: number
  lineDiscount: number
  afterLineDiscount: number
  taxCategory: TaxCategory
  isMisc: boolean
}

export function registerSalesHandlers(): void {
  handle<CreateSaleInput, CreateSaleResult>('sales:create', SALES_ACCESS, async (input) => {
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
      if (isMiscSaleLine(item)) {
        if (!Number.isFinite(item.unitPrice) || item.unitPrice <= 0) {
          throw new AppError('errors.invalidInput')
        }
        if (
          item.catalogUnitPrice != null &&
          (!Number.isFinite(item.catalogUnitPrice) || item.catalogUnitPrice <= 0)
        ) {
          throw new AppError('errors.invalidInput')
        }
      } else if (item.unitPrice != null && (!Number.isFinite(item.unitPrice) || item.unitPrice <= 0)) {
        throw new AppError('errors.invalidInput')
      }
    }
    for (const pay of input.payments) {
      if (!PAYMENT_METHOD_SET.has(pay.method)) throw new AppError('errors.invalidInput')
      if (!Number.isFinite(pay.amount) || pay.amount <= 0) throw new AppError('errors.invalidInput')
    }
    const creditAmount = round2(
      input.payments
        .filter((payment) => payment.method === 'credit')
        .reduce((sum, payment) => sum + payment.amount, 0)
    )
    if (creditAmount > 0 && input.customerAccountId == null) {
      throw new AppError('errors.customerRequired')
    }
    const condition = creditAmount > 0 ? ('credito' as const) : ('contado' as const)

    const hasDiscount =
      (input.cartDiscount ?? 0) > 0 || input.items.some((item) => (item.discount ?? 0) > 0)
    let discountAuthType: 'caja' | 'manager' | null = null
    if (hasDiscount) {
      if (!input.discountPin?.trim()) throw new AppError('errors.discountPinRequired')
      discountAuthType = await session.verifyDiscountPin(input.discountPin.trim())
    }

    const db = getDb()
    const settings = getAppSettings()
    const lang = receiptLanguage()
    const now = localNow()

    const miscItemName = t(lang, 'pos.miscItemName')

    const result = db.transaction((): Omit<CreateSaleResult, 'printStatus'> => {
      const lines: PricedSaleLine[] = input.items.map((item) => {
        if (isMiscSaleLine(item)) {
          const unitPrice = round2(item.unitPrice)
          const catalogRaw = round2(item.catalogUnitPrice ?? unitPrice)
          const catalogUnitPrice = moneyEquals(unitPrice, catalogRaw) ? null : catalogRaw
          const gross = round2(unitPrice * item.quantity)
          const lineDiscount = clampLineDiscount(gross, item.discount)
          return {
            product: null,
            displayName: cleanText(item.name) ?? miscItemName,
            quantity: item.quantity,
            unitPrice,
            catalogUnitPrice,
            gross,
            lineDiscount,
            afterLineDiscount: totalAfterLineDiscount(gross, lineDiscount),
            taxCategory: 'standard',
            isMisc: true
          }
        }

        const product = getProduct(item.productId)
        if (!product) throw new AppError('errors.productNotFound')
        assertSaleStock(product, item.quantity)
        const catalogUnitPrice = sharedCatalogUnitPrice(product, item.quantity)
        const unitPrice = item.unitPrice != null ? round2(item.unitPrice) : catalogUnitPrice
        const priceOverridden = isCustomPriceOverride(product, catalogUnitPrice, unitPrice)
        const gross = round2(unitPrice * item.quantity)
        const lineDiscount = clampLineDiscount(gross, item.discount)
        return {
          product,
          displayName: product.name,
          quantity: item.quantity,
          unitPrice,
          catalogUnitPrice: priceOverridden ? catalogUnitPrice : null,
          gross,
          lineDiscount,
          afterLineDiscount: totalAfterLineDiscount(gross, lineDiscount),
          taxCategory: product.tax_category as TaxCategory,
          isMisc: false
        }
      })

      const { subtotal, afterLineDiscounts, cartDiscount, total, discountTotal } =
        calculateCartTotals(
          lines.map((line) => ({ gross: line.gross, discount: line.lineDiscount })),
          input.cartDiscount
        )

      // 2. Persist proportional cart-discount shares; the final line absorbs the remainder.
      const finalized = distributeCartDiscount(lines, cartDiscount, afterLineDiscounts)

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

      // Legacy single-method column (deprecated): sale_payments holds authoritative tenders.
      const sinpeRef = input.payments.find((p) => p.method === 'sinpe' && p.ref?.trim())?.ref?.trim()
      const account =
        input.customerAccountId == null ? null : getCustomerById(input.customerAccountId, db)
      if (creditAmount > 0 && !account?.isActive) {
        throw new AppError('errors.customerNotFound')
      }

      const customer: SaleCustomer = {
        name: cleanText(input.customer?.name) ?? account?.name ?? null,
        idType:
          input.customer?.idType && ID_TYPES.includes(input.customer.idType)
            ? input.customer.idType
            : null,
        id: cleanText(input.customer?.id) ?? account?.idNumber ?? null,
        phone: cleanText(input.customer?.phone) ?? account?.phone ?? null,
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
                customer_activity_code, customer_account_id, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
          )
          .run(
            user.id,
            DEPRECATED_SALE_PAYMENT_METHOD,
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
            account?.id ?? null,
            now
          ).lastInsertRowid
      )

      const insertItem = db.prepare(
        `INSERT INTO sale_items
           (sale_id, product_id, quantity, unit_price, catalog_unit_price, discount, line_discount, line_total, tax_category, product_name_snapshot, barcode_snapshot)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`
      )
      const insertPayment = db.prepare(
        'INSERT INTO sale_payments (sale_id, method, amount, ref) VALUES (?,?,?,?)'
      )
      // Deliberately sale-specific: the conditional write closes the preflight race and
      // preserves sale stock errors. Sales are not manual stock_adjustments ledger entries.
      const decrementStock = db.prepare(
        'UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND stock >= ?'
      )
      const decrementStockUnlimited = db.prepare(
        'UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?'
      )
      for (const line of finalized) {
        const itemResult = insertItem.run(
          saleId,
          line.isMisc ? null : line.product!.id,
          line.quantity,
          line.unitPrice,
          line.catalogUnitPrice,
          line.discount,
          line.lineDiscount,
          line.lineTotal,
          line.taxCategory,
          line.displayName,
          line.isMisc ? null : (line.product!.barcode ?? null)
        )
        enqueueSync('sale_items', Number(itemResult.lastInsertRowid), 'insert', db)
        if (line.isMisc || !line.product) continue

        const productId = line.product.id
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
        enqueueProductSync(productId, 'update', db)
      }
      for (const pay of input.payments) {
        const payResult = insertPayment.run(saleId, pay.method, round2(pay.amount), cleanText(pay.ref))
        enqueueSync('sale_payments', Number(payResult.lastInsertRowid), 'insert', db)
      }
      if (account && creditAmount > 0) {
        const balanceUpdated = applyCustomerBalanceDelta(
          db,
          account.id,
          creditAmount,
          now
        )
        if (!balanceUpdated) throw new AppError('errors.customerNotFound')
        enqueueSync('customers', account.id, 'update', db)
      }
      enqueueSync('sales', saleId, 'insert', db)

      const receiptLines = buildReceiptLines(
        {
          emisor: emisorFromSettings(settings),
          consecutivo,
          saleId,
          createdAt: now,
          cashier: user.username,
          items: finalized.map((l) => ({
            name: l.displayName,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            catalogUnitPrice: l.catalogUnitPrice,
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
      const openDrawer = input.payments.some((p) => p.method === 'cash')
      const printJobId =
        input.printReceipt === false
          ? 0
          : insertPrintJob('receipt', saleId, { lang, lines: receiptLines, openDrawer })

      const priceOverrideLines = finalized.filter((l) => l.catalogUnitPrice != null)
      for (const line of priceOverrideLines) {
        writeAudit('price_override_sale', {
          entity: 'sale',
          entityId: saleId,
          detail: `${consecutivo} · ${line.displayName} · cat ${line.catalogUnitPrice} → ${line.unitPrice} x${line.quantity}`
        })
      }

      if (discountAuthType) {
        const discountAmount = round2(discountTotal)
        writeAudit(
          discountAuthType === 'caja' ? 'discount_authorized_caja' : 'discount_authorized_manager',
          {
            entity: 'sale',
            entityId: saleId,
            detail: `checkout · ${discountAmount}`
          }
        )
      }

      writeAudit('sale_created', {
        entity: 'sale',
        entityId: saleId,
        detail:
          discountTotal > 0
            ? `${consecutivo} · ${total} · desc ${discountTotal}`
            : `${consecutivo} · ${total}`
      })

      const stockProductIds: number[] = []
      for (const line of finalized) {
        if (!line.isMisc && line.product) stockProductIds.push(line.product.id)
      }

      return {
        saleId,
        consecutivo,
        total,
        change,
        stockAlerts: alertsForProducts(stockProductIds),
        printJobId
      }
    })()

    const printStatus =
      input.printReceipt === false || result.printJobId === 0
        ? 'printed'
        : await schedulePrintJob(result.printJobId)
    return { ...result, printStatus }
  })

  handle<{ saleId?: number; date?: string }, SaleDetail[]>(
    'sales:findForReturn',
    SALES_ACCESS,
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
        `SELECT si.id AS saleItemId,
                si.product_id AS productId,
                COALESCE(si.product_name_snapshot, p.name) AS name,
                COALESCE(p.barcode, '') AS barcode,
                si.quantity AS quantity, si.unit_price AS unitPrice, si.discount AS discount,
                si.line_total AS lineTotal, si.tax_category AS taxCategory,
                CASE WHEN si.product_id IS NULL THEN 1 ELSE 0 END AS isMisc,
                COALESCE((
                  SELECT SUM(ri.quantity)
                  FROM return_items ri
                  WHERE ri.sale_id = si.sale_id
                    AND (
                      ri.sale_item_id = si.id
                      OR (
                        ri.sale_item_id IS NULL
                        AND si.product_id IS NOT NULL
                        AND ri.product_id = si.product_id
                      )
                    )
                ), 0) AS returnedQty
         FROM sale_items si
         LEFT JOIN products p ON p.id = si.product_id
         WHERE si.sale_id = ?`
      )
      const paymentsStmt = db.prepare(
        'SELECT method, amount, ref FROM sale_payments WHERE sale_id = ?'
      )
      interface SaleItemReturnRow {
        saleItemId: number
        productId: number | null
        name: string
        barcode: string
        quantity: number
        unitPrice: number
        discount: number
        lineTotal: number
        taxCategory: TaxCategory
        returnedQty: number
        isMisc: number
      }

      const details: SaleDetail[] = []
      for (const sale of saleRows) {
        const items = (itemsStmt.all(sale.id) as SaleItemReturnRow[]).map((item) => ({
          saleItemId: item.saleItemId,
          productId: item.productId,
          name: item.name,
          barcode: item.barcode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          lineTotal: item.lineTotal,
          taxCategory: item.taxCategory,
          returnedQty: item.returnedQty,
          isMisc: item.isMisc === 1
        }))
        if (items.length === 0) continue
        details.push({
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
          items
        })
      }
      return details
    }
  )

  handle<void, SaleReprintRow[]>(
    'sales:listForReprint',
    SALES_ACCESS,
    () => listPendingCierreSalesForReprint()
  )

  handle<{ saleId: number }, ReprintReceiptResult>(
    'sales:reprintReceipt',
    SALES_OR_ADMIN_ACCESS,
    async ({ saleId }) => {
      if (session.get()?.role === 'sales') assertSaleInOpenShift(saleId)
      return reprintSaleReceipt(saleId)
    }
  )

  handle<{ saleId: number }, { canceled: boolean; path?: string }>(
    'sales:exportFacturaPdf',
    SALES_OR_ADMIN_ACCESS,
    async ({ saleId }) => {
      if (session.get()?.role === 'sales') assertSaleInOpenShift(saleId)
      const result = await showSaveDialog({
        title: 'Guardar factura PDF',
        defaultPath: join(app.getPath('documents'), `factura-${saleId}.pdf`),
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      if (result.canceled || !result.filePath) return { canceled: true }
      const data = buildFacturaPdfData(saleId)
      await writeFacturaPdf(data, result.filePath)
      return { canceled: false, path: result.filePath }
    }
  )
}
