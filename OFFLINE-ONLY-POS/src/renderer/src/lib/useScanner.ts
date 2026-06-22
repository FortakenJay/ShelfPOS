import { useEffect, useRef, useState, type RefObject } from 'react'
import { shouldIgnoreShortcutTarget } from './shortcuts'

/**
 * Distinguishes USB HID barcode scanner input (rapid keystroke burst ending in
 * Enter) from manual typing. Attach `onKeyDown` to the input and call
 * `consumeIsScan` from the Enter handler.
 */
export function useScannerDetector(thresholdMs: number): {
  onKeyDown: (e: React.KeyboardEvent) => void
  consumeIsScan: (valueLength: number) => boolean
} {
  const lastKeyAt = useRef(0)
  const burstCount = useRef(0)

  return {
    onKeyDown: (e: React.KeyboardEvent): void => {
      if (e.key.length !== 1) return
      const now = performance.now()
      burstCount.current = now - lastKeyAt.current <= thresholdMs ? burstCount.current + 1 : 1
      lastKeyAt.current = now
    },
    consumeIsScan: (valueLength: number): boolean => {
      const isScan = valueLength >= 4 && burstCount.current >= valueLength - 1
      burstCount.current = 0
      return isScan
    }
  }
}

/**
 * Captures USB HID scanner input anywhere on the POS screen (not only the search
 * field). Uses capture-phase keydown so scans work when focus is on cart, sidebar,
 * etc. Skips when the search input or another editable field is being typed in.
 */
export function useGlobalBarcodeScanner({
  enabled,
  thresholdMs,
  searchInputRef,
  onScan
}: {
  enabled: boolean
  thresholdMs: number
  searchInputRef: RefObject<HTMLInputElement | null>
  onScan: (barcode: string) => void | Promise<void>
}): void {
  const bufferRef = useRef('')
  const lastKeyAt = useRef(0)
  const burstCount = useRef(0)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    if (!enabled) {
      bufferRef.current = ''
      burstCount.current = 0
      return
    }

    const resetBuffer = (): void => {
      bufferRef.current = ''
      burstCount.current = 0
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (event.target === searchInputRef.current) return

      if (event.key === 'Enter') {
        const value = bufferRef.current.trim()
        const isScan = value.length >= 4 && burstCount.current >= value.length - 1
        const hadBufferedInput = value.length > 0
        resetBuffer()
        if (!value || !isScan) {
          if (hadBufferedInput) {
            event.preventDefault()
            event.stopPropagation()
          }
          return
        }
        event.preventDefault()
        event.stopPropagation()
        void onScanRef.current(value)
        return
      }

      if (event.key.length !== 1) return

      const now = performance.now()
      if (bufferRef.current.length > 0 && now - lastKeyAt.current > thresholdMs) {
        resetBuffer()
      }

      if (shouldSkipGlobalScanTarget(event.target, bufferRef.current.length, event.key)) return

      lastKeyAt.current = now
      burstCount.current += 1
      bufferRef.current += event.key
      event.preventDefault()
      event.stopPropagation()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      resetBuffer()
    }
  }, [enabled, thresholdMs, searchInputRef])
}

function shouldSkipGlobalScanTarget(
  target: EventTarget | null,
  bufferLen: number,
  key: string
): boolean {
  if (bufferLen > 0) return false
  if (shouldIgnoreShortcutTarget(target)) return true
  if (key === ' ' || key === 'Enter') {
    if (target instanceof HTMLElement && target.closest('button, a[href], [role="button"]')) return true
  }
  return false
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(handle)
  }, [value, delayMs])
  return debounced
}
