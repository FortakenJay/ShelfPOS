import { useEffect, useRef, useState, type RefObject } from 'react'
import { shouldIgnoreShortcutTarget } from './shortcuts'

function isWedgeScan(
  valueLength: number,
  burstCount: number,
  thresholdMs: number,
  firstKeyAt: number,
): boolean {
  if (valueLength < 4) return false
  if (burstCount >= valueLength - 1) return true
  const elapsed = performance.now() - firstKeyAt
  const maxElapsed = valueLength * thresholdMs * 2.5
  return burstCount >= 2 && elapsed > 0 && elapsed <= maxElapsed
}

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
  const firstKeyAt = useRef(0)

  return {
    onKeyDown: (e: React.KeyboardEvent): void => {
      if (e.key.length !== 1) return
      const now = performance.now()
      if (now - lastKeyAt.current > thresholdMs) {
        burstCount.current = 1
        firstKeyAt.current = now
      } else {
        burstCount.current += 1
      }
      lastKeyAt.current = now
    },
    consumeIsScan: (valueLength: number): boolean => {
      const isScan = isWedgeScan(valueLength, burstCount.current, thresholdMs, firstKeyAt.current)
      burstCount.current = 0
      firstKeyAt.current = 0
      return isScan
    },
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
  onScan,
  onIncompleteScan,
}: {
  enabled: boolean
  thresholdMs: number
  searchInputRef: RefObject<HTMLInputElement | null>
  onScan: (barcode: string) => void | Promise<void>
  onIncompleteScan?: () => void
}): void {
  const bufferRef = useRef('')
  const lastKeyAt = useRef(0)
  const firstKeyAt = useRef(0)
  const burstCount = useRef(0)
  const onScanRef = useRef(onScan)
  const onIncompleteScanRef = useRef(onIncompleteScan)

  useEffect(() => {
    onScanRef.current = onScan
  })

  useEffect(() => {
    onIncompleteScanRef.current = onIncompleteScan
  })

  useEffect(() => {
    if (!enabled) {
      bufferRef.current = ''
      burstCount.current = 0
      firstKeyAt.current = 0
      return
    }

    const resetBuffer = (): void => {
      bufferRef.current = ''
      burstCount.current = 0
      firstKeyAt.current = 0
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (event.target === searchInputRef.current) return

      if (event.key === 'Enter') {
        const value = bufferRef.current.trim()
        const isScan = isWedgeScan(value.length, burstCount.current, thresholdMs, firstKeyAt.current)
        const hadBufferedInput = value.length > 0
        resetBuffer()
        if (!value || !isScan) {
          if (hadBufferedInput) {
            event.preventDefault()
            event.stopPropagation()
            onIncompleteScanRef.current?.()
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

      if (bufferRef.current.length === 0) {
        firstKeyAt.current = now
      }
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
  key: string,
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
