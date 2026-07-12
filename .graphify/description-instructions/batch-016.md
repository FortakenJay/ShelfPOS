# Node Description Batch 17 of 43

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

- "shared_types_audituser": "AuditUser" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1177 | neighbors=[audit.ts, audit.ts, types.ts]
- "shared_types_cashmovementrow": "CashMovementRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1124 | neighbors=[cash.ts, cash.ts, types.ts]
- "shared_types_cashmovementtype": "CashMovementType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L49 | neighbors=[cash.ts, cashMovementTotals.ts, types.ts]
- "shared_types_cashsummary": "CashSummary" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L725 | neighbors=[cash.ts, types.ts, CashDrawerStatus]
- "shared_types_dashboardoverview": "DashboardOverview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L694 | neighbors=[dashboard.ts, dashboard.ts, types.ts]
- "shared_types_inventoryrow": "InventoryRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L457 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_ipcchannel": "IpcChannel" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1309 | neighbors=[helpers.ts, ipc.ts, types.ts]
- "shared_types_itemizedsalesreport": "ItemizedSalesReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L538 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_printerstatusinfo": "PrinterStatusInfo" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L25 | neighbors=[printer.ts, printer.ts, types.ts]
- "shared_types_printjoblistresult": "PrintJobListResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L871 | neighbors=[printQueue.ts, printJobs.ts, types.ts]
- "shared_types_productfilters": "ProductFilters" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L135 | neighbors=[products.ts, products.ts, types.ts]
- "shared_types_productimporterror": "ProductImportError" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L151 | neighbors=[productCsvImport.ts, productSupplierInvoicePdf.ts, types.ts]
- "shared_types_productimportpreview": "ProductImportPreview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L172 | neighbors=[products.ts, productCsvImport.ts, types.ts]
- "shared_types_productimportresult": "ProductImportResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L183 | neighbors=[products.ts, productCsvImport.ts, types.ts]
- "shared_types_productimportstockmode": "ProductImportStockMode" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L157 | neighbors=[products.ts, productCsvImport.ts, types.ts]
- "shared_types_productlistresult": "ProductListResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L144 | neighbors=[products.ts, products.ts, types.ts]
- "shared_types_salecustomer": "SaleCustomer" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L374 | neighbors=[sales.ts, printTemplates.ts, types.ts]
- "shared_types_salepaymentsnapshot": "SalePaymentSnapshot" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L492 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_salereprintrow": "SaleReprintRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L341 | neighbors=[sales.ts, salesReceipt.ts, types.ts]
- "shared_types_salessummaryreport": "SalesSummaryReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L424 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_sessionuser": "SessionUser" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L51 | neighbors=[auth.ts, session.ts, types.ts]
- "shared_types_stockalert": "StockAlert" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L263 | neighbors=[products.ts, products.ts, types.ts]
- "shared_types_supplierinvoiceconfirminput": "SupplierInvoiceConfirmInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L250 | neighbors=[products.ts, productSupplierInvoicePdf.ts, types.ts]
- "shared_types_supplierinvoicepreview": "SupplierInvoicePreview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L223 | neighbors=[products.ts, productSupplierInvoicePdf.ts, types.ts]
- "shared_types_supplierinvoiceresult": "SupplierInvoiceResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L256 | neighbors=[products.ts, productSupplierInvoicePdf.ts, types.ts]
- "shared_types_taxbreakdownreport": "TaxBreakdownReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L484 | neighbors=[dashboard.ts, reports.ts, types.ts]
- "shared_types_taxbreakdownrow": "TaxBreakdownRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L476 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_taxregime": "TaxRegime" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L46 | neighbors=[settings.ts, printTemplates.ts, types.ts]
- "shared_types_topproductrow": "TopProductRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L447 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_transactionlogreport": "TransactionLogReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L509 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "src_db_applypendingsyncstoreid": "applyPendingSyncStoreId()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L79 | neighbors=[db.ts, readSetting(), openDatabase()]
- "src_db_markerror": "markError()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L187 | neighbors=[db.ts, isTransientSyncError(), sync.ts]
- "src_db_opendatabase": "openDatabase()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L102 | neighbors=[db.ts, applyPendingSyncStoreId(), index.ts]
- "src_db_readivaratestandard": "readIvaRateStandard()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L58 | neighbors=[db.ts, readSetting(), index.ts]
- "src_db_readposlastseenat": "readPosLastSeenAt()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L45 | neighbors=[db.ts, readSetting(), index.ts]
- "src_db_readstockthresholddefault": "readStockThresholdDefault()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L50 | neighbors=[db.ts, readSetting(), index.ts]
- "src_errorlog_logsyncqueuefailure": "logSyncQueueFailure()" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L29 | neighbors=[errorLog.ts, appendSyncErrorLog(), sync.ts]
- "src_main": "main.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/main.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, bootstrap(), queryClient]
- "src_sync_checkconnectivity": "checkConnectivity()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L31 | neighbors=[index.ts, sync.ts, claimStoreIfNeeded()]
- "src_sync_storehasdashboardaccess": "storeHasDashboardAccess()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L205 | neighbors=[sync.ts, claimStoreIfNeeded(), SupabaseHttpError]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-016.json

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
