import { z } from 'zod'
import { PAYMENT_METHODS } from '../types'
import { MAX_PRODUCT_MONEY, MAX_PRODUCT_STOCK } from '../productValidation'

export { MAX_PRODUCT_STOCK } from '../productValidation'

/** IPC handlers with no payload (undefined or omitted). */
export const voidInput = z.union([z.undefined(), z.null()]).optional()

export const pinSchema = z.string().regex(/^\d{4,6}$/, 'PIN must be 4–6 digits')

export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

export const moneySchema = z.number().finite().min(0).max(MAX_PRODUCT_MONEY)

export const positiveIdSchema = z.number().int().positive().max(10_000_000)

export const quantitySchema = z.number().int().min(1).max(10_000)

/** Import stock above this is treated as corrupt data (zeroed on eFactura, rejected on CSV). */
export const IMPORT_STOCK_GARBAGE_THRESHOLD = MAX_PRODUCT_STOCK

export const usernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[\w.-]+$/i, 'Invalid username characters')

export const passwordSchema = z.string().min(1).max(128)

export const barcodeSchema = z.string().trim().min(1).max(64)

export const shortTextSchema = z.string().trim().min(1).max(200)

export const optionalTextSchema = z.string().trim().max(500)

export const optionalLongTextSchema = z.string().trim().max(2000)

export const filePathSchema = z.string().trim().min(1).max(512)

export const languageSchema = z.enum(['es', 'zh-CN'])

export const roleSchema = z.enum(['sales', 'product_manager', 'admin'])

export const actionShortcutKeySchema = z.enum([
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12'
])

export const paymentMethodSchema = z.enum(PAYMENT_METHODS)

export const taxCategorySchema = z.literal('standard')

export const idTypeSchema = z.enum(['fisica', 'juridica', 'dimex', 'nite'])

export const stockStatusSchema = z.enum(['all', 'low', 'zero', 'negative'])

export const reportTypeSchema = z.enum([
  'summary',
  'byPayment',
  'topProducts',
  'inventory',
  'taxBreakdown',
  'transactionLog',
  'itemizedSales'
])

export const localTimeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:mm')

export const dateRangeSchema = z.strictObject({
  from: localDateSchema,
  to: localDateSchema,
  fromTime: localTimeSchema.optional(),
  toTime: localTimeSchema.optional()
})
