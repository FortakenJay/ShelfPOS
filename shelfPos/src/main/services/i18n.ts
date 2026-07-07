import es from '../../shared/locales/es.json'
import zh from '../../shared/locales/zh-CN.json'
import type { Language } from '../../shared/types'

/** Minimal translator for main-process print templates (same resources as the renderer). */
export function t(
  lang: Language,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict: unknown = lang === 'zh-CN' ? zh : es
  const value = key.split('.').reduce<unknown>((obj, k) => {
    if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k]
    return undefined
  }, dict)
  let str = typeof value === 'string' ? value : key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{{${k}}}`, String(v))
    }
  }
  return str
}
