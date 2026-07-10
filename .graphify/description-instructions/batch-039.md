# Node Description Batch 40 of 42

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

- "services_printtemplates_printer_test_receipt_catalog": "PRINTER_TEST_RECEIPT_CATALOG" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L92 | neighbors=[printTemplates.ts]
- "services_printtemplates_receiptargs": "ReceiptArgs" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L72 | neighbors=[printTemplates.ts]
- "services_printtemplates_receiptitemline": "ReceiptItemLine" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L57 | neighbors=[printTemplates.ts]
- "services_productcsvexport_product_export_columns": "PRODUCT_EXPORT_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L16 | neighbors=[productCsvExport.ts]
- "services_productcsvexport_productexportrow": "ProductExportRow" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L20 | neighbors=[productCsvExport.ts]
- "services_productcsvimport_applyimportstock": "applyImportStock()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L211 | neighbors=[productCsvImport.ts]
- "services_productefacturaimport_celltovalue": "cellToValue()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L17 | neighbors=[productEfacturaImport.ts]
- "services_productefacturaimport_efactura_headers": "EFACTURA_HEADERS" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L10 | neighbors=[productEfacturaImport.ts]
- "services_productefacturaimport_normalized_csv_columns": "NORMALIZED_CSV_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L123 | neighbors=[productEfacturaImport.ts]
- "services_productsupplierinvoicepdf_isuniqueviolation": "isUniqueViolation()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L249 | neighbors=[productSupplierInvoicePdf.ts]
- "services_session_userrow": "UserRow" | kind=code-symbol | source=shelfPos/src/main/services/session.ts:L10 | neighbors=[session.ts]
- "services_syncconfig_syncsetupsaveinput": "SyncSetupSaveInput" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L27 | neighbors=[syncConfig.ts]
- "services_syncconfig_syncsetupstatus": "SyncSetupStatus" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L15 | neighbors=[syncConfig.ts]
- "services_syncconfig_tosyncstoreid": "toSyncStoreId()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L45 | neighbors=[syncConfig.ts]
- "shared_carttabsnapshot_carttabsnapshot": "CartTabSnapshot" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L5 | neighbors=[cartTabSnapshot.ts]
- "shared_miscitem_parsemiscpriceinput": "parseMiscPriceInput()" | kind=code-symbol | source=shelfPos/src/shared/miscItem.ts:L4 | neighbors=[miscItem.ts]
- "shared_money_formatgroupedinteger": "formatGroupedInteger()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L10 | neighbors=[money.ts]
- "shared_types_batchprintitem": "BatchPrintItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L123 | neighbors=[types.ts]
- "shared_types_cierrediscardedtabrow": "CierreDiscardedTabRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L769 | neighbors=[types.ts]
- "shared_types_cierrediscountitem": "CierreDiscountItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L722 | neighbors=[types.ts]
- "shared_types_cierrediscountsale": "CierreDiscountSale" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L729 | neighbors=[types.ts]
- "shared_types_cierrehistoryfilter": "CierreHistoryFilter" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L839 | neighbors=[types.ts]
- "shared_types_cierrepriceoverrideitem": "CierrePriceOverrideItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L747 | neighbors=[types.ts]
- "shared_types_cierrepriceoverridesale": "CierrePriceOverrideSale" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L756 | neighbors=[types.ts]
- "shared_types_createsaleiteminput": "CreateSaleItemInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L285 | neighbors=[types.ts]
- "shared_types_dashboardactivitykind": "DashboardActivityKind" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L648 | neighbors=[types.ts]
- "shared_types_dashboardalertkind": "DashboardAlertKind" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L666 | neighbors=[types.ts]
- "shared_types_dashboardkpis": "DashboardKpis" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L549 | neighbors=[types.ts]
- "shared_types_itemizedsaleslinerow": "ItemizedSalesLineRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L503 | neighbors=[types.ts]
- "shared_types_itemizedsalessalerow": "ItemizedSalesSaleRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L513 | neighbors=[types.ts]
- "shared_types_reportperiodpreset": "ReportPeriodPreset" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L39 | neighbors=[types.ts]
- "shared_types_saleitemdetail": "SaleItemDetail" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L350 | neighbors=[types.ts]
- "shared_types_salepaymentinput": "SalePaymentInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L270 | neighbors=[types.ts]
- "shared_types_stockstatus": "StockStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L4 | neighbors=[types.ts]
- "shared_types_supplierinvoicenewiteminput": "SupplierInvoiceNewItemInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L225 | neighbors=[types.ts]
- "shared_types_supplierinvoicenewrow": "SupplierInvoiceNewRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L205 | neighbors=[types.ts]
- "shared_types_supplierinvoicerestockinput": "SupplierInvoiceRestockInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L235 | neighbors=[types.ts]
- "shared_types_supplierinvoicerestockrow": "SupplierInvoiceRestockRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L194 | neighbors=[types.ts]
- "shared_types_transactionlogrow": "TransactionLogRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L486 | neighbors=[types.ts]
- "shell_shell_admin_items": "ADMIN_ITEMS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L33 | neighbors=[Shell.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-039.json

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
