import type { ActionShortcutKey } from '@shared/types'

export function eventToShortcutKey(event: KeyboardEvent): ActionShortcutKey | null {
  const key = event.key.toUpperCase()
  if (!/^F([1-9]|1[0-2])$/.test(key)) return null
  return key as ActionShortcutKey
}

export function shouldIgnoreShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.closest('dialog[open]')) return true
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}
