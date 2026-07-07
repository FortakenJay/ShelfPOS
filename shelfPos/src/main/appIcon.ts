import { app } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Window / taskbar / installer icon (not the in-app sidebar logo). */
export const APP_ICON_FILE = 'ShelfPOS.png'

/** Resolves ShelfPOS.png for dev, packaged Windows, and packaged macOS. */
export function resolveAppIcon(): string | undefined {
  const candidates = [
    // Prefer source public/ in dev so icon updates without a full rebuild.
    join(__dirname, '../../public', APP_ICON_FILE),
    join(app.getAppPath(), 'public', APP_ICON_FILE),
    join(__dirname, '../renderer', APP_ICON_FILE)
  ]

  if (process.resourcesPath) {
    candidates.push(
      join(process.resourcesPath, APP_ICON_FILE),
      join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer', APP_ICON_FILE),
      join(process.resourcesPath, 'app', 'out', 'renderer', APP_ICON_FILE)
    )
  }

  return candidates.find((path) => existsSync(path))
}
