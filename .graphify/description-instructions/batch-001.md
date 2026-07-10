# Node Description Batch 2 of 42

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "main_license": "license.ts" | kind=code-symbol | source=shelfPos/src/main/license.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, license.ts, index.ts, errors.ts, AppError, activateLicense()]
- "repos_users": "users.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, users.ts, syncQueue.ts, helpers.ts, localNow(), index.ts]
- "schemas_primitives": "primitives.ts" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ipc.ts, actionShortcutKeySchema, barcodeSchema, dateRangeSchema, filePathSchema]
- "admin_settingsform": "SettingsForm.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L1 | neighbors=[PinCardPrintModal.tsx, PinCardPrintModal(), settingsDraft.ts, draftFromSettings(), emisorDraftDirty(), generalDraftDirty()]
- "ipc_backup": "backup.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/backup.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, rangeBounds(), index.ts, getDb(), getDbPath()]
- "services_csvcolumns": "csvColumns.ts" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, backup.ts, formatPaymentMethod(), headerAliases(), LANGUAGES, mapProductCsvHeaders()]
- "services_facturapdf": "facturaPdf.ts" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, sales.ts, salesReceipt.ts, buildFacturaHtml(), buildPage(), buildSummaryBlock()]
- "services_productcsvexport": "productCsvExport.ts" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, index.ts, getDb(), products.ts, csv.ts]
- "repos_syncqueue": "syncQueue.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cierre.ts, returns.ts, sales.ts, syncSetup.ts, users.ts]
- "services_syncconfig": "syncConfig.ts" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, syncSetup.ts, index.ts, getDbPath(), parseEnv.ts, errors.ts]
- "src_db": "db.ts" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, config.ts, SyncConfig, applyPendingSyncStoreId(), clearSyncOwnerClaimed(), enqueueAllPosUsersBackfill()]
- "src_sync": "sync.ts" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, config.ts, SyncConfig, db.ts, clearSyncOwnerClaimed()]
- "components_productmanagermodals": "ProductManagerModals.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductManagerModals.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals(), ProductManagerModalsProps, useProductManager.ts, ProductManagerUiState, AdjustStockModal.tsx]
- "db_helpers_localnow": "localNow()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L7 | neighbors=[helpers.ts, pad(), todayLocal(), cierre.ts, firstRun.ts, products.ts]
- "ipc_firstrun": "firstRun.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/firstRun.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, localNow(), index.ts, getDb(), getDbPath()]
- "ipc_helpers_handle": "handle()" | kind=code-symbol | source=shelfPos/src/main/ipc/helpers.ts:L13 | neighbors=[audit.ts, auth.ts, backup.ts, cart.ts, cartTabs.ts, cash.ts]
- "ipc_syncsetup": "syncSetup.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/syncSetup.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, handle(), registerSyncSetupHandlers(), syncSetupStatus()]
- "pos_posmodals": "POSModals.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSModals.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CustomerModal.tsx, CustomerModal(), DiscountModal.tsx, DiscountModal(), PaymentModal.tsx]
- "repos_dashboard_dashboardoverview": "dashboardOverview()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L526 | neighbors=[dashboard.ts, dashboard.ts, buildAlerts(), categoryPerformance(), employeeOverview(), employeePerformance()]
- "pos_paymentmodal": "PaymentModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentCheckoutPad.tsx, PaymentCheckoutPad(), PaymentCheckoutPanel.tsx, PaymentCheckoutPanel(), paymentCustomer.ts]
- "services_productefacturaimport": "productEfacturaImport.ts" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, errors.ts, AppError, primitives.ts, csvColumns.ts]
- "src_index": "index.ts" | kind=code-symbol | source=shelfPos/sync-service/src/index.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, config.ts, loadConfig(), SyncConfig, db.ts, enqueueAllPosUsersBackfill()]
- "components_ui": "ui.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DateRangePicker.tsx, PinModal.tsx, Button(), ButtonProps, ButtonSize]
- "pos_posterminalview": "POSTerminalView.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSTerminalView.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSPage.tsx, CartTabsBar.tsx, CartTabsBar(), LineDiscountPinModal.tsx, LineDiscountPinModal()]
- "pos_useposterminal": "usePOSTerminal.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSModals.tsx, POSPage.tsx, POSTerminalView.tsx, lineDiscount.ts, lineDiscountFromPercent()]
- "components_dashboardtables": "DashboardTables.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardPrimitives.tsx, DashboardCard(), DashboardEmpty(), FooterLink(), ActivityAlertsSection()]
- "products_productspage": "ProductsPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, ProductManagerModals(), ProductsPageFilters.tsx, ProductsPageFilters(), ProductsPageToolbar.tsx]
- "repos_audit_writeaudit": "writeAudit()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L41 | neighbors=[auth.ts, authorize.ts, backup.ts, cart.ts, cash.ts, cierre.ts]
- "components_dashboardcharts": "DashboardCharts.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardCharts.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, dashboardChartLoaders.ts, DashboardChartFallback.tsx, DashboardChartFallback(), CHART_COLORS, InventoryHealthChart()]
- "reports_reporttable": "ReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/ReportTable.tsx:L1 | neighbors=[ReportsPage.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable(), ByPaymentReportTable.tsx, ByPaymentReportTable(), InventoryReportTable.tsx]
- "shared_money": "money.ts" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, format.ts, productCsvImport.ts, productSupplierInvoicePdf.ts, cartTabSnapshot.ts]
- "lib_toast": "toast.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, format.ts, formatMoney(), session.ts, useSession(), KIND_BAR]
- "services_labelprintlines": "labelPrintLines.ts" | kind=code-symbol | source=shelfPos/src/main/services/labelPrintLines.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, products.ts, getProduct(), LabelPrintKind, labelPrintPayload()]
- "services_shelflabellines": "shelfLabelLines.ts" | kind=code-symbol | source=shelfPos/src/main/services/shelfLabelLines.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, print-test-crc.ts, printer.ts, printTemplates.ts, format.ts, formatMoney()]
- "components_dashboardchartlazy": "dashboardChartLazy.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLazy.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardChartFallback.tsx, DashboardChartFallback(), LazyDashboardHomeCharts(), LazyInventoryHealthChart(), LazyProductAnalyticsCharts()]
- "ipc_printer": "printer.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/printer.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, handle(), PRINTER_ACTION, registerPrinterHandlers()]
- "scripts_print_test_crc": "print-test-crc.ts" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, __dirname, labelLines, main(), printer, probePrinter()]
- "services_escposrender_pushrowline": "pushRowLine()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L265 | neighbors=[escPosRender.ts, align(), applyTextStyle(), capEscPosScale(), compactMoneyText(), encodeDigits()]
- "admin_cierrediscrepancyalerts": "CierreDiscrepancyAlerts.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L1 | neighbors=[alertMessage(), CierreDiscrepancyAlerts(), CierreDiscrepancyBanner(), DismissButton(), dismissCierreIds(), dismissedListeners]
- "admin_settingsdraft": "settingsDraft.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L1 | neighbors=[draftFromSettings(), EMISOR_KEYS, emisorDraftDirty(), GENERAL_KEYS, generalDraftDirty(), sectionDirty()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-001.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
