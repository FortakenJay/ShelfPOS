import { useTranslation } from 'react-i18next'
import { Button, Field, Input, Select } from '@/components/ui'
import type { SettingsDraft } from './settingsDraft'
import type { AppSettings, IdType, Language } from '@shared/types'

const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']

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

export function SettingsLanguageSection({
  currentLang,
  pending,
  onSelect
}: {
  currentLang: Language
  pending: boolean
  onSelect: (lang: Language) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <section className="rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-3 text-lg font-bold">{t('settings.language')}</h2>
      <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
        {(['es', 'zh-CN'] as Language[]).map((lang) => (
          <button
            key={lang}
            type="button"
            disabled={pending}
            onClick={() => onSelect(lang)}
            className={`min-h-[52px] rounded-md border-2 text-lg font-bold ${
              currentLang === lang
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-white hover:border-primary'
            }`}
          >
            {t(`languages.${lang}`)}
          </button>
        ))}
      </div>
    </section>
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
