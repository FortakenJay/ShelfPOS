-- =============================================================================
-- ShelfPOS — Supabase Mirror Schema (idempotent)
-- Safe to run multiple times in the Supabase SQL Editor.
-- Uses CREATE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / DROP POLICY IF EXISTS.
--
-- READ-ONLY mirror: data is pushed from local SQLite by the sync service
-- (service role key bypasses RLS). Admin dashboard reads via anon + Auth JWT.
-- =============================================================================


-- =============================================================================
-- SECTION 1 — HELPERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    ''
  );
$$;


-- =============================================================================
-- SECTION 2 — TABLES
-- Every table has store_id. PK is (id, store_id) — local autoincrement ids are
-- only unique per store; the composite key is globally unique in Supabase.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id               BIGINT        NOT NULL,
  store_id         TEXT          NOT NULL,
  barcode          TEXT,
  name             TEXT,
  price            REAL,
  cost_price       REAL,
  category         TEXT,
  stock            INTEGER,
  stock_threshold  INTEGER,
  tax_category     TEXT,
  bulk_qty         INTEGER,
  bulk_price       REAL,
  factura_negativo INTEGER,
  deleted_at       TEXT,          -- soft delete mirror
  created_at       TEXT,
  updated_at       TEXT,
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.sales (
  id                      BIGINT        NOT NULL,
  store_id                TEXT          NOT NULL,
  user_id                 BIGINT,
  total                   REAL,
  subtotal                REAL,
  discount_total          REAL,
  cart_discount           REAL,
  note                    TEXT,
  sale_condition          TEXT,
  consecutivo             TEXT,
  customer_name           TEXT,
  customer_id_type        TEXT,
  customer_id             TEXT,
  customer_phone          TEXT,
  customer_email          TEXT,
  customer_activity_code  TEXT,          -- eFactura receptor activity code
  cierre_id               BIGINT,
  created_at              TEXT,
  -- payment_method intentionally excluded — sale_payments is canonical.
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id                     BIGINT   NOT NULL,
  store_id               TEXT     NOT NULL,
  sale_id                BIGINT,
  product_id             BIGINT,
  product_name_snapshot  TEXT,    -- always use for display, never join products
  quantity               INTEGER,
  unit_price             REAL,    -- price charged at time of sale
  catalog_unit_price     REAL,    -- catalog price at time of sale (v7)
  line_total             REAL,
  line_discount          REAL,    -- explicit per-line discount set by cashier
  discount               REAL,    -- line_discount + cart share on this line
  tax_category           TEXT,
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.sale_payments (
  id         BIGINT   NOT NULL,
  store_id   TEXT     NOT NULL,
  sale_id    BIGINT,
  method     TEXT,               -- 'cash' | 'card' | 'sinpe'
  amount     REAL,
  ref        TEXT,
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.cierres (
  id                   BIGINT   NOT NULL,
  store_id             TEXT     NOT NULL,
  opened_at            TEXT,
  closed_at            TEXT,
  closed_by_user_id    BIGINT,
  closed_by_username   TEXT,    -- snapshot — no join to users needed
  shift_label          TEXT,
  total_cash           REAL,
  total_card           REAL,
  total_sinpe          REAL,
  total_sales          REAL,
  opening_float        REAL,
  cash_in              REAL,
  cash_out             REAL,
  expected_cash        REAL,
  counted_cash         REAL,
  cash_difference      REAL,
  notes                TEXT,
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.cash_movements (
  id         BIGINT   NOT NULL,
  store_id   TEXT     NOT NULL,
  type       TEXT,               -- 'opening_float' | 'cash_in' | 'cash_out'
  amount     REAL,
  reason     TEXT,
  user_id    BIGINT,
  created_at TEXT,
  cierre_id  BIGINT,
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id         BIGINT   NOT NULL,
  store_id   TEXT     NOT NULL,
  user_id    BIGINT,
  username   TEXT,
  action     TEXT,
  entity     TEXT,
  entity_id  TEXT,
  detail     TEXT,
  created_at TEXT,
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.return_items (
  id           BIGINT   NOT NULL,
  store_id     TEXT     NOT NULL,
  sale_id      BIGINT,
  product_id   BIGINT,
  quantity     INTEGER,
  restocked    INTEGER,
  created_at   TEXT,
  processed_by BIGINT,
  PRIMARY KEY (id, store_id)
);

CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id         BIGINT   NOT NULL,
  store_id   TEXT     NOT NULL,
  product_id BIGINT,
  user_id    BIGINT,
  delta      INTEGER,
  reason     TEXT,
  created_at TEXT,
  PRIMARY KEY (id, store_id)
);

-- Store registry (one row per POS install). Sync service upserts display_name from local settings.
CREATE TABLE IF NOT EXISTS public.stores (
  store_id         TEXT PRIMARY KEY,
  display_name     TEXT NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now(),
  pos_last_seen_at TEXT
);


-- =============================================================================
-- SECTION 3 — COLUMN PATCHES (existing deployments)
-- CREATE TABLE IF NOT EXISTS skips new columns on tables that already exist.
-- =============================================================================

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS customer_activity_code TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS deleted_at TEXT;

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS pos_last_seen_at TEXT;

ALTER TABLE public.sale_items
  ADD COLUMN IF NOT EXISTS product_name_snapshot TEXT;

ALTER TABLE public.sale_items
  ADD COLUMN IF NOT EXISTS catalog_unit_price REAL;

ALTER TABLE public.sale_items
  ADD COLUMN IF NOT EXISTS line_discount REAL;

ALTER TABLE public.cierres
  ADD COLUMN IF NOT EXISTS closed_by_username TEXT;


-- =============================================================================
-- SECTION 4 — INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_products_store_category
  ON public.products (store_id, category);

CREATE INDEX IF NOT EXISTS idx_products_store_deleted
  ON public.products (store_id, deleted_at);

CREATE INDEX IF NOT EXISTS idx_sales_store_created
  ON public.sales (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_sales_store_cierre
  ON public.sales (store_id, cierre_id);

CREATE INDEX IF NOT EXISTS idx_sale_items_store_sale
  ON public.sale_items (store_id, sale_id);

CREATE INDEX IF NOT EXISTS idx_sale_items_store_product
  ON public.sale_items (store_id, product_id);

CREATE INDEX IF NOT EXISTS idx_sale_payments_store_sale
  ON public.sale_payments (store_id, sale_id);

CREATE INDEX IF NOT EXISTS idx_cierres_store_closed
  ON public.cierres (store_id, closed_at);

CREATE INDEX IF NOT EXISTS idx_cash_mov_store_cierre
  ON public.cash_movements (store_id, cierre_id);

CREATE INDEX IF NOT EXISTS idx_cash_mov_store_created
  ON public.cash_movements (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_store_created
  ON public.audit_log (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_store_action
  ON public.audit_log (store_id, action);

CREATE INDEX IF NOT EXISTS idx_returns_store_sale
  ON public.return_items (store_id, sale_id);

CREATE INDEX IF NOT EXISTS idx_returns_store_created
  ON public.return_items (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_stock_adj_store_product
  ON public.stock_adjustments (store_id, product_id);

CREATE INDEX IF NOT EXISTS idx_stock_adj_store_created
  ON public.stock_adjustments (store_id, created_at);


-- =============================================================================
-- SECTION 5 — ROW LEVEL SECURITY
-- Sync service: service role key → bypasses RLS → writes
-- Dashboard: authenticated JWT → read-only via SELECT policies
-- =============================================================================

ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cierres           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores              ENABLE ROW LEVEL SECURITY;


-- READ policies — authenticated user can read all stores
DROP POLICY IF EXISTS "admin read stores" ON public.stores;
CREATE POLICY "admin read stores"
  ON public.stores FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "block dashboard writes to stores" ON public.stores;
CREATE POLICY "block dashboard writes to stores"
  ON public.stores FOR ALL TO authenticated USING (false) WITH CHECK (false);


-- READ policies — authenticated user can read all stores
DROP POLICY IF EXISTS "admin read products" ON public.products;
CREATE POLICY "admin read products"
  ON public.products FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read sales" ON public.sales;
CREATE POLICY "admin read sales"
  ON public.sales FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read sale_items" ON public.sale_items;
CREATE POLICY "admin read sale_items"
  ON public.sale_items FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read sale_payments" ON public.sale_payments;
CREATE POLICY "admin read sale_payments"
  ON public.sale_payments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read cierres" ON public.cierres;
CREATE POLICY "admin read cierres"
  ON public.cierres FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read cash_movements" ON public.cash_movements;
CREATE POLICY "admin read cash_movements"
  ON public.cash_movements FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read audit_log" ON public.audit_log;
CREATE POLICY "admin read audit_log"
  ON public.audit_log FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read return_items" ON public.return_items;
CREATE POLICY "admin read return_items"
  ON public.return_items FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "admin read stock_adjustments" ON public.stock_adjustments;
CREATE POLICY "admin read stock_adjustments"
  ON public.stock_adjustments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);


-- WRITE block — dashboard cannot mutate mirror data
DROP POLICY IF EXISTS "block dashboard writes to products" ON public.products;
CREATE POLICY "block dashboard writes to products"
  ON public.products FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to sales" ON public.sales;
CREATE POLICY "block dashboard writes to sales"
  ON public.sales FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to sale_items" ON public.sale_items;
CREATE POLICY "block dashboard writes to sale_items"
  ON public.sale_items FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to sale_payments" ON public.sale_payments;
CREATE POLICY "block dashboard writes to sale_payments"
  ON public.sale_payments FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to cierres" ON public.cierres;
CREATE POLICY "block dashboard writes to cierres"
  ON public.cierres FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to cash_movements" ON public.cash_movements;
CREATE POLICY "block dashboard writes to cash_movements"
  ON public.cash_movements FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to audit_log" ON public.audit_log;
CREATE POLICY "block dashboard writes to audit_log"
  ON public.audit_log FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to return_items" ON public.return_items;
CREATE POLICY "block dashboard writes to return_items"
  ON public.return_items FOR ALL TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "block dashboard writes to stock_adjustments" ON public.stock_adjustments;
CREATE POLICY "block dashboard writes to stock_adjustments"
  ON public.stock_adjustments FOR ALL TO authenticated USING (false) WITH CHECK (false);


-- =============================================================================
-- SECTION 6 — MANUAL SETUP (one-time)
--
-- 1. Authentication → Users → create admin user
-- 2. User metadata: { "role": "superadmin" }
-- 3. Sync service sync.env: SUPABASE_URL, SUPABASE_SERVICE_KEY, SQLITE_PATH
-- 4. Dashboard .env: SUPABASE_URL, SUPABASE_ANON_KEY
-- =============================================================================
