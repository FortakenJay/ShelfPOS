import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { formatDate, formatMoney } from '@/lib/format'
import type { CierreDiscrepancyAlert } from '@shared/types'

const DISMISSED_STORAGE_KEY = 'shelfpos-dismissed-cierre-discrepancies'

const dismissedListeners = new Set<() => void>()

function emitDismissedChange(): void {
  for (const listener of dismissedListeners) listener()
}

function subscribeDismissed(onChange: () => void): () => void {
  dismissedListeners.add(onChange)
  return () => dismissedListeners.delete(onChange)
}

function readDismissedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is number => typeof id === 'number'))
  } catch {
    return new Set()
  }
}

function dismissedSnapshot(): string {
  return localStorage.getItem(DISMISSED_STORAGE_KEY) ?? '[]'
}

function useDismissedCierreIds(): { dismissed: Set<number>; dismiss: (ids: number | number[]) => void } {
  const snapshot = useSyncExternalStore(subscribeDismissed, dismissedSnapshot, () => '[]')
  const dismissed = useMemo(() => readDismissedIds(), [snapshot])

  const dismiss = useCallback((ids: number | number[]) => {
    const list = Array.isArray(ids) ? ids : [ids]
    const next = new Set(dismissed)
    for (const id of list) next.add(id)
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...next]))
    emitDismissedChange()
  }, [dismissed])

  return { dismissed, dismiss }
}

function useCierreDiscrepancyAlerts(): {
  visible: CierreDiscrepancyAlert[]
  dismiss: (ids: number | number[]) => void
} {
  const { dismissed, dismiss } = useDismissedCierreIds()
  const { data: alerts } = useQuery({
    queryKey: ['cierreDiscrepancyAlerts'],
    queryFn: api.cierre.discrepancyAlerts,
    staleTime: 30_000,
    retry: false
  })

  const visible = useMemo(
    () => (alerts ?? []).filter((alert) => !dismissed.has(alert.id)),
    [alerts, dismissed]
  )

  return { visible, dismiss }
}

function alertMessage(t: (key: string, opts?: object) => string, alert: CierreDiscrepancyAlert): string {
  const amount = formatMoney(Math.abs(alert.cash_difference))
  const direction =
    alert.cash_difference > 0 ? t('cierre.discrepancyOver') : t('cierre.discrepancyShort')
  return t('cierre.discrepancyIncomplete', {
    date: formatDate(alert.closed_at, true),
    direction,
    amount
  })
}

function DismissButton({ onClick, label }: { onClick: () => void; label: string }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xl leading-none font-bold text-amber-900 hover:bg-amber-200/80"
    >
      ×
    </button>
  )
}

export function CierreDiscrepancyBanner(): React.JSX.Element | null {
  const { t } = useTranslation()
  const { visible, dismiss } = useCierreDiscrepancyAlerts()

  if (visible.length === 0) return null

  return (
    <div
      className="flex items-center justify-between gap-4 border-b-2 border-warning bg-amber-50 px-6 py-3 text-[15px] font-semibold text-amber-900"
      role="alert"
    >
      <span>{t('cierre.discrepancyBanner', { count: visible.length })}</span>
      <DismissButton
        label={t('common.close')}
        onClick={() => dismiss(visible.map((alert) => alert.id))}
      />
    </div>
  )
}

export function CierreDiscrepancyAlerts({
  className = ''
}: {
  className?: string
}): React.JSX.Element | null {
  const { t } = useTranslation()
  const { visible, dismiss } = useCierreDiscrepancyAlerts()

  if (visible.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`} role="alert">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-warning">
          {t('cierre.discrepancyAlertsTitle', { count: visible.length })}
        </h2>
        <DismissButton
          label={t('common.close')}
          onClick={() => dismiss(visible.map((alert) => alert.id))}
        />
      </div>
      {visible.map((alert) => (
        <div
          key={alert.id}
          className="relative rounded-lg border-2 border-warning bg-amber-50 py-3 pr-12 pl-4 text-[15px] text-amber-950"
        >
          <div className="absolute top-2 right-2">
            <DismissButton label={t('common.close')} onClick={() => dismiss(alert.id)} />
          </div>
          <p className="font-bold">{alertMessage(t, alert)}</p>
          <p className="mt-1 text-[14px]">
            {t('cierre.discrepancyBy', { user: alert.closed_by })}
            {' · '}
            {t('cierre.discrepancyDifference', {
              amount: formatMoney(alert.cash_difference)
            })}
            {' · '}
            {t('cash.countedCash')}: {formatMoney(alert.counted_cash)}
            {' · '}
            {t('cash.expectedCash')}: {formatMoney(alert.expected_cash)}
          </p>
        </div>
      ))}
    </div>
  )
}
