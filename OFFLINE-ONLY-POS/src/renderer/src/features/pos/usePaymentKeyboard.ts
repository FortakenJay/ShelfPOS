import { useEffect } from 'react'
import { eventToShortcutKey } from '@/lib/shortcuts'
import { isEditableElement } from './posKeyboard'
import type { ActionShortcutKey, PaymentMethod } from '@shared/types'

export function usePaymentKeyboard({
  enabled,
  canConfirm,
  splitPayment,
  hasCashSingle,
  singleMethod,
  paymentShortcuts,
  onClose,
  onConfirm,
  onSelectMethod
}: {
  enabled: boolean
  canConfirm: boolean
  splitPayment: boolean
  hasCashSingle: boolean
  singleMethod: PaymentMethod
  paymentShortcuts?: {
    cash?: ActionShortcutKey
    card?: ActionShortcutKey
    sinpe?: ActionShortcutKey
  }
  onClose: () => void
  onConfirm: () => void
  onSelectMethod?: (method: PaymentMethod) => void
}): void {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent): void => {
      const shortcutKey = eventToShortcutKey(e)
      if (shortcutKey && paymentShortcuts && onSelectMethod && !splitPayment) {
        const method =
          shortcutKey === paymentShortcuts.cash
            ? 'cash'
            : shortcutKey === paymentShortcuts.card
              ? 'card'
              : shortcutKey === paymentShortcuts.sinpe
                ? 'sinpe'
                : null
        if (method && !isEditableElement(e.target)) {
          e.preventDefault()
          onSelectMethod(method)
          return
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Enter' || e.defaultPrevented) return

      const target = e.target
      if (isEditableElement(target)) {
        if (splitPayment) {
          commitSplitAmount(target, e)
          return
        }
        if (hasCashSingle) {
          return
        }
        if (!splitPayment && singleMethod === 'sinpe' && target.tagName === 'INPUT') {
          e.preventDefault()
          if (canConfirm) onConfirm()
        }
        return
      }

      if (canConfirm) {
        e.preventDefault()
        onConfirm()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    enabled,
    canConfirm,
    splitPayment,
    hasCashSingle,
    singleMethod,
    paymentShortcuts,
    onClose,
    onConfirm,
    onSelectMethod
  ])
}

function commitSplitAmount(target: HTMLElement, e: KeyboardEvent): void {
  if (target.tagName !== 'INPUT') return
  e.preventDefault()
  target.blur()
}
