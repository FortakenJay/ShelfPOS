import { handle } from './helpers'
import { dashboardOverview } from '../db/repos/dashboard'
import type { DashboardOverview } from '../../shared/types'

export function registerDashboardHandlers(): void {
  handle<void, DashboardOverview>('dashboard:overview', ['admin'], () => dashboardOverview())
}
