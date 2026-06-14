import bcrypt from 'bcryptjs'
import { handle } from './helpers'
import { AppError } from '../errors'
import { getAppSettings, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import type { AppSettings, IdType, Language, SettingsUpdateInput } from '../../shared/types'

const PIN_RE = /^\d{4,6}$/
const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']

export function registerSettingsHandlers(): void {
  // Public: the renderer needs the language before any login (e.g. login screen).
  handle<void, AppSettings>('settings:get', 'public', () => getAppSettings())

  handle<{ language: Language }, null>('settings:setLanguage', 'public', ({ language }) => {
    if (language !== 'es' && language !== 'zh-CN') throw new AppError('errors.invalidInput')
    setSetting(SETTING_KEYS.language, language)
    return null
  })

  handle<SettingsUpdateInput, AppSettings>('settings:update', ['admin'], (input) => {
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
    rate(SETTING_KEYS.ivaRateCanastaBasica, input.ivaRateCanastaBasica)

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
      await session.verifyCajaPin(currentPin)
      setSetting(SETTING_KEYS.cajaPinHash, await bcrypt.hash(newPin, 10))
      writeAudit('pin_changed', { entity: 'settings', detail: 'caja' })
      return null
    }
  )
}
