# Conventions For AI

Parent: [[Home]]

Read this before editing ShelfPOS. Rules align with `.cursor/rules/` in each project.

## Scope discipline

- **Minimum diff** — only change what the task requires
- Match existing naming, imports, and layer boundaries
- Do not refactor unrelated code

## Layer rules

### POS renderer

- No SQLite, Electron, or Supabase imports
- No business math in JSX — use `lib/` or repos
- API: `lib/api.ts` → IPC only

### POS main

- IPC validates with Zod + enforces roles again
- Repos: SQL only; enqueue sync in same transaction
- Errors: `AppError` + locale keys

### Dashboard

- `lib/queries/*.ts` — Supabase only, no React
- Components call hooks/queries; no `reduce` chains in JSX
- Explicit column lists — never `select('*')`

### sync-service

- No Supabase SDK — raw REST
- Column maps in `db.ts` `LIVE_ROW_SQL`

## Query keys (dashboard)

```
['stores', userId]
['dashboard', storeId]
['cash-movements', storeId, from, to]
['reports', storeId, type, from, to, …]
```

Invalidate on mutations consistently.

## Schema changes checklist

- [ ] `migrations.ts` bump `SCHEMA_VERSION`
- [ ] `syncQueue.ts` / repos enqueue if new synced table
- [ ] `sync-service/src/db.ts` `LIVE_ROW_SQL`
- [ ] `DASHBOARD/SUPA.sql` CREATE + ALTER patches
- [ ] Run `SUPA.sql` on Supabase
- [ ] `npm run build` sync-service

## Multi-tenant

- Dashboard reads rely on **RLS** — test with two auth users
- Never widen RLS to `auth.uid() IS NOT NULL` on mirror tables
- Superadmin only via `app_metadata.role`

## Quality gates

See [[18-Quality-And-Tooling]] for Bugbot, full vs changed Doctor scope, and pre-commit checklist.

```bash
# POS
cd OFFLINE-ONLY-POS && npm run lint && npm run doctor

# Dashboard
cd DASHBOARD && npm run lint && npm run doctor
```

## Files to grep first

| Task | Start here |
|------|------------|
| Sale logic | `main/ipc/sales.ts`, `repos/products.ts` |
| Sync failure | `sync-service/src/sync.ts`, `errorLog.ts` |
| Dashboard KPI | `lib/queries/dashboard.ts`, `dashboard-inventory.ts` |
| Tenancy | `SUPA.sql`, `link-pos.tsx`, `claimStoreIfNeeded` |
| Reports | `lib/queries/reports.ts`, `reports.types.ts` |

## Wiki maintenance

When you add a feature that changes architecture or schema, update the relevant `docs/wiki/*.md` page and link from [[Home]].

## Related

- [[02-Architecture]]
- [[16-Error-Handling]]
- [[04-Multi-Tenant-Security]]
