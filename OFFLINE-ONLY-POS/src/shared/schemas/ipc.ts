import { z } from 'zod'
import type { IpcChannel } from '../types'
import {
  actionShortcutKeySchema,
  barcodeSchema,
  dateRangeSchema,
  filePathSchema,
  idTypeSchema,
  languageSchema,
  localDateSchema,
  MAX_PRODUCT_STOCK,
  moneySchema,
  optionalLongTextSchema,
  optionalTextSchema,
  passwordSchema,
  paymentMethodSchema,
  pinSchema,
  positiveIdSchema,
  quantitySchema,
  reportTypeSchema,
  roleSchema,
  shortTextSchema,
  stockStatusSchema,
  taxCategorySchema,
  usernameSchema,
  voidInput
} from './primitives'

const languagePayloadSchema = z.strictObject({ language: languageSchema })
const pinChangeSchema = z.strictObject({ currentPin: pinSchema, newPin: pinSchema })
/** Empty currentPin allowed when caja PIN is not configured yet. */
const cajaPinChangeInputSchema = z.strictObject({
  currentPin: z.union([z.literal(''), pinSchema]),
  newPin: pinSchema
})

const productInputSchema = z.strictObject({
  barcode: barcodeSchema,
  name: shortTextSchema,
  price: moneySchema,
  costPrice: moneySchema.nullable(),
  category: z.string().trim().max(100).nullable(),
  stockProvider: z.string().trim().max(100).nullable(),
  stock: z.number().int().min(0).max(MAX_PRODUCT_STOCK),
  stockThreshold: z.number().int().min(0).max(MAX_PRODUCT_STOCK).nullable(),
  taxCategory: taxCategorySchema,
  bulkQty: z.number().int().min(2).max(10_000).nullable(),
  bulkPrice: moneySchema.nullable(),
  facturaNegativo: z.boolean()
})

const productFiltersSchema = z
  .strictObject({
    search: z.string().trim().max(100).optional(),
    category: z.string().trim().max(100).optional(),
    stockProvider: z.string().trim().max(100).optional(),
    stockStatus: stockStatusSchema.optional(),
    page: z.number().int().min(1).max(10_000).optional(),
    pageSize: z.number().int().min(1).max(200).optional()
  })
  .optional()

const adjustStockInputSchema = z.strictObject({
  productId: positiveIdSchema,
  delta: z.number().int().min(-1_000_000).max(1_000_000),
  reason: z.string().trim().min(1).max(500)
})

const salePaymentInputSchema = z.strictObject({
  method: paymentMethodSchema,
  amount: moneySchema,
  ref: z.string().trim().max(64).optional()
})

const createSaleProductItemSchema = z.strictObject({
  productId: positiveIdSchema,
  quantity: quantitySchema,
  discount: moneySchema.optional(),
  unitPrice: moneySchema.optional()
})

const createSaleMiscItemSchema = z.strictObject({
  miscItem: z.literal(true),
  quantity: quantitySchema,
  unitPrice: moneySchema.refine((n) => n > 0, 'unit price must be positive'),
  name: z.string().trim().max(200).optional(),
  catalogUnitPrice: moneySchema.optional(),
  discount: moneySchema.optional()
})

const createSaleItemInputSchema = z.union([createSaleProductItemSchema, createSaleMiscItemSchema])

const customerInputSchema = z.strictObject({
  name: z.string().trim().max(200).optional(),
  idType: idTypeSchema.optional(),
  id: z.string().trim().max(32).optional(),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().max(128).optional(),
  activityCode: z.string().trim().max(16).optional()
})

export const createSaleInputSchema = z.strictObject({
  items: z.array(createSaleItemInputSchema).min(1).max(500),
  payments: z.array(salePaymentInputSchema).min(1).max(3),
  cartDiscount: moneySchema.optional(),
  customer: customerInputSchema.optional(),
  tendered: moneySchema.optional(),
  discountPin: pinSchema.optional(),
  printReceipt: z.boolean().optional()
})

const createReturnInputSchema = z.strictObject({
  saleId: positiveIdSchema,
  items: z
    .array(
      z.strictObject({
        saleItemId: positiveIdSchema,
        quantity: quantitySchema
      })
    )
    .min(1)
    .max(500),
  restock: z.boolean(),
  pin: pinSchema
})

const discountAuthorizeInputSchema = z.strictObject({
  pin: pinSchema,
  kind: z.enum(['line', 'cart']),
  amount: moneySchema.refine((n) => n > 0, 'amount must be positive'),
  productName: z.string().trim().max(200).optional()
})

const priceOverrideAuthorizeInputSchema = z.strictObject({
  pin: pinSchema,
  productId: z.number().int().min(0),
  productName: z.string().trim().min(1).max(200),
  catalogUnitPrice: moneySchema.refine((n) => n > 0, 'catalog price must be positive'),
  overrideUnitPrice: moneySchema.refine((n) => n > 0, 'override price must be positive'),
  quantity: z.number().int().min(1).max(9999)
})

const firstRunSetupInputSchema = z.strictObject({
  storeName: z.string().trim().min(1).max(200),
  username: usernameSchema,
  password: passwordSchema,
  pin: pinSchema
})

const userCreateInputSchema = z.strictObject({
  username: usernameSchema,
  password: passwordSchema,
  role: roleSchema
})

const userUpdateInputSchema = z.strictObject({
  id: positiveIdSchema,
  username: usernameSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional()
})

const settingsUpdateInputSchema = z.strictObject({
  storeName: z.string().trim().min(1).max(200).optional(),
  stockThresholdDefault: z.number().int().min(0).max(1_000_000).optional(),
  scannerBurstMs: z.number().int().min(5).max(500).optional(),
  ivaRateStandard: z.number().finite().min(0).max(100).optional(),
  branchCode: z.string().trim().max(10).optional(),
  terminalCode: z.string().trim().max(10).optional(),
  storeLegalName: optionalTextSchema.optional(),
  storeIdType: idTypeSchema.optional(),
  storeId: z.string().trim().max(32).optional(),
  storePhone: z.string().trim().max(32).optional(),
  storeEmail: z.string().trim().max(128).optional(),
  storeActivityCode: z.string().trim().max(16).optional(),
  storeProvince: z.string().trim().max(64).optional(),
  storeCanton: z.string().trim().max(64).optional(),
  storeDistrict: z.string().trim().max(64).optional(),
  storeAddress: optionalLongTextSchema.optional(),
  receiptFooter: optionalLongTextSchema.optional(),
  shortcutOpenFloat: actionShortcutKeySchema.optional(),
  shortcutCashIn: actionShortcutKeySchema.optional(),
  shortcutCashOut: actionShortcutKeySchema.optional(),
  shortcutDrawerAction: actionShortcutKeySchema.optional(),
  shortcutPrintLabel: actionShortcutKeySchema.optional(),
  shortcutPayCash: actionShortcutKeySchema.optional(),
  shortcutPayCard: actionShortcutKeySchema.optional(),
  shortcutPaySinpe: actionShortcutKeySchema.optional()
})

const auditLogFilterSchema = z
  .strictObject({
    range: dateRangeSchema.optional(),
    userId: positiveIdSchema.optional(),
    action: z.string().trim().min(1).max(64).optional(),
    limit: z.number().int().min(1).max(200).optional(),
    offset: z.number().int().min(0).max(1_000_000).optional()
  })
  .optional()

const reportPayloadSchema = z.strictObject({
  type: reportTypeSchema,
  range: dateRangeSchema,
  page: z.number().int().min(1).max(10_000).optional(),
  pageSize: z.number().int().min(1).max(200).optional()
})

const cierreConfirmInputSchema = z.strictObject({
  shiftLabel: z.string().trim().max(100).nullish(),
  notes: optionalLongTextSchema.nullish(),
  countedCash: moneySchema
})

const cashMovementInputSchema = z.strictObject({
  type: z.enum(['cash_in', 'cash_out']),
  amount: moneySchema.refine((n) => n > 0, 'amount must be positive'),
  reason: optionalTextSchema.optional(),
  pin: pinSchema
})

const licenseActivateInputSchema = z.strictObject({
  jwt: z.string().trim().min(20).max(16_384)
})

const productUpdateInputSchema = z.strictObject({
  id: positiveIdSchema,
  ...productInputSchema.shape
})

/** Electron IPC may pass null for omitted payloads; page/pageSize may arrive as strings. */
const printQueueListInputSchema = z.union([
  z.undefined(),
  z.null(),
  z.strictObject({
    page: z.coerce.number().int().min(1).max(10_000).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional()
  })
])

/** Per-channel Zod schemas — enforced in main-process IPC before any handler runs. */
export const IPC_SCHEMAS = {
  'license:activate': licenseActivateInputSchema,
  'license:status': voidInput,
  'firstRun:status': voidInput,
  'firstRun:setLanguage': languagePayloadSchema,
  'firstRun:complete': firstRunSetupInputSchema,
  'syncSetup:status': voidInput,
  'syncSetup:save': z.strictObject({
    pairingCode: z.string().trim().length(8).regex(/^[A-Z0-9]{8}$/i),
  }),
  'syncSetup:restartService': voidInput,
  'auth:login': z.strictObject({ username: usernameSchema, password: passwordSchema }),
  'auth:logout': voidInput,
  'auth:session': voidInput,
  'settings:get': voidInput,
  'settings:update': settingsUpdateInputSchema,
  'settings:setLanguage': languagePayloadSchema,
  'settings:changePin': pinChangeSchema,
  'settings:changeCajaPin': cajaPinChangeInputSchema,
  'settings:printPinCard': z.strictObject({
    managerPin: pinSchema,
    cajaPin: pinSchema
  }),
  'products:list': productFiltersSchema,
  'products:categories': voidInput,
  'products:stockProviders': voidInput,
  'products:create': productInputSchema,
  'products:update': productUpdateInputSchema,
  'products:delete': z.strictObject({ id: positiveIdSchema }),
  'products:adjustStock': adjustStockInputSchema,
  'products:exportCsv': z.strictObject({ template: z.boolean().optional() }).optional(),
  'products:importCsvPreview': voidInput,
  'products:importCsvConfirm': z.strictObject({
    filePath: filePathSchema,
    stockMode: z.enum(['add', 'replace']).optional()
  }),
  'products:importEfacturaPreview': voidInput,
  'products:importEfacturaConfirm': z.strictObject({
    filePath: filePathSchema,
    stockMode: z.enum(['add', 'replace']).optional()
  }),
  'products:printLabel': z.strictObject({
    productId: positiveIdSchema,
    copies: z.number().int().min(1).max(20).optional()
  }),
  'products:printLabelBatch': z.strictObject({
    productIds: z.array(positiveIdSchema).min(1).max(200)
  }),
  'products:byBarcode': z.strictObject({ barcode: barcodeSchema }),
  'products:search': z.strictObject({ query: z.string().trim().max(100) }),
  'sales:create': createSaleInputSchema,
  'sales:findForReturn': z.strictObject({
    saleId: positiveIdSchema.optional(),
    date: localDateSchema.optional()
  }),
  'sales:listForReprint': voidInput,
  'sales:reprintReceipt': z.strictObject({ saleId: positiveIdSchema }),
  'sales:exportFacturaPdf': z.strictObject({
    saleId: z.coerce.number().int().positive().max(10_000_000)
  }),
  'returns:create': createReturnInputSchema,
  'discount:authorize': discountAuthorizeInputSchema,
  'cart:removeAuthorize': z.strictObject({
    pin: pinSchema,
    productName: z.string().trim().min(1).max(200),
    quantity: quantitySchema
  }),
  'cartTabs:list': voidInput,
  'cartTabs:create': z.strictObject({
    label: optionalTextSchema.nullish().optional(),
    position: z.number().int().min(1)
  }),
  'cartTabs:save': z.strictObject({
    id: positiveIdSchema,
    cartJson: z.string().min(2).max(2_000_000)
  }),
  'cartTabs:rename': z.strictObject({
    id: positiveIdSchema,
    label: optionalTextSchema.nullish()
  }),
  'cartTabs:remove': z.strictObject({ id: positiveIdSchema }),
  'cartTabs:complete': z.strictObject({ id: positiveIdSchema }),
  'cartTabs:discardAudited': z.strictObject({
    id: positiveIdSchema,
    pin: pinSchema,
    label: z.string().trim().min(1).max(120),
    total: moneySchema
  }),
  'cartTabs:reorder': z.strictObject({
    ids: z.array(positiveIdSchema).min(1).max(50)
  }),
  'priceOverride:authorize': priceOverrideAuthorizeInputSchema,
  'reports:run': reportPayloadSchema,
  'reports:print': reportPayloadSchema,
  'reports:exportPdf': reportPayloadSchema,
  'dashboard:overview': voidInput,
  'cierre:preview': voidInput,
  'cierre:confirm': cierreConfirmInputSchema,
  'cierre:history': z.strictObject({ range: dateRangeSchema }),
  'cierre:discrepancyAlerts': voidInput,
  'cierre:exportPdf': z.strictObject({ cierreId: positiveIdSchema }),
  'cierre:print': z.strictObject({ cierreId: positiveIdSchema }),
  'cash:status': voidInput,
  'cash:openFloat': z.strictObject({ amount: moneySchema }),
  'cash:movement': cashMovementInputSchema,
  'cash:listMovements': dateRangeSchema,
  'audit:list': auditLogFilterSchema,
  'audit:users': voidInput,
  'audit:actions': voidInput,
  'users:list': voidInput,
  'users:create': userCreateInputSchema,
  'users:update': userUpdateInputSchema,
  'users:delete': z.strictObject({ id: positiveIdSchema }),
  'printQueue:list': printQueueListInputSchema,
  'printQueue:retry': z.strictObject({ id: positiveIdSchema }),
  'printer:openDrawer': voidInput,
  'printer:colonTest': voidInput,
  'printer:status': voidInput,
  'printer:test': voidInput,
  'backup:info': voidInput,
  'backup:runManual': voidInput,
  'backup:exportCsv': z.strictObject({ range: dateRangeSchema })
} satisfies Record<IpcChannel, z.ZodType>
