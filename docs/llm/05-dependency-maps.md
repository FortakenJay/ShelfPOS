# Dependency Maps

Parent: [LLM Index](README.md)

Use these trees to trace **impact** when changing a feature — not npm package dependencies.

---

## POS terminal UI

```
POSTerminalView
├── CartTabsBar
│   └── api.cartTabs.* (switch, new, close)
├── POSSearchPanel
│   ├── inputRef + scanner.onKeyDown
│   └── searchResults (debounced query)
├── POSCartPanel
│   ├── CartLineDiscountInput
│   ├── CartMiscNameInput
│   └── quantity / remove / price actions
├── POSSidebar
│   ├── openPay → PaymentModal
│   ├── ReturnModal
│   └── CashMovementsPanel
├── PaymentModal
│   ├── PaymentCheckoutPanel
│   ├── PaymentMethodButtons / Sidebar
│   └── sales:create on confirm
├── POSModals (PIN, customer, discounts)
└── usePOSTerminal (central hook)
    ├── useScannerDetector
    ├── useGlobalBarcodeScanner
    ├── usePosSearchFocus
    ├── usePosEnterShortcut
    ├── addToCart / onEnter
    └── cart tab persistence
```

---

## POS admin UI

```
Shell (sidebar routes)
├── ProductsPage
│   ├── useProductManager
│   ├── ProductForm
│   ├── ProductsTable
│   └── ProductsPageFilters (stock_provider)
├── CierrePage → cierre:confirm / print / PDF
├── ReportsPage (local SQLite)
├── SettingsPage (scanner_burst_ms, tax, printer)
├── UsersPage
├── AuditLogPage
├── AdminCashPage
├── PrintQueuePage
└── dashboard/ (local KPI charts)
```

---

## Main process — sale path

```
sales:create (ipc/sales.ts)
├── validate cart + stock (authoritative)
├── repos/sales.ts — INSERT header
├── repos/saleItems.ts — INSERT lines + snapshots
├── repos/salePayments.ts — INSERT payments
├── repos/products.ts — UPDATE stock conditional
├── enqueueSync × N tables
├── print_jobs — receipt payload
└── audit_log (if applicable)
```

---

## Main process — product path

```
products:* (ipc/products.ts)
├── repos/products.ts
│   ├── list / byBarcode / CRUD
│   ├── listStockProviders
│   └── stock filter
├── productCsvImport.ts
└── enqueueSync('products', ...)
```

---

## Sync service

```
sync-service/src/index.ts
├── claimStoreIfNeeded (startup)
├── poll sync_queue
└── sync.ts
    ├── listPendingQueue (priority order)
    ├── getLiveRow (db.ts LIVE_ROW_SQL)
    ├── upsert/delete Supabase REST
    └── markSynced / markError
```

---

## Dashboard — reports path

```
reports.tsx
├── ReportTypeTabs
├── DateRangePicker
├── tables/*ReportTable
└── downloadReportExcel / PDF
    ├── queries/reports.ts — fetch data
    ├── build-report-print-lines.ts
    ├── print-lines-to-pdf.ts
    └── report-grid-to-xlsx.ts (Excel grids)
```

---

## Dashboard — auth & tenancy

```
__root.tsx
└── _app/route.tsx
    ├── AuthProvider (lib/auth.tsx)
    ├── StoreProvider (store list + selected storeId)
    └── Shell
        ├── dashboard.tsx
        ├── link-pos.tsx → create_store_pairing RPC
        └── ... tenant-scoped pages
```

---

## IPC channel map (subset)

| Domain | Channels | Handler file |
|--------|----------|--------------|
| Sales | `sales:create`, `sales:findForReturn`, … | `sales.ts` |
| Products | `products:list`, `products:byBarcode`, `products:stockProviders` | `products.ts` |
| Cart tabs | `cartTabs:*` | `cartTabs.ts` |
| Cierre | `cierre:confirm`, `cierre:print`, … | `cierre.ts` |
| Settings | `settings:get`, `settings:update` | `settings.ts` |
| Sync setup | `syncSetup:*` | `syncSetup.ts` |

Full list: `shared/types.ts` → `IPC_CHANNELS`

---

## Related

- [Code index](07-code-index.md)
- [Features](06-features.md)
- [Wiki: IPC reference](../wiki/09-IPC-Reference.md)
