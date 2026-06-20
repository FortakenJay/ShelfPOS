import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import type { DashboardKpiTrend } from '@shared/types'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'

export function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  id
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}): React.JSX.Element {
  return (
    <section
      id={id}
      className={`min-w-0 rounded-xl border-2 border-line bg-white p-5 shadow-sm hover:border-slate-300 ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function DashboardEmpty({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="flex min-h-[100px] items-center justify-center rounded-lg bg-slate-50 px-4 py-8 text-center text-[15px] text-slate-500">
      {message}
    </div>
  )
}

export function SectionHeading({
  title,
  description
}: {
  title: string
  description?: string
}): React.JSX.Element {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-[14px] text-slate-500">{description}</p>}
    </div>
  )
}

export function TrendBadge({
  trend,
  money = false,
  invert = false
}: {
  trend: DashboardKpiTrend
  money?: boolean
  invert?: boolean
}): React.JSX.Element {
  const { t } = useTranslation()
  const display = money ? formatMoney(trend.value) : String(trend.value)
  const hasTrend = trend.changePct != null
  const positive = trend.changePct != null && trend.changePct >= 0
  const trendGood = invert ? !positive : positive

  return (
    <div>
      <p className="text-2xl font-extrabold tracking-tight text-slate-900">{display}</p>
      {hasTrend && (
        <p className={`mt-2 text-[13px] font-bold ${trendGood ? 'text-cta' : 'text-danger'}`}>
          {positive ? '▲' : '▼'} {Math.abs(trend.changePct!)}% {t('dashboard.vsPrevious')}
        </p>
      )}
      {invert && trend.value > 0 && (
        <p className="mt-1 text-[12px] font-bold text-danger">{t('dashboard.kpis.needsAttention')}</p>
      )}
    </div>
  )
}

export function KpiCard({
  label,
  trend,
  money = false,
  invertTrend = false,
  linkTo,
  search
}: {
  label: string
  trend: DashboardKpiTrend
  money?: boolean
  invertTrend?: boolean
  linkTo?: string
  search?: Record<string, string>
}): React.JSX.Element {
  const body = (
    <div className="rounded-xl border-2 border-line bg-white p-4 shadow-sm">
      <p className="text-[13px] font-semibold text-slate-500">{label}</p>
      <div className="mt-2">
        <TrendBadge trend={trend} money={money} invert={invertTrend} />
      </div>
    </div>
  )

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        search={search}
        className="block hover:[&>div]:border-primary"
      >
        {body}
      </Link>
    )
  }

  return body
}

export function FooterLink({
  to,
  label,
  search
}: {
  to: string
  label: string
  search?: Record<string, string>
}): React.JSX.Element {
  return (
    <div className="mt-4 border-t border-line pt-3 text-right">
      <Link to={to} search={search} className="text-[14px] font-semibold text-primary hover:underline">
        {label}
      </Link>
    </div>
  )
}
