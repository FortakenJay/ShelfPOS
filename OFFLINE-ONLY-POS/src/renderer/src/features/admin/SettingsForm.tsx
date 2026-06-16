import { useReducer, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { draftFromSettings, emisorDraftDirty, generalDraftDirty, taxDraftDirty, type SettingsDraft } from './settingsDraft'
import {
  SettingsEmisorSection,
  SettingsGeneralSection,
  SettingsLanguageSection,
  SettingsPinSection,
  SettingsCajaPinSection,
  SettingsTaxSection
} from './SettingsSections'
import type { AppSettings, Language, SettingsUpdateInput } from '@shared/types'

function commitSavedDraft(
  saved: SettingsDraft,
  draft: SettingsDraft,
  input: SettingsUpdateInput
): SettingsDraft {
  const next = { ...saved }
  if (
    input.storeName !== undefined ||
    input.stockThresholdDefault !== undefined ||
    input.scannerBurstMs !== undefined
  ) {
    next.storeName = draft.storeName
    next.threshold = draft.threshold
    next.scannerMs = draft.scannerMs
  }
  if (input.storeLegalName !== undefined) {
    next.legalName = draft.legalName
    next.idType = draft.idType
    next.storeId = draft.storeId
    next.phone = draft.phone
    next.email = draft.email
    next.activityCode = draft.activityCode
    next.province = draft.province
    next.canton = draft.canton
    next.district = draft.district
    next.address = draft.address
    next.footer = draft.footer
  }
  if (
    input.branchCode !== undefined ||
    input.terminalCode !== undefined ||
    input.ivaRateStandard !== undefined ||
    input.ivaRateCanastaBasica !== undefined
  ) {
    next.branchCode = draft.branchCode
    next.terminalCode = draft.terminalCode
    next.ivaStandard = draft.ivaStandard
    next.ivaCanasta = draft.ivaCanasta
  }
  return next
}

type PinFields = { current: string; next: string; confirm: string }

interface PinFormsState {
  pin: PinFields
  pinError: string | null
  cajaPin: PinFields
  cajaPinError: string | null
}

const emptyPinFields = (): PinFields => ({ current: '', next: '', confirm: '' })

type PinFormsAction =
  | { type: 'patchPin'; patch: Partial<PinFields> }
  | { type: 'patchCajaPin'; patch: Partial<PinFields> }
  | { type: 'setPinError'; error: string | null }
  | { type: 'setCajaPinError'; error: string | null }
  | { type: 'resetPin' }
  | { type: 'resetCajaPin' }

function pinFormsReducer(state: PinFormsState, action: PinFormsAction): PinFormsState {
  switch (action.type) {
    case 'patchPin':
      return { ...state, pin: { ...state.pin, ...action.patch } }
    case 'patchCajaPin':
      return { ...state, cajaPin: { ...state.cajaPin, ...action.patch } }
    case 'setPinError':
      return { ...state, pinError: action.error }
    case 'setCajaPinError':
      return { ...state, cajaPinError: action.error }
    case 'resetPin':
      return { ...state, pin: emptyPinFields(), pinError: null }
    case 'resetCajaPin':
      return { ...state, cajaPin: emptyPinFields(), cajaPinError: null }
    default:
      return state
  }
}

export function SettingsForm({ settings }: { settings: AppSettings }): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<SettingsDraft>(() => draftFromSettings(settings))
  const [savedDraft, setSavedDraft] = useState<SettingsDraft>(() => draftFromSettings(settings))
  const [pinForms, dispatchPinForms] = useReducer(pinFormsReducer, {
    pin: emptyPinFields(),
    pinError: null,
    cajaPin: emptyPinFields(),
    cajaPinError: null
  })
  const { pin, pinError, cajaPin, cajaPinError } = pinForms

  const patchDraft = (patch: Partial<SettingsDraft>): void => setDraft((prev) => ({ ...prev, ...patch }))

  const languageMutation = useMutation({
    mutationFn: async (language: Language) => {
      await api.settings.setLanguage(language)
      await i18n.changeLanguage(language)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const updateMutation = useMutation({
    mutationFn: api.settings.update,
    onSuccess: (_data, input) => {
      toasts.success('settings.saved')
      setDraft((current) => {
        setSavedDraft((saved) => commitSavedDraft(saved, current, input))
        return current
      })
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const pinMutation = useMutation({
    mutationFn: () => api.settings.changePin(pin.current, pin.next),
    onSuccess: () => {
      toasts.success('settings.pinChanged')
      dispatchPinForms({ type: 'resetPin' })
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err) =>
      dispatchPinForms({
        type: 'setPinError',
        error: t(err instanceof ApiError ? err.key : 'errors.unknown')
      })
  })

  const cajaPinMutation = useMutation({
    mutationFn: () => api.settings.changeCajaPin(cajaPin.current, cajaPin.next),
    onSuccess: () => {
      toasts.success('settings.cajaPinChanged')
      dispatchPinForms({ type: 'resetCajaPin' })
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err) =>
      dispatchPinForms({
        type: 'setCajaPinError',
        error: t(err instanceof ApiError ? err.key : 'errors.unknown')
      })
  })

  return (
    <div className="space-y-6">
      <SettingsLanguageSection
        currentLang={settings.language ?? 'es'}
        pending={languageMutation.isPending}
        onSelect={(lang) => languageMutation.mutate(lang)}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsGeneralSection
          draft={draft}
          onChange={patchDraft}
          saving={updateMutation.isPending}
          dirty={generalDraftDirty(draft, savedDraft)}
          onSave={() =>
            updateMutation.mutate({
              storeName: draft.storeName,
              stockThresholdDefault: Number(draft.threshold) || 5,
              scannerBurstMs: Number(draft.scannerMs) || 30
            })
          }
        />

        <SettingsTaxSection
          draft={draft}
          taxRegime={settings.taxRegime}
          onChange={patchDraft}
          saving={updateMutation.isPending}
          dirty={taxDraftDirty(draft, savedDraft)}
          onSave={() =>
            updateMutation.mutate({
              branchCode: draft.branchCode,
              terminalCode: draft.terminalCode,
              ivaRateStandard: Number(draft.ivaStandard) || 0,
              ivaRateCanastaBasica: Number(draft.ivaCanasta) || 0
            })
          }
        />
      </div>

      <SettingsEmisorSection
        draft={draft}
        onChange={patchDraft}
        saving={updateMutation.isPending}
        dirty={emisorDraftDirty(draft, savedDraft)}
        onSave={() =>
          updateMutation.mutate({
            storeLegalName: draft.legalName,
            storeIdType: draft.idType,
            storeId: draft.storeId,
            storePhone: draft.phone,
            storeEmail: draft.email,
            storeActivityCode: draft.activityCode,
            storeProvince: draft.province,
            storeCanton: draft.canton,
            storeDistrict: draft.district,
            storeAddress: draft.address,
            receiptFooter: draft.footer
          })
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsPinSection
          pin={pin}
          pinError={pinError}
          saving={pinMutation.isPending}
          onChange={(patch) => dispatchPinForms({ type: 'patchPin', patch })}
          onSave={() => {
            if (pin.next !== pin.confirm) {
              dispatchPinForms({ type: 'setPinError', error: t('settings.pinMismatch') })
              return
            }
            dispatchPinForms({ type: 'setPinError', error: null })
            pinMutation.mutate()
          }}
        />

        <SettingsCajaPinSection
          pin={cajaPin}
          pinError={cajaPinError}
          saving={cajaPinMutation.isPending}
          cajaPinConfigured={settings.cajaPinConfigured}
          onChange={(patch) => dispatchPinForms({ type: 'patchCajaPin', patch })}
          onSave={() => {
            if (cajaPin.next !== cajaPin.confirm) {
              dispatchPinForms({ type: 'setCajaPinError', error: t('settings.pinMismatch') })
              return
            }
            dispatchPinForms({ type: 'setCajaPinError', error: null })
            cajaPinMutation.mutate()
          }}
        />
      </div>
    </div>
  )
}
