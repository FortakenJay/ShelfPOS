# Supabase Schema

Parent: [[Home]]

**Canonical file:** `DASHBOARD/SUPA.sql` (idempotent — safe to re-run in SQL Editor)

### Applying on Supabase

1. Paste/run the full script in the Supabase SQL Editor (or apply in sections if debugging a failure).
2. **Fresh project:** uses `store_pairings` only; no legacy `store_claim_codes` table.
3. **Upgrading:** migration block copies any legacy `store_claim_codes` into `store_pairings`, then drops the old table.
4. If you see `relation "store_claim_codes" does not exist` on a fresh apply, ensure you have the latest `SUPA.sql` (legacy `DROP POLICY` on that table was removed).

See [[18-Quality-And-Tooling#Supabase SQL (`SUPA.sql`)]].

## Mirror tables

All business tables include `store_id TEXT NOT NULL` and PK `(id, store_id)`.

| Table | Notes |
|-------|-------|
| `products` | `deleted_at` soft delete; nullable `stock_provider` (v20, synced; index `idx_products_stock_provider`) |
| `sales` | No `payment_method` — use `sale_payments` |
| `sale_items` | Snapshots: `product_name_snapshot`, `barcode_snapshot` |
| `sale_payments` | `method`: cash \| card \| sinpe |
| `cierres` | Shift close snapshot fields |
| `cash_movements` | Linked to `cierre_id` optional |
| `audit_log` | Username snapshot; `action` is free text (e.g. `cart_tab_discarded_caja`) |
| `return_items` | `sale_item_id` for misc returns |
| `stock_adjustments` | `delta` capped in sync sanitizer |
| `pos_users` | Roles: sales, product_manager, admin — no passwords |

**Local-only (SQLite, not in `SUPA.sql`):** `cart_tabs` — open carts per register. PIN discards still sync as `audit_log` rows.

## Tenancy tables

| Table | PK | Purpose |
|-------|-----|---------|
| `stores` | `store_id` | Registry + heartbeat + display name |
| `store_access` | `(user_id, store_id)` | Owner/viewer membership |
| `store_pairings` | `id` UUID | One-time 24h POS link codes (multiple pending per owner) |

Legacy `store_claim_codes` is migrated to `store_pairings` on apply (see migration block in `SUPA.sql`).

## Functions & RPCs

| Name | Caller | Role |
|------|--------|------|
| `get_my_role()` | RLS | Reads `app_metadata.role` |
| `is_superadmin()` | RLS | `role = 'superadmin'` |
| `can_access_store(store_id)` | RLS | Membership check |
| `create_store_pairing(label?)` | Dashboard JWT | Returns new 8-char code |
| `ensure_store_pairing()` | Dashboard JWT | Active unused code or creates one |
| `list_pending_pairings()` | Dashboard JWT | Pending codes for owner |
| `claim_store_sync(code, store_id, display_name)` | Service role only | Creates `store_access` |
| `create_store_claim()` | Dashboard JWT | **Legacy alias** → `create_store_pairing` |
| `ensure_store_claim()` | Dashboard JWT | **Legacy alias** → `ensure_store_pairing` |

## RLS summary

- `ENABLE ROW LEVEL SECURITY` on all public tables above
- Mirror `SELECT`: `can_access_store(store_id)`
- Mirror writes for `authenticated`: **denied**
- `store_access` / `store_pairings`: users read own rows; writes via RPC only

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
