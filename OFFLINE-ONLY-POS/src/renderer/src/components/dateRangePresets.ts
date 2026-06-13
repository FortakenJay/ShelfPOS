import { todayStr } from '@/lib/format'
import type { DateRange } from '@shared/types'

function shiftDays(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function presetToday(): DateRange {
  const today = todayStr()
  return { from: today, to: today }
}

export function presetWeek(): DateRange {
  const now = new Date()
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1
  return { from: shiftDays(now, -day), to: todayStr() }
}

export function presetMonth(): DateRange {
  const today = todayStr()
  return { from: today.slice(0, 8) + '01', to: today }
}
