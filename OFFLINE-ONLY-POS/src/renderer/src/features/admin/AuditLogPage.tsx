import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { RequireRole } from '@/features/shell/Shell'
import { Select, Td, Th } from '@/components/ui'
import { DateRangePicker, presetToday } from '@/components/DateRangePicker'
import type { DateRange } from '@shared/types'

export function AuditLogPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <AuditLog />
    </RequireRole>
  )
}

function AuditLog(): React.JSX.Element {
  const { t } = useTranslation()
  const [range, setRange] = useState<DateRange>(presetToday())
  const [userId, setUserId] = useState<number | ''>('')

  const users = useQuery({ queryKey: ['auditUsers'], queryFn: api.audit.users })
  const log = useQuery({
    queryKey: ['audit', range, userId],
    queryFn: () =>
      api.audit.list({ range, userId: userId === '' ? undefined : Number(userId), limit: 500 })
  })

  const actionLabel = (action: string): string => {
    const key = `audit.actions.${action}`
    const translated = i18n.exists(key) ? t(key) : action
    return translated
  }

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('audit.title')}</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <DateRangePicker value={range} onChange={setRange} />
        <Select
          value={userId === '' ? '' : String(userId)}
          onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-52"
          aria-label={t('audit.user')}
        >
          <option value="">{t('audit.allUsers')}</option>
          {users.data?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <Th>{t('common.date')}</Th>
              <Th>{t('audit.user')}</Th>
              <Th>{t('audit.action')}</Th>
              <Th>{t('audit.entity')}</Th>
              <Th>{t('audit.detail')}</Th>
            </tr>
          </thead>
          <tbody>
            {log.data?.length === 0 && (
              <tr>
                <Td colSpan={5} className="py-6 text-center text-slate-500">
                  {t('common.noData')}
                </Td>
              </tr>
            )}
            {log.data?.map((row) => (
              <tr key={row.id}>
                <Td className="whitespace-nowrap">{formatDate(row.created_at, true)}</Td>
                <Td className="font-semibold">{row.username ?? '—'}</Td>
                <Td>{actionLabel(row.action)}</Td>
                <Td className="text-slate-500">
                  {row.entity ?? '—'}
                  {row.entity_id ? ` #${row.entity_id}` : ''}
                </Td>
                <Td className="text-slate-500">{row.detail ?? '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
