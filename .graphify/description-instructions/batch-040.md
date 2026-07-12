# Node Description Batch 41 of 43

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

- "services_printer_isprinterready": "isPrinterReady()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L120 | neighbors=[printer.ts]
- "services_printer_known_receipt_printer_names": "KNOWN_RECEIPT_PRINTER_NAMES" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L21 | neighbors=[printer.ts]
- "services_printer_lastprinterdetails": "lastPrinterDetails" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L56 | neighbors=[printer.ts]
- "services_printer_printerqueue": "printerQueue" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L42 | neighbors=[printer.ts]
- "services_printer_probe_printers_ps": "PROBE_PRINTERS_PS" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L76 | neighbors=[printer.ts]
- "services_printtemplates_cierrecashargs": "CierreCashArgs" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L489 | neighbors=[printTemplates.ts]
- "services_printtemplates_cierreprintargs": "CierrePrintArgs" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L499 | neighbors=[printTemplates.ts]
- "services_printtemplates_printer_test_receipt_catalog": "PRINTER_TEST_RECEIPT_CATALOG" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L94 | neighbors=[printTemplates.ts]
- "services_printtemplates_receiptargs": "ReceiptArgs" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L74 | neighbors=[printTemplates.ts]
- "services_printtemplates_receiptitemline": "ReceiptItemLine" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L59 | neighbors=[printTemplates.ts]
- "services_productcsvexport_product_export_columns": "PRODUCT_EXPORT_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L17 | neighbors=[productCsvExport.ts]
- "services_productcsvexport_productexportrow": "ProductExportRow" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L19 | neighbors=[productCsvExport.ts]
- "services_productcsvimport_analyzedproductimport": "AnalyzedProductImport" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L225 | neighbors=[productCsvImport.ts]
- "services_productcsvimport_productimportdecision": "ProductImportDecision" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L221 | neighbors=[productCsvImport.ts]
- "services_productefacturaimport_celltovalue": "cellToValue()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L21 | neighbors=[productEfacturaImport.ts]
- "services_productefacturaimport_efactura_headers": "EFACTURA_HEADERS" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L14 | neighbors=[productEfacturaImport.ts]
- "services_productefacturaimport_normalized_csv_columns": "NORMALIZED_CSV_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L122 | neighbors=[productEfacturaImport.ts]
- "services_productsupplierinvoicepdf_isuniqueviolation": "isUniqueViolation()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L249 | neighbors=[productSupplierInvoicePdf.ts]
- "services_session_userrow": "UserRow" | kind=code-symbol | source=shelfPos/src/main/services/session.ts:L10 | neighbors=[session.ts]
- "services_syncconfig_syncsetupsaveinput": "SyncSetupSaveInput" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L27 | neighbors=[syncConfig.ts]
- "services_syncconfig_syncsetupstatus": "SyncSetupStatus" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L15 | neighbors=[syncConfig.ts]
- "services_syncconfig_tosyncstoreid": "toSyncStoreId()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L45 | neighbors=[syncConfig.ts]
- "shared_carttabsnapshot_carttabsnapshot": "CartTabSnapshot" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L6 | neighbors=[cartTabSnapshot.ts]
- "shared_miscitem_parsemiscpriceinput": "parseMiscPriceInput()" | kind=code-symbol | source=shelfPos/src/shared/miscItem.ts:L4 | neighbors=[miscItem.ts]
- "shared_money_formatgroupedinteger": "formatGroupedInteger()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L36 | neighbors=[money.ts]
- "shared_money_parselocalizedmoneyinput": "parseLocalizedMoneyInput()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L10 | neighbors=[money.ts]
- "shared_pricing_sanctionedunitprices": "SanctionedUnitPrices" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L13 | neighbors=[pricing.ts]
- "shared_types_batchprintitem": "BatchPrintItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L130 | neighbors=[types.ts]
- "shared_types_cierrediscardedtabrow": "CierreDiscardedTabRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L781 | neighbors=[types.ts]
- "shared_types_cierrediscountitem": "CierreDiscountItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L734 | neighbors=[types.ts]
- "shared_types_cierrediscountsale": "CierreDiscountSale" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L741 | neighbors=[types.ts]
- "shared_types_cierrehistoryfilter": "CierreHistoryFilter" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L853 | neighbors=[types.ts]
- "shared_types_cierrepriceoverrideitem": "CierrePriceOverrideItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L759 | neighbors=[types.ts]
- "shared_types_cierrepriceoverridesale": "CierrePriceOverrideSale" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L768 | neighbors=[types.ts]
- "shared_types_createsaleiteminput": "CreateSaleItemInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L293 | neighbors=[types.ts]
- "shared_types_creditchargehistoryrow": "CreditChargeHistoryRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1028 | neighbors=[types.ts]
- "shared_types_creditpaymenthistoryrow": "CreditPaymentHistoryRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1051 | neighbors=[types.ts]
- "shared_types_creditpaymentinput": "CreditPaymentInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1078 | neighbors=[types.ts]
- "shared_types_creditpaymentmethod": "CreditPaymentMethod" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L5 | neighbors=[types.ts]
- "shared_types_customercredithistoryrow": "CustomerCreditHistoryRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1063 | neighbors=[types.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-040.json

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
