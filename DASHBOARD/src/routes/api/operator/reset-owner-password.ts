import { createFileRoute } from '@tanstack/react-router'
import { createSupabaseAdmin } from '#/lib/server/supabase-admin'
import {
  isValidEmail,
  normalizeEmail,
  resolveDashboardRedirect,
} from '#/lib/server/operator-auth-api'
import { operatorInviteConfigured } from '#/lib/server-env'
import { verifySuperadminFromRequest } from '#/lib/server/verify-superadmin'

interface ResetBody {
  email?: string
  sendEmail?: boolean
  redirectOrigin?: string
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status })
}

export const Route = createFileRoute('/api/operator/reset-owner-password')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!operatorInviteConfigured()) {
          return json({ error: 'secret_key_not_configured' }, 503)
        }

        const auth = await verifySuperadminFromRequest(request)
        if (!auth.ok) {
          return json({ error: auth.message }, auth.status)
        }

        let body: ResetBody
        try {
          body = (await request.json()) as ResetBody
        } catch {
          return json({ error: 'invalid_input' }, 400)
        }

        const email = normalizeEmail(body.email ?? '')
        if (!isValidEmail(email)) {
          return json({ error: 'invalid_email' }, 400)
        }

        const admin = createSupabaseAdmin()
        if (!admin) {
          return json({ error: 'secret_key_not_configured' }, 503)
        }

        const redirectTo = resolveDashboardRedirect('/reset-password', body.redirectOrigin, request)

        if (body.sendEmail) {
          const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo })
          if (error) {
            return json({ error: mapSupabaseResetError(error.message) }, 400)
          }
          return json({ email, sent: true })
        }

        const { data, error } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: { redirectTo },
        })

        if (error) {
          return json({ error: mapSupabaseResetError(error.message) }, 400)
        }

        const actionLink = data.properties.action_link
        if (!actionLink) {
          return json({ error: 'reset_link_failed' }, 500)
        }

        return json({
          email,
          actionLink,
          expiresAt: data.properties.expires_at ?? null,
        })
      },
    },
  },
})

function mapSupabaseResetError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('not found') || lower.includes('no user')) {
    return 'owner_not_found'
  }
  if (lower.includes('invalid') && lower.includes('email')) {
    return 'invalid_email'
  }
  return 'reset_failed'
}
