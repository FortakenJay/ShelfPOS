# Code Index — Where Things Live

Parent: [LLM Index](README.md)

Quick lookup when an LLM (or human) needs the right file.

---

## By concern

| Concern | Path |
|---------|------|
| **Master LLM context** | `docs/shelfpos_context.md` |
| SQLite schema / migrations | `OFFLINE-ONLY-POS/src/main/db/migrations.ts` |
| SQL column lists | `OFFLINE-ONLY-POS/src/main/db/columns.ts` |
| Database repos | `OFFLINE-ONLY-POS/src/main/db/repos/*.ts` |
| Sync enqueue | `OFFLINE-ONLY-POS/src/main/db/repos/syncQueue.ts` |
| IPC handlers | `OFFLINE-ONLY-POS/src/main/ipc/*.ts` |
| IPC channel list | `OFFLINE-ONLY-POS/src/shared/types.ts` |
| IPC Zod schemas | `OFFLINE-ONLY-POS/src/shared/schemas/ipc.ts` |
| AppError | `OFFLINE-ONLY-POS/src/main/ipc/helpers.ts` |
| Renderer API facade | `OFFLINE-ONLY-POS/src/renderer/src/lib/api.ts` |
| Preload bridge | `OFFLINE-ONLY-POS/src/preload/index.ts` |
| Locales (errors + UI) | `OFFLINE-ONLY-POS/src/shared/locales/es.json`, `zh-CN.json` |
| Misc item parse | `OFFLINE-ONLY-POS/src/shared/miscItem.ts` |
| Electron entry | `OFFLINE-ONLY-POS/src/main/index.ts` |
| Printer / receipts | `OFFLINE-ONLY-POS/src/main/services/printer.ts` |
| Factura PDF | `OFFLINE-ONLY-POS/src/main/services/facturaPdf.ts` |
| Cierre print lines | `OFFLINE-ONLY-POS/src/main/services/printTemplates.ts` |
| Operator recovery (SAKEN) | `OFFLINE-ONLY-POS/src/main/services/operatorConfig.ts` |
| Sync service loop | `OFFLINE-ONLY-POS/sync-service/src/index.ts` |
| Sync upsert logic | `OFFLINE-ONLY-POS/sync-service/src/sync.ts` |
| Sync LIVE_ROW_SQL | `OFFLINE-ONLY-POS/sync-service/src/db.ts` |
| Supabase DDL | `DASHBOARD/SUPA.sql` |
| Cloud wipe script | `DASHBOARD/scripts/wipe-supabase-mirror-data.sql` |
| Dashboard auth | `DASHBOARD/src/lib/auth.tsx` |
| Dashboard queries | `DASHBOARD/src/lib/queries/*.ts` |
| Dashboard reports export | `DASHBOARD/src/lib/reports-pdf.ts`, `lib/reports/report-grid-to-xlsx.ts` |
| Store pairing UI | `DASHBOARD/src/routes/_app/link-pos.tsx` |

---

## POS renderer features

| Feature | Path |
|---------|------|
| Authentication / login | `features/auth/` |
| First-run wizard | `features/auth/` (Bootstrap, first run) |
| App shell / sidebar | `features/shell/Shell.tsx` |
| POS terminal | `features/pos/` |
| POS hook (main state) | `features/pos/usePOSTerminal.ts` |
| Barcode scanner | `lib/useScanner.ts`, `features/pos/posKeyboard.ts` |
| Cart tabs UI | `features/pos/CartTabsBar.tsx` |
| Payment checkout | `features/pos/PaymentModal.tsx`, `PaymentCheckoutPanel.tsx` |
| Products admin | `features/products/` |
| Product manager hook | `features/products/hooks/useProductManager.ts` |
| Admin (cierre, reports, settings, users) | `features/admin/` |
| Local dashboard charts | `features/admin/dashboard/` |
| Sync setup page | `features/sync-setup/SyncSetupPage.tsx` |
| Router | `renderer/src/router.tsx` |

---

## POS main IPC by domain

| Domain | File |
|--------|------|
| Auth | `ipc/auth.ts` |
| Sales | `ipc/sales.ts` |
| Returns | `ipc/returns.ts` |
| Products | `ipc/products.ts` |
| Cierre | `ipc/cierre.ts` |
| Cash | `ipc/cash.ts` |
| Cart tabs | `ipc/cartTabs.ts` |
| Settings | `ipc/settings.ts` |
| Users | `ipc/users.ts` |
| Reports (local) | `ipc/reports.ts` |
| Sync setup | `ipc/syncSetup.ts` |
| Print / drawer | `ipc/printer.ts`, `ipc/printQueue.ts` |

---

## Dashboard routes

| Route | File |
|-------|------|
| Login | `routes/login.tsx` |
| Signup / invite | `routes/create-account.tsx`, `accept-invite.tsx` |
| Home KPIs | `routes/_app/dashboard.tsx` |
| Reports | `routes/_app/reports.tsx` |
| Cash movements | `routes/_app/movements.tsx` |
| Cierres | `routes/_app/cierres.tsx` |
| Audit | `routes/_app/audit.tsx` |
| Link POS | `routes/_app/link-pos.tsx` |
| Superadmin | `routes/_app/admin.tsx` |

---

## Documentation

| Audience | Path |
|----------|------|
| LLM (one file) | `docs/shelfpos_context.md` |
| LLM (chapters) | `docs/llm/` |
| Humans (wiki) | `docs/wiki/Home.md` |
| ADRs | `docs/decisions/` |
| AI conventions | `docs/wiki/17-Conventions-For-AI.md` |
| Runbooks | `docs/wiki/19-Edge-Cases-And-Runbooks.md` |

---

## Related

- [Dependency maps](05-dependency-maps.md)
- [Overview](01-overview.md)
