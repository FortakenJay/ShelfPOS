import { useTranslation } from 'react-i18next'
import type { DashboardOverview } from '@shared/types'
import { KpiCard } from './DashboardPrimitives'

export function KpiOverview({ kpis }: { kpis: DashboardOverview['kpis'] }): React.JSX.Element {
  const { t } = useTranslation()

  const cards = [
    {
      label: t('dashboard.kpis.todaySales'),
      trend: kpis.todaySales,
      money: true,
      linkTo: '/admin/reports',
      search: { type: 'summary', period: 'today' }
    },
    {
      label: t('dashboard.kpis.monthlySales'),
      trend: kpis.monthlySales,
      money: true,
      linkTo: '/admin/reports',
      search: { type: 'summary', period: 'month' }
    },
    {
      label: t('dashboard.kpis.todayTransactions'),
      trend: kpis.todayTransactions,
      linkTo: '/admin/reports',
      search: { type: 'summary', period: 'today' }
    },
    {
      label: t('dashboard.kpis.avgTicket'),
      trend: kpis.avgTicketToday,
      money: true,
      linkTo: '/admin/reports',
      search: { type: 'summary', period: 'today' }
    },
    {
      label: t('dashboard.kpis.grossProfit'),
      trend: kpis.grossProfitToday,
      money: true,
      linkTo: '/admin/reports',
      search: { type: 'topProducts', period: 'today' }
    },
    {
      label: t('dashboard.kpis.totalProducts'),
      trend: kpis.totalProducts,
      linkTo: '/products'
    },
    {
      label: t('dashboard.kpis.lowStockAlerts'),
      trend: kpis.lowStockAlerts,
      invertTrend: true,
      linkTo: '/products',
      search: { stock: 'low' }
    },
    {
      label: t('dashboard.kpis.outOfStock'),
      trend: kpis.outOfStock,
      invertTrend: true,
      linkTo: '/products',
      search: { stock: 'zero' }
    }
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
      {cards.map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          trend={card.trend}
          money={'money' in card ? card.money : undefined}
          invertTrend={'invertTrend' in card ? card.invertTrend : undefined}
          linkTo={card.linkTo}
          search={'search' in card ? card.search : undefined}
        />
      ))}
    </div>
  )
}
