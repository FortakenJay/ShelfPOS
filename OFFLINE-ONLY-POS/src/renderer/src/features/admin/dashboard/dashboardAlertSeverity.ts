import type { DashboardAlert } from '@shared/types'

/** Dropdown / compact alert rows (NotificationsCenter). */
export function notificationAlertSeverityClass(severity: DashboardAlert['severity']): string {
  if (severity === 'danger') return 'border-danger/30 bg-red-50'
  if (severity === 'warning') return 'border-warning/30 bg-amber-50'
  return 'border-line bg-slate-50'
}

/** Full-width alert cards on the dashboard panel. */
export function panelAlertSeverityClass(severity: DashboardAlert['severity']): string {
  if (severity === 'danger') return 'border-danger/40 bg-red-50'
  if (severity === 'warning') return 'border-warning/40 bg-amber-50'
  return 'border-line bg-slate-50'
}
