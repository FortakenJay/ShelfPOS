# Node Description Batch 25 of 42

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

- "services_facturapdf_facturapdfdata": "FacturaPdfData" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L23 | neighbors=[salesReceipt.ts, facturaPdf.ts]
- "services_facturapdf_formatdocumentnumber": "formatDocumentNumber()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L69 | neighbors=[facturaPdf.ts, buildPage()]
- "services_facturapdf_formatfacturaamount": "formatFacturaAmount()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L46 | neighbors=[facturaPdf.ts, buildSummaryBlock()]
- "services_facturapdf_formatfacturadatetime": "formatFacturaDateTime()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L65 | neighbors=[facturaPdf.ts, buildPage()]
- "services_facturapdf_itembarcodecell": "itemBarcodeCell()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L85 | neighbors=[facturaPdf.ts, escapeHtml()]
- "services_facturapdf_itemcodecell": "itemCodeCell()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L75 | neighbors=[facturaPdf.ts, escapeHtml()]
- "services_labellayout_estimateshelflabeldots": "estimateShelfLabelDots()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L57 | neighbors=[labelLayout.ts, estimateShelfLabelDotsFromLines()]
- "services_labellayout_shelflabelbigcols": "shelfLabelBigCols()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L24 | neighbors=[labelLayout.ts, shelfLabelTextCols()]
- "services_labellayout_wrapshelflabeltext": "wrapShelfLabelText()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L35 | neighbors=[labelLayout.ts, shelfLabelLines.ts]
- "services_labelprintlines_labelprintpayload": "labelPrintPayload()" | kind=code-symbol | source=shelfPos/src/main/services/labelPrintLines.ts:L22 | neighbors=[products.ts, labelPrintLines.ts]
- "services_labelprintlines_resolvelabelprintlines": "resolveLabelPrintLines()" | kind=code-symbol | source=shelfPos/src/main/services/labelPrintLines.ts:L9 | neighbors=[labelPrintLines.ts, printer.ts]
- "services_operatorconfig_isoperatorloginconfigured": "isOperatorLoginConfigured()" | kind=code-symbol | source=shelfPos/src/main/services/operatorConfig.ts:L46 | neighbors=[operatorConfig.ts, refreshOperatorPasswordHash()]
- "services_operatorconfig_loadoperatorenv": "loadOperatorEnv()" | kind=code-symbol | source=shelfPos/src/main/services/operatorConfig.ts:L24 | neighbors=[operatorConfig.ts, refreshOperatorPasswordHash()]
- "services_pendingstoreid_applypendingsyncstoreid": "applyPendingSyncStoreId()" | kind=code-symbol | source=shelfPos/src/main/services/pendingStoreId.ts:L11 | neighbors=[index.ts, pendingStoreId.ts]
- "services_posheartbeat_stopposheartbeat": "stopPosHeartbeat()" | kind=code-symbol | source=shelfPos/src/main/services/posHeartbeat.ts:L18 | neighbors=[index.ts, posHeartbeat.ts]
- "services_posheartbeat_writeheartbeat": "writeHeartbeat()" | kind=code-symbol | source=shelfPos/src/main/services/posHeartbeat.ts:L8 | neighbors=[posHeartbeat.ts, startPosHeartbeat()]
- "services_printer_enqueueprintertask": "enqueuePrinterTask()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L40 | neighbors=[printer.ts, sendRawToPrinter()]
- "services_printer_getprinterstatus": "getPrinterStatus()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L120 | neighbors=[printer.ts, printer.ts]
- "services_printer_ist81escposquirks": "isT81EscPosQuirks()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L343 | neighbors=[printer.ts, toEscPosOptions()]
- "services_printer_printtestlabel": "printTestLabel()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L397 | neighbors=[printer.ts, printLines()]
- "services_printpdf_escapehtml": "escapeHtml()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L79 | neighbors=[printPdf.ts, printLinesToHtml()]
- "services_printpdf_loadwindowhtml": "loadWindowHtml()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L12 | neighbors=[printPdf.ts, writeHtmlToPdf()]
- "services_printtemplates_buildpincardlines": "buildPinCardLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L869 | neighbors=[settings.ts, printTemplates.ts]
- "services_printtemplates_cierrecashlines": "cierreCashLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L511 | neighbors=[printTemplates.ts, buildCierreLines()]
- "services_printtemplates_cierrediscardedtablines": "cierreDiscardedTabLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L622 | neighbors=[printTemplates.ts, buildCierreLines()]
- "services_printtemplates_cierrediscountlines": "cierreDiscountLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L533 | neighbors=[printTemplates.ts, buildCierreLines()]
- "services_printtemplates_cierrepriceoverridelines": "cierrePriceOverrideLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L583 | neighbors=[printTemplates.ts, buildCierreLines()]
- "services_printtemplates_emisorinfo": "EmisorInfo" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L43 | neighbors=[facturaPdf.ts, printTemplates.ts]
- "services_printtemplates_hascustomerdata": "hasCustomerData()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L224 | neighbors=[printTemplates.ts, buildReceiptLines()]
- "services_printtemplates_receiptitemsfromcatalog": "receiptItemsFromCatalog()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L128 | neighbors=[printTemplates.ts, buildPrinterTestReceiptLines()]
- "services_productcsvexport_createexportbatchstatement": "createExportBatchStatement()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L50 | neighbors=[productCsvExport.ts, exportProductsToCsv()]
- "services_productcsvexport_flushlines": "flushLines()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L60 | neighbors=[productCsvExport.ts, exportProductsToCsv()]
- "services_productcsvexport_formatproductexportline": "formatProductExportLine()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L34 | neighbors=[productCsvExport.ts, exportProductsToCsv()]
- "services_productcsvexport_writeproductcsvtemplate": "writeProductCsvTemplate()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L66 | neighbors=[productCsvExport.ts, exportProductsToCsv()]
- "services_productcsvimport_cell": "cell()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L51 | neighbors=[productCsvImport.ts, parseProductRow()]
- "services_productcsvimport_parsedcsv": "ParsedCsv" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L143 | neighbors=[productCsvImport.ts, productEfacturaImport.ts]
- "services_productcsvimport_parseoptionalnumber": "parseOptionalNumber()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L56 | neighbors=[productCsvImport.ts, parseProductRow()]
- "services_productcsvimport_previewrow": "previewRow()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L121 | neighbors=[productCsvImport.ts, buildProductImportPreview()]
- "services_productefacturaimport_findheaderrow": "findHeaderRow()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L43 | neighbors=[productEfacturaImport.ts, readEfacturaXlsx()]
- "services_productefacturaimport_maplettercolumns": "mapLetterColumns()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L51 | neighbors=[productEfacturaImport.ts, readEfacturaXlsx()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-024.json

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
