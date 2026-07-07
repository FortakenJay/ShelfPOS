import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import { parseCartTabSnapshot, snapshotTotal } from '@/lib/cartTabSnapshot'
import type { CartTabListItem } from '@shared/types'

interface CartTabsBarProps {
  tabs: CartTabListItem[]
  activeTabId: number | null
  activeTotal: number
  onSwitch: (id: number) => void
  onNew: () => void
  onClose: (id: number) => void
}

export function CartTabsBar({
  tabs,
  activeTabId,
  activeTotal,
  onSwitch,
  onNew,
  onClose
}: CartTabsBarProps): React.JSX.Element {
  const { t } = useTranslation()
  const singleTab = tabs.length <= 1

  return (
    <div className="flex shrink-0 items-stretch gap-1 overflow-x-auto border-b-2 border-line bg-slate-50 px-2 py-2">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId
        const label =
          tab.label?.trim() ||
          t('pos.cartTabs.defaultLabel', { n: tab.position })
        const switchShortcut =
          index < 8 ? t('pos.cartTabs.switchShortcut', { n: index + 1 }) : undefined
        const total = isActive
          ? activeTotal
          : snapshotTotal(parseCartTabSnapshot(tab.cartJson))

        return (
          <div
            key={tab.id}
            className={`flex min-w-0 shrink-0 items-stretch rounded-md border-2 ${
              isActive
                ? 'border-primary bg-white shadow-sm'
                : 'border-transparent bg-slate-100 hover:border-line'
            }`}
          >
            <button
              type="button"
              title={switchShortcut}
              className="flex min-w-[120px] max-w-[200px] flex-col items-start px-3 py-1.5 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
              onClick={() => onSwitch(tab.id)}
            >
              <span className="truncate text-[13px] font-semibold text-slate-800">{label}</span>
              <span className="text-[12px] font-bold text-primary">{formatMoney(total)}</span>
            </button>
            {!singleTab && (
              <button
                type="button"
                aria-label={t('pos.cartTabs.closeTab', { label })}
                className="flex w-8 shrink-0 items-center justify-center rounded-r-md text-slate-500 hover:bg-slate-200 hover:text-danger focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
                onClick={(event) => {
                  event.stopPropagation()
                  onClose(tab.id)
                }}
              >
                ×
              </button>
            )}
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="md"
        className="shrink-0 self-center px-3"
        onClick={onNew}
        title={t('pos.cartTabs.newTabHint')}
        aria-label={t('pos.cartTabs.newTabHint')}
      >
        +
      </Button>
    </div>
  )
}
