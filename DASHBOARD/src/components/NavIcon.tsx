import type { ReactNode } from 'react'

export type NavIconName =
  | 'dashboard'
  | 'reports'
  | 'cierre'
  | 'cashMovements'
  | 'audit'
  | 'link'
  | 'logout'
  | 'panelExpand'
  | 'panelCollapse'

const PATHS: Record<NavIconName, ReactNode> = {
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
  cierre: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M10 14h4" />
    </>
  ),
  cashMovements: (
    <>
      <path d="M7 7h10M7 12h6M7 17h8" />
      <path d="M5 4h14v16H5z" />
      <path d="M16 9l2 2-2 2" />
    </>
  ),
  audit: (
    <>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-4-4H9z" />
      <path d="M13 5v4h4M9 13h6M9 17h4" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 12H8M17 9l3 3-3 3" />
    </>
  ),
  panelExpand: <path d="M10 6l4 6-4 6" />,
  panelCollapse: <path d="M14 6l-4 6 4 6" />,
}

export function NavIcon({
  name,
  className = 'h-5 w-5',
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
