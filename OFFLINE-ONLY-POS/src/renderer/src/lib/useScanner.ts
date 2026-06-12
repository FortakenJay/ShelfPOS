import { useEffect, useRef, useState } from 'react'

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

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(handle)
  }, [value, delayMs])
  return debounced
}
