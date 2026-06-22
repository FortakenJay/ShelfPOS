import { roundColones } from '@shared/money'
import type { CartLine } from '@/features/pos/types'
import { cartLineGross } from '@/lib/cartLine'

export function lineDiscountFromPercent(line: CartLine, percent: number): number {
  const gross = cartLineGross(line)
  if (percent <= 0 || gross <= 0) return 0
  return roundColones(Math.min(gross, (gross * percent) / 100))
}

export function cartLineDiscountPercentDisplay(line: CartLine): string {
  if (line.discount <= 0) return ''
  if (line.discountPercent != null && line.discountPercent > 0) {
    return formatPercentDisplay(line.discountPercent)
  }
  const gross = cartLineGross(line)
  if (gross <= 0) return ''
  return formatPercentDisplay((line.discount / gross) * 100)
}

function formatPercentDisplay(percent: number): string {
  const rounded = Math.round(percent * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

export function parseDiscountPercentInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/[^\d.]/g, '')
  if (!trimmed) return 0
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.min(n, 100)
}
