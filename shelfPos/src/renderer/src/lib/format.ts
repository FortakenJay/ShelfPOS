import i18n from 'i18next'
import { formatColones } from '@shared/money'

export { formatGroupedInteger, parseLocalizedMoneyInput } from '@shared/money'

export function formatMoney(n: number): string {
  void i18n.language
  return formatColones(n)
}

/** Formats local 'YYYY-MM-DD[ HH:mm:ss]' strings: dd/mm/yyyy (es) or yyyy年mm月dd日 (zh-CN). */
export function formatDate(local: string, withTime = false): string {
  if (!local) return ''
  const [datePart, timePart] = local.split(' ')
  const [y, m, d] = datePart.split('-')
  const date = i18n.language === 'zh-CN' ? `${y}年${m}月${d}日` : `${d}/${m}/${y}`
  if (withTime && timePart) return `${date} ${timePart.slice(0, 5)}`
  return date
}

export function todayStr(): string {
  const d = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
