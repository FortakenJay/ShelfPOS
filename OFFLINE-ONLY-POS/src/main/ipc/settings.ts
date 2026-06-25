import bcrypt from 'bcryptjs'
import { handle } from './helpers'
import { AppError } from '../errors'
import { getAppSettings, getSetting, receiptLanguage, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import { t } from '../services/i18n'
import { buildPinCardLines } from '../services/printTemplates'
import { insertPrintJob } from '../db/repos/printJobs'
import { attemptPrintJob, probePrinter, isPrintableCode128Barcode } from '../services/printer'
import type {
  ActionShortcutKey,
  AppSettings,
  IdType,
  Language,
  PrintStatus,
  SettingsUpdateInput
} from '../../shared/types'

const PIN_RE = /^\d{4,6}$/
const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']
const SHORTCUT_KEYS: (keyof Pick<
  SettingsUpdateInput,
  | 'shortcutOpenFloat'
  | 'shortcutCashIn'
  | 'shortcutCashOut'
  | 'shortcutDrawerAction'
  | 'shortcutPrintLabel'
  | 'shortcutPrintBarcode'
  | 'shortcutPayCash'
  | 'shortcutPayCard'
  | 'shortcutPaySinpe'
>)[] = [
  'shortcutOpenFloat',
  'shortcutCashIn',
  'shortcutCashOut',
  'shortcutDrawerAction',
  'shortcutPrintLabel',
  'shortcutPrintBarcode',
  'shortcutPayCash',
  'shortcutPayCard',
  'shortcutPaySinpe'
]

export function registerSettingsHandlers(): void {
  // Public: the renderer needs the language before any login (e.g. login screen).
  handle<void, AppSettings>('settings:get', 'public', () => getAppSettings())

  handle<{ language: Language }, null>('settings:setLanguage', 'public', ({ language }) => {
    if (language !== 'es' && language !== 'zh-CN') throw new AppError('errors.invalidInput')
    setSetting(SETTING_KEYS.language, language)
    return null
  })

  handle<SettingsUpdateInput, AppSettings>('settings:update', ['admin'], (input) => {
    const current = getAppSettings()
    const shortcutValues: Record<(typeof SHORTCUT_KEYS)[number], ActionShortcutKey> = {
      shortcutOpenFloat: input.shortcutOpenFloat ?? current.shortcutOpenFloat,
      shortcutCashIn: input.shortcutCashIn ?? current.shortcutCashIn,
      shortcutCashOut: input.shortcutCashOut ?? current.shortcutCashOut,
      shortcutDrawerAction: input.shortcutDrawerAction ?? current.shortcutDrawerAction,
      shortcutPrintLabel: input.shortcutPrintLabel ?? current.shortcutPrintLabel,
      shortcutPrintBarcode: input.shortcutPrintBarcode ?? current.shortcutPrintBarcode,
      shortcutPayCash: input.shortcutPayCash ?? current.shortcutPayCash,
      shortcutPayCard: input.shortcutPayCard ?? current.shortcutPayCard,
      shortcutPaySinpe: input.shortcutPaySinpe ?? current.shortcutPaySinpe
    }
    const uniqueShortcutCount = new Set(Object.values(shortcutValues)).size
    if (uniqueShortcutCount !== SHORTCUT_KEYS.length) throw new AppError('errors.invalidInput')

    // Optional free-text emisor/receipt fields (trimmed; empty allowed except storeName).
    const text = (key: string, value?: string): void => {
      if (value !== undefined) setSetting(key, value.trim())
    }
    const rate = (key: string, value?: number): void => {
      if (value === undefined) return
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new AppError('errors.invalidInput')
      }
      setSetting(key, String(value))
    }

    if (input.storeName !== undefined) {
      if (!input.storeName.trim()) throw new AppError('errors.invalidInput')
      setSetting(SETTING_KEYS.storeName, input.storeName.trim())
    }
    if (input.stockThresholdDefault !== undefined) {
      const v = Math.floor(input.stockThresholdDefault)
      if (!Number.isFinite(v) || v < 0) throw new AppError('errors.invalidInput')
      setSetting(SETTING_KEYS.stockThresholdDefault, String(v))
    }
    if (input.scannerBurstMs !== undefined) {
      const v = Math.floor(input.scannerBurstMs)
      if (!Number.isFinite(v) || v < 5 || v > 500) throw new AppError('errors.invalidInput')
      setSetting(SETTING_KEYS.scannerBurstMs, String(v))
    }
    rate(SETTING_KEYS.ivaRateStandard, input.ivaRateStandard)

    if (input.branchCode !== undefined) {
      const v = input.branchCode.replace(/\D/g, '').slice(0, 3).padStart(3, '0')
      setSetting(SETTING_KEYS.branchCode, v)
    }
    if (input.terminalCode !== undefined) {
      const v = input.terminalCode.replace(/\D/g, '').slice(0, 5).padStart(5, '0')
      setSetting(SETTING_KEYS.terminalCode, v)
    }
    if (input.storeIdType !== undefined) {
      if (!ID_TYPES.includes(input.storeIdType)) throw new AppError('errors.invalidInput')
      setSetting(SETTING_KEYS.storeIdType, input.storeIdType)
    }
    text(SETTING_KEYS.storeLegalName, input.storeLegalName)
    text(SETTING_KEYS.storeId, input.storeId)
    text(SETTING_KEYS.storePhone, input.storePhone)
    text(SETTING_KEYS.storeEmail, input.storeEmail)
    text(SETTING_KEYS.storeActivityCode, input.storeActivityCode)
    text(SETTING_KEYS.storeProvince, input.storeProvince)
    text(SETTING_KEYS.storeCanton, input.storeCanton)
    text(SETTING_KEYS.storeDistrict, input.storeDistrict)
    text(SETTING_KEYS.storeAddress, input.storeAddress)
    text(SETTING_KEYS.receiptFooter, input.receiptFooter)
    if (input.shortcutOpenFloat !== undefined) {
      setSetting(SETTING_KEYS.shortcutOpenFloat, input.shortcutOpenFloat)
    }
    if (input.shortcutCashIn !== undefined) setSetting(SETTING_KEYS.shortcutCashIn, input.shortcutCashIn)
    if (input.shortcutCashOut !== undefined) setSetting(SETTING_KEYS.shortcutCashOut, input.shortcutCashOut)
    if (input.shortcutDrawerAction !== undefined) {
      setSetting(SETTING_KEYS.shortcutDrawerAction, input.shortcutDrawerAction)
    }
    if (input.shortcutPrintLabel !== undefined) {
      setSetting(SETTING_KEYS.shortcutPrintLabel, input.shortcutPrintLabel)
    }
    if (input.shortcutPrintBarcode !== undefined) {
      setSetting(SETTING_KEYS.shortcutPrintBarcode, input.shortcutPrintBarcode)
    }
    if (input.shortcutPayCash !== undefined) setSetting(SETTING_KEYS.shortcutPayCash, input.shortcutPayCash)
    if (input.shortcutPayCard !== undefined) setSetting(SETTING_KEYS.shortcutPayCard, input.shortcutPayCard)
    if (input.shortcutPaySinpe !== undefined) setSetting(SETTING_KEYS.shortcutPaySinpe, input.shortcutPaySinpe)

    writeAudit('settings_updated', { entity: 'settings' })
    return getAppSettings()
  })

  handle<{ currentPin: string; newPin: string }, null>(
    'settings:changePin',
    ['admin'],
    async ({ currentPin, newPin }) => {
      if (!PIN_RE.test(newPin)) throw new AppError('firstRun.errors.pinFormat')
      await session.verifyPin(currentPin)
      setSetting(SETTING_KEYS.managerPinHash, await bcrypt.hash(newPin, 10))
      writeAudit('pin_changed', { entity: 'settings', detail: 'manager' })
      return null
    }
  )

  handle<{ currentPin: string; newPin: string }, null>(
    'settings:changeCajaPin',
    ['admin'],
    async ({ currentPin, newPin }) => {
      if (!PIN_RE.test(newPin)) throw new AppError('firstRun.errors.pinFormat')
      const existing = getSetting(SETTING_KEYS.cajaPinHash)
      if (existing) {
        if (!PIN_RE.test(currentPin)) throw new AppError('errors.invalidPin')
        await session.verifyCajaPin(currentPin)
      }
      setSetting(SETTING_KEYS.cajaPinHash, await bcrypt.hash(newPin, 10))
      writeAudit('pin_changed', { entity: 'settings', detail: existing ? 'caja' : 'caja_initial' })
      return null
    }
  )

  handle<{ managerPin: string; cajaPin: string }, { printStatus: PrintStatus }>(
    'settings:printPinCard',
    ['admin'],
    async ({ managerPin, cajaPin }) => {
      if (!PIN_RE.test(managerPin) || !PIN_RE.test(cajaPin)) {
        throw new AppError('firstRun.errors.pinFormat')
      }
      if (!getSetting(SETTING_KEYS.cajaPinHash)) {
        throw new AppError('settings.pinCard.cajaNotConfigured')
      }
      if (
        !isPrintableCode128Barcode(managerPin) ||
        !isPrintableCode128Barcode(cajaPin)
      ) {
        throw new AppError('errors.invalidInput')
      }

      await Promise.all([
        session.verifyPin(managerPin),
        session.verifyCajaPin(cajaPin),
        probePrinter(),
      ])

      const lang = receiptLanguage()
      const user = session.require()
      const storeName = getAppSettings().storeName
      const printJobId = insertPrintJob('label', null, {
        lang,
        lines: buildPinCardLines({
          storeName,
          adminLabel: t(lang, 'settings.pinCard.adminLabel'),
          managerPin,
          username: user.username,
          cajaPin,
          scanHint: t(lang, 'settings.pinCard.scanHint')
        })
      })
      const printStatus = await attemptPrintJob(printJobId)
      writeAudit('pin_card_printed', {
        entity: 'settings',
        detail: user.username
      })
      return { printStatus }
    }
  )
}
