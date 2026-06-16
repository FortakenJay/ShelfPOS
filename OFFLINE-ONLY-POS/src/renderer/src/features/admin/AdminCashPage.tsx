import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { RequireRole } from '@/features/shell/Shell'
import { DateRangePicker } from '@/components/DateRangePicker'
import { presetToday } from '@/components/dateRangePresets'
import { CashMovementsPanel } from '@/features/pos/CashMovementsPanel'
import type { DateRange } from '@shared/types'

export function AdminCashPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <AdminCash />
    </RequireRole>
  )
}

function AdminCash(): React.JSX.Element {
  const { t } = useTranslation()
  const [range, setRange] = useState<DateRange>(() => presetToday())

  const { data: movements } = useQuery({
    queryKey: ['cashMovements', range],
    queryFn: () => api.cash.listMovements(range)
  })

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">{t('cash.adminTitle')}</h1>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <DateRangePicker value={range} onChange={setRange} />
        </div>
        <CashMovementsPanel movements={movements ?? []} floatOpened={false} canEdit={false} />
      </div>
    </div>
  )
}
