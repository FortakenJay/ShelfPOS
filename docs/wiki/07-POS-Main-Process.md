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
| `db/migrations.ts` | Schema version 20 |
| `db/repos/cartTabs.ts` | Open cart tab rows (`cart_json` snapshots) |
| `db/repos/*.ts` | SQL only — no Electron imports in repos |
| `ipc/*.ts` | `handle(channel, roles, zodSchema, fn)` |
| `ipc/helpers.ts` | Access control, `AppError`, validation |
| `services/operatorConfig.ts` | Loads `operator.env`; enables SAKEN backdoor login |
| `services/session.ts` | Auth; SAKEN verifies env password, not DB hash |
| `services/printer.ts` | Thermal receipt, drawer kick |
| `services/facturaPdf.ts` | A4 landscape invoice PDF |
| `services/backup.ts` | Scheduled + manual DB backup |
| `services/productCsvExport.ts` | Streaming product catalog CSV export (large inventories) |
| `services/productCsvImport.ts` | CSV import parse, preview, apply |
| `services/csv.ts` | `csvEscape`, `buildCsv`, `parseCsv` |
| `services/csvStream.ts` | Async UTF-8 file stream writer (backpressure-safe) |
| `services/csvSpreadsheet.ts` | Barcode text literals (`="…"`) for Excel/Sheets |
| `services/posHeartbeat.ts` | Updates `pos_last_seen_at` |

## Error model

Throw `AppError('errors.someKey', { name: '…' })` — never raw `Error` in IPC handlers.

Keys must exist in `src/shared/locales/es.json` and `zh-CN.json`.

Renderer: `toastApiError(toasts, err)` for translated messages.

See [[16-Error-Handling]].

## Product CSV export (catalog backup)

**IPC:** `products:exportCsv` (`template?: boolean`) — `product_manager` / `admin`.

**Layers:** `ipc/products.ts` (save dialog only) → `services/productCsvExport.ts` → SQLite + `csvStream.ts`.

| Concern | Implementation |
|---------|----------------|
| Full catalog | All active rows (`deleted_at IS NULL`), not UI pagination |
| Scale (100k+) | Keyset batches (`id > ?`, 1000 rows/query); one prepared statement per export |
| Memory | Stream to `*.tmp`, flush 256 lines per disk write; atomic `rename` on success |
| Concurrency | Batched `.all()` — no long-lived `.iterate()` cursor blocking writes |
| Barcodes | `asSpreadsheetText()` → `="1234567890123"` so Excel does not show scientific notation |
| Re-import | `parseSpreadsheetText()` in `productCsvImport.ts` strips the literal on import |

Template export (`template: true`) writes headers only (same columns as full export).

## Cierre and cart tabs

On **`cierre:confirm`**, before the cierre row is inserted:

1. `resetCartTabsForNewShift(closedBy, closedAt)` in `db/repos/cartTabs.ts`
2. Each non-empty held cart → `audit_log` action `cart_tab_discarded_cierre` (synced)
3. All `cart_tabs` rows deleted; one empty tab inserted at position 1
4. `cierreDiscardedTabs` queried **after** reset so held carts appear on the thermal ticket / PDF

**Preview:** `cierre:preview` returns `heldCartTabs` (open POS carts with totals). `CierrePage` shows a warning before confirm.

**Renderer:** `CierrePage` invalidates `cartTabs` on success; `usePOSTerminal` switches to the new tab when the active tab id disappears.

**New shift:** opening float is still required (`cash:openFloat`) — normal after cierre locks prior `cash_movements`.

## Transactions

All multi-step writes use `db.transaction()`. Sync enqueue inside same transaction.

## Printing

- Receipts via `print_jobs` queue + `printer.ts`
- **Thermal currency:** **¢** (CP850 cent sign) on receipts and labels via `formatColonesPrint` + `encodePrintText` (normalizes legacy **₡** in templates). Screen UI still shows **₡**. Receipt footer disclaimer: `print.receipt.centDisclaimer`.
- **Product labels (thermal):** `buildShelfLabelLines` (shelf tag: barcode + código, bold name, huge price) and `buildProductBarcodeLabelLines` (CODE128 sticker with HRI). IPC: `products:printLabel`, `products:printBarcode`, batch variants (`items[]` with optional `copies`, max 99 per product). See [[08-POS-Renderer#product-label-printing-thermal]].
- **Cierre ticket / PDF:** `buildCierreLines` in `printTemplates.ts` — includes payment totals, discounts, price overrides, **discarded cart tabs** (from `audit_log`), cash count, top products. Used on `cierre:confirm` print, `cierre:print`, and `cierre:exportPdf`.
- **Cash drawer:** ESC/POS pulse at end of receipt when sale includes cash (`PrintPayload.openDrawer`); manual kick via `printer:openDrawer` or cash-movement shortcuts
- Epson TM-T20/T81III: Windows RAW spooler; env `SHELFPOS_PRINTER_NAME` override
- Encoding: `iconv-lite` CP850 for thermal text
- Env overrides: `SHELFPOS_PRINTER_NAME`, `SHELFPOS_LINE_WIDTH`, `SHELFPOS_LABEL_WIDTH_MM` (default 58)
- IPC: `printer:status`, `printer:test` (sample receipt with ¢ amounts)

## License

Machine-bound JWT license in production. Dev bypass when `NODE_ENV=development`.

Scripts: `npm run license:generate`, `license:machine-id`.

## Related

- [[09-IPC-Reference]]
- [[08-POS-Renderer]]
- [[13-Factura-PDF]]
