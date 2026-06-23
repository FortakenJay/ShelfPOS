# SQLite Schema

Parent: [[Home]]

**Source of truth:** `OFFLINE-ONLY-POS/src/main/db/migrations.ts`  
**Current version:** `SCHEMA_VERSION = 18`

Migrations are **forward-only**, keyed by version number. `user_version` pragma updated after run. Pre-migration backup in `main/index.ts`.

## Core tables

| Table | Purpose |
|-------|---------|
| `settings` | Key-value config (`store_name`, `sync_store_id`, PINs, tax, printer, …) |
| `users` | POS login users (local passwords — **not synced**) |
| `products` | Catalog, stock, soft-delete via `deleted_at` (v9) |
| `sales` | Sale header, customer fields, consecutivo, discounts |
| `sale_items` | Lines; `product_id` nullable for misc lines (v10); `barcode_snapshot` (v14) |
| `sale_payments` | Split payments: cash / card / sinpe (canonical — not `sales.payment_method` for mirror) |
| `cierres` | Shift close totals, cash count, discrepancy |
| `cash_movements` | opening_float, cash_in, cash_out |
| `return_items` | Returns; misc via `sale_item_id` (v13) |
| `stock_adjustments` | Manual inventory deltas |
| `audit_log` | Local audit trail (synced) |
| `print_jobs` | Receipt print queue (**local only**) |
| `sync_queue` | Outbound mirror queue (v9) |

## sync_queue

Outbound mirror queue (v9). The sync service polls this table — it does **not** watch WAL or scan `updated_at` on business tables.

```sql
id, table_name, row_id, operation,  -- insert | update | delete
status,          -- pending | synced | error
created_at, synced_at, error, retry_count
```

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for sync service (or retrying after error) |
| `synced` | Successfully pushed to Supabase |
| `error` | Gave up after 10 failed attempts (`retry_count >= 10`) |

Enqueue **in the same transaction** as the business write (`enqueueSync` in `syncQueue.ts`). The service always reads the **current** live row via `getLiveRow` before pushing.

## Important settings keys

| Key | Used by |
|-----|---------|
| `sync_store_id` | Stamped on every Supabase row |
| `store_name` | Display name → `stores.display_name` |
| `pos_last_seen_at` | Heartbeat → `stores.pos_last_seen_at` |
| `sync_owner_claimed` | Set by sync-service after claim (runtime, not migration) |
| `stock_threshold_default` | Low-stock alerts |

## POS users vs Supabase pos_users

| SQLite `users` | Supabase `pos_users` |
|----------------|----------------------|
| Has `password_hash` | No password — mirror for dashboard team view |
| Local auth | Synced via `pos_users` table (hidden `SAKEN` user excluded) |

Hidden recovery user **`SAKEN`** (v15+): local admin, never listed in UI, never synced. Login enabled only when `operator.env` is present — see [[15-Setup-And-Deployment#POS operator recovery (SAKEN)]].

## Migration milestones

| Ver | Highlights |
|-----|------------|
| v2 | Tax, bulk pricing, split payments, cash drawer, audit |
| v9 | `sync_queue`, soft-delete products, sale snapshots |
| v10 | Misc sale lines |
| v13 | Misc returns |
| v14 | `sale_items.barcode_snapshot` |
| v15–v18 | Hidden `SAKEN` recovery user; env-gated login |

## Related

- [[06-Supabase-Schema]] — mirror column parity via `sync-service/src/db.ts` `LIVE_ROW_SQL`
- [[10-Sync-Service]]
