import { getDb } from '../index'
import type {
  ActionShortcutKey,
  AppSettings,
  IdType,
  Language,
  TaxCategory,
  TaxRegime
} from '../../../shared/types'

export const SETTING_KEYS = {
  language: 'language',
  storeName: 'store_name',
  firstRunComplete: 'first_run_complete',
  stockThresholdDefault: 'stock_threshold_default',
  scannerBurstMs: 'scanner_burst_ms',
  managerPinHash: 'manager_pin_hash',
  cajaPinHash: 'caja_pin_hash',
  taxRegime: 'tax_regime',
  ivaRateStandard: 'iva_rate_standard',
  branchCode: 'branch_code',
  terminalCode: 'terminal_code',
  consecutivoNext: 'consecutivo_next',
  storeLegalName: 'store_legal_name',
  storeIdType: 'store_id_type',
  storeId: 'store_id',
  storePhone: 'store_phone',
  storeEmail: 'store_email',
  storeActivityCode: 'store_activity_code',
  storeProvince: 'store_province',
  storeCanton: 'store_canton',
  storeDistrict: 'store_district',
  storeAddress: 'store_address',
  receiptFooter: 'receipt_footer',
  shortcutOpenFloat: 'shortcut_open_float',
  shortcutCashIn: 'shortcut_cash_in',
  shortcutCashOut: 'shortcut_cash_out',
  shortcutDrawerAction: 'shortcut_drawer_action',
  shortcutPrintLabel: 'shortcut_print_label',
  /** Multi-store sync identity stamped on every Supabase row (store_a / store_b). */
  syncStoreId: 'sync_store_id',
  /** Updated by the POS app while running; sync service mirrors to Supabase. */
  posLastSeenAt: 'pos_last_seen_at'
} as const

export function getSetting(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
    .run(key, value)
}

export function getAppSettings(): AppSettings {
  const shortcutOrDefault = (key: string, fallback: ActionShortcutKey): ActionShortcutKey =>
    (getSetting(key) as ActionShortcutKey | null) ?? fallback

  return {
    language: (getSetting(SETTING_KEYS.language) as Language | null) ?? null,
    storeName: getSetting(SETTING_KEYS.storeName) ?? 'ShelfPOS',
    stockThresholdDefault: Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5'),
    scannerBurstMs: Number(getSetting(SETTING_KEYS.scannerBurstMs) ?? '30'),
    shortcutOpenFloat: shortcutOrDefault(SETTING_KEYS.shortcutOpenFloat, 'F7'),
    shortcutCashIn: shortcutOrDefault(SETTING_KEYS.shortcutCashIn, 'F8'),
    shortcutCashOut: shortcutOrDefault(SETTING_KEYS.shortcutCashOut, 'F9'),
    shortcutDrawerAction: shortcutOrDefault(SETTING_KEYS.shortcutDrawerAction, 'F10'),
    shortcutPrintLabel: shortcutOrDefault(SETTING_KEYS.shortcutPrintLabel, 'F6'),
    firstRunComplete: getSetting(SETTING_KEYS.firstRunComplete) === '1',
    cajaPinConfigured: !!getSetting(SETTING_KEYS.cajaPinHash),
    taxRegime: (getSetting(SETTING_KEYS.taxRegime) as TaxRegime | null) ?? 'simplificado',
    ivaRateStandard: Number(getSetting(SETTING_KEYS.ivaRateStandard) ?? '13'),
    branchCode: getSetting(SETTING_KEYS.branchCode) ?? '001',
    terminalCode: getSetting(SETTING_KEYS.terminalCode) ?? '00001',
    storeLegalName: getSetting(SETTING_KEYS.storeLegalName) ?? '',
    storeIdType: (getSetting(SETTING_KEYS.storeIdType) as IdType | null) ?? 'fisica',
    storeId: getSetting(SETTING_KEYS.storeId) ?? '',
    storePhone: getSetting(SETTING_KEYS.storePhone) ?? '',
    storeEmail: getSetting(SETTING_KEYS.storeEmail) ?? '',
    storeActivityCode: getSetting(SETTING_KEYS.storeActivityCode) ?? '',
    storeProvince: getSetting(SETTING_KEYS.storeProvince) ?? '',
    storeCanton: getSetting(SETTING_KEYS.storeCanton) ?? '',
    storeDistrict: getSetting(SETTING_KEYS.storeDistrict) ?? '',
    storeAddress: getSetting(SETTING_KEYS.storeAddress) ?? '',
    receiptFooter: getSetting(SETTING_KEYS.receiptFooter) ?? ''
  }
}

/** IVA rate (fraction, e.g. 0.13) from settings. All products use the standard rate. */
export function ivaRateFor(_category: TaxCategory): number {
  return getAppSettings().ivaRateStandard / 100
}

export function currentLanguage(): Language {
  return (getSetting(SETTING_KEYS.language) as Language | null) ?? 'es'
}

/** Thermal receipt/report language — always Spanish (ESC/POS CP850). */
export function receiptLanguage(): Language {
  return 'es'
}
