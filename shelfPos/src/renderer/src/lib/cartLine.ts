import type { CartLine } from '@/features/pos/types'
import { catalogUnitPrice, lineGross, lineTotal, lineUnitPrice } from '@shared/pricing'
import { roundColones } from '@shared/money'

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
    return roundColones(Math.max(0, cartLineGross(line) - line.discount))
  }
  return lineTotal(line.product, line.quantity, line.discount, line.priceOverride)
}

export function cartLineShowsBulk(line: CartLine): boolean {
  return (
    line.kind === 'product' &&
    line.priceOverride == null &&
    catalogUnitPrice(line.product, line.quantity) !== line.product.price
  )
}

export function cartLineHasCustomPrice(line: CartLine): boolean {
  return line.priceOverride != null
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
