import type { DateRange } from '../../shared/types'
import { roundColones } from '../../shared/money'

const pad = (n: number): string => String(n).padStart(2, '0')

/** Local wall-clock timestamp 'YYYY-MM-DD HH:mm:ss' (single-device app, no TZ juggling). */
export function localNow(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function todayLocal(): string {
  return localNow().slice(0, 10)
}

/** Local calendar date `YYYY-MM-DD` N days before today. */
export function daysAgoLocal(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function rangeBounds(range: DateRange): [string, string] {
  return [`${range.from} 00:00:00`, `${range.to} 23:59:59`]
}

/** Inclusive list of `YYYY-MM-DD` dates from `range.from` through `range.to`. */
export function daysInRange(range: DateRange): string[] {
  const days: string[] = []
  const cursor = new Date(`${range.from}T12:00:00`)
  const end = new Date(`${range.to}T12:00:00`)
  while (cursor <= end) {
    days.push(
      `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`
    )
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function round2(n: number): number {
  return roundColones(n)
}
