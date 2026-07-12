import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import {
  _electron as electron,
  test as base,
  expect,
  type ElectronApplication,
  type Page
} from '@playwright/test'

interface ElectronFixtures {
  electronApp: ElectronApplication
  page: Page
  dataDir: string
}

const electronExecutable = resolve('node_modules/electron/dist/electron.exe')

export const test = base.extend<ElectronFixtures>({
  // Playwright requires fixture dependency parameters to use object destructuring.
  // eslint-disable-next-line no-empty-pattern
  dataDir: async ({}, use) => {
    const directory = await mkdtemp(resolve(tmpdir(), 'shelfpos-e2e-'))
    await use(directory)
    await rm(directory, { recursive: true, force: true }).catch(() => {})
  },

  electronApp: async ({ dataDir }, use) => {
    const app = await electron.launch({
      executablePath: electronExecutable,
      args: [resolve('out/main/index.js')],
      cwd: resolve('.'),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        SHELFPOS_TEST: '1',
        SHELFPOS_DATA_DIR: dataDir
      }
    })

    await use(app)
    await app.close()
  },

  page: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await use(window)
  }
})

export { expect }
