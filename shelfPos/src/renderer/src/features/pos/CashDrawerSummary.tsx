import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import type { CashSummary } from '@shared/types'

function StatBox({ label, value, highlight = false }: {
  label: string
  value: string
  highlight?: boolean
}): React.JSX.Element {
  if (highlight) {
    return (
      <div className="rounded-md bg-chrome px-4 py-3 text-white">
        <div className="text-[13px] font-semibold text-slate-300">{label}</div>
        <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-line bg-slate-50 px-4 py-3">
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      <div className="text-[17px] font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  )
}

export function CashDrawerSummary({
  summary,
  expectedSinpe,
  className = ''
}: {
  summary: CashSummary
  expectedSinpe?: number
  className?: string
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <section className={`rounded-lg border-2 border-line bg-white p-5 ${className}`}>
      <h2 className="mb-3 text-lg font-bold">{t('cash.summaryTitle')}</h2>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label={t('cash.openingFloat')} value={formatMoney(summary.openingFloat)} />
        <StatBox label={t('cash.cashSales')} value={formatMoney(summary.cashSales)} />
        <StatBox label={t('cash.cashIn')} value={formatMoney(summary.cashIn)} />
        <StatBox label={t('cash.cashOut')} value={formatMoney(summary.cashOut)} />
      </div>

      <div
        className={`mt-4 grid gap-3 ${expectedSinpe != null ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        <StatBox
          label={t('cash.expectedCash')}
          value={formatMoney(summary.expectedCash)}
          highlight
        />
        {expectedSinpe != null && (
          <StatBox
            label={t('cierre.expectedSinpe')}
            value={formatMoney(expectedSinpe)}
            highlight={false}
          />
        )}
      </div>
    </section>
  )
}
