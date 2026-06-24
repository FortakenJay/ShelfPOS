import type { EmailOtpType, SupabaseClient } from '@supabase/supabase-js'

function parseEmailOtpType(value: string): EmailOtpType | null {
  switch (value) {
    case 'signup':
    case 'invite':
    case 'magiclink':
    case 'recovery':
    case 'email_change':
    case 'email':
      return value
    default:
      return null
  }
}

function stripAuthParamsFromUrl(): void {
  window.history.replaceState({}, '', window.location.pathname)
}

/** True when the URL carries Supabase auth callback params from an invite/reset link. */
export function hasAuthCallbackInUrl(): boolean {
  const params = new URLSearchParams(window.location.search)
  if (params.get('code')) return true
  if (params.get('token_hash') && params.get('type')) return true
  const hash = window.location.hash
  return hash.includes('access_token') || hash.includes('error=')
}

export async function establishSessionFromAuthCallback(
  sb: SupabaseClient,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code)
    if (error) return { ok: false, error: error.message }
    stripAuthParamsFromUrl()
    return { ok: true }
  }

  const tokenHash = params.get('token_hash')
  const type = params.get('type')
  const otpType = type ? parseEmailOtpType(type) : null
  if (tokenHash && otpType) {
    const { error } = await sb.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    })
    if (error) return { ok: false, error: error.message }
    stripAuthParamsFromUrl()
    return { ok: true }
  }

  const hash = window.location.hash
  if (hash.includes('access_token') || hash.includes('error=')) {
    const { data, error } = await sb.auth.getSession()
    if (error) return { ok: false, error: error.message }
    if (data.session) {
      stripAuthParamsFromUrl()
      return { ok: true }
    }
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
    const desc = hashParams.get('error_description')
    if (desc) return { ok: false, error: desc }
  }

  const { data } = await sb.auth.getSession()
  if (data.session) return { ok: true }

  return { ok: false, error: 'missing_callback' }
}
