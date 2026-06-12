import type { DateRange } from '../../shared/types'

const pad = (n: number): string => String(n).padStart(2, '0')

/** Local wall-clock timestamp 'YYYY-MM-DD HH:mm:ss' (single-device app, no TZ juggling). */
export function localNow(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function todayLocal(): string {
  return localNow().slice(0, 10)
}

export function rangeBounds(range: DateRange): [string, string] {
  return [`${range.from} 00:00:00`, `${range.to} 23:59:59`]
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
