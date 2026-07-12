# Node Description Batch 5 of 43

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

- "main_activationwindow": "activationWindow.ts" | kind=code-symbol | source=shelfPos/src/main/activationWindow.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, license.ts, activationUrl(), closeActivationWindow(), createActivationWindow(), appIcon.ts]
- "node_dpapi_win": "dpapi-win.ts" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, decryptDpapi(), encryptDpapi(), isEncryptedSecret(), PS_DECRYPT, PS_ENCRYPT]
- "pos_priceoverridemodal": "PriceOverrideModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PriceOverrideModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSModals.tsx, PriceOverrideAction, PriceOverrideModal(), priceOverrideReducer(), PriceOverrideState]
- "pos_types": "types.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/types.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartLineDiscountInput.tsx, POSCartPanel.tsx, posCartSale.ts, POSModals.tsx, POSPage.tsx]
- "products_productcsvhelpmodal": "ProductCsvHelpModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, OPTIONAL_COLS, ProductCsvHelpModal(), ProductCsvHelpModalProps, REQUIRED_COLS]
- "repos_settings_receiptlanguage": "receiptLanguage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L204 | neighbors=[cierre.ts, products.ts, reports.ts, sales.ts, settings.ts, salesReceipt.ts]
- "repos_syncqueue_enqueuesync": "enqueueSync()" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L68 | neighbors=[cierre.ts, returns.ts, sales.ts, users.ts, audit.ts, cash.ts]
- "services_escposrender_pushtextline": "pushTextLine()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L238 | neighbors=[escPosRender.ts, align(), capEscPosScale(), parseMoneyText(), pushMoneyAmount(), pushPlainText()]
- "services_escposrender_scalecmd": "scaleCmd()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L54 | neighbors=[escPosRender.ts, applyTextStyle(), pushCentSign(), resetTextStyle(), sizeBig(), sizeHuge()]
- "services_i18n": "i18n.ts" | kind=code-symbol | source=shelfPos/src/main/services/i18n.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, sales.ts, settings.ts, csvColumns.ts, t(), types.ts]
- "services_printer_printlines": "printLines()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L369 | neighbors=[printer.ts, attemptPrintJob(), ensurePrinterExists(), getActivePrinterName(), sendRawToPrinter(), toEscPosOptions()]
- "shared_types_printstatus": "PrintStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L23 | neighbors=[cierre.ts, printQueue.ts, products.ts, reports.ts, settings.ts, salesReceipt.ts]
- "shared_types_product": "Product" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L92 | neighbors=[products.ts, sales.ts, products.ts, stock.ts, productCsvImport.ts, cartTabSnapshot.ts]
- "shell_shell": "Shell.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ADMIN_ITEMS, AdminSidebarNotifications(), NAV_ITEMS, NavItem, navLinkClass()]
- "src_errorlog": "errorLog.ts" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, appendSyncErrorLog(), logSyncQueueFailure(), logSyncServiceError(), syncErrorLogFile()]
- "admin_settingspage": "SettingsPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsPage.tsx:L1 | neighbors=[SettingsCloudPanel.tsx, SettingsCloudPanel(), SettingsForm.tsx, SettingsForm(), Settings(), SettingsPage()]
- "auth_firstrun": "FirstRun.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/FirstRun.tsx:L1 | neighbors=[AccountsStep.tsx, AccountsStep(), FirstRunWizard(), Step, LanguagePicker.tsx, LanguagePicker()]
- "components_dashboardtabnav": "DashboardTabNav.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTabNav.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardTabNav(), TAB_LABEL_KEYS, dashboardTabs.ts, DASHBOARD_TABS, DashboardTab]
- "components_daterangepresets": "dateRangePresets.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DateRangePicker.tsx, presetMonth(), presetToday(), presetWeek(), rangeForReportPeriod()]
- "dashboard_dashboardtabs": "dashboardTabs.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardTabs.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardTabNav.tsx, DashboardPage.tsx, DASHBOARD_TAB_SEARCH, DASHBOARD_TABS, DashboardTab]
- "db_helpers_rangebounds": "rangeBounds()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L23 | neighbors=[helpers.ts, backup.ts, cash.ts, cierre.ts, reports.ts, audit.ts]
- "hooks_userechartsmodule": "useRechartsModule.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/hooks/useRechartsModule.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx, loadRechartsModule(), RechartsModule]
- "main_license_activatelicense": "activateLicense()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L187 | neighbors=[license.ts, license.ts, encryptLicenseToken(), getMachineId(), licenseFilePath(), payloadToStatus()]
- "pos_cashdrawerpage": "CashDrawerPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CashDrawer(), CashDrawerPage(), CashDrawerSummary.tsx, CashDrawerSummary(), CashMovementsPanel.tsx]
- "pos_linediscount": "lineDiscount.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/lineDiscount.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartLineDiscountInput.tsx, cartLineDiscountPercentDisplay(), formatPercentDisplay(), lineDiscountFromPercent(), parseDiscountPercentInput()]
- "pos_linediscountpinmodal": "LineDiscountPinModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/LineDiscountPinModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, LineDiscountPinModal(), LineDiscountPinRequest, usePinAuthorize.ts, usePinAuthorize(), POSTerminalView.tsx]
- "pos_types_cartline": "CartLine" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/types.ts:L3 | neighbors=[CartLineDiscountInput.tsx, POSCartPanel.tsx, posCartSale.ts, POSModals.tsx, POSPage.tsx, types.ts]
- "products_supplierinvoicepreviewmodal": "SupplierInvoicePreviewModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/SupplierInvoicePreviewModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, buildConfirmInput(), initDrafts(), NewItemDraft, SupplierInvoicePreviewModal()]
- "repos_printjobs_insertprintjob": "insertPrintJob()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L15 | neighbors=[cierre.ts, products.ts, reports.ts, sales.ts, settings.ts, printJobs.ts]
- "repos_reports_paymenttotals": "paymentTotals()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L53 | neighbors=[cierre.ts, reports.ts, cash.ts, dashboard.ts, reports.ts, saleWhere()]
- "repos_reports_salessummary": "salesSummary()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L174 | neighbors=[reports.ts, dashboard.ts, reports.ts, cierreDiscounts(), paymentTotals(), returnTotals()]
- "repos_stock": "stock.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/stock.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, sales.ts, errors.ts, AppError, assertSaleStock(), types.ts]
- "scripts_generate_keypair": "generate-keypair.js" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, { generateKeyPairSync }, { homedir }, { join, dirname }, privateDir, { publicKey, privateKey }]
- "scripts_print_colon_preprod_buildjob1": "buildJob1()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L190 | neighbors=[print-colon-preprod.mjs, align(), appendColonMark(), bold(), colonHeightFromText(), feed()]
- "scripts_print_colon_preprod_buildjob3": "buildJob3()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L231 | neighbors=[print-colon-preprod.mjs, align(), bold(), colonHeightFromText(), feed(), pushPrintText()]
- "services_csv": "csv.ts" | kind=code-symbol | source=shelfPos/src/main/services/csv.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, backup.ts, buildCsv(), csvEscape(), parseCsv(), productCsvExport.ts]
- "services_escposrender_applytextstyle": "applyTextStyle()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L88 | neighbors=[escPosRender.ts, capEscPosScale(), doubleStrike(), scaleCmd(), pushMoneyAmount(), pushPlainText()]
- "services_escposrender_pushcentsign": "pushCentSign()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L98 | neighbors=[escPosRender.ts, centScaleFor(), scaleCmd(), selectCodePage(), pushMoneyAmount(), pushPlainText()]
- "services_escposrender_pushmoneyamount": "pushMoneyAmount()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L195 | neighbors=[escPosRender.ts, applyTextStyle(), capEscPosScale(), encodeDigits(), pushCentSign(), pushRowLine()]
- "services_facturapdf_buildpage": "buildPage()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L126 | neighbors=[facturaPdf.ts, buildFacturaHtml(), buildSummaryBlock(), buildTableRows(), escapeHtml(), formatDocumentNumber()]

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
