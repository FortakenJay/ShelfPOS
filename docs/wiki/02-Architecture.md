# Architecture

Parent: [[Home]]

## Design principles

1. **Offline-first** — POS works with zero network; sync is best-effort background.
2. **SQLite is source of truth** — Supabase is a **read-only mirror** for the dashboard.
3. **One-way sync** — Dashboard never writes mirror tables (RLS blocks writes).
4. **Multi-tenant cloud** — Same Supabase project; owners isolated via `store_access` + RLS.
5. **Layered renderer** — UI → hooks → IPC → repos; no Supabase/SQLite in components.

## Process architecture (POS)

```
┌─────────────────────────────────────────────────────────┐
│ Renderer (React)                                         │
│  features/* → lib/api.ts → window.api.invoke(channel)    │
└───────────────────────────┬─────────────────────────────┘
                            │ IPC (Zod validated)
┌───────────────────────────▼─────────────────────────────┐
│ Main process                                             │
│  ipc/*.ts → db/repos/*.ts → SQLite transaction          │
│              └→ enqueueSync() same transaction           │
│  services/printer.ts, backup.ts, license.ts              │
└───────────────────────────┬─────────────────────────────┘
                            │ shared shelf.db
┌───────────────────────────▼─────────────────────────────┐
│ sync-service (separate Node process)                     │
│  sync_queue → Supabase REST (service role)               │
└─────────────────────────────────────────────────────────┘
```

## Dashboard architecture

```
routes/_app/*.tsx  (pages, minimal logic)
       ↓
lib/queries/*.ts   (Supabase selects only)
       ↓
lib/dashboard-*.ts, lib/reports/*  (aggregations, export builders)
       ↓
components/*       (presentation)
```

**Providers** (`routes/_app/route.tsx`):

1. `AppQueryProvider` — TanStack Query + sessionStorage persist for dashboard summary
2. `AuthProvider` — Supabase session
3. `StoreProvider` — tenant store list + `storeId` selection
4. `Shell` — nav, presence, outlet

## Feature CRUD pattern (both apps)

POS renderer follows feature folders; dashboard uses `lib/queries` as the “api” layer:

```
api/ or queries/  → pure async, no React
hooks/            → useQuery / useMutation (POS features)
components/       → render only
```

See [[17-Conventions-For-AI]].

## ID model

| Layer | ID uniqueness |
|-------|----------------|
| SQLite | `INTEGER AUTOINCREMENT` per table |
| Supabase | Composite PK `(id, store_id)` — `store_id` from `settings.sync_store_id` |

Never assume sale `id=5` is globally unique — only `(5, store_a)` is.

## Synced vs local-only tables

**Synced** (`SYNC_TABLES` in `syncQueue.ts`):

`products`, `sales`, `sale_items`, `sale_payments`, `cierres`, `cash_movements`, `audit_log`, `return_items`, `stock_adjustments`, `pos_users`

**Local only:**

`settings`, `users` (passwords), `print_jobs`

## Related

- [[03-Data-Flow]]
- [[04-Multi-Tenant-Security]]
- [[09-IPC-Reference]]
