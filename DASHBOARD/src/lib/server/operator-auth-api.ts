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

const PRODUCTION_ORIGIN = 'https://shelfpos.net'

function getConfiguredDashboardOrigin(): string {
  const fromEnv =
    process.env.VITE_DASHBOARD_URL?.trim() ||
    process.env.DASHBOARD_PUBLIC_URL?.trim() ||
    ''
  if (fromEnv) return normalizeOrigin(fromEnv)
  if (process.env.VERCEL_ENV === 'production') return PRODUCTION_ORIGIN
  return ''
}

function getForwardedOrigin(request: Request): string {
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  if (!host) return ''
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https'
  const origin = normalizeOrigin(`${proto}://${host}`)
  return isLocalOrigin(origin) ? '' : origin
}

function pickDashboardOrigin(clientOrigin: string | undefined, request: Request): string {
  const candidates = [
    getConfiguredDashboardOrigin(),
    getForwardedOrigin(request),
    request.headers.get('origin') ?? '',
    clientOrigin?.trim() ?? '',
  ]
    .map(normalizeOrigin)
    .filter(Boolean)

  return candidates.find((candidate) => !isLocalOrigin(candidate)) ?? candidates[0] ?? ''
}

export function resolveDashboardRedirect(
  path: '/accept-invite' | '/reset-password',
  clientOrigin: string | undefined,
  request: Request,
): string {
  const picked = pickDashboardOrigin(clientOrigin, request)
  const configured = getConfiguredDashboardOrigin()

  let base = picked
  if (!base || isLocalOrigin(base)) {
    base = configured || (process.env.VERCEL_ENV === 'production' ? PRODUCTION_ORIGIN : '')
  }
  if (!base) base = 'http://localhost:3000'

  return `${normalizeOrigin(base)}${path}`
}
