import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { homeFor } from '@/lib/session'
import { FullScreenSpinner } from '@/components/ui'

/** Entry redirect: first-run wizard → language → login → role home. */
export function Bootstrap(): React.JSX.Element {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const status = await api.firstRun.status()
        if (cancelled) return
        if (status.needed) {
          void navigate({ to: '/first-run', replace: true })
          return
        }
        const user = await api.auth.session()
        if (cancelled) return
        if (!user) {
          void navigate({ to: '/choose-language', replace: true })
          return
        }
        void navigate({ to: homeFor(user.role), replace: true })
      } catch (err) {
        console.error(err)
        void navigate({ to: '/choose-language', replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return <FullScreenSpinner />
}
