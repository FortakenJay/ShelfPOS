import { t } from './i18n'
import { PAYMENT_METHODS } from '../../shared/types'
import type { Language, PaymentMethod } from '../../shared/types'

export const SALES_CSV_KEYS = [
  'sale_id',
  'created_at',
  'cashier',
  'payment_method',
  'sinpe_ref',
  'sale_total',
  'cierre_id',
  'barcode',
  'product',
  'quantity',
  'unit_price',
  'line_total'
] as const

export type SalesCsvKey = (typeof SALES_CSV_KEYS)[number]

export const PRODUCT_CSV_KEYS = [
  'barcode',
  'name',
  'price',
  'price2',
  'price3',
  'cost_price',
  'category',
  'stock',
  'stock_threshold',
  'bulk_qty',
  'bulk_price',
  'factura_negativo'
] as const

export type ProductCsvKey = (typeof PRODUCT_CSV_KEYS)[number]

const LANGUAGES: Language[] = ['es', 'zh-CN']

export function salesCsvHeaders(lang: Language): string[] {
  return SALES_CSV_KEYS.map((key) => t(lang, `export.csvColumns.${key}`))
}

export function productCsvHeaders(lang: Language): string[] {
  return PRODUCT_CSV_KEYS.map((key) => t(lang, `products.csv.${key}`))
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function headerAliases(key: string, langKey: string): string[] {
  const aliases = [key, key.replace(/_/g, ' ')]
  for (const lang of LANGUAGES) {
    aliases.push(t(lang, langKey))
  }
  return aliases.map(normalizeHeader)
}

const PRODUCT_HEADER_ALIASES: Record<ProductCsvKey, string[]> = Object.fromEntries(
  PRODUCT_CSV_KEYS.map((key) => [key, headerAliases(key, `products.csv.${key}`)])
) as Record<ProductCsvKey, string[]>

const NORMALIZED_TO_PRODUCT_KEY = new Map<string, ProductCsvKey>()
for (const key of PRODUCT_CSV_KEYS) {
  for (const alias of PRODUCT_HEADER_ALIASES[key]) {
    if (!NORMALIZED_TO_PRODUCT_KEY.has(alias)) {
      NORMALIZED_TO_PRODUCT_KEY.set(alias, key)
    }
  }
}

export function mapProductCsvHeaders(headers: string[]): Partial<Record<ProductCsvKey, number>> {
  const map: Partial<Record<ProductCsvKey, number>> = {}
  headers.forEach((header, index) => {
    const key = NORMALIZED_TO_PRODUCT_KEY.get(normalizeHeader(header))
    if (key != null && map[key] === undefined) map[key] = index
  })
  return map
}

/** Parses 0/1 (or sí/no) for factura negativo. Empty → false. */
export function parseFacturaNegativo(raw: string): boolean {
  const norm = normalizeHeader(raw)
  if (!norm) return false
  if (['1', 'true', 'si', 'sí', 'yes', 'on'].includes(norm)) return true
  return false
}

export function formatPaymentMethod(lang: Language, method: string): string {
  const key = `pos.methods.${method}` as const
  const label = t(lang, key)
  return label === key ? method : label
}

export function parsePaymentMethod(raw: string): PaymentMethod | null {
  const norm = normalizeHeader(raw)
  for (const method of PAYMENT_METHODS) {
    if (normalizeHeader(method) === norm) return method
    for (const lang of LANGUAGES) {
      if (normalizeHeader(t(lang, `pos.methods.${method}`)) === norm) return method
    }
  }
  return null
}
