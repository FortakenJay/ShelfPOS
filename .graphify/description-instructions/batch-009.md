# Node Description Batch 10 of 42

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

- "db_helpers_daysinrange": "daysInRange()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L30 | neighbors=[helpers.ts, pad(), reports.ts, dashboard.ts]
- "db_helpers_pad": "pad()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L4 | neighbors=[helpers.ts, daysAgoLocal(), daysInRange(), localNow()]
- "db_index_getdbpath": "getDbPath()" | kind=code-symbol | source=shelfPos/src/main/db/index.ts:L16 | neighbors=[index.ts, backup.ts, firstRun.ts, syncConfig.ts]
- "hooks_userechartsmodule_userechartsmodule": "useRechartsModule()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/hooks/useRechartsModule.ts:L13 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx, useRechartsModule.ts]
- "ipc_products_runbatchprint": "runBatchPrint()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L177 | neighbors=[products.ts, normalizeBatchPrintItems(), printLabelForProduct(), printProductLabel()]
- "ipc_reports_buildreportprintlines": "buildReportPrintLines()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L112 | neighbors=[reports.ts, boundsForReport(), isMultiDay(), reportRangeLabel()]
- "lib_errors": "errors.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/errors.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, stockAllows(), toastApiError(), Toasts]
- "lib_parseenv": "parseEnv.ts" | kind=code-symbol | source=shelfPos/src/main/lib/parseEnv.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, parseEnv.ts, operatorConfig.ts, syncConfig.ts]
- "lib_shortcuts": "shortcuts.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/shortcuts.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, eventToShortcutKey(), shouldIgnoreShortcutTarget(), useScanner.ts]
- "main_appicon": "appIcon.ts" | kind=code-symbol | source=shelfPos/src/main/appIcon.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, activationWindow.ts, resolveAppIcon(), index.ts]
- "main_license_getlicensestatus": "getLicenseStatus()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L198 | neighbors=[license.ts, license.ts, checkStoredLicense(), devLicenseStatus()]
- "main_license_getmachineid": "getMachineId()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L47 | neighbors=[license.ts, activateLicense(), checkStoredLicense(), devLicenseStatus()]
- "pos_carttabsbar": "CartTabsBar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartTabsBar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartTabsBar(), CartTabsBarProps, POSTerminalView.tsx]
- "pos_cashdrawersummary": "CashDrawerSummary.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerSummary.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CashDrawerPage.tsx, CashDrawerSummary(), StatBox()]
- "pos_cashmovementspanel": "CashMovementsPanel.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashMovementsPanel.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CashDrawerPage.tsx, CashMovementsPanel(), PendingMovement]
- "pos_paymentmethodbuttons": "PaymentMethodButtons.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodButtons.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, METHODS, PaymentMethodButtons(), PaymentMethodSidebar.tsx]
- "pos_removelinemodal": "RemoveLineModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/RemoveLineModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSModals.tsx, RemoveLineModal(), RemoveLineModalProps]
- "pos_usepinauthorize_usepinauthorize": "usePinAuthorize()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePinAuthorize.ts:L3 | neighbors=[DiscountModal.tsx, LineDiscountPinModal.tsx, PriceOverrideModal.tsx, usePinAuthorize.ts]
- "preload_index_d": "index.d.ts" | kind=code-symbol | source=shelfPos/src/preload/index.d.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, Window, types.ts, LicenseStatus]
- "products_adjuststockmodal": "AdjustStockModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/AdjustStockModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, AdjustStockModal(), REASONS]
- "repos_carttabs_removecarttab": "removeCartTab()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L66 | neighbors=[cartTabs.ts, cartTabs.ts, deleteCartTabRow(), getCartTabJson()]
- "repos_cash_cashdrawerstatus": "cashDrawerStatus()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L81 | neighbors=[cash.ts, cash.ts, listOpenCashMovements(), openCashSummary()]
- "repos_cash_hasopeningfloat": "hasOpeningFloat()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L106 | neighbors=[cash.ts, returns.ts, sales.ts, cash.ts]
- "repos_cash_opencashsummary": "openCashSummary()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L9 | neighbors=[cash.ts, cierre.ts, cash.ts, cashDrawerStatus()]
- "repos_products_alertsforproducts": "alertsForProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L211 | neighbors=[products.ts, returns.ts, sales.ts, products.ts]
- "repos_products_applystockdelta": "applyStockDelta()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L172 | neighbors=[products.ts, products.ts, productCsvImport.ts, productSupplierInvoicePdf.ts]
- "repos_products_enqueueproductsync": "enqueueProductSync()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L235 | neighbors=[products.ts, returns.ts, sales.ts, products.ts]
- "repos_products_listproducts": "listProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L103 | neighbors=[products.ts, products.ts, buildProductListWhere(), productSelect()]
- "repos_products_searchproducts": "searchProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L126 | neighbors=[products.ts, products.ts, getProduct(), productSelect()]
- "repos_products_softdeleteproduct": "softDeleteProduct()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L193 | neighbors=[products.ts, products.ts, isTombstoneBarcode(), tombstoneBarcodeValue()]
- "repos_products_updateproductcatalogfields": "updateProductCatalogFields()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L272 | neighbors=[products.ts, products.ts, releaseBarcodeForReuse(), productCsvImport.ts]
- "repos_reports_cierrediscounts": "cierreDiscounts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L353 | neighbors=[cierre.ts, reports.ts, saleWhere(), salesSummary()]
- "repos_reports_listsaleheaders": "listSaleHeaders()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L650 | neighbors=[reports.ts, itemizedSales(), saleWhere(), transactionLog()]
- "repos_reports_listsalepayments": "listSalePayments()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L664 | neighbors=[reports.ts, itemizedSales(), saleWhere(), transactionLog()]
- "repos_reports_taxbreakdown": "taxBreakdown()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L101 | neighbors=[reports.ts, dashboard.ts, reports.ts, saleWhere()]
- "repos_reports_topproducts": "topProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L219 | neighbors=[cierre.ts, reports.ts, reports.ts, saleWhere()]
- "scripts_e2e_full_waitfor": "waitFor()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L68 | neighbors=[e2e-full.mjs, dumpState(), evalJs(), sleep()]
- "scripts_print_colon_preprod_appendcolonmark": "appendColonMark()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L106 | neighbors=[print-colon-preprod.mjs, colonMatrixToEscPos(), buildJob1(), pushPrintText()]
- "scripts_print_colon_preprod_buildjob2": "buildJob2()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L206 | neighbors=[print-colon-preprod.mjs, align(), bold(), feed()]
- "scripts_print_colon_preprod_size": "size()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L60 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob3()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-009.json

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
