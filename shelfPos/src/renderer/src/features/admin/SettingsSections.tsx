import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Select } from '@/components/ui'
import type { SettingsDraft } from './settingsDraft'
import type { ActionShortcutKey, AppSettings, IdType } from '@shared/types'

const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']
const SHORTCUT_OPTIONS: ActionShortcutKey[] = [
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12'
]

function SettingsSaveRow({
  saving,
  disabled,
  onSave,
  labelKey = 'common.save'
}: {
  saving: boolean
  disabled: boolean
  onSave: () => void
  labelKey?: string
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="mt-5 flex justify-end border-t border-line pt-4">
      <Button loading={saving} disabled={disabled} onClick={onSave}>
        {t(labelKey)}
      </Button>
    </div>
  )
}

export function SettingsGeneralSection({
  draft,
  onChange,
  saving,
  dirty,
  onSave
}: {
  draft: SettingsDraft
  onChange: (patch: Partial<SettingsDraft>) => void
  saving: boolean
  dirty: boolean
  onSave: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <section className="flex h-full flex-col rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-3 text-lg font-bold">{t('settings.generalTitle')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
        <Field label={t('settings.storeName')} className="sm:col-span-2">
          <Input value={draft.storeName} onChange={(e) => onChange({ storeName: e.target.value })} />
        </Field>
        <Field label={t('settings.stockThresholdDefault')}>
          <Input
            inputMode="numeric"
            value={draft.threshold}
            onChange={(e) => onChange({ threshold: e.target.value.replace(/\D/g, '') })}
          />
        </Field>
        <Field label={t('settings.scannerBurstMs')}>
          <Input
            inputMode="numeric"
            value={draft.scannerMs}
            onChange={(e) => onChange({ scannerMs: e.target.value.replace(/\D/g, '') })}
          />
        </Field>
      </div>
      <p className="mt-3 text-[13px] text-slate-500">{t('settings.scannerHint')}</p>
      <SettingsSaveRow saving={saving} disabled={!dirty} onSave={onSave} />
    </section>
  )
}

export function SettingsEmisorSection({
  draft,
  onChange,
  saving,
  dirty,
  onSave
}: {
  draft: SettingsDraft
  onChange: (patch: Partial<SettingsDraft>) => void
  saving: boolean
  dirty: boolean
  onSave: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <section className="rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-1 text-lg font-bold">{t('settings.emisor.title')}</h2>
      <p className="mb-4 text-[13px] text-slate-500">{t('settings.emisor.hint')}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label={t('settings.emisor.legalName')} className="md:col-span-2 xl:col-span-3">
          <Input value={draft.legalName} onChange={(e) => onChange({ legalName: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.idType')}>
          <Select value={draft.idType} onChange={(e) => onChange({ idType: e.target.value as IdType })}>
            {ID_TYPES.map((it) => (
              <option key={it} value={it}>
                {t(`idTypes.${it}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.emisor.id')}>
          <Input value={draft.storeId} onChange={(e) => onChange({ storeId: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.phone')}>
          <Input value={draft.phone} onChange={(e) => onChange({ phone: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.email')}>
          <Input value={draft.email} onChange={(e) => onChange({ email: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.activityCode')} className="md:col-span-2 xl:col-span-3">
          <Input value={draft.activityCode} onChange={(e) => onChange({ activityCode: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.province')}>
          <Input value={draft.province} onChange={(e) => onChange({ province: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.canton')}>
          <Input value={draft.canton} onChange={(e) => onChange({ canton: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.district')}>
          <Input value={draft.district} onChange={(e) => onChange({ district: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.address')} className="md:col-span-2">
          <Input value={draft.address} onChange={(e) => onChange({ address: e.target.value })} />
        </Field>
        <Field label={t('settings.emisor.footer')} className="md:col-span-2 xl:col-span-3">
          <Input value={draft.footer} onChange={(e) => onChange({ footer: e.target.value })} />
        </Field>
      </div>
      <SettingsSaveRow saving={saving} disabled={!dirty} onSave={onSave} />
    </section>
  )
}

export function SettingsTaxSection({
  draft,
  taxRegime,
  onChange,
  saving,
  dirty,
  onSave
}: {
  draft: SettingsDraft
  taxRegime: AppSettings['taxRegime']
  onChange: (patch: Partial<SettingsDraft>) => void
  saving: boolean
  dirty: boolean
  onSave: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <section className="flex h-full flex-col rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-1 text-lg font-bold">{t('settings.tax.title')}</h2>
      <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
        <span className="font-semibold">{t('settings.tax.regime')}</span>
        <span className="font-extrabold">{t(`tax.regime.${taxRegime}`)}</span>
      </div>
      <p className="mb-4 text-[13px] text-slate-500">{t('settings.tax.regimeHint')}</p>
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('settings.tax.branchCode')}>
          <Input
            inputMode="numeric"
            value={draft.branchCode}
            onChange={(e) => onChange({ branchCode: e.target.value.replace(/\D/g, '').slice(0, 3) })}
          />
        </Field>
        <Field label={t('settings.tax.terminalCode')}>
          <Input
            inputMode="numeric"
            value={draft.terminalCode}
            onChange={(e) => onChange({ terminalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
          />
        </Field>
        <Field label={t('settings.tax.ivaStandard')}>
          <Input
            inputMode="decimal"
            value={draft.ivaStandard}
            onChange={(e) => onChange({ ivaStandard: e.target.value.replace(/[^\d.]/g, '') })}
          />
        </Field>
      </div>
      <SettingsSaveRow saving={saving} disabled={!dirty} onSave={onSave} />
    </section>
  )
}

export function SettingsShortcutsSection({
  draft,
  onChange,
  saving,
  dirty,
  hasConflict,
  onSave
}: {
  draft: SettingsDraft
  onChange: (patch: Partial<SettingsDraft>) => void
  saving: boolean
  dirty: boolean
  hasConflict: boolean
  onSave: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const [printerTestPending, setPrinterTestPending] = useState(false)

  const {
    data: printerStatus,
    isFetching: printerStatusPending,
    refetch: refreshPrinterStatus
  } = useQuery({
    queryKey: ['printerStatus'],
    queryFn: () => api.printer.status()
  })

  const runPrinterTest = (): void => {
    if (printerTestPending) return
    setPrinterTestPending(true)
    void api.printer
      .test()
      .then(() => toasts.success('settings.printerTestSent'))
      .catch((err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown'))
      .finally(() => {
        setPrinterTestPending(false)
        void refreshPrinterStatus()
      })
  }

  const optionLabel = (k: ActionShortcutKey): string => t(`settings.shortcuts.options.${k}`, k)

  return (
    <section className="rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-1 text-lg font-bold">{t('settings.shortcuts.title')}</h2>
      <p className="mb-4 text-[13px] text-slate-500">{t('settings.shortcuts.hint')}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label={t('settings.shortcuts.openFloat')}>
          <Select
            value={draft.shortcutOpenFloat}
            onChange={(e) => onChange({ shortcutOpenFloat: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.cashIn')}>
          <Select
            value={draft.shortcutCashIn}
            onChange={(e) => onChange({ shortcutCashIn: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.cashOut')}>
          <Select
            value={draft.shortcutCashOut}
            onChange={(e) => onChange({ shortcutCashOut: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.drawerAction')}>
          <Select
            value={draft.shortcutDrawerAction}
            onChange={(e) => onChange({ shortcutDrawerAction: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.printLabel')}>
          <Select
            value={draft.shortcutPrintLabel}
            onChange={(e) => onChange({ shortcutPrintLabel: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.printBarcode')}>
          <Select
            value={draft.shortcutPrintBarcode}
            onChange={(e) => onChange({ shortcutPrintBarcode: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.payCash')}>
          <Select
            value={draft.shortcutPayCash}
            onChange={(e) => onChange({ shortcutPayCash: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.payCard')}>
          <Select
            value={draft.shortcutPayCard}
            onChange={(e) => onChange({ shortcutPayCard: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('settings.shortcuts.paySinpe')}>
          <Select
            value={draft.shortcutPaySinpe}
            onChange={(e) => onChange({ shortcutPaySinpe: e.target.value as ActionShortcutKey })}
          >
            {SHORTCUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {optionLabel(opt)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {hasConflict && <p className="mt-3 text-[14px] font-semibold text-danger">{t('settings.shortcuts.conflict')}</p>}
      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-2 text-[14px] font-semibold text-slate-700">{t('settings.printerSection')}</p>
        <p className="mb-3 text-[13px] text-slate-500">
          {printerStatusPending
            ? t('common.loading')
            : printerStatus?.ready
              ? t('settings.printerStatusReady', { name: printerStatus.name ?? '?' })
              : t('settings.printerStatusMissing')}
        </p>
        {printerStatus?.ready && printerStatus.driver ? (
          <p className="mb-3 text-[12px] text-slate-500">
            {t('settings.printerStatusDetails', {
              driver: printerStatus.driver,
              datatype: printerStatus.datatype ?? '?',
              port: printerStatus.port ?? '?'
            })}
          </p>
        ) : null}
        <div className="mb-5 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={printerStatusPending}
            onClick={() => void refreshPrinterStatus()}
          >
            {t('settings.printerRefresh')}
          </Button>
          <Button type="button" variant="outline" disabled={printerTestPending} onClick={runPrinterTest}>
            {t('settings.printerTest')}
          </Button>
        </div>
      </div>
      <SettingsSaveRow saving={saving} disabled={!dirty || hasConflict} onSave={onSave} />
    </section>
  )
}

export function SettingsPinSection({
  pin,
  pinError,
  saving,
  onChange,
  onSave
}: {
  pin: { current: string; next: string; confirm: string }
  pinError: string | null
  saving: boolean
  onChange: (patch: Partial<{ current: string; next: string; confirm: string }>) => void
  onSave: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <section className="flex h-full flex-col rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-3 text-lg font-bold">{t('settings.pinSection')}</h2>
      <p className="mb-4 text-[14px] text-slate-600">{t('settings.managerPinHint')}</p>
      <div className="grid flex-1 grid-cols-1 gap-4">
        <Field label={t('settings.currentPin')}>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin.current}
            onChange={(e) => onChange({ current: e.target.value.replace(/\D/g, '') })}
          />
        </Field>
        <Field label={t('settings.newPin')}>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin.next}
            onChange={(e) => onChange({ next: e.target.value.replace(/\D/g, '') })}
          />
        </Field>
        <Field label={t('settings.confirmNewPin')}>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin.confirm}
            onChange={(e) => onChange({ confirm: e.target.value.replace(/\D/g, '') })}
          />
        </Field>
      </div>
      {pinError && <p className="mt-2 text-[15px] font-bold text-danger">{pinError}</p>}
      <SettingsSaveRow
        saving={saving}
        disabled={!pin.current || pin.next.length < 4}
        onSave={onSave}
        labelKey="settings.changePin"
      />
    </section>
  )
}

export function SettingsCajaPinSection({
  pin,
  pinError,
  saving,
  cajaPinConfigured,
  onChange,
  onSave
}: {
  pin: { current: string; next: string; confirm: string }
  pinError: string | null
  saving: boolean
  cajaPinConfigured: boolean
  onChange: (patch: Partial<{ current: string; next: string; confirm: string }>) => void
  onSave: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const canSave =
    pin.next.length >= 4 && (cajaPinConfigured ? pin.current.length >= 4 : true)

  return (
    <section className="flex h-full flex-col rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-3 text-lg font-bold">{t('settings.cajaPinSection')}</h2>
      <p className="mb-4 text-[14px] text-slate-600">{t('settings.cajaPinHint')}</p>
      <div className="grid flex-1 grid-cols-1 gap-4">
        {cajaPinConfigured && (
          <Field label={t('settings.currentPin')}>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin.current}
              onChange={(e) => onChange({ current: e.target.value.replace(/\D/g, '') })}
            />
          </Field>
        )}
        <Field label={t('settings.newPin')}>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin.next}
            onChange={(e) => onChange({ next: e.target.value.replace(/\D/g, '') })}
          />
        </Field>
        <Field label={t('settings.confirmNewPin')}>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin.confirm}
            onChange={(e) => onChange({ confirm: e.target.value.replace(/\D/g, '') })}
          />
        </Field>
      </div>
      {pinError && <p className="mt-2 text-[15px] font-bold text-danger">{pinError}</p>}
      <SettingsSaveRow
        saving={saving}
        disabled={!canSave}
        onSave={onSave}
        labelKey={cajaPinConfigured ? 'settings.changeCajaPin' : 'users.setupContinue'}
      />
    </section>
  )
}
