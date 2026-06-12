import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, Field, Input, Select } from '@/components/ui'
import type { IdType, Language } from '@shared/types'

const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']

export function SettingsPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Settings />
    </RequireRole>
  )
}

function Settings(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const settings = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })

  const [storeName, setStoreName] = useState('')
  const [threshold, setThreshold] = useState('')
  const [scannerMs, setScannerMs] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [cjkTestSent, setCjkTestSent] = useState(false)

  // Emisor / receipt fields
  const [legalName, setLegalName] = useState('')
  const [idType, setIdType] = useState<IdType>('fisica')
  const [storeId, setStoreId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [activityCode, setActivityCode] = useState('')
  const [province, setProvince] = useState('')
  const [canton, setCanton] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [footer, setFooter] = useState('')
  // Tax / consecutivo fields
  const [branchCode, setBranchCode] = useState('')
  const [terminalCode, setTerminalCode] = useState('')
  const [ivaStandard, setIvaStandard] = useState('')
  const [ivaCanasta, setIvaCanasta] = useState('')

  useEffect(() => {
    const s = settings.data
    if (!s) return
    setStoreName(s.storeName)
    setThreshold(String(s.stockThresholdDefault))
    setScannerMs(String(s.scannerBurstMs))
    setLegalName(s.storeLegalName)
    setIdType(s.storeIdType)
    setStoreId(s.storeId)
    setPhone(s.storePhone)
    setEmail(s.storeEmail)
    setActivityCode(s.storeActivityCode)
    setProvince(s.storeProvince)
    setCanton(s.storeCanton)
    setDistrict(s.storeDistrict)
    setAddress(s.storeAddress)
    setFooter(s.receiptFooter)
    setBranchCode(s.branchCode)
    setTerminalCode(s.terminalCode)
    setIvaStandard(String(s.ivaRateStandard))
    setIvaCanasta(String(s.ivaRateCanastaBasica))
  }, [settings.data])

  const invalidateSettings = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['settings'] })
  }

  const languageMutation = useMutation({
    mutationFn: async (language: Language) => {
      await api.settings.setLanguage(language)
      await i18n.changeLanguage(language)
    },
    onSuccess: invalidateSettings,
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const updateMutation = useMutation({
    mutationFn: api.settings.update,
    onSuccess: () => {
      toasts.success('settings.saved')
      invalidateSettings()
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const pinMutation = useMutation({
    mutationFn: () => api.settings.changePin(currentPin, newPin),
    onSuccess: () => {
      toasts.success('settings.pinChanged')
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
      setPinError(null)
    },
    onError: (err) => setPinError(t(err instanceof ApiError ? err.key : 'errors.unknown'))
  })

  const cjkTestMutation = useMutation({
    mutationFn: api.settings.testCjk,
    onSuccess: () => setCjkTestSent(true),
    onError: () => toasts.error('errors.printerNotFound')
  })

  const cjkCapableMutation = useMutation({
    mutationFn: api.settings.setCjkCapable,
    onSuccess: () => {
      setCjkTestSent(false)
      toasts.success('settings.saved')
      invalidateSettings()
    }
  })

  const currentLang = settings.data?.language ?? 'es'

  return (
    <div className="max-w-3xl p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('settings.title')}</h1>

      {/* Language */}
      <section className="mb-6 rounded-lg border-2 border-line bg-white p-5">
        <h2 className="mb-3 text-lg font-bold">{t('settings.language')}</h2>
        <div className="flex gap-3">
          {(['es', 'zh-CN'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              disabled={languageMutation.isPending}
              onClick={() => languageMutation.mutate(lang)}
              className={`min-h-[52px] flex-1 rounded-md border-2 text-lg font-bold ${
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

      {/* General */}
      <section className="mb-6 rounded-lg border-2 border-line bg-white p-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('settings.storeName')}>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </Field>
          <Field label={t('settings.stockThresholdDefault')}>
            <Input
              inputMode="numeric"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label={t('settings.scannerBurstMs')}>
            <Input
              inputMode="numeric"
              value={scannerMs}
              onChange={(e) => setScannerMs(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        </div>
        <p className="mt-2 text-[13px] text-slate-500">{t('settings.scannerHint')}</p>
        <Button
          className="mt-4"
          loading={updateMutation.isPending}
          onClick={() =>
            updateMutation.mutate({
              storeName,
              stockThresholdDefault: Number(threshold) || 5,
              scannerBurstMs: Number(scannerMs) || 30
            })
          }
        >
          {t('common.save')}
        </Button>
      </section>

      {/* Emisor / Receipt data */}
      <section className="mb-6 rounded-lg border-2 border-line bg-white p-5">
        <h2 className="mb-1 text-lg font-bold">{t('settings.emisor.title')}</h2>
        <p className="mb-4 text-[13px] text-slate-500">{t('settings.emisor.hint')}</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('settings.emisor.legalName')} className="col-span-2">
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.idType')}>
            <Select value={idType} onChange={(e) => setIdType(e.target.value as IdType)}>
              {ID_TYPES.map((it) => (
                <option key={it} value={it}>
                  {t(`idTypes.${it}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('settings.emisor.id')}>
            <Input value={storeId} onChange={(e) => setStoreId(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.phone')}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.email')}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.activityCode')} className="col-span-2">
            <Input value={activityCode} onChange={(e) => setActivityCode(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.province')}>
            <Input value={province} onChange={(e) => setProvince(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.canton')}>
            <Input value={canton} onChange={(e) => setCanton(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.district')}>
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.address')}>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label={t('settings.emisor.footer')} className="col-span-2">
            <Input value={footer} onChange={(e) => setFooter(e.target.value)} />
          </Field>
        </div>
        <Button
          className="mt-4"
          loading={updateMutation.isPending}
          onClick={() =>
            updateMutation.mutate({
              storeLegalName: legalName,
              storeIdType: idType,
              storeId,
              storePhone: phone,
              storeEmail: email,
              storeActivityCode: activityCode,
              storeProvince: province,
              storeCanton: canton,
              storeDistrict: district,
              storeAddress: address,
              receiptFooter: footer
            })
          }
        >
          {t('common.save')}
        </Button>
      </section>

      {/* Taxes / consecutivo */}
      <section className="mb-6 rounded-lg border-2 border-line bg-white p-5">
        <h2 className="mb-1 text-lg font-bold">{t('settings.tax.title')}</h2>
        <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
          <span className="font-semibold">{t('settings.tax.regime')}</span>
          <span className="font-extrabold">
            {t(`tax.regime.${settings.data?.taxRegime ?? 'simplificado'}`)}
          </span>
        </div>
        <p className="mb-4 text-[13px] text-slate-500">{t('settings.tax.regimeHint')}</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('settings.tax.branchCode')}>
            <Input
              inputMode="numeric"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
            />
          </Field>
          <Field label={t('settings.tax.terminalCode')}>
            <Input
              inputMode="numeric"
              value={terminalCode}
              onChange={(e) => setTerminalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            />
          </Field>
          <Field label={t('settings.tax.ivaStandard')}>
            <Input
              inputMode="decimal"
              value={ivaStandard}
              onChange={(e) => setIvaStandard(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </Field>
          <Field label={t('settings.tax.ivaCanasta')}>
            <Input
              inputMode="decimal"
              value={ivaCanasta}
              onChange={(e) => setIvaCanasta(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </Field>
        </div>
        <Button
          className="mt-4"
          loading={updateMutation.isPending}
          onClick={() =>
            updateMutation.mutate({
              branchCode,
              terminalCode,
              ivaRateStandard: Number(ivaStandard) || 0,
              ivaRateCanastaBasica: Number(ivaCanasta) || 0
            })
          }
        >
          {t('common.save')}
        </Button>
      </section>

      {/* Manager PIN */}
      <section className="mb-6 rounded-lg border-2 border-line bg-white p-5">
        <h2 className="mb-3 text-lg font-bold">{t('settings.pinSection')}</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label={t('settings.currentPin')}>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label={t('settings.newPin')}>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label={t('settings.confirmNewPin')}>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
        </div>
        {pinError && <p className="mt-2 text-[15px] font-bold text-danger">{pinError}</p>}
        <Button
          className="mt-4"
          loading={pinMutation.isPending}
          disabled={!currentPin || newPin.length < 4}
          onClick={() => {
            if (newPin !== confirmPin) {
              setPinError(t('settings.pinMismatch'))
              return
            }
            setPinError(null)
            pinMutation.mutate()
          }}
        >
          {t('settings.changePin')}
        </Button>
      </section>

      {/* Printer / CJK */}
      <section className="rounded-lg border-2 border-line bg-white p-5">
        <h2 className="mb-3 text-lg font-bold">{t('settings.printerSection')}</h2>
        <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
          <span className="font-semibold">{t('settings.cjkStatus')}</span>
          <span
            className={`font-extrabold ${settings.data?.printerCjkCapable ? 'text-cta' : 'text-danger'}`}
          >
            {settings.data?.printerCjkCapable ? t('settings.capable') : t('settings.notCapable')}
          </span>
        </div>
        <Button
          variant="outline"
          loading={cjkTestMutation.isPending}
          onClick={() => cjkTestMutation.mutate()}
        >
          {t('settings.testCjk')}
        </Button>
        {cjkTestSent && (
          <div className="mt-4 rounded-md border-2 border-line p-4">
            <p className="mb-3 font-bold">{t('settings.testSent')}</p>
            <div className="flex gap-3">
              <Button variant="cta" onClick={() => cjkCapableMutation.mutate(true)}>
                {t('settings.markCapable')}
              </Button>
              <Button variant="danger" onClick={() => cjkCapableMutation.mutate(false)}>
                {t('settings.markNotCapable')}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
