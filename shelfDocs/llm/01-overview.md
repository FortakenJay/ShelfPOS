# ShelfPOS Overview

Parent: [LLM Index](README.md) · Master: [shelfpos_context.md](../shelfpos_context.md)

## What is ShelfPOS?

An **offline-first** point-of-sale system for retail stores, with an optional **cloud dashboard** for owners.

- Cashiers use a **Windows desktop app** (Electron) that works without internet.
- Sales and inventory live in **SQLite** on each register PC.
- A **background sync service** mirrors data to **Supabase** for the web dashboard.
- The dashboard is **read-only** for business data — all writes happen on the POS.

**Primary market:** small shops in Costa Rica (IVA, SINPE, factura PDF), but architecture is general retail.

## Business goals

| Goal | How |
|------|-----|
| Process sales | POS terminal: scan, cart, split payment, receipt |
| Manage inventory | Product catalog, stock on sale, adjustments, returns |
| Operate cash shifts | Opening float, cash in/out, cierre (shift close) |
| Control staff access | POS roles, PINs for discounts and sensitive actions |
| Owner visibility | Dashboard KPIs, reports, Excel/PDF export |
| Multi-store SaaS | One Supabase project; tenants isolated by RLS |

## Tech stack

| Component | Stack |
|-----------|--------|
| POS app | Electron 28+, React 19, TanStack Router, TanStack Query, Tailwind |
| POS database | better-sqlite3 (main process only) |
| POS ↔ UI | IPC with Zod validation |
| Sync | Node Windows Service → Supabase REST |
| Dashboard | TanStack Start, React 19, TanStack Query, Supabase JS |
| Cloud | Supabase (PostgreSQL, Auth, RLS) |
| Hosting | Dashboard on Vercel |

**Not used:** Next.js, Redux, Firebase, direct Supabase writes from dashboard.

## Architecture summary

```
POS Renderer (React)
    ↓ IPC invoke
Electron Main (repos, transactions)
    ↓
SQLite shelf.db
    ↓ sync_queue
ShelfPOSSync (Windows Service)
    ↓ REST + secret key
Supabase PostgreSQL (mirror)
    ↑ JWT + RLS read
Dashboard (Vercel)
```

## Main modules

| Module | POS | Dashboard |
|--------|-----|-----------|
| Authentication | Local users + first-run wizard | Supabase Auth |
| Products | Catalog CRUD, CSV import, labels | Inventory in reports |
| POS / Sales | Terminal, payment, returns | Transaction reports |
| Inventory | Stock on sale, adjustments | Inventory report |
| Cash & cierre | Float, movements, shift close | Cierres, movements pages |
| Reports | Local SQLite reports | Cloud reports + export |
| Team | POS users (passwords local) | `pos_users` mirror, invites |
| Sync | `/sync-setup`, background service | `/link-pos` pairing |

## Monorepo layout

```
ShelfPOS/
├── OFFLINE-ONLY-POS/     # Electron POS + sync-service subfolder
├── DASHBOARD/            # Owner web panel
└── docs/
    ├── shelfpos_context.md   # ← LLM master file
    ├── llm/                  # This documentation set
    ├── wiki/                 # Obsidian wiki (runbooks)
    └── decisions/            # ADRs
```

## Related

- [Business rules](02-business-rules.md)
- [Architecture](03-architecture.md)
- [Code index](07-code-index.md)
