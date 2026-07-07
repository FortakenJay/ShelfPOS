import type { ReactNode } from 'react'

export type NavIconName =
  | 'pos'
  | 'cash'
  | 'reprints'
  | 'cierre'
  | 'printQueue'
  | 'products'
  | 'dashboard'
  | 'reports'
  | 'cashMovements'
  | 'users'
  | 'audit'
  | 'export'
  | 'settings'
  | 'logout'
  | 'panelExpand'
  | 'panelCollapse'
  | 'notifications'

const PATHS: Record<NavIconName, ReactNode> = {
  pos: (
    <>
      <path d="M4 7h16M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M6 11h12M8 15h2M14 15h2" />
      <rect x="4" y="7" width="16" height="13" rx="2" />
    </>
  ),
  cash: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7 10h.01M17 14h.01" />
    </>
  ),
  reprints: (
    <>
      <path d="M7 3h7l3 3v15H7V3z" />
      <path d="M14 3v4h4M9 12h6M9 16h4" />
    </>
  ),
  cierre: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M10 14h4" />
    </>
  ),
  printQueue: (
    <>
      <path d="M7 9V4h10v5M7 15H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="15" width="10" height="5" rx="1" />
      <path d="M9 12h6" />
    </>
  ),
  products: (
    <>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4z" />
      <path d="M12 11v10M4 7l8 4 8-4" />
    </>
  ),
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="4" rx="1.5" />
      <rect x="13" y="10" width="7" height="10" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  reports: (
    <>
      <path d="M5 19V9M12 19V5M19 19v-7" />
      <path d="M4 19h16" />
    </>
  ),
  cashMovements: (
    <>
      <path d="M7 7h10M7 12h6M7 17h8" />
      <path d="M5 4h14v16H5z" />
      <path d="M16 9l2 2-2 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 19c.3-2.2 1.8-4 4-4" />
    </>
  ),
  audit: (
    <>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-4-4H9z" />
      <path d="M13 5v4h4M9 13h6M9 17h4" />
    </>
  ),
  export: (
    <>
      <path d="M12 3v10M8 9l4 4 4-4" />
      <path d="M5 15v4h14v-4" />
    </>
  ),
  settings: (
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  ),
  logout: (
    <>
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 12H8M17 9l3 3-3 3" />
    </>
  ),
  panelExpand: <path d="M10 6l4 6-4 6" />,
  panelCollapse: <path d="M14 6l-4 6 4 6" />,
  notifications: (
    <>
      <path d="M12 4a5 5 0 0 1 5 5v4l2 2H5l2-2V9a5 5 0 0 1 5-5z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </>
  )
}

export function NavIcon({
  name,
  className = 'h-5 w-5'
}: {
  name: NavIconName
  className?: string
}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}
