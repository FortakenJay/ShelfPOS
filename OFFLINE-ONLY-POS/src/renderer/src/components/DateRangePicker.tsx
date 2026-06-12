import { useTranslation } from 'react-i18next'
import { Button, Input } from './ui'
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
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1 // Monday-based
  return { from: shiftDays(now, -day), to: todayStr() }
}

export function presetMonth(): DateRange {
  const today = todayStr()
  return { from: today.slice(0, 8) + '01', to: today }
}

export function DateRangePicker({
  value,
  onChange
}: {
  value: DateRange
  onChange: (range: DateRange) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Button variant="outline" onClick={() => onChange(presetToday())}>
        {t('reports.presets.today')}
      </Button>
      <Button variant="outline" onClick={() => onChange(presetWeek())}>
        {t('reports.presets.week')}
      </Button>
      <Button variant="outline" onClick={() => onChange(presetMonth())}>
        {t('reports.presets.month')}
      </Button>
      <label className="ml-2">
        <span className="block text-[13px] font-semibold text-slate-600">{t('reports.from')}</span>
        <Input
          type="date"
          value={value.from}
          max={value.to}
          onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })}
          className="w-44"
        />
      </label>
      <label>
        <span className="block text-[13px] font-semibold text-slate-600">{t('reports.to')}</span>
        <Input
          type="date"
          value={value.to}
          min={value.from}
          onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })}
          className="w-44"
        />
      </label>
    </div>
  )
}
