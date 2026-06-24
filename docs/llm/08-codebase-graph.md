# ShelfPOS — Codebase Dependency Graph

Parent: [LLM Index](README.md)

Visual map of **who talks to whom** across the monorepo. Open in Obsidian, GitHub, or any Mermaid preview.

**Interactive canvas (Cursor):** [shelfpos-codebase-graph.canvas.tsx](/Users/Jay/.cursor/projects/c-Users-Jay-Desktop-ShelfPOS/canvases/shelfpos-codebase-graph.canvas.tsx)

**UML diagrams:** [09-uml-diagrams.md](09-uml-diagrams.md) — deployment, component, class, sequence, state, ER

---

## How to read these graphs

| Arrow | Meaning |
|-------|---------|
| `A --> B` | A calls, invokes, reads, or depends on B |
| `subgraph` | Logical boundary (folder / process) |
| Dashed mental model | Sync is async — POS does not wait on Supabase |

**Three runtimes on a shop PC:** Electron renderer, Electron main, ShelfPOSSync Windows Service — all share `shelf.db`.

---

## Level 0 — Monorepo bird's eye

```mermaid
flowchart TB
  subgraph MONOREPO["ShelfPOS monorepo"]
    POS["OFFLINE-ONLY-POS<br/>Electron POS"]
    SYNC["sync-service<br/>Windows Service"]
    DASH["DASHBOARD<br/>TanStack Start"]
    DOCS["docs/"]
  end

  subgraph LOCAL["Each register PC"]
    DB[(shelf.db SQLite)]
    ENV[sync.env secrets]
  end

  subgraph CLOUD["Supabase + Vercel"]
    SB[(PostgreSQL mirror)]
    AUTH[Supabase Auth]
    VERCEL[Vercel dashboard]
  end

  POS --> DB
  SYNC --> DB
  SYNC --> ENV
  SYNC -->|REST secret key| SB
  POS -->|IPC only| POS

  DASH --> VERCEL
  DASH -->|anon JWT read| SB
  DASH --> AUTH

  DOCS -.-> POS
  DOCS -.-> DASH
  DOCS -.-> SYNC
```

---

## Level 1 — POS: three processes, one database

```mermaid
flowchart LR
  subgraph ELECTRON["Electron app"]
    R[Renderer React]
    P[Preload bridge]
    M[Main process Node]
    R -->|window.api.invoke| P
    P -->|ipcRenderer| M
  end

  subgraph SERVICE["ShelfPOSSync — separate process"]
    SS[sync loop 5s]
  end

  DB[(shelf.db)]

  M --> DB
  SS --> DB
  M -->|enqueueSync same txn| Q[sync_queue table]
  SS -->|poll pending| Q
  SS -->|getLiveRow + upsert| SB[(Supabase)]

  M --> PRN[Thermal printer]
  M --> PDF[Factura PDF files]
```

---

## Level 2 — Renderer features → API → IPC

```mermaid
flowchart TB
  subgraph FEATURES["renderer/src/features"]
    AUTH_F[auth/]
    POS_F[pos/]
    PROD_F[products/]
    ADM_F[admin/]
    SHL_F[shell/]
    SYNC_F[sync-setup/]
  end

  subgraph LIB["renderer/src/lib"]
    API[api.ts]
    SCAN[useScanner.ts]
    TOAST[toast, format, shortcuts]
  end

  subgraph SHARED["shared/"]
    TYPES[types.ts IPC_CHANNELS]
    ZOD[schemas/ipc.ts]
    LOC[locales es + zh-CN]
  end

  subgraph PRELOAD["preload/"]
    BR[contextBridge whitelist]
  end

  subgraph IPC["main/ipc/"]
    IX[index.ts registers all]
  end

  AUTH_F --> API
  POS_F --> API
  POS_F --> SCAN
  PROD_F --> API
  ADM_F --> API
  SYNC_F --> API
  SHL_F --> API

  API --> BR
  BR --> IX
  IX --> ZOD
  IX --> TYPES
  LOC --> AUTH_F
  LOC --> POS_F
```

### Feature → primary IPC channels

```mermaid
flowchart LR
  POS_F[pos/ usePOSTerminal] --> SALES[sales:*]
  POS_F --> PRODS[products:search<br/>products:byBarcode]
  POS_F --> TABS[cartTabs:*]
  POS_F --> CASH_IPC[cash:status]
  POS_F --> PAY[sales:create]

  PROD_F[products/] --> PROD_IPC[products:*]
  ADM_F[CierrePage] --> CIERRE[cierre:*]
  ADM_F[ReportsPage] --> REP_IPC[reports:*]
  ADM_F[SettingsPage] --> SET[settings:*]
  ADM_F[UsersPage] --> USR[users:*]
  ADM_F[DashboardPage] --> DASH_IPC[dashboard:overview]
  SYNC_F[sync-setup] --> SYNC_IPC[syncSetup:*]
  AUTH_F[auth/] --> AUTH_IPC[auth:*<br/>firstRun:*]
```

---

## Level 3 — IPC handlers → repos & services

```mermaid
flowchart TB
  subgraph IPC_HANDLERS["main/ipc/*.ts"]
    sales_ts[sales.ts]
    products_ts[products.ts]
    cierre_ts[cierre.ts]
    returns_ts[returns.ts]
    cash_ts[cash.ts]
    cartTabs_ts[cartTabs.ts]
    users_ts[users.ts]
    settings_ts[settings.ts]
    reports_ts[reports.ts]
    syncSetup_ts[syncSetup.ts]
    printer_ts[printer.ts]
    audit_ts[audit.ts]
  end

  subgraph REPOS["main/db/repos/"]
    products_r[products.ts]
    sales_r[salesReceipt.ts]
    stock_r[stock.ts]
    cash_r[cash.ts]
    cartTabs_r[cartTabs.ts]
    users_r[users.ts]
    settings_r[settings.ts]
    reports_r[reports.ts]
    audit_r[audit.ts]
    printJobs_r[printJobs.ts]
    syncQ_r[syncQueue.ts]
    dashboard_r[dashboard.ts]
  end

  subgraph SERVICES["main/services/"]
    session[session.ts]
    printer_s[printer.ts]
    printTpl[printTemplates.ts]
    factura[facturaPdf.ts]
    backup[backup.ts]
    syncCfg[syncConfig.ts]
    csvImp[productCsvImport.ts]
  end

  DB[(SQLite)]

  sales_ts --> products_r
  sales_ts --> stock_r
  sales_ts --> cash_r
  sales_ts --> sales_r
  sales_ts --> syncQ_r
  sales_ts --> printJobs_r
  sales_ts --> printer_s
  sales_ts --> session

  products_ts --> products_r
  products_ts --> syncQ_r
  products_ts --> csvImp
  products_ts --> printer_s

  cierre_ts --> reports_r
  cierre_ts --> cash_r
  cierre_ts --> syncQ_r
  cierre_ts --> printTpl

  returns_ts --> products_r
  returns_ts --> syncQ_r

  users_ts --> users_r
  users_ts --> syncQ_r

  cartTabs_ts --> cartTabs_r

  syncSetup_ts --> syncCfg

  REPOS --> DB
  SERVICES --> DB
```

---

## Level 4 — Repos → SQLite tables

```mermaid
flowchart TB
  subgraph SYNCED["Synced tables → sync_queue → Supabase"]
    products[(products)]
    sales[(sales)]
    sale_items[(sale_items)]
    sale_payments[(sale_payments)]
    cierres[(cierres)]
    cash_mov[(cash_movements)]
    audit[(audit_log)]
    returns[(return_items)]
    stock_adj[(stock_adjustments)]
    pos_users[(pos_users mirror)]
  end

  subgraph LOCAL_ONLY["Local only"]
    settings[(settings)]
    users[(users passwords)]
    print_jobs[(print_jobs)]
    cart_tabs[(cart_tabs)]
    sync_queue[(sync_queue)]
  end

  products_r[repos/products] --> products
  products_r --> stock_adj
  sales_r[repos/salesReceipt] --> sales
  sales_r --> sale_items
  sales_r --> sale_payments
  cash_r[repos/cash] --> cash_mov
  cash_r --> cierres
  cartTabs_r[repos/cartTabs] --> cart_tabs
  users_r[repos/users] --> users
  users_r --> pos_users
  syncQ_r[repos/syncQueue] --> sync_queue
  audit_r[repos/audit] --> audit
  settings_r[repos/settings] --> settings
  printJobs_r[repos/printJobs] --> print_jobs
```

---

## Level 5 — Sync service internals

```mermaid
flowchart TB
  IDX[sync-service/index.ts]
  CFG[config.ts → sync.env]
  DB_OP[db.ts open + LIVE_ROW_SQL]
  SYNC_TS[sync.ts]

  IDX --> CFG
  IDX --> DB_OP
  IDX --> SYNC_TS

  SYNC_TS --> CLAIM[claimStoreIfNeeded RPC]
  SYNC_TS --> REG[syncStoreRegistry → stores table]
  SYNC_TS --> POLL[listPendingQueue]
  POLL --> PROC[processEntry per row]
  PROC --> LIVE[getLiveRow from SQLite]
  PROC --> REST[Supabase REST upsert/delete]
  PROC --> MARK[markSynced / markError]

  DB[(shelf.db)] --> DB_OP
  REST --> SB[(Supabase mirror)]
  CLAIM --> SB
```

**Column parity:** `sync-service/src/db.ts` `LIVE_ROW_SQL` ↔ `DASHBOARD/SUPA.sql` ↔ `migrations.ts`

---

## Level 6 — Dashboard layers

```mermaid
flowchart TB
  subgraph ROUTES["DASHBOARD/src/routes"]
    LOGIN[login.tsx]
    APP[_app/route.tsx providers]
    DASH_R[dashboard.tsx]
    REP_R[reports.tsx]
    LINK[link-pos.tsx]
    MOV[movements.tsx]
    CIER_R[cierres.tsx]
    AUD[audit.tsx]
    ADMIN[admin.tsx superadmin]
  end

  subgraph LIB["DASHBOARD/src/lib"]
    AUTH_L[auth.tsx]
    STORES[stores / StoreProvider]
    SB_CLIENT[supabase.ts]
    Q_DASH[queries/dashboard.ts]
    Q_REP[queries/reports.ts]
    Q_CASH[queries/cash-movements.ts]
    Q_CIER[queries/cierres.ts]
    R_PDF[reports-pdf.ts]
    R_GRID[report-grid-to-xlsx.ts]
    FACT[factura-pdf.ts]
  end

  subgraph SB["Supabase"]
    MIRROR[(mirror tables)]
    RPC[pairing RPCs]
    RLS[RLS policies]
  end

  APP --> AUTH_L
  APP --> STORES
  DASH_R --> Q_DASH
  REP_R --> Q_REP
  REP_R --> R_PDF
  MOV --> Q_CASH
  CIER_R --> Q_CIER
  LINK --> RPC

  Q_DASH --> SB_CLIENT
  Q_REP --> SB_CLIENT
  SB_CLIENT --> MIRROR
  SB_CLIENT --> RLS
  RPC --> SB
```

**Dashboard never writes mirror rows** — RLS denies authenticated INSERT/UPDATE on business tables.

---

## Level 7 — Tenancy & pairing

```mermaid
sequenceDiagram
  participant Owner as Dashboard owner
  participant RPC as Supabase RPC
  participant Sync as ShelfPOSSync
  participant POS as Electron POS
  participant DB as shelf.db

  Owner->>RPC: create_store_pairing()
  RPC-->>Owner: 8-char code
  Note over Sync: STORE_PAIRING_CODE in sync.env
  Sync->>RPC: claim_store_sync(code, store_id)
  RPC->>RPC: INSERT store_access

  POS->>DB: sales:create + enqueueSync
  Sync->>DB: poll sync_queue
  Sync->>RPC: upsert rows + store_id

  Owner->>RPC: SELECT sales (RLS can_access_store)
```

---

## Level 8 — End-to-end sale (cross-system)

```mermaid
flowchart LR
  A[Cashier scans] --> B[usePOSTerminal]
  B --> C[api.products.byBarcode]
  C --> D[IPC products.ts]
  D --> E[(products table)]

  B --> F[PaymentModal]
  F --> G[api.sales.create]
  G --> H[IPC sales.ts]
  H --> I[Txn: sales + items + payments]
  H --> J[Txn: stock decrement]
  H --> K[enqueueSync]
  H --> L[print_jobs]

  K --> M[sync_queue]
  M --> N[ShelfPOSSync]
  N --> O[(Supabase)]

  O --> P[Dashboard reports.tsx]
  P --> Q[Owner sees sale]
```

---

## Dependency rules (for impact analysis)

| If you change… | Also check… |
|----------------|-------------|
| `migrations.ts` | `sync-service/db.ts`, `SUPA.sql`, repos, IPC schemas |
| `schemas/ipc.ts` | `api.ts`, preload channels, handler |
| `repos/products.ts` | `ipc/products.ts`, `ipc/sales.ts`, sync LIVE_ROW_SQL |
| `usePOSTerminal.ts` | `useScanner.ts`, `posKeyboard.ts`, `PaymentModal` |
| `queries/reports.ts` | report tables, `report-grid-to-xlsx.ts`, RLS |
| `SUPA.sql` | RLS policies, dashboard queries, sync upsert columns |
| `sync.ts` | claim flow, `19-Edge-Cases` runbook |

---

## Related

- [Dependency maps (text trees)](05-dependency-maps.md)
- [Architecture](03-architecture.md)
- [Code index](07-code-index.md)
- [Master context](../shelfpos_context.md)
