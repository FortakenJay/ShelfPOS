# Sync Service

Parent: [[Home]]

**Package:** `OFFLINE-ONLY-POS/sync-service/` (`@shelfpos/sync-service`)

## Config (`sync.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Service role (bypasses RLS) |
| `SQLITE_PATH` | Yes | Path to `shelf.db` |
| `STORE_PAIRING_CODE` | First link only | From dashboard **Vincular POS** |
| `STORE_CLAIM_CODE` | Legacy alias | Same as `STORE_PAIRING_CODE` |

Loader: `src/config.ts`  
Template: `sync.env.example`

### Config location

**Production:** `%APPDATA%\Roaming\shelfpos\sync.env` (user-writable; POS **Vincular con el panel** GUI or installer).

Service env `SHELFPOS_SYNC_CONFIG` points to that path.

### Encrypted service key

`SUPABASE_SERVICE_KEY` is stored as `dpapi:<base64>` (Windows DPAPI **LocalMachine**). Only decrypts on the **same PC** — copying the file elsewhere does not expose the key.

Plaintext key still supported for dev/non-Windows.

### POS setup GUI

**Route:** `/sync-setup` (admin, after first login if not configured)  
**Settings:** link to cloud sync wizard  
**IPC:** `syncSetup:status`, `syncSetup:save`, `syncSetup:restartService`

### Claim lifecycle

1. On startup, `claimStoreIfNeeded()` calls RPC `claim_store_sync(code, sync_store_id)`.
2. Success → `store_access` row + SQLite `sync_owner_claimed=1`.
3. `STORE_CLAIM_CODE` can be removed from `sync.env` afterward.
4. If unset, sync continues but owners cannot see the store in the dashboard until linked.

## Main loop (`src/index.ts`)

1. Open SQLite (same file as POS — WAL safe for concurrent read)
2. `claimStoreIfNeeded()` once
3. `enqueueAllPosUsersBackfill()` if needed
4. Repeat `runSyncCycle()`:
   - Offline → sleep 30s
   - `syncStoreRegistry()` — upsert `stores`
   - Process batch of `sync_queue` (100 rows)
   - Empty queue → sleep 5s

## processEntry (`src/sync.ts`)

| Operation | Action |
|-----------|--------|
| upsert | POST `/rest/v1/{table}` with `Prefer: resolution=merge-duplicates` |
| delete | DELETE where `store_id` + `id` |
| row missing + delete | DELETE remote (tombstone) |

Payload always includes `store_id` from `settings.sync_store_id`.

## Error handling

- Retries: up to 10 (`MAX_RETRIES`)
- Logs: `%APPDATA%\Roaming\shelfpos\error\sync.txt` (`src/errorLog.ts`)
- Console warn/error on retry / give-up

## LIVE_ROW_SQL

`src/db.ts` maps SQLite columns → JSON for each synced table. **Must match** `SUPA.sql` columns.

## Ops scripts

| Script | Purpose |
|--------|---------|
| `npm run queue:diagnose` | Queue stats + error log path |
| `npm run backfill` | Push existing rows to mirror |
| `npm run install:windows` | Register Windows service |

## Windows service

| Item | Value |
|------|-------|
| Service name | `ShelfPOSSync` |
| Install dir | `C:\Program Files\ShelfPOS\sync-service` |
| Installer | `OFFLINE-ONLY-POS/scripts/Install-ShelfPOS.ps1` |
| Restart | `Restart-Service ShelfPOSSync` or `services.msc` |

Env file path is passed as `SHELFPOS_SYNC_CONFIG` in `install-windows-service.cjs`.

## Related

- [[03-Data-Flow]]
- [[04-Multi-Tenant-Security]]
- [[05-SQLite-Schema]]
