# Node Description Batch 19 of 42

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

- "dashboard_dashboardalertseverity_panelalertseverityclass": "panelAlertSeverityClass()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSeverity.ts:L11 | neighbors=[DashboardTables.tsx, dashboardAlertSeverity.ts]
- "dashboard_dashboardtabs_dashboard_tabs": "DASHBOARD_TABS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardTabs.ts:L1 | neighbors=[DashboardTabNav.tsx, dashboardTabs.ts]
- "dashboard_usedashboard_usedashboard": "useDashboard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/useDashboard.ts:L7 | neighbors=[DashboardPage.tsx, useDashboard.ts]
- "db_columns_product_columns": "PRODUCT_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L3 | neighbors=[columns.ts, products.ts]
- "db_columns_product_pos_columns": "PRODUCT_POS_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L9 | neighbors=[columns.ts, products.ts]
- "db_index_setdb": "setDb()" | kind=code-symbol | source=shelfPos/src/main/db/index.ts:L6 | neighbors=[index.ts, index.ts]
- "eslint_config": "eslint.config.mjs" | kind=code-symbol | source=shelfPos/eslint.config.mjs:L1 | neighbors=[nodeFiles, reactFiles]
- "hooks_useaccountsstep_useaccountsstep": "useAccountsStep()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/hooks/useAccountsStep.ts:L14 | neighbors=[AccountsStep.tsx, useAccountsStep.ts]
- "hooks_useproductmanager_productfiltersstate": "ProductFiltersState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/hooks/useProductManager.ts:L23 | neighbors=[ProductsPageFilters.tsx, useProductManager.ts]
- "hooks_useproductmanager_productmanageruistate": "ProductManagerUiState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/hooks/useProductManager.ts:L9 | neighbors=[ProductManagerModals.tsx, useProductManager.ts]
- "hooks_useproductmanager_useproductmanager": "useProductManager()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/hooks/useProductManager.ts:L30 | neighbors=[useProductManager.ts, ProductsPage.tsx]
- "i18n_index": "index.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/i18n/index.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, initI18n()]
- "ipc_audit_registeraudithandlers": "registerAuditHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/audit.ts:L5 | neighbors=[audit.ts, index.ts]
- "ipc_auth_registerauthhandlers": "registerAuthHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/auth.ts:L6 | neighbors=[auth.ts, index.ts]
- "ipc_backup_registerbackuphandlers": "registerBackupHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/backup.ts:L14 | neighbors=[backup.ts, index.ts]
- "ipc_cart_registercarthandlers": "registerCartHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/cart.ts:L9 | neighbors=[cart.ts, index.ts]
- "ipc_carttabs_registercarttabhandlers": "registerCartTabHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/cartTabs.ts:L42 | neighbors=[cartTabs.ts, index.ts]
- "ipc_cash_registercashhandlers": "registerCashHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/cash.ts:L33 | neighbors=[cash.ts, index.ts]
- "ipc_cierre_registercierrehandlers": "registerCierreHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L113 | neighbors=[cierre.ts, index.ts]
- "ipc_dashboard_registerdashboardhandlers": "registerDashboardHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/dashboard.ts:L5 | neighbors=[dashboard.ts, index.ts]
- "ipc_discount_registerdiscounthandlers": "registerDiscountHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/discount.ts:L9 | neighbors=[discount.ts, index.ts]
- "ipc_firstrun_registerfirstrunhandlers": "registerFirstRunHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/firstRun.ts:L16 | neighbors=[firstRun.ts, index.ts]
- "ipc_index_registeripchandlers": "registerIpcHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/index.ts:L23 | neighbors=[index.ts, index.ts]
- "ipc_license_registerlicensehandlers": "registerLicenseHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/license.ts:L8 | neighbors=[license.ts, index.ts]
- "ipc_priceoverride_registerpriceoverridehandlers": "registerPriceOverrideHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/priceOverride.ts:L9 | neighbors=[index.ts, priceOverride.ts]
- "ipc_printer_registerprinterhandlers": "registerPrinterHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/printer.ts:L13 | neighbors=[index.ts, printer.ts]
- "ipc_printqueue_registerprintqueuehandlers": "registerPrintQueueHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/printQueue.ts:L6 | neighbors=[index.ts, printQueue.ts]
- "ipc_products_isuniqueviolation": "isUniqueViolation()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L79 | neighbors=[products.ts, mapProductDbError()]
- "ipc_products_labellinesforproduct": "labelLinesForProduct()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L121 | neighbors=[products.ts, printProductLabel()]
- "ipc_products_normalizebatchprintitems": "normalizeBatchPrintItems()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L62 | neighbors=[products.ts, runBatchPrint()]
- "ipc_products_registerproducthandlers": "registerProductHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L245 | neighbors=[index.ts, products.ts]
- "ipc_reports_ismultiday": "isMultiDay()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L108 | neighbors=[reports.ts, buildReportPrintLines()]
- "ipc_reports_registerreporthandlers": "registerReportHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L155 | neighbors=[index.ts, reports.ts]
- "ipc_reports_reportrangelabel": "reportRangeLabel()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L99 | neighbors=[reports.ts, buildReportPrintLines()]
- "ipc_reports_runreport": "runReport()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L49 | neighbors=[reports.ts, boundsForReport()]
- "ipc_returns_registerreturnhandlers": "registerReturnHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/returns.ts:L19 | neighbors=[index.ts, returns.ts]
- "ipc_sales_registersaleshandlers": "registerSalesHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L91 | neighbors=[index.ts, sales.ts]
- "ipc_settings_registersettingshandlers": "registerSettingsHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/settings.ts:L45 | neighbors=[index.ts, settings.ts]
- "ipc_syncsetup_registersyncsetuphandlers": "registerSyncSetupHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/syncSetup.ts:L17 | neighbors=[index.ts, syncSetup.ts]
- "ipc_users_registeruserhandlers": "registerUserHandlers()" | kind=code-symbol | source=shelfPos/src/main/ipc/users.ts:L30 | neighbors=[index.ts, users.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-018.json

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
