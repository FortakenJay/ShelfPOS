import { join } from 'node:path'
import { existsSync, readdirSync, unlinkSync } from 'node:fs'
import { getDb } from '../db'
import { todayLocal } from '../db/helpers'

const DAILY_PREFIX = 'shelf-'
const KEEP_DAILY = 7

export class BackupService {
  constructor(public readonly backupDir: string) {}

  async backupTo(destPath: string): Promise<string> {
    await getDb().backup(destPath)
    return destPath
  }

  private dailyPath(): string {
    return join(this.backupDir, `${DAILY_PREFIX}${todayLocal()}.db`)
  }

  /** Once-per-calendar-day backup, run on app launch. */
  async dailyBackup(): Promise<void> {
    const dest = this.dailyPath()
    if (existsSync(dest)) return
    await this.backupTo(dest)
    this.cleanup()
  }

  /** Backup after a successful cierre (refreshes today's file). */
  async onCierre(): Promise<void> {
    await this.backupTo(this.dailyPath())
    this.cleanup()
  }

  listBackups(): string[] {
    if (!existsSync(this.backupDir)) return []
    return readdirSync(this.backupDir)
      .filter((f) => f.endsWith('.db'))
      .sort()
      .reverse()
  }

  private cleanup(): void {
    const daily = readdirSync(this.backupDir)
      .filter((f) => f.startsWith(DAILY_PREFIX) && f.endsWith('.db'))
      .sort()
      .reverse()
    for (const old of daily.slice(KEEP_DAILY)) {
      try {
        unlinkSync(join(this.backupDir, old))
      } catch {
        // best-effort cleanup
      }
    }
  }
}
