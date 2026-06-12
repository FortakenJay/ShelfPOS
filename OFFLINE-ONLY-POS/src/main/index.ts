import { app, BrowserWindow, dialog } from 'electron'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import Database from 'better-sqlite3'
import { setDb } from './db'
import { getDbVersion, runMigrations, SCHEMA_VERSION } from './db/migrations'
import { BackupService } from './services/backup'
import { registerIpcHandlers } from './ipc'

// Deterministic data location regardless of how the app is launched:
// %APPDATA%\shelfpos\shelf.db  (SHELFPOS_DATA_DIR overrides for dev/testing)
app.setName('shelfpos')
app.setPath(
  'userData',
  process.env.SHELFPOS_DATA_DIR ?? join(app.getPath('appData'), 'shelfpos')
)

function fatal(message: string): never {
  dialog.showErrorBox('ShelfPOS', message)
  app.exit(1)
  throw new Error(message)
}

/**
 * Startup sequence (runs before the window is shown):
 * 1. open DB  2. integrity check  3. WAL  4. version gate + pre-migration backup + migrations
 * 5. daily backup
 */
async function initData(): Promise<BackupService> {
  const userData = app.getPath('userData')
  mkdirSync(userData, { recursive: true })
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

  try {
    await backup.dailyBackup()
  } catch (err) {
    console.error('[startup] daily backup failed', err)
  }

  return backup
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#F8FAFC',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  })

  win.on('ready-to-show', () => {
    win.maximize()
    win.show()
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  const backup = await initData()
  registerIpcHandlers(backup)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
