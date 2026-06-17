import { useReducer } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { MANAGED_ROLES } from '@/features/auth/firstRun.types'
import type { AppUserRow, Role } from '@shared/types'

type UserModalState = { mode: 'create' } | { mode: 'edit'; user: AppUserRow }

type FormState = {
  username: string
  password: string
  confirm: string
  role: Role
  isActive: boolean
  error: string | null
}

type FormAction =
  | { type: 'usernameChanged'; value: string }
  | { type: 'passwordChanged'; value: string }
  | { type: 'confirmChanged'; value: string }
  | { type: 'roleChanged'; value: Role }
  | { type: 'isActiveChanged'; value: boolean }
  | { type: 'errorSet'; value: string | null }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'usernameChanged':
      return { ...state, username: action.value }
    case 'passwordChanged':
      return { ...state, password: action.value }
    case 'confirmChanged':
      return { ...state, confirm: action.value }
    case 'roleChanged':
      return { ...state, role: action.value }
    case 'isActiveChanged':
      return { ...state, isActive: action.value }
    case 'errorSet':
      return { ...state, error: action.value }
  }
}

function initialFormState(modal: UserModalState): FormState {
  const isEdit = modal.mode === 'edit'
  return {
    username: isEdit ? modal.user.username : '',
    password: '',
    confirm: '',
    role: isEdit ? modal.user.role : 'sales',
    isActive: isEdit ? modal.user.isActive : true,
    error: null
  }
}

export function UserFormModal({
  state,
  onClose
}: {
  state: UserModalState
  onClose: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const isEdit = state.mode === 'edit'
  const [form, dispatch] = useReducer(formReducer, state, initialFormState)
  const { username, password, confirm, role, isActive, error } = form

  const save = useMutation({
    mutationFn: async () => {
      if (!username.trim()) throw new ApiError('errors.invalidInput')
      if (!isEdit) {
        if (!password) throw new ApiError('errors.invalidInput')
        if (password !== confirm) throw new ApiError('firstRun.errors.passwordMismatch')
      } else if (password || confirm) {
        if (!password || password !== confirm) {
          throw new ApiError('firstRun.errors.passwordMismatch')
        }
      }
      if (isEdit) {
        return api.users.update({
          id: state.user.id,
          username: username.trim(),
          password: password || undefined,
          role,
          isActive
        })
      }
      return api.users.create({
        username: username.trim(),
        password,
        role
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['auditUsers'] })
      toasts.success(isEdit ? 'users.updated' : 'users.created')
      onClose()
    },
    onError: (err) => {
      dispatch({ type: 'errorSet', value: t(err instanceof ApiError ? err.key : 'errors.unknown') })
    }
  })

  return (
    <Modal
      title={t(isEdit ? 'users.editTitle' : 'users.createTitle')}
      onClose={onClose}
      size="lg"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('users.username')}>
          <Input
            value={username}
            onChange={(e) => dispatch({ type: 'usernameChanged', value: e.target.value })}
            autoComplete="off"
          />
        </Field>
        <Field label={t('users.role')}>
          <Select
            value={role}
            onChange={(e) => dispatch({ type: 'roleChanged', value: e.target.value as Role })}
          >
            {MANAGED_ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`roles.${r}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={isEdit ? t('users.newPassword') : t('firstRun.password')}>
          <Input
            type="password"
            value={password}
            onChange={(e) => dispatch({ type: 'passwordChanged', value: e.target.value })}
            autoComplete="new-password"
          />
        </Field>
        <Field label={t('firstRun.confirmPassword')}>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => dispatch({ type: 'confirmChanged', value: e.target.value })}
            autoComplete="new-password"
          />
        </Field>
      </div>
      {isEdit && (
        <>
          <p className="mt-1 text-[14px] text-slate-500">{t('users.passwordOptional')}</p>
          <label className="mt-3 flex items-center gap-2 text-[15px] font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => dispatch({ type: 'isActiveChanged', value: e.target.checked })}
              className="h-4 w-4"
            />
            {t('users.active')}
          </label>
        </>
      )}
      {error && <p className="mt-3 text-[15px] font-bold text-danger">{error}</p>}
      <div className="mt-4 flex gap-3">
        <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="cta"
          size="lg"
          className="flex-1"
          loading={save.isPending}
          onClick={() => save.mutate()}
        >
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
