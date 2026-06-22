# Supabase Schema

Parent: [[Home]]

**Canonical file:** `DASHBOARD/SUPA.sql` (idempotent — safe to re-run in SQL Editor)

## Mirror tables

All business tables include `store_id TEXT NOT NULL` and PK `(id, store_id)`.

| Table | Notes |
|-------|-------|
| `products` | `deleted_at` soft delete |
| `sales` | No `payment_method` — use `sale_payments` |
| `sale_items` | Snapshots: `product_name_snapshot`, `barcode_snapshot` |
| `sale_payments` | `method`: cash \| card \| sinpe |
| `cierres` | Shift close snapshot fields |
| `cash_movements` | Linked to `cierre_id` optional |
| `audit_log` | Username snapshot column |
| `return_items` | `sale_item_id` for misc returns |
| `stock_adjustments` | `delta` capped in sync sanitizer |
| `pos_users` | Roles: sales, product_manager, admin — no passwords |

## Tenancy tables

| Table | PK | Purpose |
|-------|-----|---------|
| `stores` | `store_id` | Registry + heartbeat + display name |
| `store_access` | `(user_id, store_id)` | Owner/viewer membership |
| `store_claim_codes` | `id` UUID | One-time link codes |

## Functions & RPCs

| Name | Caller | Role |
|------|--------|------|
| `get_my_role()` | RLS | Reads `app_metadata.role` |
| `is_superadmin()` | RLS | `role = 'superadmin'` |
| `can_access_store(store_id)` | RLS | Membership check |
| `create_store_claim()` | Dashboard JWT | Returns new 8-char code |
| `ensure_store_claim()` | Dashboard JWT | Returns active unused code or creates one |
| `claim_store_sync(code, store_id)` | Service role only | Creates `store_access` |

## RLS summary

- `ENABLE ROW LEVEL SECURITY` on all public tables above
- Mirror `SELECT`: `can_access_store(store_id)`
- Mirror writes for `authenticated`: **denied**
- `store_access` / `store_claim_codes`: users read own rows; writes via RPC only

## Column patches

Section 3 of `SUPA.sql` adds columns on existing deployments. Must stay aligned with:

`OFFLINE-ONLY-POS/sync-service/src/db.ts` → `LIVE_ROW_SQL` per table.

When adding a SQLite column to sync:

1. Migration in `migrations.ts`
2. `LIVE_ROW_SQL` in sync-service `db.ts`
3. `ALTER TABLE … ADD COLUMN IF NOT EXISTS` in `SUPA.sql`
4. Re-run `SUPA.sql` on Supabase

## Indexes

Section 4 — composite indexes on `(store_id, …)` for dashboard query patterns.

## Related

- [[04-Multi-Tenant-Security]]
- [[05-SQLite-Schema]]
- [[15-Setup-And-Deployment]]
