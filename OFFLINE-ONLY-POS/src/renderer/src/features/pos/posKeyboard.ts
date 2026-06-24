import { useEffect, type RefObject } from 'react'

export function isEditableElement(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

function shouldKeepSearchFocused(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return true
  if (target.closest('dialog[open]')) return false
  return !isEditableElement(target)
}

/**
 * Keeps the POS search field focused so barcode scanners and manual entry always
 * land in the search box after clicking cart, sidebar, or other non-input areas.
 */
export function usePosSearchFocus({
  enabled,
  searchInputRef
}: {
  enabled: boolean
  searchInputRef: RefObject<HTMLInputElement | null>
}): void {
  useEffect(() => {
    if (!enabled) return

    const focusSearch = (): void => {
      requestAnimationFrame(() => searchInputRef.current?.focus())
    }

    const onPointerDown = (event: PointerEvent): void => {
      if (!shouldKeepSearchFocused(event.target)) return
      focusSearch()
    }

    const onFocusOut = (event: FocusEvent): void => {
      const related = event.relatedTarget
      if (related instanceof HTMLElement && isEditableElement(related)) return
      if (related instanceof HTMLElement && related.closest('dialog[open]')) return
      focusSearch()
    }

    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('focusout', onFocusOut, true)
    focusSearch()

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('focusout', onFocusOut, true)
    }
  }, [enabled, searchInputRef])
}

/** Enter in a field should commit the value, not trigger a global POS action. */
export function commitEditableOnEnter(e: React.KeyboardEvent<HTMLElement>): void {
  if (e.key !== 'Enter') return
  e.preventDefault()
  e.stopPropagation()
  e.currentTarget.blur()
}

/** Enter anywhere on the POS screen: add/search product or open payment when search is empty. */
export function usePosEnterShortcut({
  enabled,
  query,
  searchInputRef,
  onSearchEnter,
  onCharge
}: {
  enabled: boolean
  query: string
  searchInputRef: RefObject<HTMLInputElement | null>
  onSearchEnter: () => void | Promise<void>
  onCharge: () => void
}): void {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Enter' || event.defaultPrevented) return
      if (event.target instanceof HTMLButtonElement) return
      if (event.target instanceof HTMLElement && event.target.closest('dialog[open]')) return

      const isSearchInput = event.target === searchInputRef.current
      const trimmed = isSearchInput
        ? (searchInputRef.current?.value ?? '').trim()
        : query.trim()

      if (isEditableElement(event.target) && !isSearchInput) return

      event.preventDefault()
      if (!trimmed) onCharge()
      else void onSearchEnter()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, query, searchInputRef, onSearchEnter, onCharge])
}
