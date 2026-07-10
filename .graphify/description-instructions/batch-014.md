# Node Description Batch 15 of 42

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

- "services_csvcolumns_productcsvkey": "ProductCsvKey" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L34 | neighbors=[csvColumns.ts, productCsvImport.ts, productEfacturaImport.ts]
- "services_escposrender_doublestrike": "doubleStrike()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L38 | neighbors=[escPosRender.ts, applyTextStyle(), resetTextStyle()]
- "services_escposrender_visuallen": "visualLen()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L141 | neighbors=[escPosRender.ts, padRow(), pushRowLine()]
- "services_facturapdf_buildfacturahtml": "buildFacturaHtml()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L177 | neighbors=[facturaPdf.ts, buildPage(), writeFacturaPdf()]
- "services_facturapdf_buildsummaryblock": "buildSummaryBlock()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L109 | neighbors=[facturaPdf.ts, buildPage(), formatFacturaAmount()]
- "services_facturapdf_writefacturapdf": "writeFacturaPdf()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L277 | neighbors=[sales.ts, facturaPdf.ts, buildFacturaHtml()]
- "services_format_formatmoney": "formatMoney()" | kind=code-symbol | source=shelfPos/src/main/services/format.ts:L4 | neighbors=[format.ts, printTemplates.ts, shelfLabelLines.ts]
- "services_labellayout_estimateshelflabeldotsfromlines": "estimateShelfLabelDotsFromLines()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L96 | neighbors=[labelLayout.ts, estimateShelfLabelDots(), warnIfShelfLabelOverflow()]
- "services_labellayout_shelflabeltextcols": "shelfLabelTextCols()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L29 | neighbors=[labelLayout.ts, shelfLabelBigCols(), shelfLabelLines.ts]
- "services_labellayout_warnifshelflabeloverflow": "warnIfShelfLabelOverflow()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L133 | neighbors=[labelLayout.ts, estimateShelfLabelDotsFromLines(), printer.ts]
- "services_operatorconfig_verifyoperatorpassword": "verifyOperatorPassword()" | kind=code-symbol | source=shelfPos/src/main/services/operatorConfig.ts:L51 | neighbors=[operatorConfig.ts, refreshOperatorPasswordHash(), session.ts]
- "services_posheartbeat_startposheartbeat": "startPosHeartbeat()" | kind=code-symbol | source=shelfPos/src/main/services/posHeartbeat.ts:L12 | neighbors=[index.ts, posHeartbeat.ts, writeHeartbeat()]
- "services_printer_execfileasync": "execFileAsync" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L18 | neighbors=[printer.ts, logPrinterDetails(), probePrinter()]
- "services_printer_fallbackprintername": "fallbackPrinterName()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L64 | neighbors=[printer.ts, configuredPrinterName(), getActivePrinterName()]
- "services_printer_flushpendingprintjobs": "flushPendingPrintJobs()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L197 | neighbors=[index.ts, printer.ts, flushPrintJobAt()]
- "services_printer_flushprintjobat": "flushPrintJobAt()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L190 | neighbors=[printer.ts, flushPendingPrintJobs(), attemptPrintJob()]
- "services_printer_initprinter": "initPrinter()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L185 | neighbors=[index.ts, printer.ts, probePrinter()]
- "services_printer_logprinterdetails": "logPrinterDetails()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L166 | neighbors=[printer.ts, execFileAsync, probePrinter()]
- "services_printer_printtestreceipt": "printTestReceipt()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L389 | neighbors=[printer.ts, printer.ts, printLines()]
- "services_printer_probeenv": "probeEnv()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L128 | neighbors=[printer.ts, configuredPrinterName(), probePrinter()]
- "services_printpdf_printlinestohtml": "printLinesToHtml()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L87 | neighbors=[printPdf.ts, escapeHtml(), writePrintLinesPdf()]
- "services_printtemplates_buildinventoryreportlines": "buildInventoryReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L468 | neighbors=[reports.ts, printTemplates.ts, reportHeader()]
- "services_printtemplates_buildproductbarcodelabellines": "buildProductBarcodeLabelLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L851 | neighbors=[products.ts, labelPrintLines.ts, printTemplates.ts]
- "services_printtemplates_customerlines": "customerLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L209 | neighbors=[printTemplates.ts, buildReceiptLines(), idTypeLabel()]
- "services_printtemplates_emisorlines": "emisorLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L182 | neighbors=[printTemplates.ts, buildReceiptLines(), idTypeLabel()]
- "services_printtemplates_idtypelabel": "idTypeLabel()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L180 | neighbors=[printTemplates.ts, customerLines(), emisorLines()]
- "services_printtemplates_methodlabel": "methodLabel()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L179 | neighbors=[printTemplates.ts, buildReceiptLines(), paymentLines()]
- "services_printtemplates_receiptpaymentline": "ReceiptPaymentLine" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L66 | neighbors=[sales.ts, salesReceipt.ts, printTemplates.ts]
- "services_printtemplates_salepaymentsummarylines": "salePaymentSummaryLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L710 | neighbors=[printTemplates.ts, buildItemizedSalesReportLines(), buildTransactionLogReportLines()]
- "services_printtemplates_summarymetriclines": "summaryMetricLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L367 | neighbors=[printTemplates.ts, buildMultiDaySummaryReportLines(), buildSummaryReportLines()]
- "services_printtemplates_taxsum": "taxSum()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L322 | neighbors=[printTemplates.ts, buildReceiptLines(), buildTaxReportLines()]
- "services_printtemplates_topproductlines": "topProductLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L348 | neighbors=[printTemplates.ts, buildCierreLines(), buildTopProductsReportLines()]
- "services_productcsvimport_productinputdiffers": "productInputDiffers()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L108 | neighbors=[productCsvImport.ts, applyProductImport(), buildProductImportPreview()]
- "services_productcsvimport_readproductcsv": "readProductCsv()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L150 | neighbors=[products.ts, productCsvImport.ts, applyProductImport()]
- "services_productefacturaimport_cell": "cell()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L60 | neighbors=[productEfacturaImport.ts, normalizeCell(), efacturaRowToProductCsvRow()]
- "services_productsupplierinvoicepdf_buildsupplierinvoicepreview": "buildSupplierInvoicePreview()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L193 | neighbors=[products.ts, productSupplierInvoicePdf.ts, readSupplierInvoicePdf()]
- "services_productsupplierinvoicepdf_extracttrailingnumbers": "extractTrailingNumbers()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L53 | neighbors=[productSupplierInvoicePdf.ts, parseMoney(), parseSupplierInvoiceText()]
- "services_productsupplierinvoicepdf_readsupplierinvoicepdf": "readSupplierInvoicePdf()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L168 | neighbors=[productSupplierInvoicePdf.ts, buildSupplierInvoicePreview(), parseSupplierInvoiceText()]
- "services_syncconfig_getsyncconfigpath": "getSyncConfigPath()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L31 | neighbors=[syncConfig.ts, readSyncSetupStatus(), writePairingCodeOnly()]
- "services_syncconfig_parseenvfile": "parseEnvFile()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L36 | neighbors=[syncConfig.ts, readSyncSetupStatus(), writePairingCodeOnly()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-014.json

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
