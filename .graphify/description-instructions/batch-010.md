# Node Description Batch 11 of 43

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

- "repos_products_searchproducts": "searchProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L133 | neighbors=[products.ts, products.ts, getProduct(), productSelect()]
- "repos_products_softdeleteproduct": "softDeleteProduct()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L200 | neighbors=[products.ts, products.ts, isTombstoneBarcode(), tombstoneBarcodeValue()]
- "repos_reports_cierrediscounts": "cierreDiscounts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L358 | neighbors=[cierre.ts, reports.ts, saleWhere(), salesSummary()]
- "repos_reports_listsaleheaders": "listSaleHeaders()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L658 | neighbors=[reports.ts, itemizedSales(), saleWhere(), transactionLog()]
- "repos_reports_listsalepayments": "listSalePayments()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L672 | neighbors=[reports.ts, itemizedSales(), saleWhere(), transactionLog()]
- "repos_reports_taxbreakdown": "taxBreakdown()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L106 | neighbors=[reports.ts, dashboard.ts, reports.ts, saleWhere()]
- "repos_reports_topproducts": "topProducts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L224 | neighbors=[cierre.ts, reports.ts, reports.ts, saleWhere()]
- "scripts_e2e_full_waitfor": "waitFor()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L68 | neighbors=[e2e-full.mjs, dumpState(), evalJs(), sleep()]
- "scripts_print_colon_preprod_appendcolonmark": "appendColonMark()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L106 | neighbors=[print-colon-preprod.mjs, colonMatrixToEscPos(), buildJob1(), pushPrintText()]
- "scripts_print_colon_preprod_buildjob2": "buildJob2()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L206 | neighbors=[print-colon-preprod.mjs, align(), bold(), feed()]
- "scripts_print_colon_preprod_size": "size()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L60 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob3()]
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
- "services_printer_configuredprintername": "configuredPrinterName()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L62 | neighbors=[printer.ts, fallbackPrinterName(), probeEnv(), probePrinter()]
- "services_printer_ensureprinterexists": "ensurePrinterExists()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L297 | neighbors=[printer.ts, probePrinter(), openCashDrawer(), printLines()]
- "services_printer_istestmode": "isTestMode()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L37 | neighbors=[printer.ts, attemptPrintJob(), probePrinter(), tryOpenCashDrawer()]
- "services_printer_sendrawtoprinter": "sendRawToPrinter()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L310 | neighbors=[printer.ts, openCashDrawer(), printLines(), enqueuePrinterTask()]
- "services_printer_toescposoptions": "toEscPosOptions()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L358 | neighbors=[printer.ts, printLines(), getActivePrinterName(), isT81EscPosQuirks()]
- "services_printpdf_writehtmltopdf": "writeHtmlToPdf()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L40 | neighbors=[facturaPdf.ts, printPdf.ts, loadWindowHtml(), writePrintLinesPdf()]
- "services_printtemplates_builditemizedsalesreportlines": "buildItemizedSalesReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L777 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), salePaymentSummaryLines()]
- "services_printtemplates_buildmultidaypaymentreportlines": "buildMultiDayPaymentReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L424 | neighbors=[reports.ts, printTemplates.ts, paymentLines(), reportHeader()]
- "services_printtemplates_buildmultidaysummaryreportlines": "buildMultiDaySummaryReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L401 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), summaryMetricLines()]
- "services_printtemplates_buildpaymentreportlines": "buildPaymentReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L447 | neighbors=[reports.ts, printTemplates.ts, paymentLines(), reportHeader()]
- "services_printtemplates_buildsummaryreportlines": "buildSummaryReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L389 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), summaryMetricLines()]
- "services_printtemplates_buildtaxreportlines": "buildTaxReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L685 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), taxSum()]
- "services_printtemplates_buildtopproductsreportlines": "buildTopProductsReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L459 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), topProductLines()]
- "services_printtemplates_buildtransactionlogreportlines": "buildTransactionLogReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L728 | neighbors=[reports.ts, printTemplates.ts, reportHeader(), salePaymentSummaryLines()]
- "services_printtemplates_emisorfromsettings": "emisorFromSettings()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L29 | neighbors=[sales.ts, salesReceipt.ts, printer.ts, printTemplates.ts]
- "services_productcsvimport_preservealternatepriceswhencolumnsareomitted": "preserveAlternatePricesWhenColumnsAreOmitted()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L116 | neighbors=[productCsvImport.ts, analyzeProductImport(), applyProductImport(), buildProductImportPreview()]
- "services_productcsvimport_productimportsourceversion": "productImportSourceVersion()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L158 | neighbors=[productCsvImport.ts, assertProductImportSourceVersion(), readProductCsv(), productEfacturaImport.ts]
- "services_productcsvimport_productinputdiffers": "productInputDiffers()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L101 | neighbors=[productCsvImport.ts, analyzeProductImport(), applyProductImport(), buildProductImportPreview()]

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
