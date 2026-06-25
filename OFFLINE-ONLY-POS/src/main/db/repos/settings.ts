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
  shortcutPrintBarcode: 'shortcut_print_barcode',
  shortcutPayCash: 'shortcut_pay_cash',
  shortcutPayCard: 'shortcut_pay_card',
  shortcutPaySinpe: 'shortcut_pay_sinpe',
  /** Multi-store sync identity stamped on every Supabase row (store_a / store_b). */
  syncStoreId: 'sync_store_id',
  /** Updated by the POS app while running; sync service mirrors to Supabase. */
  posLastSeenAt: 'pos_last_seen_at'
} as const

const ACTION_SHORTCUT_KEYS: ActionShortcutKey[] = [
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

function resolvePayShortcuts(
  existing: Pick<
    AppSettings,
    | 'shortcutOpenFloat'
    | 'shortcutCashIn'
    | 'shortcutCashOut'
    | 'shortcutDrawerAction'
    | 'shortcutPrintLabel'
    | 'shortcutPrintBarcode'
  >,
  storedPay: { cash: string | null; card: string | null; sinpe: string | null }
): Pick<AppSettings, 'shortcutPayCash' | 'shortcutPayCard' | 'shortcutPaySinpe'> {
  const used = new Set<ActionShortcutKey>([
    existing.shortcutOpenFloat,
    existing.shortcutCashIn,
    existing.shortcutCashOut,
    existing.shortcutDrawerAction,
    existing.shortcutPrintLabel,
    existing.shortcutPrintBarcode
  ])

  const pick = (stored: string | null, preferred: ActionShortcutKey[]): ActionShortcutKey => {
    if (
      stored &&
      ACTION_SHORTCUT_KEYS.includes(stored as ActionShortcutKey) &&
      !used.has(stored as ActionShortcutKey)
    ) {
      used.add(stored as ActionShortcutKey)
      return stored as ActionShortcutKey
    }
    for (const key of preferred) {
      if (!used.has(key)) {
        used.add(key)
        return key
      }
    }
    const free = ACTION_SHORTCUT_KEYS.find((k) => !used.has(k))
    const resolved = free ?? 'F1'
    used.add(resolved)
    return resolved
  }

  return {
    shortcutPayCash: pick(storedPay.cash, ['F3', 'F1', 'F2', 'F4', 'F5']),
    shortcutPayCard: pick(storedPay.card, ['F5', 'F1', 'F2', 'F3', 'F4']),
    shortcutPaySinpe: pick(storedPay.sinpe, ['F4', 'F1', 'F2', 'F3', 'F5'])
  }
}

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

  const shortcutOpenFloat = shortcutOrDefault(SETTING_KEYS.shortcutOpenFloat, 'F7')
  const shortcutCashIn = shortcutOrDefault(SETTING_KEYS.shortcutCashIn, 'F8')
  const shortcutCashOut = shortcutOrDefault(SETTING_KEYS.shortcutCashOut, 'F9')
  const shortcutDrawerAction = shortcutOrDefault(SETTING_KEYS.shortcutDrawerAction, 'F10')
  const shortcutPrintLabel = shortcutOrDefault(SETTING_KEYS.shortcutPrintLabel, 'F6')
  const shortcutPrintBarcode = shortcutOrDefault(SETTING_KEYS.shortcutPrintBarcode, 'F11')

  const storedPayCash = getSetting(SETTING_KEYS.shortcutPayCash)
  const storedPayCard = getSetting(SETTING_KEYS.shortcutPayCard)
  const storedPaySinpe = getSetting(SETTING_KEYS.shortcutPaySinpe)

  const payShortcuts = resolvePayShortcuts(
    {
      shortcutOpenFloat,
      shortcutCashIn,
      shortcutCashOut,
      shortcutDrawerAction,
      shortcutPrintLabel,
      shortcutPrintBarcode
    },
    { cash: storedPayCash, card: storedPayCard, sinpe: storedPaySinpe }
  )

  if (!storedPayCash) setSetting(SETTING_KEYS.shortcutPayCash, payShortcuts.shortcutPayCash)
  if (!storedPayCard) setSetting(SETTING_KEYS.shortcutPayCard, payShortcuts.shortcutPayCard)
  if (!storedPaySinpe) setSetting(SETTING_KEYS.shortcutPaySinpe, payShortcuts.shortcutPaySinpe)

  return {
    language: (getSetting(SETTING_KEYS.language) as Language | null) ?? null,
    storeName: getSetting(SETTING_KEYS.storeName) ?? 'ShelfPOS',
    stockThresholdDefault: Number(getSetting(SETTING_KEYS.stockThresholdDefault) ?? '5'),
    scannerBurstMs: Number(getSetting(SETTING_KEYS.scannerBurstMs) ?? '30'),
    shortcutOpenFloat,
    shortcutCashIn,
    shortcutCashOut,
    shortcutDrawerAction,
    shortcutPrintLabel,
    shortcutPrintBarcode,
    shortcutPayCash: payShortcuts.shortcutPayCash,
    shortcutPayCard: payShortcuts.shortcutPayCard,
    shortcutPaySinpe: payShortcuts.shortcutPaySinpe,
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
