import { app } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Resolves SHELFPOS.png for dev (public/) and production (out/renderer/). */
export function resolveAppIcon(): string | undefined {
  const candidates = [
    join(app.getAppPath(), 'public', 'SHELFPOS.png'),
    join(__dirname, '../renderer/SHELFPOS.png')
  ]
  return candidates.find((path) => existsSync(path))
}
