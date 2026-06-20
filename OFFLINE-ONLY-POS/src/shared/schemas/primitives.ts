import { z } from 'zod'

/** IPC handlers with no payload (undefined or omitted). */
export const voidInput = z.union([z.undefined(), z.null()]).optional()

export const pinSchema = z.string().regex(/^\d{4,6}$/, 'PIN must be 4–6 digits')

export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

export const moneySchema = z.number().finite().min(0).max(999_999_999)

export const positiveIdSchema = z.number().int().positive().max(10_000_000)

export const quantitySchema = z.number().int().min(1).max(10_000)

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

export const paymentMethodSchema = z.enum(['cash', 'card', 'sinpe'])

export const taxCategorySchema = z.literal('standard')

export const idTypeSchema = z.enum(['fisica', 'juridica', 'dimex', 'nite'])

export const stockStatusSchema = z.enum(['all', 'low', 'zero', 'negative'])

export const reportTypeSchema = z.enum([
  'summary',
  'byPayment',
  'topProducts',
  'inventory',
  'taxBreakdown'
])

export const dateRangeSchema = z.strictObject({
  from: localDateSchema,
  to: localDateSchema
})
