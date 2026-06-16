import { useEffect } from 'react'
import { isEditableElement } from './posKeyboard'

export function usePaymentKeyboard({
  enabled,
  canConfirm,
  splitPayment,
  hasCashSingle,
  singleMethod,
  onClose,
  onConfirm
}: {
  enabled: boolean
  canConfirm: boolean
  splitPayment: boolean
  hasCashSingle: boolean
  singleMethod: 'cash' | 'card' | 'sinpe'
  onClose: () => void
  onConfirm: () => void
}): void {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent): void => {
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
  }, [enabled, canConfirm, splitPayment, hasCashSingle, singleMethod, onClose, onConfirm])
}

function commitSplitAmount(target: HTMLElement, e: KeyboardEvent): void {
  if (target.tagName !== 'INPUT') return
  e.preventDefault()
  target.blur()
}
