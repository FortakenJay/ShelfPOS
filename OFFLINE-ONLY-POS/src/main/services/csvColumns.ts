import { t } from './i18n'
import type { Language, PaymentMethod, TaxCategory } from '../../shared/types'

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
  'cost_price',
  'category',
  'stock',
  'stock_threshold',
  'tax_category',
  'bulk_qty',
  'bulk_price'
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

const TAX_ALIASES: Record<TaxCategory, string[]> = {
  standard: ['standard', ...LANGUAGES.map((lang) => normalizeHeader(t(lang, 'tax.categories.standard')))],
  canasta_basica: [
    'canasta_basica',
    'canasta basica',
    ...LANGUAGES.map((lang) => normalizeHeader(t(lang, 'tax.categories.canasta_basica')))
  ],
  exempt: ['exempt', ...LANGUAGES.map((lang) => normalizeHeader(t(lang, 'tax.categories.exempt')))]
}

const NORMALIZED_TO_TAX_CATEGORY = new Map<string, TaxCategory>()
for (const [category, aliases] of Object.entries(TAX_ALIASES) as [TaxCategory, string[]][]) {
  for (const alias of aliases) {
    if (!NORMALIZED_TO_TAX_CATEGORY.has(alias)) {
      NORMALIZED_TO_TAX_CATEGORY.set(alias, category)
    }
  }
}

export function parseTaxCategory(raw: string): TaxCategory | null {
  const norm = normalizeHeader(raw)
  if (!norm) return 'standard'
  return NORMALIZED_TO_TAX_CATEGORY.get(norm) ?? null
}

export function formatPaymentMethod(lang: Language, method: string): string {
  const key = `pos.methods.${method}` as const
  const label = t(lang, key)
  return label === key ? method : label
}

export function parsePaymentMethod(raw: string): PaymentMethod | null {
  const norm = normalizeHeader(raw)
  const methods: PaymentMethod[] = ['cash', 'card', 'sinpe']
  for (const method of methods) {
    if (normalizeHeader(method) === norm) return method
    for (const lang of LANGUAGES) {
      if (normalizeHeader(t(lang, `pos.methods.${method}`)) === norm) return method
    }
  }
  return null
}
