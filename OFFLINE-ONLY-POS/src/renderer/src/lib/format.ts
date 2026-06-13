import i18n from 'i18next'
import type { Language } from '@shared/types'

const CRC_MONEY_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'CRC',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
}

const moneyFormatterEs = new Intl.NumberFormat('es-CR', CRC_MONEY_OPTIONS)
const moneyFormatterZh = new Intl.NumberFormat('zh-CN', CRC_MONEY_OPTIONS)

function lang(): Language {
  return i18n.language === 'zh-CN' ? 'zh-CN' : 'es'
}

export function formatMoney(n: number): string {
  return (lang() === 'zh-CN' ? moneyFormatterZh : moneyFormatterEs).format(n)
}

/** Formats local 'YYYY-MM-DD[ HH:mm:ss]' strings: dd/mm/yyyy (es) or yyyy年mm月dd日 (zh-CN). */
export function formatDate(local: string, withTime = false): string {
  if (!local) return ''
  const [datePart, timePart] = local.split(' ')
  const [y, m, d] = datePart.split('-')
  const date = lang() === 'zh-CN' ? `${y}年${m}月${d}日` : `${d}/${m}/${y}`
  if (withTime && timePart) return `${date} ${timePart.slice(0, 5)}`
  return date
}

export function todayStr(): string {
  const d = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
