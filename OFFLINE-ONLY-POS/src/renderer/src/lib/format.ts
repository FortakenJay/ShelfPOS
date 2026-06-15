import i18n from 'i18next'
import { formatColones } from '@shared/money'

export { formatGroupedInteger } from '@shared/money'

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

/** Parse cash typed in the UI (supports spaces or dots as thousands, e.g. 10 980 or 10.980). */
export function parseColonesInput(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '')
  if (!s) return null
  if (/^\d+$/.test(s)) {
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  const normalized = s.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) && n >= 0 ? n : null
}
