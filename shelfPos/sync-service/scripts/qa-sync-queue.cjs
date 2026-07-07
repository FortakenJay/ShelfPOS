'use strict'

const path = require('node:path')
const Database = require('better-sqlite3')

const dbPath = path.join(process.env.APPDATA, 'shelfpos', 'shelf.db')
const db = new Database(dbPath, { readonly: true })

try {
  const byStatus = db
    .prepare('SELECT status, COUNT(*) as c FROM sync_queue GROUP BY status')
    .all()
  console.log('sync_queue_by_status', JSON.stringify(byStatus))

  const pending = db
    .prepare("SELECT COUNT(*) as c FROM sync_queue WHERE status IN ('pending','error')")
    .get()
  console.log('pending_or_error', pending.c)
} catch (error) {
  console.error('query_failed', error.message)
  process.exitCode = 1
} finally {
  db.close()
}
