# Dashboard

Parent: [[Home]]

**App root:** `DASHBOARD/`  
**Stack:** TanStack Start, React 19, TanStack Query, Supabase JS, Tailwind v4, Recharts

## Routes

| Path | File | Purpose |
|------|------|---------|
| `/login` | `routes/login.tsx` | Sign in only |
| `/create-account` | `routes/create-account.tsx` | Owner signup via invite `?key=` (`VITE_SIGNUP_INVITE_KEY`) |
| `/accept-invite` | `routes/accept-invite.tsx` | Operator-invited owners set password |
| `/reset-password` | `routes/reset-password.tsx` | Password reset from email link |
| `/dashboard` | `routes/_app/dashboard.tsx` | KPIs, charts, team, inventory (today-focused) |
| `/reports` | `routes/_app/reports.tsx` | Report tabs, date range, export |
| `/cierres` | `routes/_app/cierres.tsx` | Shift history (500-row fetch cap + warning) |
| `/movements` | `routes/_app/movements.tsx` | Cash movements (paginated 25/50/100) |
| `/audit` | `routes/_app/audit.tsx` | Audit log pagination |
| `/link-pos` | `routes/_app/link-pos.tsx` | Generate pairing codes (production onboarding) |
| `/admin` | `routes/admin.tsx` | Operator portal (superadmin only) |

Layout: `routes/_app/route.tsx` — auth gate + `StoreProvider` + `Shell`.

**Production:** owners use the deployed URL (e.g. shelfpos.net), not localhost. Pairing codes are entered on the POS PC's `sync.env` or via POS `/sync-setup` — see [[15-Setup-And-Deployment]].

## Auth (`lib/auth.tsx`)

- Supabase `signInWithPassword` / `signUp` (signup only on `/create-account` with valid invite key)
- Clears persisted cache on sign-out and **user switch**
- `supabaseConfigured()` checks `VITE_SUPABASE_*`
- Invite gate: `lib/signup-invite.ts` + `VITE_SIGNUP_INVITE_KEY`
- Operator invite: `/accept-invite` + `SetPasswordFromAuthCallback` (Supabase `detectSessionInUrl`)

## Store context (`lib/store-context.tsx`)

- Query `fetchStores()` — RLS-filtered `stores` table (superadmin sees all)
- Persists selection: `localStorage` key `shelfpos_dashboard_store`
- `NoStoresPage` when zero stores (except on `/link-pos`); auto `ensure_store_pairing` on no-stores page only
- Superadmin on `/link-pos` → redirect to `/admin`

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

## Pagination limits

| Page | Behavior |
|------|----------|
| Cash movements | Full pagination; default page size 50 |
| Cierres | Fetches up to **500** rows; shows truncation warning if more exist |
| Audit | 25/50/100 per page |
| Reports inventory | Max **200** per page; export loads all pages in chunks |

## Dashboard data helpers

| Module | Role |
|--------|------|
| `dashboard-inventory.ts` | Stock counts, KPI prior reconstruction |
| `dashboard-employees.ts` | `pos_users` team roster (filters hidden `SAKEN`) |
| `dashboard-activity.ts` | Alerts, recent activity |
| `tax-breakdown.ts` | IVA summary |

## Query cache

- Dashboard summary persisted to `sessionStorage` via `@tanstack/react-query-persist-client`
- Cleared on logout / user change: `lib/clear-dashboard-cache.ts`

## Shell (`components/Shell.tsx`)

- Collapsible sidebar, store switcher (multi-store owners)
- POS presence dots (`store-presence.ts`)
- Language switcher (ES / 中文)
- Owner nav includes `/link-pos`; operator uses `/admin` shell

## Common edge cases

| Symptom | Likely cause |
|---------|----------------|
| Home shows today only | By design — use **Reports** for historical date ranges |
| Sync OK, dashboard empty | Missing claim, wrong `store_id`, or stale `sync_owner_claimed` after wipe — [[19-Edge-Cases-And-Runbooks]] |
| Invite link fails | Expired or already consumed; operator can resend or use reset-password |
| Superadmin sees all stores | Expected; support view when a store is selected |

## Related

- [[12-Reports-And-Exports]]
- [[04-Multi-Tenant-Security]]
- [[06-Supabase-Schema]]
- [[19-Edge-Cases-And-Runbooks]]
