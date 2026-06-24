# System Architecture

Parent: [LLM Index](README.md)

## Design principles

1. **Offline-first** — POS works with zero network.
2. **SQLite is source of truth** — Supabase is a read mirror for dashboard.
3. **One-way sync** — Dashboard never writes mirror tables.
4. **Multi-tenant cloud** — `store_id` on every mirror row + RLS.
5. **Layered UI** — Components → hooks → API/IPC → repos.

## POS process architecture

```mermaid
flowchart TB
  subgraph Renderer
    F[features/*]
    API[lib/api.ts]
    F --> API
  end

  subgraph Preload
    BR[contextBridge invoke whitelist]
  end

  subgraph Main
    IPC[ipc/*.ts + Zod]
    REPO[db/repos/*.ts]
    SVC[services: printer, backup, license]
    IPC --> REPO
    IPC --> SVC
    REPO --> SQ[enqueueSync]
  end

  DB[(SQLite shelf.db)]

  API --> BR --> IPC
  REPO --> DB
  SQ --> DB
```

## Sync process (separate from Electron)

```mermaid
flowchart LR
  Q[sync_queue pending]
  S[ShelfPOSSync poll 5s]
  LR[getLiveRow SQL]
  REST[Supabase REST upsert]
  Q --> S --> LR --> REST
```

- **Not** spawned by Electron — Windows Service via installer.
- Config: `%APPDATA%\shelfpos\sync.env` (secret key, URL, pairing code).
- Retries: max 10 per row → status `error` → `sync.txt` log.

## Dashboard architecture

```mermaid
flowchart TB
  R[routes/_app/*.tsx]
  Q[lib/queries/*.ts]
  B[lib/reports/* builders]
  C[components/*]
  SB[(Supabase)]

  R --> Q --> SB
  R --> B
  R --> C
```

**Providers** (`_app/route.tsx`): Query persist → Auth → Store selection → Shell.

## Request flow: sale checkout

```mermaid
sequenceDiagram
  participant UI as PaymentModal
  participant API as lib/api.ts
  participant IPC as ipc/sales.ts
  participant DB as SQLite
  participant Q as sync_queue

  UI->>API: sales:create
  API->>IPC: invoke
  IPC->>DB: BEGIN
  IPC->>DB: INSERT sales, items, payments
  IPC->>DB: UPDATE stock conditional
  IPC->>Q: enqueueSync (same txn)
  IPC->>DB: COMMIT
  IPC-->>UI: success + print job
```

## Request flow: dashboard report

```mermaid
sequenceDiagram
  participant Page as reports.tsx
  participant Q as queries/reports.ts
  participant SB as Supabase

  Page->>Q: runReport(storeId, range, type)
  Q->>SB: SELECT explicit columns
  Note over SB: RLS filters store_access
  SB-->>Q: rows
  Q-->>Page: ReportData
  Page->>Page: downloadReportExcel / PDF
```

## ID model

| Layer | IDs |
|-------|-----|
| SQLite | `INTEGER AUTOINCREMENT` per table |
| Supabase | Composite PK `(id, store_id)` |

Sale `id=5` on `store_a` ≠ sale `id=5` on `store_b`.

## Synced vs local tables

**Synced:** `products`, `sales`, `sale_items`, `sale_payments`, `cierres`, `cash_movements`, `audit_log`, `return_items`, `stock_adjustments`, `pos_users`

**Local only:** `settings`, `users`, `print_jobs`, `cart_tabs`, `sync_queue`

## Claim / pairing flow

```mermaid
sequenceDiagram
  participant Owner as Dashboard /link-pos
  participant SB as Supabase RPC
  participant Sync as sync-service startup

  Owner->>SB: create_store_pairing()
  SB-->>Owner: 8-char code (24h)
  Note over Sync: STORE_PAIRING_CODE in sync.env
  Sync->>SB: claim_store_sync(code, store_id)
  SB->>SB: INSERT store_access
```

## Related

- [Database](04-database.md)
- [Wiki: Data flow](../wiki/03-Data-Flow.md)
- [Wiki: Sync service](../wiki/10-Sync-Service.md)
