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
  ivaCanasta: string
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
    ivaCanasta: String(s.ivaRateCanastaBasica)
  }
}
