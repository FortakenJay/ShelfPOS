-- =============================================================================
-- ShelfPOS — wipe mirrored POS data from Supabase (fresh cloud start)
-- =============================================================================
--
-- IMPORTANT — Supabase SQL Editor role:
--   Top-right dropdown MUST be **postgres** (or "Run as service role").
--   If you use **authenticated** or **anon**, DELETE affects 0 rows (RLS blocks writes)
--   and products / cash_movements will look unchanged.
--
-- BEFORE running:
--   1. Close the POS app
--   2. Stop ShelfPOSSync if installed (or data will sync back from local shelf.db)
--   3. Optional: delete local shelf.db and re-run ShelfPOS Setup (no reset-fresh-install.ps1 in repo)
--
-- KEEPS: auth.users, schema, RLS policies, RPCs
-- DELETES: all mirror rows + stores + pairing codes
-- =============================================================================

-- Row counts BEFORE (save this result)
SELECT 'BEFORE' AS phase, tbl, rows FROM (
  SELECT 'products' AS tbl, COUNT(*)::bigint AS rows FROM public.products
  UNION ALL SELECT 'cash_movements', COUNT(*)::bigint FROM public.cash_movements
  UNION ALL SELECT 'sales', COUNT(*)::bigint FROM public.sales
  UNION ALL SELECT 'stores', COUNT(*)::bigint FROM public.stores
) x
ORDER BY tbl;

BEGIN;

-- Bypass RLS for this transaction (postgres / service role only)
SET LOCAL row_security = off;

TRUNCATE TABLE
  public.return_items,
  public.sale_items,
  public.sale_payments,
  public.sales,
  public.cash_movements,
  public.cierres,
  public.audit_log,
  public.stock_adjustments,
  public.pos_users,
  public.products,
  public.store_pairings,
  public.store_access,
  public.stores;

COMMIT;

-- Row counts AFTER (every tbl must be 0)
SELECT 'AFTER' AS phase, tbl, rows FROM (
  SELECT 'products' AS tbl, COUNT(*)::bigint AS rows FROM public.products
  UNION ALL SELECT 'cash_movements', COUNT(*)::bigint FROM public.cash_movements
  UNION ALL SELECT 'sale_items', COUNT(*)::bigint FROM public.sale_items
  UNION ALL SELECT 'sale_payments', COUNT(*)::bigint FROM public.sale_payments
  UNION ALL SELECT 'sales', COUNT(*)::bigint FROM public.sales
  UNION ALL SELECT 'cierres', COUNT(*)::bigint FROM public.cierres
  UNION ALL SELECT 'audit_log', COUNT(*)::bigint FROM public.audit_log
  UNION ALL SELECT 'return_items', COUNT(*)::bigint FROM public.return_items
  UNION ALL SELECT 'stock_adjustments', COUNT(*)::bigint FROM public.stock_adjustments
  UNION ALL SELECT 'pos_users', COUNT(*)::bigint FROM public.pos_users
  UNION ALL SELECT 'stores', COUNT(*)::bigint FROM public.stores
  UNION ALL SELECT 'store_pairings', COUNT(*)::bigint FROM public.store_pairings
  UNION ALL SELECT 'store_access', COUNT(*)::bigint FROM public.store_access
) x
ORDER BY tbl;

-- =============================================================================
-- If AFTER still shows rows:
--   A) Wrong SQL Editor role — switch to postgres and run again
--   B) Sync service still running — stop it, wipe again, then wipe local shelf.db
--   C) Multiple Supabase projects — confirm URL matches dashboard / sync.env
--
-- OPTIONAL — one store only (run as postgres; comment out TRUNCATE block above)
-- =============================================================================
/*
BEGIN;
SET LOCAL row_security = off;

DELETE FROM public.return_items          WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.sale_items            WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.sale_payments         WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.sales                 WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.cash_movements        WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.cierres               WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.audit_log             WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.stock_adjustments     WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.pos_users             WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.products              WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.store_pairings        WHERE linked_store_id = 'store_REPLACE_ME';
DELETE FROM public.store_access          WHERE store_id = 'store_REPLACE_ME';
DELETE FROM public.stores                WHERE store_id = 'store_REPLACE_ME';

COMMIT;
*/
