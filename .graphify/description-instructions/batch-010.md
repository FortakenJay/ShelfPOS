# Node Description Batch 11 of 42

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

- "scripts_test_supplier_pdf": "test-supplier-pdf.ts" | kind=code-symbol | source=shelfPos/scripts/test-supplier-pdf.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, main(), productSupplierInvoicePdf.ts, parseSupplierInvoiceText()]
- "services_backup_backupservice_dailybackup": ".dailyBackup()" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L22 | neighbors=[BackupService, .backupTo(), .cleanup(), .dailyPath()]
- "services_backup_backupservice_oncierre": ".onCierre()" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L30 | neighbors=[BackupService, .backupTo(), .cleanup(), .dailyPath()]
- "services_escposrender_align": "align()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L32 | neighbors=[escPosRender.ts, pushRowLine(), pushTextLine(), toEscPos()]
- "services_escposrender_compactmoneytext": "compactMoneyText()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L134 | neighbors=[escPosRender.ts, padRow(), parseMoneyText(), pushRowLine()]
- "services_escposrender_encodedigits": "encodeDigits()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L234 | neighbors=[escPosRender.ts, pushMoneyAmount(), pushPlainText(), pushRowLine()]
- "services_escposrender_padrow": "padRow()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L153 | neighbors=[escPosRender.ts, compactMoneyText(), visualLen(), pushRowLine()]
- "services_escposrender_selectcodepage": "selectCodePage()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L67 | neighbors=[escPosRender.ts, pushCentSign(), pushPlainText(), toEscPos()]
- "services_facturapdf_escapehtml": "escapeHtml()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L37 | neighbors=[facturaPdf.ts, buildPage(), itemBarcodeCell(), itemCodeCell()]
- "services_format_formatdate": "formatDate()" | kind=code-symbol | source=shelfPos/src/main/services/format.ts:L9 | neighbors=[cierre.ts, reports.ts, format.ts, printTemplates.ts]
- "services_operatorconfig_refreshoperatorpasswordhash": "refreshOperatorPasswordHash()" | kind=code-symbol | source=shelfPos/src/main/services/operatorConfig.ts:L14 | neighbors=[operatorConfig.ts, isOperatorLoginConfigured(), loadOperatorEnv(), verifyOperatorPassword()]
- "services_printer_configuredprintername": "configuredPrinterName()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L58 | neighbors=[printer.ts, fallbackPrinterName(), probeEnv(), probePrinter()]
- "services_printer_ensureprinterexists": "ensurePrinterExists()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L289 | neighbors=[printer.ts, probePrinter(), openCashDrawer(), printLines()]
- "services_printer_sendrawtoprinter": "sendRawToPrinter()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L302 | neighbors=[printer.ts, openCashDrawer(), printLines(), enqueuePrinterTask()]
- "services_printer_toescposoptions": "toEscPosOptions()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L350 | neighbors=[printer.ts, printLines(), getActivePrinterName(), isT81EscPosQuirks()]
- "services_printer_tryopencashdrawer": "tryOpenCashDrawer()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L380 | neighbors=[cash.ts, printer.ts, attemptPrintJob(), openCashDrawer()]
- "services_printpdf_writehtmltopdf": "writeHtmlToPdf()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L40 | neighbors=[facturaPdf.ts, printPdf.ts, loadWindowHtml(), writePrintLinesPdf()]
- "services_printtemplates_builditemizedsalesreportlines": "buildItemizedSalesReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L774 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), salePaymentSummaryLines()]
- "services_printtemplates_buildmultidaypaymentreportlines": "buildMultiDayPaymentReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L421 | neighbors=[reports.ts, printTemplates.ts, paymentLines(), reportHeader()]
- "services_printtemplates_buildmultidaysummaryreportlines": "buildMultiDaySummaryReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L398 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), summaryMetricLines()]
- "services_printtemplates_buildpaymentreportlines": "buildPaymentReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L444 | neighbors=[reports.ts, printTemplates.ts, paymentLines(), reportHeader()]
- "services_printtemplates_buildsummaryreportlines": "buildSummaryReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L386 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), summaryMetricLines()]
- "services_printtemplates_buildtaxreportlines": "buildTaxReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L682 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), taxSum()]
- "services_printtemplates_buildtopproductsreportlines": "buildTopProductsReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L456 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), topProductLines()]
- "services_printtemplates_buildtransactionlogreportlines": "buildTransactionLogReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L725 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), salePaymentSummaryLines()]
- "services_printtemplates_emisorfromsettings": "emisorFromSettings()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L27 | neighbors=[sales.ts, salesReceipt.ts, printer.ts, printTemplates.ts]
- "services_shelflabellines_buildshelflabellines": "buildShelfLabelLines()" | kind=code-symbol | source=shelfPos/src/main/services/shelfLabelLines.ts:L12 | neighbors=[print-test-crc.ts, printer.ts, printTemplates.ts, shelfLabelLines.ts]
- "services_syncconfig_issyncserviceinstalled": "isSyncServiceInstalled()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L66 | neighbors=[syncConfig.ts, querySyncServiceRunning(), readSyncSetupStatus(), restartSyncServiceIfInstalled()]
- "services_syncconfig_restartsyncserviceifinstalled": "restartSyncServiceIfInstalled()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L150 | neighbors=[syncSetup.ts, syncConfig.ts, restartSyncService(), isSyncServiceInstalled()]
- "shared_carttabsnapshot_carttabsnapshottotal": "cartTabSnapshotTotal()" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L31 | neighbors=[cartTabs.ts, cartTabs.ts, cartTabSnapshot.ts, parseCartTabSnapshotJson()]
- "shared_pendingstoreid": "pendingStoreId.ts" | kind=code-symbol | source=shelfPos/src/shared/pendingStoreId.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, pendingStoreId.ts, parsePendingStoreIdFileContent(), shouldApplyPendingStoreId()]
- "shared_types_appsettings": "AppSettings" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L54 | neighbors=[settings.ts, settings.ts, printTemplates.ts, types.ts]
- "shared_types_cashdrawerstatus": "CashDrawerStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1031 | neighbors=[cash.ts, cash.ts, types.ts, CashSummary]
- "shared_types_paymentmethodreport": "PaymentMethodReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L425 | neighbors=[dashboard.ts, reports.ts, printTemplates.ts, types.ts]
- "shared_types_printpayload": "PrintPayload" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1089 | neighbors=[printJobs.ts, labelPrintLines.ts, printer.ts, types.ts]
- "shared_types_productinput": "ProductInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L108 | neighbors=[products.ts, products.ts, productCsvImport.ts, types.ts]
- "shared_types_taxcategory": "TaxCategory" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L42 | neighbors=[sales.ts, reports.ts, settings.ts, types.ts]
- "shell_usesidebarcollapsed": "useSidebarCollapsed.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, readCollapsed(), useSidebarCollapsed(), writeCollapsed()]
- "src_config_syncconfig": "SyncConfig" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L8 | neighbors=[config.ts, db.ts, index.ts, sync.ts]
- "src_db_readstoredisplayname": "readStoreDisplayName()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L34 | neighbors=[db.ts, readSetting(), readStoreId(), index.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-010.json

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
