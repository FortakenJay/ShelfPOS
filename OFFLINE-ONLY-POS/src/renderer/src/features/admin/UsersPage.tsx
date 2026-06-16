import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, FullScreenSpinner, Td, Th } from '@/components/ui'
import { UserFormModal } from './UserFormModal'
import { UsersInitialSetupModal } from './UsersInitialSetupModal'
import type { AppUserRow } from '@shared/types'

type UserModalState =
  | { mode: 'create' }
  | { mode: 'edit'; user: AppUserRow }
  | null

export function UsersPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Users />
    </RequireRole>
  )
}

function Users(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<UserModalState>(null)

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get
  })

  const setupComplete = settings?.cajaPinConfigured ?? false

  const {
    data: users = [],
    isLoading: usersLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
    enabled: setupComplete
  })

  const remove = useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => {
      toasts.success('users.deleted')
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['auditUsers'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const closeModal = (): void => {
    setModal(null)
    void queryClient.invalidateQueries({ queryKey: ['users'] })
    void queryClient.invalidateQueries({ queryKey: ['auditUsers'] })
  }

  const onSetupComplete = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['settings'] })
    void queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  if (settingsLoading) return <FullScreenSpinner />

  return (
    <div className="p-6">
      {!setupComplete && <UsersInitialSetupModal onComplete={onSetupComplete} />}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('users.title')}</h1>
        <Button
          variant="cta"
          disabled={!setupComplete}
          onClick={() => setModal({ mode: 'create' })}
        >
          {t('users.create')}
        </Button>
      </div>

      {setupComplete && usersLoading && <FullScreenSpinner />}

      {setupComplete && isError && (
        <div className="mb-4 rounded-lg border-2 border-danger bg-red-50 px-4 py-3">
          <p className="text-[15px] font-semibold text-danger">
            {t(error instanceof ApiError ? error.key : 'errors.unknown')}
          </p>
          <Button size="md" variant="outline" className="mt-3" onClick={() => void refetch()}>
            {t('users.retry')}
          </Button>
        </div>
      )}

      {setupComplete && !usersLoading && !isError && (
        <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
          <table className="w-full">
            <thead>
              <tr>
                <Th>{t('users.username')}</Th>
                <Th>{t('users.role')}</Th>
                <Th>{t('users.status')}</Th>
                <Th>{t('users.lastLogin')}</Th>
                <Th className="text-right">{t('common.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-6 text-center text-slate-500">
                    {t('common.noData')}
                  </Td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id}>
                  <Td className="font-semibold">{user.username}</Td>
                  <Td>{t(`roles.${user.role}`)}</Td>
                  <Td>
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[13px] font-bold ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {user.isActive ? t('users.active') : t('users.inactive')}
                    </span>
                  </Td>
                  <Td>{user.lastLoginAt ? formatDate(user.lastLoginAt, true) : '—'}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="md"
                        variant="outline"
                        onClick={() => setModal({ mode: 'edit', user })}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="md"
                        variant="danger"
                        disabled={!user.isActive || remove.isPending}
                        onClick={() => remove.mutate(user.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <UserFormModal state={modal} onClose={closeModal} />}
    </div>
  )
}
