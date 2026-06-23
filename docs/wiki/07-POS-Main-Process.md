# POS Main Process

Parent: [[Home]]

**Entry:** `OFFLINE-ONLY-POS/src/main/index.ts`

## Startup sequence

1. License check (`services/license.ts`)
2. Open SQLite `shelf.db`, run migrations
3. Optional pre-migration backup
4. Register IPC handlers (`ipc/index.ts`)
5. Printer probe, POS heartbeat interval
6. `loadOperatorEnv()` — optional SAKEN recovery password from `operator.env`
7. `enqueueAllPosUsersSync()` — ensure users queued for mirror (SAKEN excluded)
8. Create `BrowserWindow` + preload

## Directory map

| Path | Role |
|------|------|
| `db/index.ts` | Open DB, pragmas (WAL, foreign_keys) |
| `db/migrations.ts` | Schema version 19 |
| `db/repos/cartTabs.ts` | Open cart tab rows (`cart_json` snapshots) |
| `db/repos/*.ts` | SQL only — no Electron imports in repos |
| `ipc/*.ts` | `handle(channel, roles, zodSchema, fn)` |
| `ipc/helpers.ts` | Access control, `AppError`, validation |
| `services/operatorConfig.ts` | Loads `operator.env`; enables SAKEN backdoor login |
| `services/session.ts` | Auth; SAKEN verifies env password, not DB hash |
| `services/printer.ts` | Thermal receipt, drawer kick |
| `services/facturaPdf.ts` | A4 landscape invoice PDF |
| `services/backup.ts` | Scheduled + manual DB backup |
| `services/posHeartbeat.ts` | Updates `pos_last_seen_at` |

## Error model

Throw `AppError('errors.someKey', { name: '…' })` — never raw `Error` in IPC handlers.

Keys must exist in `src/shared/locales/es.json` and `zh-CN.json`.

Renderer: `toastApiError(toasts, err)` for translated messages.

See [[16-Error-Handling]].

## Transactions

All multi-step writes use `db.transaction()`. Sync enqueue inside same transaction.

## Printing

- Receipts via `print_jobs` queue + `printer.ts`
- **Cierre ticket / PDF:** `buildCierreLines` in `printTemplates.ts` — includes payment totals, discounts, price overrides, **discarded cart tabs** (from `audit_log`), cash count, top products. Used on `cierre:confirm` print, `cierre:print`, and `cierre:exportPdf`.
- **Cash drawer:** ESC/POS pulse at end of receipt when sale includes cash (`PrintPayload.openDrawer`); manual kick via `printer:openDrawer` or cash-movement shortcuts
- Epson TM-T20/T81III: Windows RAW spooler; env `SHELFPOS_PRINTER_NAME` override
- Encoding: `iconv-lite` for thermal code pages
- Env overrides: `SHELFPOS_PRINTER_NAME`, `SHELFPOS_LINE_WIDTH`
- IPC: `printer:status`, `printer:test`, `printer:colonTest`

## License

Machine-bound JWT license in production. Dev bypass when `NODE_ENV=development`.

Scripts: `npm run license:generate`, `license:machine-id`.

## Related

- [[09-IPC-Reference]]
- [[08-POS-Renderer]]
- [[13-Factura-PDF]]
