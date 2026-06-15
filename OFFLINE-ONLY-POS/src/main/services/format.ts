import { formatColones } from '../../shared/money'
import type { Language } from '../../shared/types'

export function formatMoney(n: number, _lang: Language): string {
  return formatColones(n)
}

/** Formats a local 'YYYY-MM-DD[ HH:mm:ss]' string per locale, without Date parsing. */
export function formatDate(local: string, lang: Language, withTime = false): string {
  const [datePart, timePart] = local.split(' ')
  const [y, m, d] = datePart.split('-')
  const date = lang === 'zh-CN' ? `${y}年${m}月${d}日` : `${d}/${m}/${y}`
  if (withTime && timePart) return `${date} ${timePart.slice(0, 5)}`
  return date
}
