import type Database from 'better-sqlite3'

export const SCHEMA_VERSION = 9

type Migration = (db: Database.Database) => void

/** Forward-only migrations, keyed by target schema version. */
const migrations: Record<number, Migration> = {
  1: (db) => {
    db.exec(`
      CREATE TABLE settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL CHECK (role IN ('sales','product_manager','admin')),
        language_pref TEXT,
        is_active     INTEGER NOT NULL DEFAULT 1,
        created_at    TEXT NOT NULL,
        last_login_at TEXT
      );

      CREATE TABLE products (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode         TEXT NOT NULL UNIQUE,
        name            TEXT NOT NULL,
        price           REAL NOT NULL DEFAULT 0,
        cost_price      REAL,
        category        TEXT,
        stock           INTEGER NOT NULL DEFAULT 0,
        stock_threshold INTEGER,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
      );
      CREATE INDEX idx_products_name ON products(name);

      CREATE TABLE cierres (
        id                 INTEGER PRIMARY KEY AUTOINCREMENT,
        opened_at          TEXT NOT NULL,
        closed_at          TEXT NOT NULL,
        closed_by_user_id  INTEGER NOT NULL REFERENCES users(id),
        shift_label        TEXT,
        total_cash         REAL NOT NULL DEFAULT 0,
        total_card         REAL NOT NULL DEFAULT 0,
        total_sinpe        REAL NOT NULL DEFAULT 0,
        total_sales        REAL NOT NULL DEFAULT 0,
        notes              TEXT
      );

      CREATE TABLE sales (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id        INTEGER NOT NULL REFERENCES users(id),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','card','sinpe')),
        total          REAL NOT NULL,
        note           TEXT,
        sinpe_ref      TEXT,
        created_at     TEXT NOT NULL,
        cierre_id      INTEGER REFERENCES cierres(id)
      );
      CREATE INDEX idx_sales_created ON sales(created_at);
      CREATE INDEX idx_sales_cierre ON sales(cierre_id);

      CREATE TABLE sale_items (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id    INTEGER NOT NULL REFERENCES sales(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity   INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        line_total REAL NOT NULL
      );
      CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);

      CREATE TABLE return_items (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id      INTEGER NOT NULL REFERENCES sales(id),
        product_id   INTEGER NOT NULL REFERENCES products(id),
        quantity     INTEGER NOT NULL,
        restocked    INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT NOT NULL,
        processed_by INTEGER REFERENCES users(id)
      );
      CREATE INDEX idx_return_items_sale ON return_items(sale_id);

      CREATE TABLE stock_adjustments (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id),
        user_id    INTEGER NOT NULL REFERENCES users(id),
        delta      INTEGER NOT NULL,
        reason     TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE print_jobs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id    INTEGER REFERENCES sales(id),
        job_type   TEXT NOT NULL,
        payload    TEXT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        printed_at TEXT
      );
      CREATE INDEX idx_print_jobs_status ON print_jobs(status);

      INSERT INTO settings (key, value) VALUES
        ('stock_threshold_default', '5'),
        ('scanner_burst_ms', '30'),
        ('store_name', 'ShelfPOS');
    `)
  },

  // v2 — Costa Rica retail: tax categories, bulk pricing, discounts, split payments,
  // receipt/emisor/receptor data, cash drawer (float + movements + discrepancy) and audit log.
  2: (db) => {
    db.exec(`
      -- Products: dormant tax category (régimen simplificado ignores it) + bulk pricing tier.
      ALTER TABLE products ADD COLUMN tax_category TEXT NOT NULL DEFAULT 'standard';
      ALTER TABLE products ADD COLUMN bulk_qty INTEGER;
      ALTER TABLE products ADD COLUMN bulk_price REAL;

      -- Sales: discounts, condición de venta, consecutivo and optional receptor data.
      ALTER TABLE sales ADD COLUMN subtotal REAL NOT NULL DEFAULT 0;
      ALTER TABLE sales ADD COLUMN discount_total REAL NOT NULL DEFAULT 0;
      ALTER TABLE sales ADD COLUMN sale_condition TEXT NOT NULL DEFAULT 'contado';
      ALTER TABLE sales ADD COLUMN consecutivo TEXT;
      ALTER TABLE sales ADD COLUMN customer_name TEXT;
      ALTER TABLE sales ADD COLUMN customer_id_type TEXT;
      ALTER TABLE sales ADD COLUMN customer_id TEXT;
      ALTER TABLE sales ADD COLUMN customer_phone TEXT;
      ALTER TABLE sales ADD COLUMN customer_email TEXT;
      ALTER TABLE sales ADD COLUMN customer_activity_code TEXT;

      -- Existing rows: subtotal mirrors total (no historical discounts).
      UPDATE sales SET subtotal = total;

      -- Sale items: per-line discount + tax category snapshot.
      ALTER TABLE sale_items ADD COLUMN discount REAL NOT NULL DEFAULT 0;
      ALTER TABLE sale_items ADD COLUMN tax_category TEXT NOT NULL DEFAULT 'standard';

      -- Split payments: one sale can have several tenders (e.g. cash + SINPE).
      CREATE TABLE sale_payments (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL REFERENCES sales(id),
        method  TEXT NOT NULL CHECK (method IN ('cash','card','sinpe')),
        amount  REAL NOT NULL,
        ref     TEXT
      );
      CREATE INDEX idx_sale_payments_sale ON sale_payments(sale_id);

      -- Backfill: each historical sale becomes a single payment of its original method.
      INSERT INTO sale_payments (sale_id, method, amount, ref)
        SELECT id, payment_method, total, sinpe_ref FROM sales;

      -- Cash drawer movements: opening float + mid-shift cash in/out, locked at cierre.
      CREATE TABLE cash_movements (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        type       TEXT NOT NULL CHECK (type IN ('opening_float','cash_in','cash_out')),
        amount     REAL NOT NULL,
        reason     TEXT,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        created_at TEXT NOT NULL,
        cierre_id  INTEGER REFERENCES cierres(id)
      );
      CREATE INDEX idx_cash_movements_cierre ON cash_movements(cierre_id);

      -- Cierre: cash reconciliation (expected vs counted).
      ALTER TABLE cierres ADD COLUMN opening_float  REAL NOT NULL DEFAULT 0;
      ALTER TABLE cierres ADD COLUMN cash_in        REAL NOT NULL DEFAULT 0;
      ALTER TABLE cierres ADD COLUMN cash_out       REAL NOT NULL DEFAULT 0;
      ALTER TABLE cierres ADD COLUMN expected_cash  REAL NOT NULL DEFAULT 0;
      ALTER TABLE cierres ADD COLUMN counted_cash   REAL;
      ALTER TABLE cierres ADD COLUMN cash_difference REAL;

      -- Per-user activity / audit log.
      CREATE TABLE audit_log (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER REFERENCES users(id),
        username   TEXT,
        action     TEXT NOT NULL,
        entity     TEXT,
        entity_id  TEXT,
        detail     TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX idx_audit_created ON audit_log(created_at);
      CREATE INDEX idx_audit_user ON audit_log(user_id);

      INSERT INTO settings (key, value) VALUES
        ('tax_regime', 'simplificado'),
        ('iva_rate_standard', '13'),
        ('iva_rate_canasta_basica', '1'),
        ('branch_code', '001'),
        ('terminal_code', '00001'),
        ('consecutivo_next', '1'),
        ('store_legal_name', ''),
        ('store_id_type', 'fisica'),
        ('store_id', ''),
        ('store_phone', ''),
        ('store_email', ''),
        ('store_activity_code', ''),
        ('store_province', ''),
        ('store_canton', ''),
        ('store_district', ''),
        ('store_address', ''),
        ('receipt_footer', '');
    `)
  },

  // v3 — query indexes for common filters (category, return date range).
  3: (db) => {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_return_items_created ON return_items(created_at);
    `)
  },

  // v4 — caja PIN for discount authorization; audit action index.
  4: (db) => {
    const manager = db.prepare("SELECT value FROM settings WHERE key = 'manager_pin_hash'").get() as
      | { value: string }
      | undefined
    const caja = db.prepare("SELECT value FROM settings WHERE key = 'caja_pin_hash'").get() as
      | { value: string }
      | undefined
    if (manager?.value && !caja) {
      db.prepare("INSERT INTO settings (key, value) VALUES ('caja_pin_hash', ?)").run(manager.value)
    }
    db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action)`)
  },

  // v5 — separate cart vs per-line discounts for cierre reporting.
  5: (db) => {
    db.exec(`
      ALTER TABLE sales ADD COLUMN cart_discount REAL NOT NULL DEFAULT 0;
      ALTER TABLE sale_items ADD COLUMN line_discount REAL NOT NULL DEFAULT 0;
      UPDATE sale_items SET line_discount = discount WHERE discount > 0;
    `)
  },

  // v6 — eFactura "facturar negativo": allow selling below zero stock.
  6: (db) => {
    db.exec(`
      ALTER TABLE products ADD COLUMN factura_negativo INTEGER NOT NULL DEFAULT 0
        CHECK (factura_negativo IN (0, 1));
    `)
  },

  // v7 — catalog unit price on overridden sale lines (cierre / receipt audit trail).
  7: (db) => {
    db.exec(`ALTER TABLE sale_items ADD COLUMN catalog_unit_price REAL;`)
  },

  // v8 — all products use standard IVA; drop legacy canasta/exempt categories.
  8: (db) => {
    db.exec(`
      UPDATE products SET tax_category = 'standard' WHERE tax_category != 'standard';
      UPDATE sale_items SET tax_category = 'standard' WHERE tax_category != 'standard';
    `)
  },

  // v9 — sync pipeline: soft deletes, snapshots, sync_queue, indexes.
  // sales.payment_method is DEPRECATED — sale_payments is the canonical payment source.
  9: (db) => {
    db.exec(`
      ALTER TABLE products ADD COLUMN deleted_at TEXT;
      ALTER TABLE sale_items ADD COLUMN product_name_snapshot TEXT;
      ALTER TABLE cierres ADD COLUMN closed_by_username TEXT;

      CREATE TABLE sync_queue (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name  TEXT NOT NULL,
        row_id      INTEGER NOT NULL,
        operation   TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
        status      TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'synced', 'error')),
        created_at  TEXT NOT NULL,
        synced_at   TEXT,
        error       TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE INDEX idx_sync_queue_status ON sync_queue(status);
      CREATE INDEX idx_sync_queue_created ON sync_queue(created_at);
      CREATE INDEX IF NOT EXISTS idx_cierres_closed ON cierres(closed_at);
      CREATE INDEX IF NOT EXISTS idx_stock_adj_product ON stock_adjustments(product_id);
      CREATE INDEX IF NOT EXISTS idx_stock_adj_created ON stock_adjustments(created_at);

      INSERT OR IGNORE INTO settings (key, value) VALUES ('sync_store_id', 'store_a');
    `)
  }
}

export function getDbVersion(db: Database.Database): number {
  return db.pragma('user_version', { simple: true }) as number
}

/** Runs all pending migrations inside a single transaction. Throws on failure (rolled back). */
export function runMigrations(db: Database.Database): void {
  const from = getDbVersion(db)
  const run = db.transaction(() => {
    for (let v = from + 1; v <= SCHEMA_VERSION; v++) {
      const migration = migrations[v]
      if (!migration) throw new Error(`Missing migration for schema version ${v}`)
      migration(db)
    }
    db.pragma(`user_version = ${SCHEMA_VERSION}`)
  })
  run()
}
