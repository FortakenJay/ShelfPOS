import { roundColones } from './money'
import type { ProductInput } from './types'

export const MAX_PRODUCT_MONEY = 999_999_999
export const MAX_PRODUCT_STOCK = 10_000_000
export const MAX_PRODUCT_BULK_QTY = 10_000

const MAX_BARCODE_LENGTH = 64
const MAX_NAME_LENGTH = 200
const MAX_OPTIONAL_TEXT_LENGTH = 100

function normalizeMoney(value: number): number {
  return Number.isFinite(value) && value >= 0 ? roundColones(value) : value
}

function normalizeOptionalMoney(value: number | null): number | null {
  return value == null ? null : normalizeMoney(value)
}

function normalizeOptionalText(value: string | null): string | null {
  return value?.trim() || null
}

/** Returns a normalized copy; source-specific parsing belongs at each input boundary. */
export function normalizeProductInput(input: ProductInput): ProductInput {
  return {
    ...input,
    barcode: input.barcode.trim(),
    name: input.name.trim(),
    price: normalizeMoney(input.price),
    price2: normalizeOptionalMoney(input.price2),
    price3: normalizeOptionalMoney(input.price3),
    costPrice: normalizeOptionalMoney(input.costPrice),
    category: normalizeOptionalText(input.category),
    stockProvider: normalizeOptionalText(input.stockProvider),
    bulkPrice: normalizeOptionalMoney(input.bulkPrice)
  }
}

function validMoney(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MAX_PRODUCT_MONEY
}

function validOptionalMoney(value: number | null): boolean {
  return value == null || validMoney(value)
}

/** Canonical product business constraints, evaluated after normalization. */
export function validateProductBusinessRules(input: ProductInput): boolean {
  if (!input.barcode || input.barcode.length > MAX_BARCODE_LENGTH) return false
  if (!input.name || input.name.length > MAX_NAME_LENGTH) return false
  if (input.category != null && input.category.length > MAX_OPTIONAL_TEXT_LENGTH) return false
  if (input.stockProvider != null && input.stockProvider.length > MAX_OPTIONAL_TEXT_LENGTH) {
    return false
  }

  if (!validMoney(input.price)) return false
  if (!validOptionalMoney(input.price2) || (input.price2 != null && input.price2 <= 0)) {
    return false
  }
  if (!validOptionalMoney(input.price3) || (input.price3 != null && input.price3 <= 0)) {
    return false
  }
  if (!validOptionalMoney(input.costPrice)) return false

  if (!Number.isInteger(input.stock) || input.stock < 0 || input.stock > MAX_PRODUCT_STOCK) {
    return false
  }
  if (
    input.stockThreshold != null &&
    (!Number.isInteger(input.stockThreshold) ||
      input.stockThreshold < 0 ||
      input.stockThreshold > MAX_PRODUCT_STOCK)
  ) {
    return false
  }
  if (input.taxCategory !== 'standard') return false

  const hasBulkQty = input.bulkQty != null
  const hasBulkPrice = input.bulkPrice != null
  if (hasBulkQty !== hasBulkPrice) return false
  if (hasBulkQty) {
    if (
      !Number.isInteger(input.bulkQty) ||
      (input.bulkQty as number) < 2 ||
      (input.bulkQty as number) > MAX_PRODUCT_BULK_QTY
    ) {
      return false
    }
    if (!validMoney(input.bulkPrice as number)) return false
  }

  return true
}
