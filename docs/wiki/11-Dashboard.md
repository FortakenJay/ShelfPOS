# Dashboard

Parent: [[Home]]

**App root:** `DASHBOARD/`  
**Stack:** TanStack Start, React 19, TanStack Query, Supabase JS, Tailwind v4, Recharts

## Routes

| Path | File | Purpose |
|------|------|---------|
| `/login` | `routes/login.tsx` | Sign in / sign up |
| `/dashboard` | `routes/_app/dashboard.tsx` | KPIs, charts, team, inventory |
| `/reports` | `routes/_app/reports.tsx` | Report tabs + export |
| `/cierres` | `routes/_app/cierres.tsx` | Shift history |
| `/movements` | `routes/_app/movements.tsx` | Cash movements (500 cap + warning) |
| `/audit` | `routes/_app/audit.tsx` | Audit log pagination |
| `/link-pos` | `routes/_app/link-pos.tsx` | Generate claim code (production onboarding) |

Layout: `routes/_app/route.tsx` — auth gate + `StoreProvider` + `Shell`.

**Production:** owners use the deployed URL (Vercel), not localhost. Claim codes are entered on the POS PC's `sync.env` — see [[15-Setup-And-Deployment]].

## Auth (`lib/auth.tsx`)

- Supabase `signInWithPassword` / `signUp`
- Clears persisted cache on sign-out and **user switch**
- `supabaseConfigured()` checks `VITE_SUPABASE_*`

## Store context (`lib/store-context.tsx`)

- Query `fetchStores()` — RLS-filtered `stores` table
- Persists selection: `localStorage` key `shelfpos_dashboard_store`
- `NoStoresPage` when zero stores (except on `/link-pos`)

## Queries layer (`lib/queries/`)

| Module | Data |
|--------|------|
| `dashboard.ts` | KPIs, trends, team, inventory |
| `reports.ts` | All report types |
| `stores.ts` | Tenant store list |
| `store-claims.ts` | `create_store_pairing`, `ensure_store_pairing`, `list_pending_pairings` |
| `cierres.ts`, `cash-movements.ts`, `audit.ts` | Domain pages |
| `factura-pdf.ts` | Sale fetch for PDF |

**Rules:** explicit column selects (no `*`), `.eq('store_id', storeId)`, pagination via `supabase-page.ts`.

## Dashboard data helpers

| Module | Role |
|--------|------|
| `dashboard-inventory.ts` | Stock counts, KPI prior reconstruction |
| `dashboard-employees.ts` | `pos_users` team roster |
| `dashboard-activity.ts` | Alerts, recent activity |
| `tax-breakdown.ts` | IVA summary |

## Query cache

- Dashboard summary persisted to `sessionStorage` via `@tanstack/react-query-persist-client`
- Cleared on logout / user change: `lib/clear-dashboard-cache.ts`

## Shell (`components/Shell.tsx`)

- Collapsible sidebar, store switcher (multi-store owners)
- POS presence dots (`store-presence.ts`)
- Language switcher (ES / 中文)

## Related

- [[11-Dashboard]] → [[12-Reports-And-Exports]]
- [[04-Multi-Tenant-Security]]
- [[06-Supabase-Schema]]
