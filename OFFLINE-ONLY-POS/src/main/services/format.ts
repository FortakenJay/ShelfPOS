import type { Language } from '../../shared/types'

const CRC_MONEY_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'CRC',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
}

const moneyFormatterEs = new Intl.NumberFormat('es-CR', CRC_MONEY_OPTIONS)
const moneyFormatterZh = new Intl.NumberFormat('zh-CN', CRC_MONEY_OPTIONS)

export function formatMoney(n: number, lang: Language): string {
  return (lang === 'zh-CN' ? moneyFormatterZh : moneyFormatterEs).format(n)
}

/** Formats a local 'YYYY-MM-DD[ HH:mm:ss]' string per locale, without Date parsing. */
export function formatDate(local: string, lang: Language, withTime = false): string {
  const [datePart, timePart] = local.split(' ')
  const [y, m, d] = datePart.split('-')
  const date = lang === 'zh-CN' ? `${y}年${m}月${d}日` : `${d}/${m}/${y}`
  if (withTime && timePart) return `${date} ${timePart.slice(0, 5)}`
  return date
}
