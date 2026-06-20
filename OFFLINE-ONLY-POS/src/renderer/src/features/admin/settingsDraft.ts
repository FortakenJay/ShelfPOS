import type { AppSettings, IdType } from '@shared/types'

export interface SettingsDraft {
  storeName: string
  threshold: string
  scannerMs: string
  legalName: string
  idType: IdType
  storeId: string
  phone: string
  email: string
  activityCode: string
  province: string
  canton: string
  district: string
  address: string
  footer: string
  branchCode: string
  terminalCode: string
  ivaStandard: string
  shortcutOpenFloat: AppSettings['shortcutOpenFloat']
  shortcutCashIn: AppSettings['shortcutCashIn']
  shortcutCashOut: AppSettings['shortcutCashOut']
  shortcutDrawerAction: AppSettings['shortcutDrawerAction']
  shortcutPrintLabel: AppSettings['shortcutPrintLabel']
}

export function draftFromSettings(s: AppSettings): SettingsDraft {
  return {
    storeName: s.storeName,
    threshold: String(s.stockThresholdDefault),
    scannerMs: String(s.scannerBurstMs),
    legalName: s.storeLegalName,
    idType: s.storeIdType,
    storeId: s.storeId,
    phone: s.storePhone,
    email: s.storeEmail,
    activityCode: s.storeActivityCode,
    province: s.storeProvince,
    canton: s.storeCanton,
    district: s.storeDistrict,
    address: s.storeAddress,
    footer: s.receiptFooter,
    branchCode: s.branchCode,
    terminalCode: s.terminalCode,
    ivaStandard: String(s.ivaRateStandard),
    shortcutOpenFloat: s.shortcutOpenFloat,
    shortcutCashIn: s.shortcutCashIn,
    shortcutCashOut: s.shortcutCashOut,
    shortcutDrawerAction: s.shortcutDrawerAction,
    shortcutPrintLabel: s.shortcutPrintLabel
  }
}

const GENERAL_KEYS = ['storeName', 'threshold', 'scannerMs'] as const
const EMISOR_KEYS = [
  'legalName',
  'idType',
  'storeId',
  'phone',
  'email',
  'activityCode',
  'province',
  'canton',
  'district',
  'address',
  'footer'
] as const
const TAX_KEYS = ['branchCode', 'terminalCode', 'ivaStandard'] as const
const SHORTCUT_KEYS = [
  'shortcutOpenFloat',
  'shortcutCashIn',
  'shortcutCashOut',
  'shortcutDrawerAction',
  'shortcutPrintLabel'
] as const

function sectionDirty(
  draft: SettingsDraft,
  saved: SettingsDraft,
  keys: readonly (keyof SettingsDraft)[]
): boolean {
  return keys.some((k) => draft[k] !== saved[k])
}

export function generalDraftDirty(draft: SettingsDraft, saved: SettingsDraft): boolean {
  return sectionDirty(draft, saved, GENERAL_KEYS)
}

export function emisorDraftDirty(draft: SettingsDraft, saved: SettingsDraft): boolean {
  return sectionDirty(draft, saved, EMISOR_KEYS)
}

export function taxDraftDirty(draft: SettingsDraft, saved: SettingsDraft): boolean {
  return sectionDirty(draft, saved, TAX_KEYS)
}

export function shortcutsDraftDirty(draft: SettingsDraft, saved: SettingsDraft): boolean {
  return sectionDirty(draft, saved, SHORTCUT_KEYS)
}
