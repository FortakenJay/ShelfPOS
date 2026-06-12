import type { Language } from '../../shared/types'

export function formatMoney(n: number, lang: Language): string {
  return new Intl.NumberFormat(lang === 'zh-CN' ? 'zh-CN' : 'es-CR', {
    style: 'currency',
    currency: 'CRC',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(n)
}

/** Formats a local 'YYYY-MM-DD[ HH:mm:ss]' string per locale, without Date parsing. */
export function formatDate(local: string, lang: Language, withTime = false): string {
  const [datePart, timePart] = local.split(' ')
  const [y, m, d] = datePart.split('-')
  const date = lang === 'zh-CN' ? `${y}年${m}月${d}日` : `${d}/${m}/${y}`
  if (withTime && timePart) return `${date} ${timePart.slice(0, 5)}`
  return date
}
