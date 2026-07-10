'use strict'

/**
 * Remove redundant pending queue rows — keeps only the latest pending entry per (table, row).
 * Safe before catch-up: older pending ops for the same row are superseded by newer ones.
 */

const path = require('node:path')
const Database = require('better-sqlite3')

const dbPath =
  process.env.SQLITE_PATH ?? path.join(process.env.APPDATA, 'shelfpos', 'shelf.db')
const db = new Database(dbPath)

const before = db
  .prepare('SELECT COUNT(*) AS c FROM sync_queue WHERE status = ?')
  .get('pending').c

// Never drop 'delete' rows: a newer update row would supersede the delete intent
// and the row would resurrect in the mirror. Compaction only collapses
// insert/update snapshots, which are idempotent.
const result = db.prepare(`
  DELETE FROM sync_queue
  WHERE status = 'pending'
    AND operation <> 'delete'
    AND id NOT IN (
      SELECT MAX(id) FROM sync_queue
      WHERE status = 'pending' AND operation <> 'delete'
      GROUP BY table_name, row_id
    )
`).run()

const after = db
  .prepare('SELECT COUNT(*) AS c FROM sync_queue WHERE status = ?')
  .get('pending').c

console.log(`compact: before=${before} removed=${result.changes} after=${after}`)
db.close()
