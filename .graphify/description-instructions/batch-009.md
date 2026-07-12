# Node Description Batch 10 of 43

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@f846cf6291d7f8d03d359e8d5860585dd16bfc5c": "f846cf6 updates." | kind=Commit | source=git | neighbors=[4b18b22 fixes., Separation, dev, 641f6af fixed UI.]
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@f884e6420ad283f74e20262e8226a87b08939cef": "f884e64 added admin dashboard" | kind=Commit | source=git | neighbors=[24f0fbb fixed more UIs, Separation, dev, cf0fdc7 UI fixes (thansk andres)]
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@fcdc3084cf98760f64d69b8210ff27c867aac3a5": "fcdc308 stuff" | kind=Commit | source=git | neighbors=[29f24aa dashboad online update, Separation, dev, 36c67a5 added nitro]
- "components_accountspinfields": "AccountsPinFields.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AccountsPinFields.tsx:L1 | neighbors=[AccountsStep.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, AccountsPinFields(), AccountsPinFieldsProps]
- "components_adminaccountfields": "AdminAccountFields.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AdminAccountFields.tsx:L1 | neighbors=[AccountsStep.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, AdminAccountFields(), AdminAccountFieldsProps]
- "components_dashboardprimitives_dashboardcard": "DashboardCard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L7 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, DashboardPrimitives.tsx, DashboardTables.tsx]
- "components_dashboardprimitives_dashboardempty": "DashboardEmpty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L39 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, DashboardPrimitives.tsx, DashboardTables.tsx]
- "components_daterangepresets_presetweek": "presetWeek()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L16 | neighbors=[DateRangePicker.tsx, dateRangePresets.ts, shiftDays(), rangeForReportPeriod()]
- "components_daterangepresets_rangeforreportperiod": "rangeForReportPeriod()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L27 | neighbors=[dateRangePresets.ts, presetMonth(), presetToday(), presetWeek()]
- "components_navicon": "NavIcon.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NavIcon.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, NavIcon(), NavIconName, PATHS]
- "components_productspagetoolbar": "ProductsPageToolbar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageToolbar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPageToolbar(), ProductsPageToolbarProps, ProductsPage.tsx]
- "dashboard_dashboardalertsearch": "dashboardAlertSearch.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSearch.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardTables.tsx, NotificationsCenter.tsx, dashboardAlertProductSearch()]
- "db_helpers_daysagolocal": "daysAgoLocal()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L17 | neighbors=[helpers.ts, pad(), dashboard.ts, dataRetention.ts]
- "db_helpers_daysinrange": "daysInRange()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L30 | neighbors=[helpers.ts, pad(), reports.ts, dashboard.ts]
- "db_helpers_pad": "pad()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L4 | neighbors=[helpers.ts, daysAgoLocal(), daysInRange(), localNow()]
- "db_index_getdbpath": "getDbPath()" | kind=code-symbol | source=shelfPos/src/main/db/index.ts:L16 | neighbors=[index.ts, backup.ts, firstRun.ts, syncConfig.ts]
- "hooks_userechartsmodule_userechartsmodule": "useRechartsModule()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/hooks/useRechartsModule.ts:L13 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx, useRechartsModule.ts]
- "ipc_products_runbatchprint": "runBatchPrint()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L168 | neighbors=[products.ts, normalizeBatchPrintItems(), printLabelForProduct(), printProductLabel()]
- "ipc_reports_buildreportprintlines": "buildReportPrintLines()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L112 | neighbors=[reports.ts, boundsForReport(), isMultiDay(), reportRangeLabel()]
- "lib_errors": "errors.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/errors.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, stockAllows(), toastApiError(), Toasts]
- "lib_parseenv": "parseEnv.ts" | kind=code-symbol | source=shelfPos/src/main/lib/parseEnv.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, parseEnv.ts, operatorConfig.ts, syncConfig.ts]
- "lib_shortcuts": "shortcuts.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/shortcuts.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, eventToShortcutKey(), shouldIgnoreShortcutTarget(), useScanner.ts]
- "main_appicon": "appIcon.ts" | kind=code-symbol | source=shelfPos/src/main/appIcon.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, activationWindow.ts, resolveAppIcon(), index.ts]
- "main_license_getlicensestatus": "getLicenseStatus()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L198 | neighbors=[license.ts, license.ts, checkStoredLicense(), devLicenseStatus()]
- "main_license_getmachineid": "getMachineId()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L47 | neighbors=[license.ts, activateLicense(), checkStoredLicense(), devLicenseStatus()]
- "pos_carttabsbar": "CartTabsBar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartTabsBar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartTabsBar(), CartTabsBarProps, POSTerminalView.tsx]
- "pos_cashdrawersummary": "CashDrawerSummary.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerSummary.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CashDrawerPage.tsx, CashDrawerSummary(), StatBox()]
- "pos_openfloatmodal": "OpenFloatModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/OpenFloatModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, OpenFloatModal(), POSTerminalView.tsx]
- "pos_paymentmethodbuttons": "PaymentMethodButtons.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodButtons.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, METHODS, PaymentMethodButtons(), PaymentMethodSidebar.tsx]
- "pos_removelinemodal": "RemoveLineModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/RemoveLineModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSModals.tsx, RemoveLineModal(), RemoveLineModalProps]
- "pos_usepinauthorize_usepinauthorize": "usePinAuthorize()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePinAuthorize.ts:L3 | neighbors=[DiscountModal.tsx, LineDiscountPinModal.tsx, PriceOverrideModal.tsx, usePinAuthorize.ts]
- "preload_index_d": "index.d.ts" | kind=code-symbol | source=shelfPos/src/preload/index.d.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, Window, types.ts, LicenseStatus]
- "repos_carttabs_removecarttab": "removeCartTab()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L66 | neighbors=[cartTabs.ts, cartTabs.ts, deleteCartTabRow(), getCartTabJson()]
- "repos_cash_cashdrawerstatus": "cashDrawerStatus()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L81 | neighbors=[cash.ts, cash.ts, listOpenCashMovements(), openCashSummary()]
- "repos_cash_hasopeningfloat": "hasOpeningFloat()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L106 | neighbors=[cash.ts, returns.ts, sales.ts, cash.ts]
- "repos_cash_opencashsummary": "openCashSummary()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L9 | neighbors=[cash.ts, cierre.ts, cash.ts, cashDrawerStatus()]
- "repos_products_alertsforproducts": "alertsForProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L218 | neighbors=[products.ts, returns.ts, sales.ts, products.ts]
- "repos_products_applystockdelta": "applyStockDelta()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L179 | neighbors=[products.ts, products.ts, productCsvImport.ts, productSupplierInvoicePdf.ts]
- "repos_products_enqueueproductsync": "enqueueProductSync()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L242 | neighbors=[products.ts, returns.ts, sales.ts, products.ts]
- "repos_products_listproducts": "listProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L110 | neighbors=[products.ts, products.ts, buildProductListWhere(), productSelect()]

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
