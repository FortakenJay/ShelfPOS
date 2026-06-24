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
    auth.jwt() -> 'app_metadata' ->> 'role',
    ''
  );
$$;


-- =============================================================================
-- SECTION 1b — MIGRATION TRACKER (Supabase Dashboard / CLI)
-- ShelfPOS uses SUPA.sql for schema; this table is only for Supabase's migration UI.
-- Safe to run on projects created manually in the SQL Editor.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version    TEXT NOT NULL,
  statements TEXT[],
  name       TEXT,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);


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
  stock_provider   TEXT,
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
  product_id             BIGINT,    -- nullable for misc (price*) lines
  product_name_snapshot  TEXT,     -- always use for display, never join products
  barcode_snapshot       TEXT,     -- barcode at time of sale (factura grid)
  quantity               INTEGER,
  unit_price             REAL,     -- price charged at time of sale
  catalog_unit_price     REAL,     -- catalog price at time of sale (v7)
  line_total             REAL,
  line_discount          REAL,     -- explicit per-line discount set by cashier
  discount               REAL,     -- line_discount + cart share on this line
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
  product_id   BIGINT,    -- nullable when sale_item_id is set (misc returns)
  sale_item_id BIGINT,
  quantity     INTEGER,
  line_total   REAL,
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

-- POS app users (no password_hash — credentials stay on the terminal only).
CREATE TABLE IF NOT EXISTS public.pos_users (
  id            BIGINT   NOT NULL,
  store_id      TEXT     NOT NULL,
  username      TEXT,
  role          TEXT,               -- 'sales' | 'product_manager' | 'admin'
  is_active     INTEGER,
  created_at    TEXT,
  last_login_at TEXT,
  PRIMARY KEY (id, store_id)
);

-- Store registry (one row per POS install). Sync service upserts display_name from local settings.
CREATE TABLE IF NOT EXISTS public.stores (
  store_id                 TEXT PRIMARY KEY,
  display_name             TEXT NOT NULL,
  stock_threshold_default  INTEGER NOT NULL DEFAULT 5,
  updated_at               TIMESTAMPTZ DEFAULT now(),
  pos_last_seen_at         TEXT
);

-- Links Supabase Auth users to stores they own (multi-tenant isolation).
CREATE TABLE IF NOT EXISTS public.store_access (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id   TEXT NOT NULL REFERENCES public.stores(store_id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, store_id)
);

-- Pairing codes: dashboard owner creates one per POS/register to link (multi-store supported).
CREATE TABLE IF NOT EXISTS public.store_pairings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pairing_code    TEXT NOT NULL UNIQUE,
  label           TEXT,
  linked_store_id TEXT REFERENCES public.stores(store_id) ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  linked_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT store_pairings_code_format CHECK (pairing_code ~ '^[A-Z0-9]{8}$')
);


-- =============================================================================
-- SECTION 3 — COLUMN PATCHES (existing deployments)
-- CREATE TABLE IF NOT EXISTS skips new columns on tables that already exist.
-- Column lists match sync-service LIVE_ROW_SQL (OFFLINE-ONLY-POS/sync-service/src/db.ts).
-- =============================================================================

-- products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price REAL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price REAL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_provider TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_threshold INTEGER;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tax_category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bulk_qty INTEGER;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bulk_price REAL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS factura_negativo INTEGER;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TEXT;

-- sales (factura header: consecutivo, customer, subtotal, discount_total, total)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS total REAL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS subtotal REAL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount_total REAL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cart_discount REAL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS sale_condition TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS consecutivo TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_id_type TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_id TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_activity_code TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cierre_id BIGINT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS created_at TEXT;

-- sale_items (factura grid lines)
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS sale_id BIGINT;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS product_name_snapshot TEXT;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS barcode_snapshot TEXT;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS unit_price REAL;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS catalog_unit_price REAL;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS line_total REAL;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS line_discount REAL;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS discount REAL;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS tax_category TEXT;

-- sale_payments
ALTER TABLE public.sale_payments ADD COLUMN IF NOT EXISTS sale_id BIGINT;
ALTER TABLE public.sale_payments ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE public.sale_payments ADD COLUMN IF NOT EXISTS amount REAL;
ALTER TABLE public.sale_payments ADD COLUMN IF NOT EXISTS ref TEXT;

-- cierres
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS opened_at TEXT;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS closed_at TEXT;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS closed_by_user_id BIGINT;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS closed_by_username TEXT;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS shift_label TEXT;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS total_cash REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS total_card REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS total_sinpe REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS total_sales REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS opening_float REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS cash_in REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS cash_out REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS expected_cash REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS counted_cash REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS cash_difference REAL;
ALTER TABLE public.cierres ADD COLUMN IF NOT EXISTS notes TEXT;

-- cash_movements
ALTER TABLE public.cash_movements ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.cash_movements ADD COLUMN IF NOT EXISTS amount REAL;
ALTER TABLE public.cash_movements ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.cash_movements ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE public.cash_movements ADD COLUMN IF NOT EXISTS created_at TEXT;
ALTER TABLE public.cash_movements ADD COLUMN IF NOT EXISTS cierre_id BIGINT;

-- audit_log
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS entity TEXT;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS detail TEXT;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS created_at TEXT;

-- return_items (v13 — misc returns via sale_item_id)
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS sale_id BIGINT;
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS sale_item_id BIGINT;
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS line_total REAL;
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS restocked INTEGER;
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS created_at TEXT;
ALTER TABLE public.return_items ADD COLUMN IF NOT EXISTS processed_by BIGINT;

-- stock_adjustments
ALTER TABLE public.stock_adjustments ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE public.stock_adjustments ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE public.stock_adjustments ADD COLUMN IF NOT EXISTS delta INTEGER;
ALTER TABLE public.stock_adjustments ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.stock_adjustments ADD COLUMN IF NOT EXISTS created_at TEXT;

-- pos_users (mirrors local users without password_hash)
ALTER TABLE public.pos_users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.pos_users ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.pos_users ADD COLUMN IF NOT EXISTS is_active INTEGER;
ALTER TABLE public.pos_users ADD COLUMN IF NOT EXISTS created_at TEXT;
ALTER TABLE public.pos_users ADD COLUMN IF NOT EXISTS last_login_at TEXT;

-- stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS pos_last_seen_at TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS stock_threshold_default INTEGER NOT NULL DEFAULT 5;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS billing_interval TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS next_payment_at TIMESTAMPTZ;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS billing_paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS billing_reminder_week_for DATE;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS billing_reminder_due_for DATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stores_billing_interval_check'
  ) THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_billing_interval_check
      CHECK (billing_interval IS NULL OR billing_interval IN ('weekly', 'monthly', 'annual'));
  END IF;
END $$;

-- =============================================================================
-- SECTION 4 — INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_products_store_category
  ON public.products (store_id, category);

CREATE INDEX IF NOT EXISTS idx_products_store_provider
  ON public.products (store_id, stock_provider);

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

CREATE INDEX IF NOT EXISTS idx_returns_store_sale_item
  ON public.return_items (store_id, sale_item_id);

CREATE INDEX IF NOT EXISTS idx_returns_store_created
  ON public.return_items (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_stock_adj_store_product
  ON public.stock_adjustments (store_id, product_id);

CREATE INDEX IF NOT EXISTS idx_stock_adj_store_created
  ON public.stock_adjustments (store_id, created_at);

CREATE INDEX IF NOT EXISTS idx_pos_users_store_role
  ON public.pos_users (store_id, role);

CREATE INDEX IF NOT EXISTS idx_store_access_user
  ON public.store_access (user_id);

CREATE INDEX IF NOT EXISTS idx_store_pairings_pending
  ON public.store_pairings (user_id, expires_at)
  WHERE linked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_store_pairings_code
  ON public.store_pairings (pairing_code)
  WHERE linked_at IS NULL;

-- Migrate legacy store_claim_codes if present from older deployments.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'store_claim_codes'
  ) THEN
    INSERT INTO public.store_pairings (id, user_id, pairing_code, label, linked_store_id, expires_at, linked_at, created_at)
    SELECT
      c.id,
      c.user_id,
      upper(c.claim_code),
      NULL,
      c.store_id,
      c.expires_at,
      c.used_at,
      c.created_at
    FROM public.store_claim_codes c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.store_pairings p WHERE p.id = c.id
    );
    DROP TABLE public.store_claim_codes CASCADE;
  END IF;
END $$;


-- =============================================================================
-- SECTION 4b — TENANT HELPERS & RPC
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT public.get_my_role() = 'superadmin';
$$;

CREATE OR REPLACE FUNCTION public.can_access_store(p_store_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_superadmin()
    OR EXISTS (
      SELECT 1
      FROM public.store_access sa
      WHERE sa.user_id = auth.uid()
        AND sa.store_id = p_store_id
    );
$$;

-- Dashboard: create a pairing code (optionally labeled, e.g. "Caja 2"). Multiple pending codes per owner.
CREATE OR REPLACE FUNCTION public.create_store_pairing(p_label TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_label TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  v_label := nullif(trim(p_label), '');
  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.store_pairings (user_id, pairing_code, label, expires_at)
  VALUES (auth.uid(), v_code, v_label, now() + interval '24 hours');

  RETURN v_code;
END;
$$;

-- Dashboard: list unused pairing codes for this owner (multi-register linking).
CREATE OR REPLACE FUNCTION public.list_pending_pairings()
RETURNS TABLE (
  pairing_code TEXT,
  label TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.pairing_code, p.label, p.expires_at
  FROM public.store_pairings p
  WHERE p.user_id = auth.uid()
    AND p.linked_at IS NULL
    AND p.expires_at > now()
  ORDER BY p.created_at DESC;
$$;

-- Dashboard: one code for first-time onboarding (reuse newest pending or create).
CREATE OR REPLACE FUNCTION public.ensure_store_pairing()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT p.pairing_code INTO v_code
  FROM public.store_pairings p
  WHERE p.user_id = auth.uid()
    AND p.linked_at IS NULL
    AND p.expires_at > now()
  ORDER BY p.created_at DESC
  LIMIT 1;

  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  RETURN public.create_store_pairing(NULL);
END;
$$;

-- Backward-compatible aliases (dashboard + docs).
CREATE OR REPLACE FUNCTION public.create_store_claim()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.create_store_pairing(NULL);
$$;

CREATE OR REPLACE FUNCTION public.ensure_store_claim()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.ensure_store_pairing();
$$;

-- Sync service (service role only): bind local store_id to the dashboard account.
CREATE OR REPLACE FUNCTION public.claim_store_sync(
  p_claim_code TEXT,
  p_store_id TEXT,
  p_display_name TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_pairing_id UUID;
  v_role TEXT;
  v_display TEXT;
  v_owner_email TEXT;
BEGIN
  v_role := COALESCE(
    current_setting('request.jwt.claims', true)::json ->> 'role',
    ''
  );
  IF v_role IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_store_id IS NULL OR length(trim(p_store_id)) = 0 THEN
    RAISE EXCEPTION 'store_id required';
  END IF;

  v_display := nullif(trim(p_display_name), '');

  SELECT p.id, p.user_id
  INTO v_pairing_id, v_user_id
  FROM public.store_pairings p
  WHERE p.pairing_code = upper(trim(p_claim_code))
    AND p.linked_at IS NULL
    AND p.expires_at > now()
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'invalid or expired pairing code';
  END IF;

  SELECT u.email INTO v_owner_email
  FROM auth.users u
  WHERE u.id = v_user_id;

  IF EXISTS (
    SELECT 1
    FROM public.store_access sa
    WHERE sa.store_id = p_store_id
      AND sa.user_id <> v_user_id
  ) THEN
    RAISE EXCEPTION 'store already owned by another account';
  END IF;

  INSERT INTO public.stores (store_id, display_name, billing_email)
  VALUES (p_store_id, COALESCE(v_display, p_store_id), v_owner_email)
  ON CONFLICT (store_id) DO UPDATE
  SET display_name = COALESCE(EXCLUDED.display_name, public.stores.display_name),
      billing_email = COALESCE(public.stores.billing_email, EXCLUDED.billing_email);

  INSERT INTO public.store_access (user_id, store_id, role)
  VALUES (v_user_id, p_store_id, 'owner')
  ON CONFLICT (user_id, store_id) DO NOTHING;

  UPDATE public.store_pairings
  SET linked_at = now(), linked_store_id = p_store_id
  WHERE id = v_pairing_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_store_pairing(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_pending_pairings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_store_pairing() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_store_claim() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_store_claim() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_store_sync(TEXT, TEXT, TEXT) TO service_role;


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
ALTER TABLE public.pos_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_access        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_pairings          ENABLE ROW LEVEL SECURITY;


-- store_access — users see only their own memberships
DROP POLICY IF EXISTS "read own store_access" ON public.store_access;
CREATE POLICY "read own store_access"
  ON public.store_access FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "block store_access writes" ON public.store_access;
CREATE POLICY "block store_access writes"
  ON public.store_access FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

-- pairings — owners see their own pending/used codes
DROP POLICY IF EXISTS "read own pairings" ON public.store_pairings;
CREATE POLICY "read own pairings"
  ON public.store_pairings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "block pairing writes" ON public.store_pairings;
CREATE POLICY "block pairing writes"
  ON public.store_pairings FOR ALL TO authenticated
  USING (false) WITH CHECK (false);

-- Legacy store_claim_codes policies are dropped with the table (migration block above, CASCADE).


-- READ policies — tenant-scoped (superadmin sees all)
DROP POLICY IF EXISTS "admin read stores" ON public.stores;
CREATE POLICY "admin read stores"
  ON public.stores FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "block dashboard writes to stores" ON public.stores;
CREATE POLICY "block dashboard writes to stores"
  ON public.stores FOR ALL TO authenticated USING (false) WITH CHECK (false);


-- READ policies — tenant-scoped mirror tables
DROP POLICY IF EXISTS "admin read products" ON public.products;
CREATE POLICY "admin read products"
  ON public.products FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read sales" ON public.sales;
CREATE POLICY "admin read sales"
  ON public.sales FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read sale_items" ON public.sale_items;
CREATE POLICY "admin read sale_items"
  ON public.sale_items FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read sale_payments" ON public.sale_payments;
CREATE POLICY "admin read sale_payments"
  ON public.sale_payments FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read cierres" ON public.cierres;
CREATE POLICY "admin read cierres"
  ON public.cierres FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read cash_movements" ON public.cash_movements;
CREATE POLICY "admin read cash_movements"
  ON public.cash_movements FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read audit_log" ON public.audit_log;
CREATE POLICY "admin read audit_log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read return_items" ON public.return_items;
CREATE POLICY "admin read return_items"
  ON public.return_items FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read stock_adjustments" ON public.stock_adjustments;
CREATE POLICY "admin read stock_adjustments"
  ON public.stock_adjustments FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));

DROP POLICY IF EXISTS "admin read pos_users" ON public.pos_users;
CREATE POLICY "admin read pos_users"
  ON public.pos_users FOR SELECT TO authenticated
  USING (public.can_access_store(store_id));


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

DROP POLICY IF EXISTS "block dashboard writes to pos_users" ON public.pos_users;
CREATE POLICY "block dashboard writes to pos_users"
  ON public.pos_users FOR ALL TO authenticated USING (false) WITH CHECK (false);


-- =============================================================================
-- SECTION 6 — MANUAL SETUP (one-time)
--
-- 1. Authentication → Users → create one account per store owner (mom, customer, …)
-- 2. Optional superadmin: set app_metadata (not user_metadata) via Supabase Admin API:
--    { "role": "superadmin" } — users cannot self-edit app_metadata.
-- 3. Dashboard: sign in → Link POS → copy claim code → add to sync.env
-- 4. sync.env: SUPABASE_URL, SUPABASE_SECRET_KEY, SQLITE_PATH, STORE_PAIRING_CODE
-- 5. Restart ShelfPOS Sync — claim_store_sync binds store_id to that owner
--
-- Existing data (before multi-tenant): assign owners manually, e.g.
--   INSERT INTO public.store_access (user_id, store_id, role)
--   VALUES ('<mom-auth-uuid>', 'tienda_mama', 'owner');
--
-- If Dashboard or CLI shows: relation "supabase_migrations.schema_migrations" does not exist
-- run SECTION 1b above (or re-run this file — it is idempotent).
-- =============================================================================

-- =============================================================================
-- SECTION 7 — OPTIONAL DATA CLEANUP (not part of routine schema apply)
-- Run SUPA-data-cleanup.sql manually after bad eFactura/CSV imports only.
-- =============================================================================
