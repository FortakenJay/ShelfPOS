'use strict'

const fs = require('node:fs')
const path = require('node:path')
const Database = require('better-sqlite3')

const SERVICE_ROOT = path.join(__dirname, '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(path.join(SERVICE_ROOT, 'sync.env'))

const dbPath =
  process.env.SQLITE_PATH ?? path.join(process.env.APPDATA, 'shelfpos', 'shelf.db')
const db = new Database(dbPath, { readonly: true })

try {
  const byStatus = db
    .prepare('SELECT status, COUNT(*) AS c FROM sync_queue GROUP BY status')
    .all()
  console.log('sync_queue_by_status', JSON.stringify(byStatus))

  const pending = db
    .prepare('SELECT COUNT(*) AS c FROM sync_queue WHERE status = ?')
    .get('pending').c
  const errors = db
    .prepare('SELECT COUNT(*) AS c FROM sync_queue WHERE status = ?')
    .get('error').c

  console.log('pending_total', pending)
  console.log('error_total (gave up)', errors)

  const recentErrors = db
    .prepare(
      `SELECT table_name, row_id, retry_count, error
       FROM sync_queue
       WHERE status = 'error' OR (status = 'pending' AND error IS NOT NULL)
       ORDER BY id DESC
       LIMIT 10`,
    )
    .all()
  if (recentErrors.length > 0) {
    console.log('recent_failures:')
    for (const row of recentErrors) {
      console.log(
        `  ${row.table_name}#${row.row_id} retries=${row.retry_count} ${row.error}`,
      )
    }
  }

  const roaming = process.env.APPDATA ?? path.join(process.env.USERPROFILE ?? '', 'AppData', 'Roaming')
  console.log('error_log_file', path.join(roaming, 'shelfpos', 'error', 'sync.txt'))

  const tables = [
    'sales',
    'sale_items',
    'sale_payments',
    'products',
    'cierres',
    'pos_users',
    'users',
  ]
  for (const table of tables) {
    const localTable = table === 'pos_users' ? 'users' : table
    let local = 0
    try {
      local = db.prepare(`SELECT COUNT(*) AS c FROM ${localTable}`).get().c
    } catch {
      local = -1
    }
    const synced = db
      .prepare(
        'SELECT COUNT(*) AS c FROM sync_queue WHERE table_name = ? AND status = ?',
      )
      .get(table === 'users' ? 'pos_users' : table, 'synced').c
    const pend = db
      .prepare(
        'SELECT COUNT(*) AS c FROM sync_queue WHERE table_name = ? AND status = ?',
      )
      .get(table === 'users' ? 'pos_users' : table, 'pending').c
    const dead = db
      .prepare(
        'SELECT COUNT(*) AS c FROM sync_queue WHERE table_name = ? AND status = ?',
      )
      .get(table === 'users' ? 'pos_users' : table, 'error').c
    console.log(
      `${table}: local=${local} synced=${synced} pending=${pend} gave_up=${dead}`,
    )
  }
} finally {
  db.close()
}
