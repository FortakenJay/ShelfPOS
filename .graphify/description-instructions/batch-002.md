# Node Description Batch 3 of 43

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

- "scripts_print_test_crc": "print-test-crc.ts" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, __dirname, labelLines, main(), printer, probePrinter()]
- "services_escposrender_pushrowline": "pushRowLine()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L265 | neighbors=[escPosRender.ts, align(), applyTextStyle(), capEscPosScale(), compactMoneyText(), encodeDigits()]
- "services_printer_probeprinter": "probePrinter()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L140 | neighbors=[cierre.ts, printer.ts, printQueue.ts, products.ts, settings.ts, salesReceipt.ts]
- "admin_cierrediscrepancyalerts": "CierreDiscrepancyAlerts.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L1 | neighbors=[alertMessage(), CierreDiscrepancyAlerts(), CierreDiscrepancyBanner(), DismissButton(), dismissCierreIds(), dismissedListeners]
- "admin_cierrepage": "CierrePage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L1 | neighbors=[CierreDiscrepancyAlerts.tsx, CierreDiscrepancyAlerts(), AdminCierreSummary(), Cierre(), CierreDiscardedTabs(), CierreDiscounts()]
- "admin_settingsdraft": "settingsDraft.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L1 | neighbors=[draftFromSettings(), EMISOR_KEYS, emisorDraftDirty(), GENERAL_KEYS, generalDraftDirty(), sectionDirty()]
- "admin_settingssections": "SettingsSections.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L1 | neighbors=[SettingsForm.tsx, settingsDraft.ts, SettingsDraft, ID_TYPES, SettingsCajaPinSection(), SettingsEmisorSection()]
- "ipc_cart": "cart.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/cart.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, registerCartHandlers(), helpers.ts, handle(), errors.ts, AppError]
- "ipc_discount": "discount.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/discount.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, round2(), authorize.ts, authorizeWithDiscountPin(), registerDiscountHandlers()]
- "repos_settings_getappsettings": "getAppSettings()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L129 | neighbors=[cierre.ts, firstRun.ts, reports.ts, sales.ts, settings.ts, dashboard.ts]
- "services_session_session": "session" | kind=code-symbol | source=shelfPos/src/main/services/session.ts:L20 | neighbors=[auth.ts, authorize.ts, cart.ts, cartTabs.ts, cash.ts, cierre.ts]
- "shared_types_language": "Language" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L6 | neighbors=[cierre.ts, firstRun.ts, reports.ts, settings.ts, settings.ts, csvColumns.ts]
- "src_config": "config.ts" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, defaultSyncConfigPath(), loadConfig(), loadConfigFile(), loadEnvFile(), localSyncConfigPath()]
- "components_dashboardhomecharts": "DashboardHomeCharts.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardHomeCharts.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, dashboardChartLoaders.ts, DashboardChartFallback.tsx, DashboardChartFallback(), DashboardHomeCharts(), moneyTick()]
- "ipc_audit": "audit.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/audit.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, registerAuditHandlers(), helpers.ts, handle(), audit.ts, listAuditActions()]
- "ipc_license": "license.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/license.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, handle(), OnLicenseActivated, registerLicenseHandlers(), activationWindow.ts]
- "ipc_printqueue": "printQueue.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/printQueue.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, handle(), registerPrintQueueHandlers(), printJobs.ts]
- "lib_cartline": "cartLine.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, cartLineBarcode(), cartLineDisplayName(), cartLineGross(), cartLineHasCustomPrice()]
- "pos_poskeyboard": "posKeyboard.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posKeyboard.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartLineDiscountInput.tsx, CartMiscNameInput.tsx, PaymentInvoiceCustomerSection.tsx, PaymentSplitSection.tsx, POSCartPanel.tsx]
- "scripts_print_test_big_receipt": "print-test-big-receipt.ts" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, __dirname, printer, probePrinter(), quirks, rawPrintScriptPath]
- "services_labellayout": "labelLayout.ts" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, estimateShelfLabelDots(), estimateShelfLabelDotsFromLines(), shelfLabelBigCols(), shelfLabelPaperWidthDots(), shelfLabelTextCols()]
- "services_printpdf": "printPdf.ts" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cierre.ts, reports.ts, facturaPdf.ts, errors.ts, AppError]
- "admin_reportspage": "ReportsPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L1 | neighbors=[parseReportSearch(), PERIOD_PRESETS, periodFromRange(), REPORT_TYPES, Reports(), ReportSearch]
- "components_dashboardprimitives": "DashboardPrimitives.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardCharts.tsx, DashboardHomeCharts.tsx, DashboardOverview.tsx, DashboardCard(), DashboardEmpty()]
- "pos_poscartpanel": "POSCartPanel.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSCartPanel.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartLineDiscountInput.tsx, CartLineDiscountInput(), CartMiscNameInput.tsx, CartMiscNameInput(), CartQtyInput()]
- "products_batchlabelprintmodal": "BatchLabelPrintModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, ProductManagerModals.tsx, AddProductResult, BatchLabelPrintModal(), BatchLabelPrintModalFooter()]
- "scripts_e2e_full": "e2e-full.mjs" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, dumpState(), evalJs(), fail(), log(), page]
- "services_backup_backupservice": "BackupService" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L9 | neighbors=[backup.ts, cierre.ts, index.ts, index.ts, backup.ts, .backupTo()]
- "services_dataretention": "dataRetention.ts" | kind=code-symbol | source=shelfPos/src/main/services/dataRetention.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, daysAgoLocal(), todayLocal(), index.ts]
- "services_escposrender_toescpos": "toEscPos()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L327 | neighbors=[print-test-big-receipt.ts, print-test-crc.ts, escPosRender.ts, align(), barcodeDataCode128(), encodePrintText()]
- "services_printer_attemptprintjob": "attemptPrintJob()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L429 | neighbors=[cierre.ts, printQueue.ts, products.ts, settings.ts, salesReceipt.ts, printer.ts]
- "components_daterangepicker": "DateRangePicker.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/DateRangePicker.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DateRangePicker(), presetWithTime(), withTimeDefaults(), dateRangePresets.ts, presetMonth()]
- "components_pinmodal": "PinModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/PinModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, NumPad.tsx, NumPad(), digitFromKey(), normalizePin(), PinModal()]
- "db_columns": "columns.ts" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, PRODUCT_CATALOG_COLUMNS, PRODUCT_CATALOG_WRITE_COLUMNS, PRODUCT_CATALOG_WRITE_COLUMNS_WITHOUT_S…, PRODUCT_COLUMNS]
- "db_helpers_round2": "round2()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L43 | neighbors=[helpers.ts, cash.ts, cierre.ts, discount.ts, priceOverride.ts, returns.ts]
- "ipc_auth": "auth.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/auth.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, registerAuthHandlers(), helpers.ts, handle(), audit.ts, writeAudit()]
- "ipc_authorize": "authorize.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/authorize.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, authorizeWithDiscountPin(), PrivilegedAuthType, errors.ts, AppError, audit.ts]
- "pos_paymentmodalstate": "paymentModalState.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentModal.tsx, createInitialPaymentState(), defaultCashTendered(), newPaymentEntry(), PaymentEntry]
- "repos_reports_salewhere": "saleWhere()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L31 | neighbors=[reports.ts, cierreDiscounts(), cierrePriceOverrides(), itemizedSales(), listSaleHeaders(), listSalePayments()]
- "repos_settings_getsetting": "getSetting()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L114 | neighbors=[sales.ts, settings.ts, dashboard.ts, products.ts, settings.ts, currentLanguage()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-002.json

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
