# Node Description Batch 16 of 43

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

- "services_printer_printtestreceipt": "printTestReceipt()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L398 | neighbors=[printer.ts, printer.ts, printLines()]
- "services_printer_probeenv": "probeEnv()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L132 | neighbors=[printer.ts, configuredPrinterName(), probePrinter()]
- "services_printpdf_printlinestohtml": "printLinesToHtml()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L87 | neighbors=[printPdf.ts, escapeHtml(), writePrintLinesPdf()]
- "services_printtemplates_buildinventoryreportlines": "buildInventoryReportLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L471 | neighbors=[reports.ts, printTemplates.ts, reportHeader()]
- "services_printtemplates_buildproductbarcodelabellines": "buildProductBarcodeLabelLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L854 | neighbors=[products.ts, labelPrintLines.ts, printTemplates.ts]
- "services_printtemplates_customerlines": "customerLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L214 | neighbors=[printTemplates.ts, buildReceiptLines(), idTypeLabel()]
- "services_printtemplates_emisorlines": "emisorLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L187 | neighbors=[printTemplates.ts, buildReceiptLines(), idTypeLabel()]
- "services_printtemplates_idtypelabel": "idTypeLabel()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L185 | neighbors=[printTemplates.ts, customerLines(), emisorLines()]
- "services_printtemplates_methodlabel": "methodLabel()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L184 | neighbors=[printTemplates.ts, buildReceiptLines(), paymentLines()]
- "services_printtemplates_receiptpaymentline": "ReceiptPaymentLine" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L68 | neighbors=[sales.ts, salesReceipt.ts, printTemplates.ts]
- "services_printtemplates_salepaymentsummarylines": "salePaymentSummaryLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L713 | neighbors=[printTemplates.ts, buildItemizedSalesReportLines(), buildTransactionLogReportLines()]
- "services_printtemplates_summarymetriclines": "summaryMetricLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L370 | neighbors=[printTemplates.ts, buildMultiDaySummaryReportLines(), buildSummaryReportLines()]
- "services_printtemplates_taxsum": "taxSum()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L324 | neighbors=[printTemplates.ts, buildReceiptLines(), buildTaxReportLines()]
- "services_printtemplates_topproductlines": "topProductLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L351 | neighbors=[printTemplates.ts, buildCierreLines(), buildTopProductsReportLines()]
- "services_productcsvimport_assertproductimportsourceversion": "assertProductImportSourceVersion()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L162 | neighbors=[productCsvImport.ts, productImportSourceVersion(), readProductImportSource()]
- "services_productcsvimport_preserveprice2whencolumnisomitted": "preservePrice2WhenColumnIsOmitted()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L132 | neighbors=[productCsvImport.ts, applyProductImport(), buildProductImportPreview()]
- "services_productefacturaimport_cell": "cell()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L64 | neighbors=[productEfacturaImport.ts, normalizeCell(), efacturaRowToProductCsvRow()]
- "services_productsupplierinvoicepdf_buildsupplierinvoicepreview": "buildSupplierInvoicePreview()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L194 | neighbors=[products.ts, productSupplierInvoicePdf.ts, readSupplierInvoicePdf()]
- "services_productsupplierinvoicepdf_readsupplierinvoicepdf": "readSupplierInvoicePdf()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L169 | neighbors=[productSupplierInvoicePdf.ts, buildSupplierInvoicePreview(), parseSupplierInvoiceText()]
- "services_syncconfig_getsyncconfigpath": "getSyncConfigPath()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L31 | neighbors=[syncConfig.ts, readSyncSetupStatus(), writePairingCodeOnly()]
- "services_syncconfig_parseenvfile": "parseEnvFile()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L36 | neighbors=[syncConfig.ts, readSyncSetupStatus(), writePairingCodeOnly()]
- "services_syncconfig_querysyncservicerunning": "querySyncServiceRunning()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L55 | neighbors=[syncConfig.ts, isSyncServiceInstalled(), readSyncSetupStatus()]
- "services_syncconfig_readsyncsecretkey": "readSyncSecretKey()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L41 | neighbors=[syncConfig.ts, readSyncSetupStatus(), writePairingCodeOnly()]
- "services_syncconfig_restartsyncservice": "restartSyncService()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L166 | neighbors=[syncSetup.ts, syncConfig.ts, restartSyncServiceIfInstalled()]
- "shared_barcode_canprintproductbarcode": "canPrintProductBarcode()" | kind=code-symbol | source=shelfPos/src/shared/barcode.ts:L16 | neighbors=[barcode.ts, barcodePrintValue(), isPrintableCode128Barcode()]
- "shared_carttabsnapshot_iscarttabsnapshotempty": "isCartTabSnapshotEmpty()" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L26 | neighbors=[cartTabs.ts, cartTabSnapshot.ts, parseCartTabSnapshotJson()]
- "shared_carttabsnapshot_parsecarttabsnapshotjson": "parseCartTabSnapshotJson()" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L13 | neighbors=[cartTabSnapshot.ts, cartTabSnapshotTotal(), isCartTabSnapshotEmpty()]
- "shared_money_appendmoneyinputdigit": "appendMoneyInputDigit()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L85 | neighbors=[money.ts, digitsFromMoneyInput(), formatMoneyInputFromDigits()]
- "shared_money_backspacemoneyinput": "backspaceMoneyInput()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L90 | neighbors=[money.ts, digitsFromMoneyInput(), formatMoneyInputFromDigits()]
- "shared_money_formatcolones": "formatColones()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L44 | neighbors=[money.ts, formatMoneyInputFromDigits(), formatMoneyInputFromNumber()]
- "shared_money_onmoneyinputchange": "onMoneyInputChange()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L81 | neighbors=[money.ts, digitsFromMoneyInput(), formatMoneyInputFromDigits()]
- "shared_pricing_linetotal": "lineTotal()" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L74 | neighbors=[pricing.ts, lineGross(), cartTabSnapshot.ts]
- "shared_pricing_lineunitprice": "lineUnitPrice()" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L56 | neighbors=[pricing.ts, lineGross(), catalogUnitPrice()]
- "shared_printlimits": "printLimits.ts" | kind=code-symbol | source=shelfPos/src/shared/printLimits.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, ipc.ts]
- "shared_types_actionshortcutkey": "ActionShortcutKey" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L8 | neighbors=[settings.ts, settings.ts, types.ts]
- "shared_types_apiresult": "ApiResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1203 | neighbors=[helpers.ts, index.ts, types.ts]
- "shared_types_appuserrow": "AppUserRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L976 | neighbors=[users.ts, users.ts, types.ts]
- "shared_types_auditlogfilter": "AuditLogFilter" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1162 | neighbors=[audit.ts, audit.ts, types.ts]
- "shared_types_auditlogpage": "AuditLogPage" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1170 | neighbors=[audit.ts, audit.ts, types.ts]
- "shared_types_auditlogrow": "AuditLogRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1151 | neighbors=[audit.ts, dashboard.ts, types.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-015.json

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
