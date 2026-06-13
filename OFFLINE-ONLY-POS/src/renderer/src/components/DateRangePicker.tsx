import { useTranslation } from 'react-i18next'
import { Button, Input } from './ui'
import { presetMonth, presetToday, presetWeek } from './dateRangePresets'
import type { DateRange } from '@shared/types'

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
