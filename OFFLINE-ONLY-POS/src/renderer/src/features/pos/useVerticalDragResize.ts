import { useCallback, useRef, useState } from 'react'

export function useVerticalDragResize({
  initial,
  min,
  getMax
}: {
  initial: number
  min: number
  getMax: () => number
}): { height: number; onResizePointerDown: (e: React.PointerEvent<HTMLElement>) => void } {
  const [height, setHeight] = useState(initial)
  const getMaxRef = useRef(getMax)
  getMaxRef.current = getMax

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault()
      const handle = e.currentTarget
      handle.setPointerCapture(e.pointerId)
      const startY = e.clientY
      const startHeight = height

      const onMove = (ev: PointerEvent): void => {
        const next = startHeight + (ev.clientY - startY)
        const max = getMaxRef.current()
        setHeight(Math.min(max, Math.max(min, next)))
      }

      const onUp = (ev: PointerEvent): void => {
        handle.releasePointerCapture(ev.pointerId)
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onUp)
        handle.removeEventListener('pointercancel', onUp)
      }

      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onUp)
      handle.addEventListener('pointercancel', onUp)
    },
    [height, min]
  )

  return { height, onResizePointerDown }
}
