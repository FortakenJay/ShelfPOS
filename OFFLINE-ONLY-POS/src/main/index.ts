import { app, BrowserWindow, dialog } from 'electron'

import { join } from 'node:path'

import { mkdirSync } from 'node:fs'

import Database from 'better-sqlite3'

import { setDb } from './db'

import { getDbVersion, runMigrations, SCHEMA_VERSION } from './db/migrations'

import { BackupService } from './services/backup'

import { purgeExpiredReportData } from './services/dataRetention'

import { applyPendingSyncStoreId } from './services/pendingStoreId'

import { enqueueAllPosUsersSync } from './db/repos/syncQueue'

import { initPrinter, flushPendingPrintJobs } from './services/printer'

import { startPosHeartbeat, stopPosHeartbeat } from './services/posHeartbeat'

import { registerIpcHandlers } from './ipc'

import { registerLicenseHandlers } from './ipc/license'

import { resolveAppIcon } from './appIcon'

import { checkLicense } from './license'

import { createActivationWindow } from './activationWindow'



// Deterministic data location regardless of how the app is launched:

// %APPDATA%\shelfpos\shelf.db  (SHELFPOS_DATA_DIR overrides for dev/testing)

app.setName('shelfpos')

app.setPath(

  'userData',

  process.env.SHELFPOS_DATA_DIR ?? join(app.getPath('appData'), 'shelfpos')

)



let mainWindow: BrowserWindow | null = null

let appStarted = false



function fatal(message: string): never {

  dialog.showErrorBox('ShelfPOS', message)

  app.exit(1)

  throw new Error(message)

}



/**

 * Startup sequence (runs before the main window is shown):

 * 1. open DB  2. integrity check  3. WAL  4. version gate + pre-migration backup + migrations

 * 5. daily backup  6. purge report data older than 1 year  7. probe receipt printer

 */

async function initData(): Promise<BackupService> {

  const userData = app.getPath('userData')

  mkdirSync(userData, { recursive: true })

  const { loadOperatorEnv } = await import('./services/operatorConfig')

  loadOperatorEnv(userData)

  const backupDir = join(userData, 'backups')

  mkdirSync(backupDir, { recursive: true })



  const dbPath = join(userData, 'shelf.db')

  const db = new Database(dbPath)

  setDb(db, dbPath)



  const integrity = db.pragma('integrity_check', { simple: true }) as string

  if (integrity !== 'ok') {

    fatal(

      `La base de datos está dañada.\n\nPor favor, restaure el archivo de respaldo más reciente desde:\n${backupDir}\n\ny contacte soporte.`

    )

  }



  db.pragma('journal_mode = WAL')

  db.pragma('synchronous = NORMAL')

  db.pragma('foreign_keys = ON')



  const backup = new BackupService(backupDir)

  const version = getDbVersion(db)

  if (version > SCHEMA_VERSION) {

    fatal(

      'Esta base de datos fue creada con una versión más reciente de ShelfPOS.\n\nPor favor, actualice la aplicación.'

    )

  }

  if (version < SCHEMA_VERSION) {

    if (version > 0) {

      await backup.backupTo(join(backupDir, `pre-migration-v${version}.db`))

    }

    try {

      runMigrations(db)

    } catch (err) {

      console.error('[startup] migration failed', err)

      fatal(

        `No se pudo actualizar la base de datos. Se restauró el estado anterior.\n\nRespaldo disponible en:\n${backupDir}`

      )

    }

  }

  applyPendingSyncStoreId(userData)

  try {

    await backup.dailyBackup()

  } catch (err) {

    console.error('[startup] daily backup failed', err)

  }



  try {

    const purged = purgeExpiredReportData()

    if (purged && (purged.sales > 0 || purged.cierres > 0 || purged.printJobs > 0 || purged.cashMovements > 0)) {

      console.log('[startup] purged expired report data', purged)

    }

  } catch (err) {

    console.error('[startup] data retention purge failed', err)

  }

  try {
    const queuedUsers = enqueueAllPosUsersSync(db)
    if (queuedUsers > 0) {
      console.log(`[startup] queued ${queuedUsers} pos_users row(s) for Supabase sync`)
    }
  } catch (err) {
    console.error('[startup] pos_users sync queue failed', err)
  }

  return backup

}



function createMainWindow(): void {

  if (mainWindow && !mainWindow.isDestroyed()) {

    mainWindow.focus()

    return

  }



  const icon = resolveAppIcon()

  mainWindow = new BrowserWindow({

    width: 1280,

    height: 800,

    minWidth: 1024,

    minHeight: 700,

    show: false,

    autoHideMenuBar: true,

    backgroundColor: '#F8FAFC',

    ...(icon ? { icon } : {}),

    webPreferences: {

      preload: join(__dirname, '../preload/index.js'),

      contextIsolation: true,

      nodeIntegration: false,

      sandbox: false,

      spellcheck: false

    }

  })



  mainWindow.on('closed', () => {

    mainWindow = null

  })



  mainWindow.on('ready-to-show', () => {

    mainWindow?.maximize()

    mainWindow?.show()

  })



  if (process.env.ELECTRON_RENDERER_URL) {

    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)

  } else {

    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))

  }

}



async function startLicensedApp(): Promise<void> {

  if (appStarted) return

  appStarted = true



  const backup = await initData()

  await initPrinter()

  registerIpcHandlers(backup)

  startPosHeartbeat()

  createMainWindow()

  void flushPendingPrintJobs()

}



app.whenReady().then(async () => {

  registerLicenseHandlers(() => startLicensedApp())



  if (await checkLicense()) {

    await startLicensedApp()

  } else {

    createActivationWindow()

  }



  app.on('activate', async () => {

    if (BrowserWindow.getAllWindows().length === 0) {

      if (await checkLicense()) {

        await startLicensedApp()

      } else {

        createActivationWindow()

      }

    }

  })

})



app.on('window-all-closed', () => {

  app.quit()

})

app.on('before-quit', () => {
  stopPosHeartbeat()
})


