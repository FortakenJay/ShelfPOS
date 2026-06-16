import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { DashboardAlert } from '@shared/types'
import { dashboardAlertProductSearch } from '../dashboardAlertSearch'
import { notificationAlertSeverityClass } from '../dashboardAlertSeverity'

type NotificationsCenterProps = {
  alerts: DashboardAlert[]
  variant?: 'sidebar' | 'inline'
}

function positionDialogNearTrigger(
  dialog: HTMLDialogElement,
  trigger: HTMLButtonElement
): void {
  const rect = trigger.getBoundingClientRect()
  dialog.style.position = 'fixed'
  dialog.style.top = `${rect.bottom + 6}px`
  dialog.style.left = `${rect.left}px`
  dialog.style.width = `${Math.max(rect.width, 288)}px`
  dialog.style.margin = '0'
  dialog.style.maxWidth = 'calc(100vw - 1rem)'
}

export function NotificationsCenter({
  alerts,
  variant = 'inline'
}: NotificationsCenterProps): React.JSX.Element {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const count = alerts.reduce((sum, a) => sum + a.count, 0)
  const isSidebar = variant === 'sidebar'

  const closeMenu = (): void => {
    dialogRef.current?.close()
  }

  const openMenu = (): void => {
    const dialog = dialogRef.current
    const trigger = triggerRef.current
    if (!dialog || !trigger) return
    if (isSidebar) positionDialogNearTrigger(dialog, trigger)
    if (!dialog.open) dialog.show()
    setOpen(true)
  }

  const toggleMenu = (): void => {
    if (dialogRef.current?.open) closeMenu()
    else openMenu()
  }

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent): void => {
      const dialog = dialogRef.current
      const trigger = triggerRef.current
      if (!dialog?.open) return

      const target = event.target
      if (!(target instanceof Node)) return
      if (dialog.contains(target) || trigger?.contains(target)) return

      closeMenu()
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const triggerClass = isSidebar
    ? 'relative flex w-full items-center justify-between rounded-md border border-slate-600 px-4 py-2.5 text-[14px] font-semibold text-slate-200 hover:border-slate-500 hover:bg-chrome-light hover:text-white'
    : 'relative rounded-lg border-2 border-line bg-white px-3 py-2 text-[14px] font-semibold text-slate-700 hover:border-primary'

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="dashboard-notifications-dialog"
      >
        <span>{t('dashboard.notifications.title')}</span>
        {count > 0 && (
          <span
            className={`inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1.5 py-0.5 text-[11px] font-bold text-white ${isSidebar ? '' : 'ml-2'}`}
          >
            {count}
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        id="dashboard-notifications-dialog"
        aria-label={t('dashboard.notifications.title')}
        className="z-100 max-h-[min(24rem,calc(100vh-5rem))] overflow-y-auto rounded-xl border-2 border-line bg-white p-3 shadow-xl open:fixed"
        onClose={() => setOpen(false)}
      >
        {alerts.length === 0 ? (
          <p className="px-2 py-4 text-center text-[14px] text-slate-500">
            {t('dashboard.alerts.none')}
          </p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li key={alert.kind}>
                {alert.linkTo ? (
                  <Link
                    to={alert.linkTo}
                    search={dashboardAlertProductSearch(alert)}
                    onClick={closeMenu}
                    className={`flex items-center justify-between rounded-lg border-2 px-3 py-2.5 ${notificationAlertSeverityClass(alert.severity)}`}
                  >
                    <span className="text-[13px] font-semibold">
                      {t(alert.messageKey, { count: alert.count })}
                    </span>
                    <span className="font-bold">{alert.count}</span>
                  </Link>
                ) : (
                  <div
                    className={`flex items-center justify-between rounded-lg border-2 px-3 py-2.5 ${notificationAlertSeverityClass(alert.severity)}`}
                  >
                    <span className="text-[13px] font-semibold">
                      {t(alert.messageKey, { count: alert.count })}
                    </span>
                    <span className="font-bold">{alert.count}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 border-t border-line pt-2 text-center">
          <Link
            to="/admin/dashboard"
            search={{ tab: 'home' }}
            hash="alerts"
            onClick={closeMenu}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            {t('dashboard.viewAllAlerts')}
          </Link>
        </div>
      </dialog>
    </div>
  )
}
