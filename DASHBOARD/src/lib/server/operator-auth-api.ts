export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, '')
}

function isLocalOrigin(value: string): boolean {
  try {
    const { hostname } = new URL(value)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

/** Real users receive these links by email — never localhost unless explicitly configured. */
export const PRODUCTION_DASHBOARD_ORIGIN = 'https://shelfpos.net'

function getConfiguredDashboardOrigin(): string {
  const fromEnv =
    process.env.VITE_DASHBOARD_URL?.trim() ||
    process.env.DASHBOARD_PUBLIC_URL?.trim() ||
    ''
  if (fromEnv) return normalizeOrigin(fromEnv)
  return PRODUCTION_DASHBOARD_ORIGIN
}

function getForwardedOrigin(request: Request): string {
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  if (!host) return ''
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  const origin = normalizeOrigin(`${proto}://${host}`)
  return isLocalOrigin(origin) ? '' : origin
}

/** Absolute URL for Supabase invite/reset emails. Never falls back to localhost. */
export function resolveDashboardRedirect(
  path: '/accept-invite' | '/reset-password',
  _clientOrigin: string | undefined,
  request: Request,
): string {
  let base = getConfiguredDashboardOrigin()
  if (isLocalOrigin(base)) {
    base = getForwardedOrigin(request) || PRODUCTION_DASHBOARD_ORIGIN
  }
  if (!base || isLocalOrigin(base)) base = PRODUCTION_DASHBOARD_ORIGIN
  return `${normalizeOrigin(base)}${path}`
}
