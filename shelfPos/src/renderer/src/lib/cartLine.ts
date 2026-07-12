import type { CartLine } from '@/features/pos/types'
import {
  catalogUnitPrice,
  isCustomPriceOverride,
  lineGross,
  lineTotal,
  lineUnitPrice,
  moneyEquals,
  sanctionedUnitPriceKind
} from '@shared/pricing'
import { roundColones } from '@shared/money'
import { totalAfterLineDiscount } from '@shared/cartTotals'

export function cartLineKey(line: CartLine): string {
  return line.kind === 'product' ? `p:${line.product.id}` : `m:${line.lineId}`
}

export function miscLineUnitPrice(line: Extract<CartLine, { kind: 'misc' }>): number {
  return line.priceOverride ?? line.unitPrice
}

export function cartLineUnitPrice(line: CartLine): number {
  if (line.kind === 'misc') return miscLineUnitPrice(line)
  return lineUnitPrice(line.product, line.quantity, line.priceOverride)
}

export function cartLineGross(line: CartLine): number {
  if (line.kind === 'misc') {
    return roundColones(miscLineUnitPrice(line) * line.quantity)
  }
  return lineGross(line.product, line.quantity, line.priceOverride)
}

export function cartLineTotal(line: CartLine): number {
  if (line.kind === 'misc') {
    return totalAfterLineDiscount(cartLineGross(line), line.discount)
  }
  return lineTotal(line.product, line.quantity, line.discount, line.priceOverride)
}

export function cartLineShowsBulk(line: CartLine): boolean {
  return (
    line.kind === 'product' &&
    line.priceOverride == null &&
    !moneyEquals(catalogUnitPrice(line.product, line.quantity), line.product.price)
  )
}

export function cartLineHasCustomPrice(line: CartLine): boolean {
  if (line.priceOverride == null) return false
  if (line.kind === 'misc') {
    return isCustomPriceOverride(
      { price: line.unitPrice, price2: null, price3: null },
      line.unitPrice,
      line.priceOverride
    )
  }
  return isCustomPriceOverride(
    line.product,
    catalogUnitPrice(line.product, line.quantity),
    line.priceOverride
  )
}

export function cartLineUsesPrice2(line: CartLine): boolean {
  return (
    line.kind === 'product' &&
    line.priceOverride != null &&
    sanctionedUnitPriceKind(line.product, line.priceOverride) === 'price2'
  )
}

export function cartLineUsesPrice3(line: CartLine): boolean {
  return (
    line.kind === 'product' &&
    line.priceOverride != null &&
    sanctionedUnitPriceKind(line.product, line.priceOverride) === 'price3'
  )
}

export function cartLineDisplayName(line: CartLine, miscLabel: string): string {
  if (line.kind === 'misc') {
    const name = line.customName?.trim()
    return name || miscLabel
  }
  return line.product.name
}

export function cartLineBarcode(line: CartLine): string | null {
  return line.kind === 'product' ? line.product.barcode : null
}
