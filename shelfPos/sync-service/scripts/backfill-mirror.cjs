'use strict'

/**
 * One-shot push of live SQLite rows → Supabase mirror (bypasses slow queue drain).
 * Run while sync-service is stopped, or expect duplicate upserts (harmless).
 *
 * Usage: node scripts/backfill-mirror.cjs
 * Env: sync.env (SUPABASE_URL, SUPABASE_SECRET_KEY, SQLITE_PATH)
 */

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { homedir } = require('node:os')
const Database = require('better-sqlite3')
const {
  MIRROR_MANIFEST,
  buildTableSelect,
} = require('../mirror-manifest.cjs')

const CHUNK = 500
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

function defaultSyncConfigPath() {
  const appData = process.env.APPDATA || path.join(homedir(), 'AppData', 'Roaming')
  return path.join(appData, 'shelfpos', 'sync.env')
}

function loadSyncConfig() {
  if (process.env.SHELFPOS_SYNC_CONFIG) {
    loadEnvFile(process.env.SHELFPOS_SYNC_CONFIG)
  } else if (fs.existsSync(defaultSyncConfigPath())) {
    loadEnvFile(defaultSyncConfigPath())
  } else {
    loadEnvFile(path.join(SERVICE_ROOT, 'sync.env'))
  }
}

function decryptDpapi(value) {
  if (!value.startsWith('dpapi:')) return value
  const script = `
$blob = [Console]::In.ReadToEnd().Trim()
Add-Type -AssemblyName System.Security
$enc = [Convert]::FromBase64String($blob)
$bytes = [System.Security.Cryptography.ProtectedData]::Unprotect($enc, $null, 'LocalMachine')
Write-Output ([System.Text.Encoding]::UTF8.GetString($bytes))
`.trim()
  const blob = value.slice('dpapi:'.length)
  return execFileSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { encoding: 'utf8', windowsHide: true, input: blob },
  ).trim()
}

function resolveSecretKey() {
  const raw = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!raw) return ''
  try {
    return decryptDpapi(raw)
  } catch (err) {
    throw new Error(`Failed to decrypt SUPABASE_SECRET_KEY: ${err.message}`)
  }
}

function readRuntimeConfig() {
  loadSyncConfig()
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const supabaseSecretKey = resolveSecretKey()
  const sqlitePath = process.env.SQLITE_PATH
  if (!supabaseUrl || !supabaseSecretKey || !sqlitePath) {
    throw new Error('Missing SUPABASE_URL, SUPABASE_SECRET_KEY, or SQLITE_PATH in sync.env')
  }
  return { supabaseUrl, supabaseSecretKey, sqlitePath, fetchImpl: fetch }
}

function readStoreId(db) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('sync_store_id')
  const value = row?.value?.trim()
  if (!value) throw new Error('sync_store_id not set in SQLite settings')
  return value
}

/** Zeroes corrupt deltas locally too, matching sync-service's sync.ts (audit P2-9/R-N3) —
 *  otherwise this script fixes the mirror but leaves SQLite still holding the bad value. */
function sanitizeMirrorRow(table, row, db) {
  if (table === 'stock_adjustments') {
    const delta = Number(row.delta)
    if (!Number.isFinite(delta) || delta > 10_000_000 || delta < -10_000_000) {
      db.prepare('UPDATE stock_adjustments SET delta = 0 WHERE id = ?').run(row.id)
      console.warn(`stock_adjustments#${row.id}: bad delta ${row.delta} zeroed locally`)
      return { ...row, delta: 0 }
    }
  }
  return row
}

async function upsertChunk(definition, rows, storeId, db, config) {
  const payload = rows.map((row) => ({
    ...sanitizeMirrorRow(definition.table, row, db),
    store_id: storeId,
  }))
  const res = await config.fetchImpl(`${config.supabaseUrl}/rest/v1/${definition.table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.supabaseSecretKey,
      Authorization: `Bearer ${config.supabaseSecretKey}`,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`${definition.table}: ${res.status} ${await res.text()}`)
  }
}

async function syncStoreRegistry(storeId, db, config) {
  const read = (key) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
    return row?.value?.trim() ?? null
  }
  const displayName = read('store_name') ?? storeId
  const posLastSeenAt = read('pos_last_seen_at')
  const rawThreshold = Number(read('stock_threshold_default') ?? '5')
  const stockThresholdDefault =
    Number.isFinite(rawThreshold) && rawThreshold >= 0 ? Math.floor(rawThreshold) : 5
  const rawIvaRate = Number(read('iva_rate_standard') ?? '13')
  const ivaRateStandard = Number.isFinite(rawIvaRate) && rawIvaRate >= 0 ? rawIvaRate : 13

  const res = await config.fetchImpl(`${config.supabaseUrl}/rest/v1/stores?on_conflict=store_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.supabaseSecretKey,
      Authorization: `Bearer ${config.supabaseSecretKey}`,
      Prefer: 'return=minimal,resolution=merge-duplicates',
    },
    body: JSON.stringify({
      store_id: storeId,
      display_name: displayName,
      pos_last_seen_at: posLastSeenAt,
      stock_threshold_default: stockThresholdDefault,
      iva_rate_standard: ivaRateStandard,
    }),
  })
  if (!res.ok) {
    throw new Error(`stores: ${res.status} ${await res.text()}`)
  }
  console.log(`stores: upserted ${storeId} (${displayName})`)
}

function pendingQueueEntries(db, table) {
  return db
    .prepare(
      `SELECT id, row_id FROM sync_queue
       WHERE table_name = ? AND status = 'pending' AND operation <> 'delete'`,
    )
    .all(table)
}

function markQueueEntriesSynced(db, queueIds) {
  if (queueIds.length === 0) return
  const mark = db.prepare(
    `UPDATE sync_queue
     SET status = 'synced', synced_at = datetime('now'), error = NULL
     WHERE id = ? AND status = 'pending'`,
  )
  db.transaction((ids) => {
    for (const id of ids) mark.run(id)
  })(queueIds)
}

async function backfillTable(definition, storeId, db, config, chunkSize = CHUNK) {
  const table = definition.table
  const sql = buildTableSelect(definition)
  const snapshot = db
    .prepare(`SELECT COUNT(*) AS c, MAX(id) AS max_id FROM ${definition.localTable}`)
    .get()
  const total = snapshot.c
  if (total === 0) {
    console.log(`${table}: skip (0 rows)`)
    return
  }

  const queueIdsByRow = new Map()
  for (const entry of pendingQueueEntries(db, table)) {
    const queueIds = queueIdsByRow.get(entry.row_id) ?? []
    queueIds.push(entry.id)
    queueIdsByRow.set(entry.row_id, queueIds)
  }
  const completedQueueIds = []
  let lastId = 0
  let pushed = 0
  while (pushed < total) {
    const rows = db
      .prepare(`${sql} WHERE id > ? AND id <= ? ORDER BY id LIMIT ?`)
      .all(lastId, snapshot.max_id, chunkSize)
    if (rows.length === 0) {
      throw new Error(`${table}: source changed before the backfill snapshot completed`)
    }
    await upsertChunk(definition, rows, storeId, db, config)
    for (const row of rows) {
      completedQueueIds.push(...(queueIdsByRow.get(row.id) ?? []))
    }
    pushed += rows.length
    lastId = rows[rows.length - 1].id
    process.stdout.write(`\r${table}: ${pushed}/${total}`)
  }
  const finalTotal = db
    .prepare(`SELECT COUNT(*) AS c FROM ${definition.localTable} WHERE id <= ?`)
    .get(snapshot.max_id).c
  if (pushed !== total || finalTotal !== total) {
    throw new Error(`${table}: source changed during backfill; queue rows remain pending`)
  }
  console.log(`\r${table}: ${pushed}/${total} done`)

  markQueueEntriesSynced(db, completedQueueIds)
}

async function main() {
  const config = readRuntimeConfig()
  const db = new Database(config.sqlitePath, { readonly: false, fileMustExist: true })
  try {
    const storeId = readStoreId(db)

    console.log(`backfill store_id=${storeId} db=${config.sqlitePath}`)

    await syncStoreRegistry(storeId, db, config)

    for (const definition of MIRROR_MANIFEST) {
      await backfillTable(definition, storeId, db, config)
    }

    const pending = db
      .prepare('SELECT COUNT(*) AS c FROM sync_queue WHERE status = ?')
      .get('pending').c
    console.log(`remaining pending queue rows: ${pending}`)
  } finally {
    db.close()
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('backfill failed:', err)
    process.exitCode = 1
  })
}

module.exports = {
  backfillTable,
  syncStoreRegistry,
}
