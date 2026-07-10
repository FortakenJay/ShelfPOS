'use strict'

/**
 * Re-queue all POS users for Supabase mirror sync.
 * Use when pos_users synced before the Supabase table existed, or dashboard Equipo is empty.
 *
 * Usage: node scripts/requeue-pos-users.cjs
 * Env: sync.env (SQLITE_PATH)
 */

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

const sqlitePath = process.env.SQLITE_PATH
if (!sqlitePath) {
  console.error('Missing SQLITE_PATH in sync.env')
  process.exit(1)
}

// Must match src/shared/operator-account.ts's HIDDEN_OPERATOR_USERNAME (plain .cjs script,
// not part of the TS vendor pipeline, so this can't import it directly).
const HIDDEN_OPERATOR_USERNAME = 'SAKEN'

const db = new Database(sqlitePath)
const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
// Exclude the hidden operator account — mirrors the filter in the main sync path.
const users = db
  .prepare(`SELECT id, username FROM users WHERE lower(username) <> lower(?) ORDER BY id`)
  .all(HIDDEN_OPERATOR_USERNAME)

db.prepare(`DELETE FROM sync_queue WHERE table_name = 'pos_users'`).run()

const insert = db.prepare(`
  INSERT INTO sync_queue (table_name, row_id, operation, created_at)
  VALUES ('pos_users', ?, 'update', ?)
`)

for (const user of users) {
  insert.run(user.id, now)
}

console.log(`Re-queued ${users.length} pos_users row(s):`, users.map((u) => u.username).join(', '))
db.close()
