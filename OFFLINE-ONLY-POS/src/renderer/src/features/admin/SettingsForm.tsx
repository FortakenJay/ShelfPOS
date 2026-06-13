import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { draftFromSettings, type SettingsDraft } from './settingsDraft'
import {
  SettingsEmisorSection,
  SettingsGeneralSection,
  SettingsLanguageSection,
  SettingsPinSection,
  SettingsPrinterSection,
  SettingsTaxSection
} from './SettingsSections'
import type { AppSettings, Language } from '@shared/types'

export function SettingsForm({ settings }: { settings: AppSettings }): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<SettingsDraft>(() => draftFromSettings(settings))
  const [pin, setPin] = useState({ current: '', next: '', confirm: '' })
  const [pinError, setPinError] = useState<string | null>(null)
  const [cjkTestSent, setCjkTestSent] = useState(false)

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
    onSuccess: () => {
      toasts.success('settings.saved')
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const pinMutation = useMutation({
    mutationFn: () => api.settings.changePin(pin.current, pin.next),
    onSuccess: () => {
      toasts.success('settings.pinChanged')
      setPin({ current: '', next: '', confirm: '' })
      setPinError(null)
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err) => setPinError(t(err instanceof ApiError ? err.key : 'errors.unknown'))
  })

  const cjkTestMutation = useMutation({
    mutationFn: api.settings.testCjk,
    onSuccess: () => {
      setCjkTestSent(true)
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: () => toasts.error('errors.printerNotFound')
  })

  const cjkCapableMutation = useMutation({
    mutationFn: api.settings.setCjkCapable,
    onSuccess: () => {
      setCjkTestSent(false)
      toasts.success('settings.saved')
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  return (
    <>
      <SettingsLanguageSection
        currentLang={settings.language ?? 'es'}
        pending={languageMutation.isPending}
        onSelect={(lang) => languageMutation.mutate(lang)}
      />

      <SettingsGeneralSection
        draft={draft}
        onChange={patchDraft}
        saving={updateMutation.isPending}
        onSave={() =>
          updateMutation.mutate({
            storeName: draft.storeName,
            stockThresholdDefault: Number(draft.threshold) || 5,
            scannerBurstMs: Number(draft.scannerMs) || 30
          })
        }
      />

      <SettingsEmisorSection
        draft={draft}
        onChange={patchDraft}
        saving={updateMutation.isPending}
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

      <SettingsTaxSection
        draft={draft}
        taxRegime={settings.taxRegime}
        onChange={patchDraft}
        saving={updateMutation.isPending}
        onSave={() =>
          updateMutation.mutate({
            branchCode: draft.branchCode,
            terminalCode: draft.terminalCode,
            ivaRateStandard: Number(draft.ivaStandard) || 0,
            ivaRateCanastaBasica: Number(draft.ivaCanasta) || 0
          })
        }
      />

      <SettingsPinSection
        pin={pin}
        pinError={pinError}
        saving={pinMutation.isPending}
        onChange={(patch) => setPin((prev) => ({ ...prev, ...patch }))}
        onSave={() => {
          if (pin.next !== pin.confirm) {
            setPinError(t('settings.pinMismatch'))
            return
          }
          setPinError(null)
          pinMutation.mutate()
        }}
      />

      <SettingsPrinterSection
        cjkCapable={settings.printerCjkCapable}
        cjkTestSent={cjkTestSent}
        testing={cjkTestMutation.isPending}
        onTest={() => cjkTestMutation.mutate()}
        onSetCapable={(capable) => cjkCapableMutation.mutate(capable)}
      />
    </>
  )
}
