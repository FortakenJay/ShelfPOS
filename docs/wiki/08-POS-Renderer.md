# POS Renderer

Parent: [[Home]]

**Entry:** `OFFLINE-ONLY-POS/src/renderer/src/main.tsx`  
**Routes:** `router.tsx` (code-based TanStack Router)

## API boundary

All main-process calls go through:

`features/*` → `lib/api.ts` → `window.api.invoke(channel, payload)`

**Never** import `better-sqlite3`, Electron, or Supabase in renderer.

## Feature folders

`src/renderer/src/features/`

| Feature | Routes / screens |
|---------|------------------|
| `auth/` | Login, first-run wizard, language |
| `shell/` | Sidebar, collapse, language switcher |
| `pos/` | Terminal, payment, cart tabs, cash drawer, reprints |
| `products/` | Catalog CRUD, CSV/eFactura import, labels |
| `admin/` | Reports, cierre, audit, users, settings, export |
| `admin/dashboard/` | **Local** SQLite dashboard (offline KPIs) |

## Hooks pattern

Each feature exposes hooks (e.g. `usePOSTerminal`, `useProductManager`) containing TanStack Query/mutation logic. Components are render-only.

**Cart tabs:** `usePOSTerminal` restores tabs from SQLite on mount; `CartTabsBar` switches carts. Snapshot = `{ cart, cartDiscount, customer }`. Closing a non-empty tab requires caja/manager PIN (`cartTabs:discardAudited`); rows appear in cierre **screen**, **thermal print**, and **PDF** via `audit_log` + `buildCierreLines`.

## Barcode scanner (USB HID)

Scanners emulate a keyboard: rapid digits + Enter. Detection lives in:

| File | Role |
|------|------|
| `lib/useScanner.ts` | `useScannerDetector` (search field) + `useGlobalBarcodeScanner` (capture phase elsewhere on POS) |
| `features/pos/posKeyboard.ts` | `usePosSearchFocus`, `usePosEnterShortcut` |
| `features/pos/usePOSTerminal.ts` | `onEnter`, `addToCart`, wires scanner hooks |

**Burst rule:** input is treated as a scan when length ≥ 4 and consecutive keys arrive within `scanner_burst_ms` (setting key `scanner_burst_ms`, default 30). Admin → Settings → “Umbral del escáner (ms)” (5–500).

**Search field Enter (`onEnter`):**

1. Read live `inputRef.value` (not React `query` state) so Enter after a fast scan has the full barcode.
2. `PRECIO*` misc lines (`parseMiscPriceInput`) — checked before barcode lookup.
3. If burst classified as scan → `products:byBarcode`; on miss → `errors.productNotFound` toast.
4. Else if value is 4+ digits → try `byBarcode` once (slow scanners that miss burst timing); on miss, fall through.
5. Else if exactly one debounced search result → add that product.

**Global scanner:** when focus is not on the search input, `useGlobalBarcodeScanner` buffers keys in capture phase and calls `onScan` → `byBarcode` + `addToCart`. Refocuses search only when add succeeds.

**Disabled while:** payment modal, returns, PIN modals, customer modal, cart-tab close PIN, or cash float blocked.

## Products (catalog)

Optional **`stock_provider`** (v20) — free-text supplier label (e.g. Walmart). Filter on Products page; `products:stockProviders` returns distinct values. Synced to Supabase; CSV import leaves provider null on new rows.

### Product label printing (thermal)

Two separate print actions on **Productos** (`product_manager` / `admin`). Both use the configured label printer via `print_jobs` + ESC/POS (`insertPrintJob('label', …)`). All thermal money uses **¢** (CP850); on-screen prices use **₡**.

| UI (ES) | IPC | Template | Content | Use |
|---------|-----|----------|---------|-----|
| **Imprimir etiqueta** | `products:printLabel` | `buildShelfLabelLines` | **20 mm** label: CODE128 + spaced código (when printable), **bold big** name, **bold huge** price | Display stand / shelf |
| **Imprimir código de barras** | `products:printBarcode` | `buildProductBarcodeLabelLines` | Large CODE128 (h=100, w=3) with **digits under bars** (HRI) | Sticker on the product |

**Barcode value:** `barcodePrintValue()` in `shared/barcode.ts` — printable `products.barcode` or numeric `product.id`. First barcode print without código assigns id to DB (`productForBarcodePrint` in `products.ts` IPC) so POS scan works.

**Batch modals** (toolbar):

| Button | Mode | IPC |
|--------|------|-----|
| **Etiquetas en lote** | `labels` | `products:printLabelBatch` |
| **Códigos de barras en lote** | `barcodes` | `products:printBarcodeBatch` |

`BatchLabelPrintModal`: POS-style debounced search + scanner (same burst pattern as caja), draggable results list, queue table with per-row copies. Payload: `{ items: { productId, copies? }[] }` — max **200** products, **1–99** copies each (`MAX_LABEL_COPIES` in `shared/printLimits.ts`). Ambiguous search → toast + pick from dropdown. Re-adding same product merges copies.

After **create product**, `ProductLabelPrintPromptModal` offers both prints (+ **Después**). Keyboard shortcuts (Settings → **Atajos**): **Imprimir etiqueta de producto** (default F6) and **Imprimir código de barras de producto** (default F11) — each prints when exactly one product is visible in the filtered list.

Shelf etiqueta targets **20 mm** height (half of 40 mm stock). Override label width with `SHELFPOS_LABEL_WIDTH_MM` (default 58). Audit: `product_label_printed` / `product_barcode_printed`.

**Code:** `features/products/` (`ProductsTable`, `BatchLabelPrintModal`, `ProductLabelPrintPromptModal`, `useProductManager`), `main/ipc/products.ts`, `main/services/printTemplates.ts`, `shared/barcode.ts`, `shared/printLimits.ts`, `shared/money.ts`.

## Locales

`src/shared/locales/es.json`, `zh-CN.json` — shared with main for error keys.

`LanguageSwitcher` in `components/LanguageSwitcher.tsx` — segmented ES / 中文.

## Roles (POS)

| Role | Typical access |
|------|----------------|
| `sales` | POS terminal, reprints |
| `product_manager` | Products, stock |
| `admin` | All admin screens, settings, users |

IPC enforces roles again in main process.

## Related

- [[09-IPC-Reference]]
- [[07-POS-Main-Process]]
- [[17-Conventions-For-AI]]
