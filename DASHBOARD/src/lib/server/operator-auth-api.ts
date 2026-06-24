export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function resolveDashboardRedirect(
  path: '/accept-invite' | '/reset-password',
  origin: string | undefined,
  request: Request,
): string {
  const base = (origin?.trim() || request.headers.get('origin') || '').replace(/\/$/, '')
  return base ? `${base}${path}` : path
}
