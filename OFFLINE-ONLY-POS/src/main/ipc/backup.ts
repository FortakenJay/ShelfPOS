import { dialog } from 'electron'
import { join } from 'node:path'
import { writeFileSync } from 'node:fs'
import { handle } from './helpers'
import { getDb, getDbPath } from '../db'
import { rangeBounds } from '../db/helpers'
import { currentLanguage } from '../db/repos/settings'
import { buildCsv } from '../services/csv'
import { formatPaymentMethod, SALES_CSV_KEYS, salesCsvHeaders } from '../services/csvColumns'
import type { BackupService } from '../services/backup'
import type { BackupInfo, DateRange } from '../../shared/types'

export function registerBackupHandlers(backup: BackupService): void {
  handle<void, BackupInfo>('backup:info', ['admin'], () => ({
    dbPath: getDbPath(),
    backupDir: backup.backupDir,
    backups: backup.listBackups()
  }))

  handle<void, { canceled: boolean; path?: string }>('backup:runManual', ['admin'], async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (result.canceled || !result.filePaths[0]) return { canceled: true }
    const stamp = new Date()
      .toISOString()
      .replace(/[:T]/g, '-')
      .slice(0, 19)
    const dest = join(result.filePaths[0], `shelfpos-manual-${stamp}.db`)
    await backup.backupTo(dest)
    return { canceled: false, path: dest }
  })

  handle<{ range: DateRange }, { canceled: boolean; path?: string }>(
    'backup:exportCsv',
    ['admin'],
    async ({ range }) => {
      const lang = currentLanguage()
      const result = await dialog.showSaveDialog({
        defaultPath: `ventas-${range.from}-${range.to}.csv`,
        filters: [{ name: 'CSV', extensions: ['csv'] }]
      })
      if (result.canceled || !result.filePath) return { canceled: true }

      const [fromTs, toTs] = rangeBounds(range)
      const rows = getDb()
        .prepare(
          `SELECT s.id AS sale_id, s.created_at, u.username AS cashier, s.payment_method,
                  s.sinpe_ref, s.total AS sale_total, s.cierre_id,
                  p.barcode, p.name AS product, si.quantity, si.unit_price, si.line_total
           FROM sales s
           JOIN users u ON u.id = s.user_id
           JOIN sale_items si ON si.sale_id = s.id
           JOIN products p ON p.id = si.product_id
           WHERE s.created_at >= ? AND s.created_at <= ?
           ORDER BY s.id, si.id`
        )
        .all(fromTs, toTs) as Record<string, unknown>[]

      const translated = rows.map((row) => ({
        ...row,
        payment_method: formatPaymentMethod(lang, String(row.payment_method ?? ''))
      }))

      const csv = buildCsv(
        salesCsvHeaders(lang),
        [...SALES_CSV_KEYS],
        translated
      )
      writeFileSync(result.filePath, csv, 'utf8')
      return { canceled: false, path: result.filePath }
    }
  )
}
