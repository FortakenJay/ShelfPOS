# Node Description Batch 5 of 42

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
Write every description in Portuguese (pt). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "services_escposrender_pushtextline": "pushTextLine()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L238 | neighbors=[escPosRender.ts, align(), capEscPosScale(), parseMoneyText(), pushMoneyAmount(), pushPlainText()]
- "services_escposrender_scalecmd": "scaleCmd()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L54 | neighbors=[escPosRender.ts, applyTextStyle(), pushCentSign(), resetTextStyle(), sizeBig(), sizeHuge()]
- "services_i18n": "i18n.ts" | kind=code-symbol | source=shelfPos/src/main/services/i18n.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, sales.ts, settings.ts, csvColumns.ts, t(), types.ts]
- "services_printer_printlines": "printLines()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L361 | neighbors=[printer.ts, attemptPrintJob(), ensurePrinterExists(), getActivePrinterName(), sendRawToPrinter(), toEscPosOptions()]
- "shared_types_printstatus": "PrintStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L20 | neighbors=[cierre.ts, printQueue.ts, products.ts, reports.ts, settings.ts, salesReceipt.ts]
- "shell_shell": "Shell.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ADMIN_ITEMS, AdminSidebarNotifications(), NAV_ITEMS, NavItem, navLinkClass()]
- "admin_settingspage": "SettingsPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsPage.tsx:L1 | neighbors=[SettingsCloudPanel.tsx, SettingsCloudPanel(), SettingsForm.tsx, SettingsForm(), Settings(), SettingsPage()]
- "auth_firstrun": "FirstRun.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/FirstRun.tsx:L1 | neighbors=[AccountsStep.tsx, AccountsStep(), FirstRunWizard(), Step, LanguagePicker.tsx, LanguagePicker()]
- "components_dashboardtabnav": "DashboardTabNav.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTabNav.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardTabNav(), TAB_LABEL_KEYS, dashboardTabs.ts, DASHBOARD_TABS, DashboardTab]
- "components_daterangepresets": "dateRangePresets.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DateRangePicker.tsx, presetMonth(), presetToday(), presetWeek(), rangeForReportPeriod()]
- "dashboard_dashboardtabs": "dashboardTabs.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardTabs.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardTabNav.tsx, DashboardPage.tsx, DASHBOARD_TAB_SEARCH, DASHBOARD_TABS, DashboardTab]
- "db_helpers_rangebounds": "rangeBounds()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L23 | neighbors=[helpers.ts, backup.ts, cash.ts, cierre.ts, reports.ts, audit.ts]
- "hooks_useproductmanager": "useProductManager.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/hooks/useProductManager.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, ProductsPageFilters.tsx, ProductFiltersState, ProductManagerUiState, useProductManager()]
- "hooks_userechartsmodule": "useRechartsModule.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/hooks/useRechartsModule.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx, loadRechartsModule(), RechartsModule]
- "main_license_activatelicense": "activateLicense()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L187 | neighbors=[license.ts, license.ts, encryptLicenseToken(), getMachineId(), licenseFilePath(), payloadToStatus()]
- "pos_cashdrawerpage": "CashDrawerPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CashDrawer(), CashDrawerPage(), CashDrawerSummary.tsx, CashDrawerSummary(), CashMovementsPanel.tsx]
- "pos_linediscount": "lineDiscount.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/lineDiscount.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartLineDiscountInput.tsx, cartLineDiscountPercentDisplay(), formatPercentDisplay(), lineDiscountFromPercent(), parseDiscountPercentInput()]
- "pos_linediscountpinmodal": "LineDiscountPinModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/LineDiscountPinModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, LineDiscountPinModal(), LineDiscountPinRequest, usePinAuthorize.ts, usePinAuthorize(), POSTerminalView.tsx]
- "pos_types_cartline": "CartLine" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/types.ts:L3 | neighbors=[CartLineDiscountInput.tsx, POSCartPanel.tsx, posCartSale.ts, POSModals.tsx, POSPage.tsx, types.ts]
- "repos_printjobs_insertprintjob": "insertPrintJob()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L15 | neighbors=[cierre.ts, products.ts, reports.ts, sales.ts, settings.ts, printJobs.ts]
- "repos_reports_paymenttotals": "paymentTotals()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L53 | neighbors=[cierre.ts, reports.ts, cash.ts, dashboard.ts, reports.ts, saleWhere()]
- "repos_reports_salessummary": "salesSummary()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L169 | neighbors=[reports.ts, dashboard.ts, reports.ts, cierreDiscounts(), paymentTotals(), returnTotals()]
- "repos_stock": "stock.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/stock.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, sales.ts, errors.ts, AppError, assertSaleStock(), types.ts]
- "scripts_generate_keypair": "generate-keypair.js" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, { generateKeyPairSync }, { homedir }, { join, dirname }, privateDir, { publicKey, privateKey }]
- "scripts_print_colon_preprod_buildjob1": "buildJob1()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L190 | neighbors=[print-colon-preprod.mjs, align(), appendColonMark(), bold(), colonHeightFromText(), feed()]
- "scripts_print_colon_preprod_buildjob3": "buildJob3()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L231 | neighbors=[print-colon-preprod.mjs, align(), bold(), colonHeightFromText(), feed(), pushPrintText()]
- "services_csv": "csv.ts" | kind=code-symbol | source=shelfPos/src/main/services/csv.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, backup.ts, buildCsv(), csvEscape(), parseCsv(), productCsvExport.ts]
- "services_escposrender_applytextstyle": "applyTextStyle()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L88 | neighbors=[escPosRender.ts, capEscPosScale(), doubleStrike(), scaleCmd(), pushMoneyAmount(), pushPlainText()]
- "services_escposrender_pushcentsign": "pushCentSign()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L98 | neighbors=[escPosRender.ts, centScaleFor(), scaleCmd(), selectCodePage(), pushMoneyAmount(), pushPlainText()]
- "services_escposrender_pushmoneyamount": "pushMoneyAmount()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L195 | neighbors=[escPosRender.ts, applyTextStyle(), capEscPosScale(), encodeDigits(), pushCentSign(), pushRowLine()]
- "services_facturapdf_buildpage": "buildPage()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L126 | neighbors=[facturaPdf.ts, buildFacturaHtml(), buildSummaryBlock(), buildTableRows(), escapeHtml(), formatDocumentNumber()]
- "services_productcsvimport_applyproductimport": "applyProductImport()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L225 | neighbors=[products.ts, productCsvImport.ts, buildProductImportPreview(), parseProductRow(), productInputDiffers(), readProductCsv()]
- "services_productcsvimport_buildproductimportpreview": "buildProductImportPreview()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L162 | neighbors=[products.ts, productCsvImport.ts, applyProductImport(), parseProductRow(), previewRow(), productInputDiffers()]
- "services_syncconfig_readsyncsetupstatus": "readSyncSetupStatus()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L80 | neighbors=[syncSetup.ts, syncConfig.ts, getSyncConfigPath(), isSyncServiceInstalled(), parseEnvFile(), querySyncServiceRunning()]
- "shared_types_idtype": "IdType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L45 | neighbors=[sales.ts, settings.ts, salesReceipt.ts, settings.ts, facturaPdf.ts, printTemplates.ts]
- "shared_types_product": "Product" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L89 | neighbors=[products.ts, sales.ts, products.ts, stock.ts, productCsvImport.ts, cartTabSnapshot.ts]
- "src_errorlog": "errorLog.ts" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, appendSyncErrorLog(), logSyncQueueFailure(), logSyncServiceError(), syncErrorLogFile(), index.ts]
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@3da0d23850e94bd3bf1c6c8b8ea3909116fca2ec": "3da0d23 Merge branch 'dev' of https://github.com/SakenEtAlOrg/ShelfPOS into dev" | kind=Commit | source=git | neighbors=[Separation, dev, 841808d Update push, bcf4c2f fixed links., 5f4f7d2 document to push so deployment …, 660d33a fixed mail.]
- "components_dashboardchartfallback": "DashboardChartFallback.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardChartFallback.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardChartFallback(), dashboardChartLazy.tsx, DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx]
- "components_productspagefilters": "ProductsPageFilters.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageFilters.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPageFilters(), ProductsPageFiltersProps, useProductManager.ts, ProductFiltersState, ProductsPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-004.json

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
