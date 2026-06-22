# Data Flow

Parent: [[Home]]

## Sale checkout (happy path)

```mermaid
sequenceDiagram
  participant UI as POS Renderer
  participant IPC as main/ipc/sales
  participant DB as SQLite
  participant Q as sync_queue
  participant S as sync-service
  participant SB as Supabase

  UI->>IPC: sales:create
  IPC->>DB: BEGIN transaction
  Note over IPC,DB: INSERT sales, sale_items, sale_payments
  Note over IPC,DB: UPDATE products.stock WHERE stock >= qty
  IPC->>Q: enqueueSync (same txn)
  IPC->>DB: COMMIT
  IPC-->>UI: ApiResult success

  loop every 5s when online
    S->>Q: listPendingQueue
    S->>DB: getLiveRow
    S->>SB: POST upsert + store_id
    S->>Q: markSynced
  end
```

**Key file:** `OFFLINE-ONLY-POS/src/main/ipc/sales.ts`

### Invariants enforced in IPC (authoritative)

- Stock: conditional `UPDATE … WHERE stock >= ?`; `changes === 0` → `errors.outOfStock`
- Cart validation duplicated in renderer (toast) + IPC (transaction)
- `barcode_snapshot` stored on `sale_items` at checkout (v14) for factura grid

## Sync queue priority

`listPendingQueue` orders tables so parents exist before children:

`sales` → `sale_items` → `sale_payments` → `cierres` → `cash_movements` → …

**Retries:** max 10; then status `error`. Logs: `%APPDATA%\shelfpos\error\sync.txt`

## Store registry heartbeat

1. POS `posHeartbeat.ts` writes `settings.pos_last_seen_at` every 30s
2. sync-service `syncStoreRegistry()` upserts `stores` row
3. Dashboard `fetchStorePresence()` — online if seen within 45s

## Dashboard read path

```typescript
// Typical query pattern
getSupabase()
  .from('sales')
  .select('id, total, created_at, …')
  .eq('store_id', storeId)  // app filter
// RLS also enforces store_access membership
```

Aggregations live in `DASHBOARD/src/lib/queries/dashboard.ts` and `reports.ts` — **not** in JSX.

## Claim / tenancy flow

See [[04-Multi-Tenant-Security]] and [[15-Setup-And-Deployment]].

1. Owner signs up on **production** dashboard URL
2. **Vincular POS** (`/link-pos`) → `create_store_claim()` → 8-char code (24h, single use)
3. On **that shop's PC:** `STORE_CLAIM_CODE` in `sync.env` → restart `ShelfPOSSync`
4. Sync startup → `claim_store_sync()` → `store_access` row + `sync_owner_claimed` in SQLite
5. Owner refreshes → `fetchStores()` returns only RLS-allowed stores

## Related

- [[10-Sync-Service]]
- [[05-SQLite-Schema]]
- [[06-Supabase-Schema]]
