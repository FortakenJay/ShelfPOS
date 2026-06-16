import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { RequireRole } from '@/features/shell/Shell'
import { CashDrawerSummary } from './CashDrawerSummary'
import { CashMovementsPanel } from './CashMovementsPanel'

export function CashDrawerPage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales']}>
      <CashDrawer />
    </RequireRole>
  )
}

function CashDrawer(): React.JSX.Element {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({ queryKey: ['cashStatus'], queryFn: api.cash.status })

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">{t('nav.cash')}</h1>
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="h-64 animate-pulse rounded-lg border-2 border-line bg-white lg:col-span-2" />
            <div className="h-64 animate-pulse rounded-lg border-2 border-line bg-white lg:col-span-3" />
          </div>
        ) : (
          <CashMovementsPanel
            movements={data?.movements ?? []}
            floatOpened={data?.floatOpened ?? false}
            expectedCash={data?.expectedCash}
            canEdit
            sidebar={
              data?.floatOpened ? (
                <CashDrawerSummary summary={data} openedAt={data.openedAt} />
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  )
}
