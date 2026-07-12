'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { before, test } = require('node:test')

const serviceRoot = path.join(__dirname, '..')
const {
  MIRROR_MANIFEST,
  buildTableSelect,
} = require('../mirror-manifest.cjs')
const { backfillTable } = require('../scripts/backfill-mirror.cjs')

let getLiveRow

before(async () => {
  const liveDbModule = await import(pathToFileURL(path.join(serviceRoot, 'dist', 'db.js')).href)
  getLiveRow = liveDbModule.getLiveRow
})

function projectedRow(definition, id) {
  return Object.fromEntries(
    definition.columns.map((column) => [
      column,
      column === 'id' ? id : `${definition.table}:${column}`,
    ]),
  )
}

function projectionFixture(definition, rows) {
  return {
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, ' ').trim()
      const expectedStart = buildTableSelect(definition)
      assert.ok(normalized.startsWith(expectedStart), `unexpected projection SQL: ${normalized}`)
      assert.match(normalized, /\bWHERE id = \?$/)
      return {
        get(id) {
          return rows.find((row) => row.id === id)
        },
      }
    },
  }
}

function findSupabaseSchema() {
  const configured = process.env.SHELFPOS_DASHBOARD_SUPA_SQL
  const candidates = [
    configured,
    path.resolve(serviceRoot, '..', '..', '..', 'ShelfPOS-Dashboard', 'SUPA.sql'),
  ].filter(Boolean)
  return candidates.find((candidate) => fs.existsSync(candidate))
}

function supabaseColumns(schema, table) {
  const match = schema.match(
    new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\s*\\(([\\s\\S]*?)\\n\\);`),
  )
  assert.ok(match, `SUPA.sql is missing public.${table}`)
  return match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('CONSTRAINT'))
    .map((line) => line.match(/^([a-z_][a-z0-9_]*)\s+/)?.[1])
    .filter(Boolean)
}

function supabaseMirrorTables(schema) {
  const match = schema.match(/FOREACH t IN ARRAY ARRAY\[\s*([\s\S]*?)\s*\]\s*LOOP/)
  assert.ok(match, 'SUPA.sql is missing the mirror-table RLS list')
  return [...match[1].matchAll(/'([a-z_][a-z0-9_]*)'/g)].map((entry) => entry[1])
}

test('live and backfill projections use every manifest table and column', () => {
  for (const definition of MIRROR_MANIFEST) {
    const rows = [projectedRow(definition, 1)]
    const db = projectionFixture(definition, rows)
    const liveRow = getLiveRow(db, definition.table, 1)
    const backfillRow = db
      .prepare(`${buildTableSelect(definition)} WHERE id = ?`)
      .get(1)

    assert.deepEqual(liveRow, backfillRow, `${definition.table} projection drifted`)
    assert.deepEqual(
      Object.keys(liveRow),
      definition.columns,
      `${definition.table} did not project the checked column order`,
    )
  }
})

const supaPath = findSupabaseSchema()
test(
  'mirror manifest matches the reference Dashboard SUPA.sql schema',
  { skip: supaPath ? false : 'Set SHELFPOS_DASHBOARD_SUPA_SQL to the reference SUPA.sql' },
  () => {
    const schema = fs.readFileSync(supaPath, 'utf8')
    assert.deepEqual(
      new Set(MIRROR_MANIFEST.map((definition) => definition.table)),
      new Set(supabaseMirrorTables(schema)),
      'manifest table coverage differs from Dashboard SUPA.sql',
    )
    for (const definition of MIRROR_MANIFEST) {
      assert.deepEqual(
        new Set(supabaseColumns(schema, definition.table)),
        new Set(['store_id', ...definition.columns]),
        `${definition.table} differs from Dashboard SUPA.sql`,
      )
    }
  },
)

test('backfill push failure leaves the captured queue rows pending', async () => {
  const definition = MIRROR_MANIFEST.find((entry) => entry.table === 'customers')
  assert.ok(definition)

  const rows = [projectedRow(definition, 1), projectedRow(definition, 2)]
  const queueRows = [
    { id: 1, row_id: 1, status: 'pending', synced_at: null },
    { id: 2, row_id: 2, status: 'pending', synced_at: null },
  ]
  const db = {
    prepare(sql) {
      const normalized = sql.replace(/\s+/g, ' ').trim()
      if (normalized === 'SELECT COUNT(*) AS c, MAX(id) AS max_id FROM customers') {
        return { get: () => ({ c: rows.length, max_id: rows.at(-1).id }) }
      }
      if (normalized === 'SELECT COUNT(*) AS c FROM customers WHERE id <= ?') {
        return { get: (maxId) => ({ c: rows.filter((row) => row.id <= maxId).length }) }
      }
      if (normalized.startsWith('SELECT id, row_id FROM sync_queue')) {
        return {
          all: () => queueRows.map(({ id, row_id }) => ({ id, row_id })),
        }
      }
      if (normalized.startsWith(buildTableSelect(definition))) {
        return {
          all: (lastId, maxId, limit) =>
            rows.filter((row) => row.id > lastId && row.id <= maxId).slice(0, limit),
        }
      }
      throw new Error(`unexpected fixture SQL: ${normalized}`)
    },
  }

  let requestCount = 0
  const config = {
    supabaseUrl: 'https://example.invalid',
    supabaseSecretKey: 'disposable-test-key',
    fetchImpl: async () => {
      requestCount += 1
      if (requestCount === 1) {
        return { ok: true, status: 201, text: async () => '' }
      }
      return { ok: false, status: 503, text: async () => 'fixture failure' }
    },
  }

  await assert.rejects(
    backfillTable(definition, 'fixture-store', db, config, 1),
    /customers: 503 fixture failure/,
  )

  assert.deepEqual(queueRows, [
    { id: 1, row_id: 1, status: 'pending', synced_at: null },
    { id: 2, row_id: 2, status: 'pending', synced_at: null },
  ])
})
