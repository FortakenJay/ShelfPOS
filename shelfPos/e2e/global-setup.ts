import { access } from 'node:fs/promises'
import { resolve } from 'node:path'

export default async function globalSetup(): Promise<void> {
  const mainEntry = resolve('out/main/index.js')
  try {
    await access(mainEntry)
  } catch {
    throw new Error(
      `Built Electron entry not found at ${mainEntry}. Run "npm run build" before "npm run test:e2e".`
    )
  }
}
