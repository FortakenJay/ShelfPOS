import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { RequireRole } from '@/features/shell/Shell'
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
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['cashStatus'], queryFn: api.cash.status })

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('cash.title')}</h1>
      <CashMovementsPanel
        movements={data?.movements ?? []}
        floatOpened={data?.floatOpened ?? false}
        canEdit
        onMovementComplete={() => void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })}
      />
    </div>
  )
}
