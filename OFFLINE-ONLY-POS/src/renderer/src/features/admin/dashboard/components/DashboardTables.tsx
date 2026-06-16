import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { formatDate, formatMoney } from '@/lib/format'
import { Td, Th } from '@/components/ui'
import type {
  DashboardInventoryProductRow,
  DashboardOverview,
  DashboardProductPerformanceRow,
  DashboardStockStatus
} from '@shared/types'
import { DashboardCard, DashboardEmpty, FooterLink } from './DashboardPrimitives'
import { dashboardAlertProductSearch } from '../dashboardAlertSearch'
import { panelAlertSeverityClass } from '../dashboardAlertSeverity'

function StatusBadge({ status }: { status: DashboardStockStatus }): React.JSX.Element {
  const { t } = useTranslation()
  const styles: Record<DashboardStockStatus, string> = {
    healthy: 'bg-cta/10 text-cta',
    low: 'bg-amber-100 text-amber-900',
    critical: 'bg-danger/10 text-danger'
  }
  const key =
    status === 'critical' ? 'critical' : status === 'low' ? 'low' : 'healthy'
  return (
    <span className={`inline-block rounded-md px-2 py-1 text-[12px] font-bold ${styles[status]}`}>
      {t(`dashboard.stockStatus.${key}`)}
    </span>
  )
}

function ProductPerformanceTable({
  title,
  rows,
  showProfit = true
}: {
  title: string
  rows: DashboardProductPerformanceRow[]
  showProfit?: boolean
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <DashboardCard title={title}>
      {rows.length === 0 ? (
        <DashboardEmpty message={t('common.noData')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <Th>{t('products.name')}</Th>
                <Th className="text-right">{t('dashboard.topProducts.units')}</Th>
                <Th className="text-right">{t('dashboard.topProducts.revenue')}</Th>
                {showProfit && <Th className="text-right">{t('dashboard.topProducts.profit')}</Th>}
                <Th className="text-right">{t('products.stock')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.productId}>
                  <Td className="font-semibold">{row.name}</Td>
                  <Td className="text-right font-bold">{row.unitsSold}</Td>
                  <Td className="text-right">{formatMoney(row.revenue)}</Td>
                  {showProfit && (
                    <Td className="text-right">{formatMoney(row.profit)}</Td>
                  )}
                  <Td className="text-right">{row.stock}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  )
}

function InventoryProductTable({
  title,
  rows,
  footerTo,
  footerLabel,
  footerSearch
}: {
  title: string
  rows: DashboardInventoryProductRow[]
  footerTo?: string
  footerLabel?: string
  footerSearch?: Record<string, string>
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <DashboardCard title={title}>
      {rows.length === 0 ? (
        <DashboardEmpty message={t('common.noData')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr>
                <Th>{t('products.name')}</Th>
                <Th>{t('dashboard.lowStock.sku')}</Th>
                <Th className="text-right">{t('products.stock')}</Th>
                <Th>{t('dashboard.lowStock.status')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.productId}>
                  <Td className="font-semibold">{row.name}</Td>
                  <Td className="font-mono text-[13px]">{row.sku}</Td>
                  <Td className="text-right font-bold">{row.stock}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footerTo && footerLabel && (
        <FooterLink to={footerTo} label={footerLabel} search={footerSearch} />
      )}
    </DashboardCard>
  )
}

export function ProductAnalyticsTables({ data }: { data: DashboardOverview }): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ProductPerformanceTable title={t('dashboard.topProducts.title')} rows={data.topProducts} />
      <ProductPerformanceTable title={t('dashboard.slowProducts.title')} rows={data.slowProducts} />
      <ProductPerformanceTable title={t('dashboard.worstSellers.title')} rows={data.worstSellers} />
      <ProductPerformanceTable
        title={t('dashboard.recentProducts.title')}
        rows={data.recentlyAddedProducts}
        showProfit={false}
      />
    </div>
  )
}

export function InventoryManagementSection({ data }: { data: DashboardOverview }): React.JSX.Element {
  const { t } = useTranslation()
  const inv = data.inventory

  const summary = [
    [t('dashboard.inventory.totalProducts'), String(inv.totalProducts)],
    [t('dashboard.inventory.activeProducts'), String(inv.activeProducts)],
    [t('dashboard.inventory.lowStock'), String(inv.lowStock)],
    [t('dashboard.inventory.outOfStock'), String(inv.outOfStock)],
    [t('dashboard.inventory.costValue'), formatMoney(inv.costValue)],
    [t('dashboard.inventory.retailValue'), formatMoney(inv.retailValue)]
  ] as const

  return (
    <div className="space-y-4">
      <DashboardCard title={t('dashboard.inventory.title')}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {summary.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 px-3 py-3">
              <p className="text-[12px] font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-[18px] font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
        <FooterLink to="/products" label={t('dashboard.viewAllProducts')} />
      </DashboardCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <InventoryProductTable
          title={t('dashboard.lowStock.title')}
          rows={data.lowStockProducts}
          footerTo="/products"
          footerLabel={t('dashboard.viewAllLowStock')}
          footerSearch={{ stock: 'low' }}
        />
        <InventoryProductTable
          title={t('dashboard.outOfStock.title')}
          rows={data.outOfStockProducts}
          footerTo="/products"
          footerLabel={t('dashboard.viewOutOfStock')}
          footerSearch={{ stock: 'zero' }}
        />
      </div>

      <InventoryProductTable
        title={t('dashboard.recentInventory.title')}
        rows={data.recentlyUpdatedInventory}
        footerTo="/products"
        footerLabel={t('dashboard.viewAllProducts')}
      />
    </div>
  )
}

export function EmployeeSection({ data }: { data: DashboardOverview }): React.JSX.Element {
  const { t } = useTranslation()
  const emp = data.employees

  return (
    <div className="space-y-4">
      <DashboardCard title={t('dashboard.employees.overview')}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-3">
            <p className="text-[12px] font-semibold text-slate-500">{t('dashboard.employees.total')}</p>
            <p className="mt-1 text-2xl font-bold">{emp.totalEmployees}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-3">
            <p className="text-[12px] font-semibold text-slate-500">{t('dashboard.employees.active')}</p>
            <p className="mt-1 text-2xl font-bold">{emp.activeEmployees}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-3">
            <p className="text-[12px] font-semibold text-slate-500">{t('dashboard.employees.roles')}</p>
            <ul className="mt-2 space-y-1 text-[14px] font-semibold">
              {emp.roleCounts.map((r) => (
                <li key={r.role}>
                  {t(`roles.${r.role}`)}: {r.count}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardCard title={t('dashboard.employees.performance')}>
          {data.employeePerformance.length === 0 ? (
            <DashboardEmpty message={t('common.noData')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th>{t('dashboard.employees.name')}</Th>
                  <Th className="text-right">{t('dashboard.employees.transactions')}</Th>
                  <Th className="text-right">{t('dashboard.employees.volume')}</Th>
                  <Th className="text-right">{t('dashboard.employees.avgTicket')}</Th>
                </tr>
              </thead>
              <tbody>
                {data.employeePerformance.map((row) => (
                  <tr key={row.userId}>
                    <Td>
                      <span className="font-semibold">{row.username}</span>
                      <span className="ml-2 text-[12px] text-slate-400">{t(`roles.${row.role}`)}</span>
                    </Td>
                    <Td className="text-right">{row.transactions}</Td>
                    <Td className="text-right">{formatMoney(row.salesVolume)}</Td>
                    <Td className="text-right">{formatMoney(row.avgTicket)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DashboardCard>

        <DashboardCard title={t('dashboard.employees.rolesAccess')}>
          <ul className="space-y-3">
            {data.roleSummaries.map((role) => (
              <li key={role.role} className="rounded-lg border-2 border-line px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{t(`roles.${role.role}`)}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[13px] font-bold text-primary">
                    {role.count}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-slate-500">{t(role.descriptionKey)}</p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <DashboardCard title={t('dashboard.employees.recentActivity')}>
        {data.recentEmployeeActivity.length === 0 ? (
          <DashboardEmpty message={t('common.noData')} />
        ) : (
          <ul className="divide-y divide-line">
            {data.recentEmployeeActivity.map((row) => (
              <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3">
                <div>
                  <p className="text-[14px] font-semibold">
                    {t(`audit.actions.${row.action}`, { defaultValue: row.action })}
                  </p>
                  <p className="text-[13px] text-slate-500">
                    {row.username ?? '—'}
                    {row.detail ? ` · ${row.detail}` : ''}
                  </p>
                </div>
                <time className="text-[12px] text-slate-400">{formatDate(row.created_at, true)}</time>
              </li>
            ))}
          </ul>
        )}
        <FooterLink to="/admin/audit" label={t('dashboard.viewAudit')} />
      </DashboardCard>
    </div>
  )
}

export function ActivityAlertsSection({ data }: { data: DashboardOverview }): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <DashboardCard title={t('dashboard.activity.title')}>
        {data.recentActivity.length === 0 ? (
          <DashboardEmpty message={t('common.noData')} />
        ) : (
          <ul className="divide-y divide-line">
            {data.recentActivity.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3">
                <div>
                  <p className="text-[14px] font-semibold">
                    {t(item.messageKey, { defaultValue: item.messageKey })}
                    {item.kind === 'sale' && item.detail ? ` · ${formatMoney(Number(item.detail))}` : ''}
                  </p>
                  <p className="text-[13px] text-slate-500">
                    {item.username ?? '—'}
                    {item.kind !== 'sale' && item.detail ? ` · ${item.detail}` : ''}
                  </p>
                </div>
                <time className="text-[12px] text-slate-400">{formatDate(item.createdAt, true)}</time>
              </li>
            ))}
          </ul>
        )}
        <FooterLink to="/admin/audit" label={t('dashboard.viewAudit')} />
      </DashboardCard>

      <DashboardCard title={t('dashboard.alerts.title')} id="alerts">
        {data.alerts.length === 0 ? (
          <DashboardEmpty message={t('dashboard.alerts.none')} />
        ) : (
          <ul className="space-y-2">
            {data.alerts.map((alert) => (
              <li key={alert.kind}>
                {alert.linkTo ? (
                  <Link
                    to={alert.linkTo}
                    search={dashboardAlertProductSearch(alert)}
                    className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 ${panelAlertSeverityClass(alert.severity)}`}
                  >
                    <span className="text-[14px] font-semibold">
                      {t(alert.messageKey, { count: alert.count })}
                    </span>
                    <span className="font-bold">{alert.count}</span>
                  </Link>
                ) : (
                  <div className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 ${panelAlertSeverityClass(alert.severity)}`}>
                    <span className="font-semibold">{t(alert.messageKey, { count: alert.count })}</span>
                    <span className="font-bold">{alert.count}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  )
}

export function TaxSummarySection({ data }: { data: DashboardOverview }): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <DashboardCard title={t('dashboard.tax.title')}>
      <p className="mb-3 text-[13px] text-slate-500">
        {t('reports.tax.regime')}: {t(`tax.regime.${data.taxSummary.regime}`)}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t('dashboard.tax.taxable'), formatMoney(data.taxableSales)],
          [t('dashboard.tax.exempt'), formatMoney(data.exemptSales)],
          [t('dashboard.tax.ivaCollected'), formatMoney(data.taxSummary.totalIva)],
          [t('dashboard.tax.monthlyLiability'), formatMoney(data.taxSummary.totalIva)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-3 py-3">
            <p className="text-[12px] font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-[18px] font-bold">{value}</p>
          </div>
        ))}
      </div>
      <FooterLink to="/admin/reports" label={t('dashboard.viewTaxReport')} search={{ type: 'taxBreakdown', period: 'month' }} />
    </DashboardCard>
  )
}
