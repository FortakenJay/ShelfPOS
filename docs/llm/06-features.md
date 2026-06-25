# Feature Documentation

Parent: [LLM Index](README.md)

Each card: purpose, entry point, data, permissions, edge cases.

---

## POS checkout

| | |
|--|--|
| **Purpose** | Complete sale, decrement stock, print receipt, enqueue sync |
| **Entry** | `PaymentModal` → `api.sales.create` |
| **IPC** | `OFFLINE-ONLY-POS/src/main/ipc/sales.ts` |
| **Tables** | `sales`, `sale_items`, `sale_payments`, `products`, `print_jobs`, `sync_queue` |
| **Permissions** | `sales` role minimum |
| **Edge cases** | Out of stock (race-safe SQL); split payments; misc lines (`product_id` NULL); customer fields optional |

---

## Barcode scan

| | |
|--|--|
| **Purpose** | Add product by USB scanner or typed barcode |
| **Entry** | `usePOSTerminal.onEnter`, `useGlobalBarcodeScanner` |
| **Files** | `useScanner.ts`, `posKeyboard.ts`, `usePOSTerminal.ts` |
| **Tables** | `products` (read) |
| **Settings** | `scanner_burst_ms` (default 30) |
| **Edge cases** | Slow scanner → raise ms; product not found → toast; modal open disables scan; Enter reads `inputRef` not stale state |

---

## Misc line (`PRECIO*`)

| | |
|--|--|
| **Purpose** | Ad-hoc priced line without catalog product |
| **Entry** | Search box `3000*` + Enter |
| **Parse** | `src/shared/miscItem.ts` |
| **Tables** | `sale_items` with `product_id` NULL |
| **Edge cases** | **Not returnable** — intentional; do not add to return search without requirement |

---

## Returns (devoluciones)

| | |
|--|--|
| **Purpose** | Refund catalog lines; optional restock |
| **Entry** | `ReturnModal` → `returns:create` |
| **Tables** | `return_items`, `products`, `sales`, `sale_items` |
| **Permissions** | PIN + role |
| **Edge cases** | `sales:findForReturn` filters `product_id IS NOT NULL`; mixed tickets return catalog only |

---

## Cart tabs

| | |
|--|--|
| **Purpose** | Multiple open carts per register |
| **Entry** | `CartTabsBar`, `usePOSTerminal` tab hooks |
| **IPC** | `cartTabs:list`, `create`, `save`, `discardAudited`, `complete` |
| **Tables** | `cart_tabs` (local), `audit_log` on PIN discard |
| **Permissions** | Discard with items → caja/manager PIN |
| **Edge cases** | Not synced; discard appears on cierre print/PDF |

---

## Cierre (shift close)

| | |
|--|--|
| **Purpose** | Close shift, count cash, record discrepancy |
| **Entry** | `CierrePage` → `cierre:confirm` |
| **Tables** | `cierres`, `cash_movements`, `audit_log` |
| **Output** | Thermal ticket + PDF via `buildCierreLines` |
| **Edge cases** | Includes discarded cart tabs from audit; sales must link to `cierre_id` |

---

## Product catalog

| | |
|--|--|
| **Purpose** | CRUD, CSV/eFactura import, shelf + barcode label print |
| **Entry** | `ProductsPage`, `ProductForm`, `BatchLabelPrintModal` |
| **IPC** | `products:*`, `products:stockProviders`, `products:printLabel`, `products:printBarcode`, `products:printLabelBatch`, `products:printBarcodeBatch` |
| **Tables** | `products`, `stock_adjustments` |
| **Permissions** | `product_manager` / `admin` |
| **Edge cases** | Soft delete; `stock_provider` filter; barcode UNIQUE; thermal prints use **¢**; barcode sticker falls back to product id; batch copies 1–99 (`shared/printLimits.ts`); `searchProducts` merges exact id with name/barcode `LIKE` |

---

## Stock adjustment

| | |
|--|--|
| **Purpose** | Manual inventory correction |
| **Entry** | Products admin UI |
| **Tables** | `stock_adjustments`, `products` |
| **Synced** | Yes |
| **Edge cases** | Delta capped in sync sanitizer |

---

## Local POS reports

| | |
|--|--|
| **Purpose** | Reports from SQLite on same PC |
| **Entry** | `features/admin/reports/` |
| **IPC** | `reports:*` |
| **Note** | Independent from dashboard cloud reports |

---

## Dashboard reports

| | |
|--|--|
| **Purpose** | Owner reports from Supabase mirror |
| **Entry** | `/reports` |
| **Types** | summary, byPayment, topProducts, inventory, taxBreakdown, transactionLog, itemizedSales |
| **Export** | PDF + Excel grid (`report-grid-to-xlsx.ts`) |
| **Edge cases** | Inventory max 200/page; cierres list cap 500; RLS scopes by store |

---

## Store pairing

| | |
|--|--|
| **Purpose** | Link POS register to dashboard owner |
| **Entry** | Dashboard `/link-pos` + POS `/sync-setup` |
| **Tables** | `store_pairings`, `store_access`, `stores` |
| **Flow** | 8-char code, 24h, single use; sync service calls `claim_store_sync` |
| **Edge cases** | Stale `sync_owner_claimed` after cloud wipe — re-pair |

---

## Sync setup

| | |
|--|--|
| **Purpose** | Configure pairing code on POS |
| **Entry** | `SyncSetupPage` |
| **IPC** | `syncSetup:status`, update pairing, restart service |
| **Edge cases** | Cannot fix wrong Supabase URL from UI — edit `sync.env` |

---

## Factura PDF

| | |
|--|--|
| **Purpose** | A4 invoice per sale |
| **Entry** | POS admin + dashboard report buttons |
| **Files** | `facturaPdf.ts`, `wiki/13-Factura-PDF.md` |
| **Data** | `barcode_snapshot` preferred over live product barcode |

---

## Cloud production wipe

| | |
|--|--|
| **Purpose** | Reset mirror data for clean production |
| **Script** | `DASHBOARD/scripts/wipe-supabase-mirror-data.sql` |
| **Keeps** | `auth.users`, schema, RLS |
| **Edge cases** | Run as postgres; stop sync first; re-pair all registers |

---

## Related

- [Business rules](02-business-rules.md)
- [Wiki: Edge cases](../wiki/19-Edge-Cases-And-Runbooks.md)
