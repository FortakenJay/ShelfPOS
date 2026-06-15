import { ApiError } from '@/lib/api'
import type { useToasts } from '@/lib/toast'

type Toasts = ReturnType<typeof useToasts>

export function toastApiError(toasts: Toasts, err: unknown): void {
  if (err instanceof ApiError) {
    toasts.error(err.key, err.vars)
    return
  }
  toasts.error('errors.unknown')
}

/** Client-side stock guard before adding/increasing cart lines. */
export function stockAllows(
  product: { name: string; stock: number; factura_negativo?: number },
  requestedQty: number
): { ok: true } | { ok: false; key: string; vars: Record<string, string | number> } {
  if (product.factura_negativo === 1) return { ok: true }
  if (product.stock >= requestedQty) return { ok: true }
  if (product.stock <= 0) {
    return { ok: false, key: 'errors.outOfStock', vars: { name: product.name } }
  }
  return {
    ok: false,
    key: 'errors.insufficientStock',
    vars: { name: product.name, stock: product.stock, qty: requestedQty }
  }
}
