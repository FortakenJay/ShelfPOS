# Node Description Batch 16 of 42

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

- "services_syncconfig_querysyncservicerunning": "querySyncServiceRunning()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L55 | neighbors=[syncConfig.ts, isSyncServiceInstalled(), readSyncSetupStatus()]
- "services_syncconfig_readsyncsecretkey": "readSyncSecretKey()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L41 | neighbors=[syncConfig.ts, readSyncSetupStatus(), writePairingCodeOnly()]
- "services_syncconfig_restartsyncservice": "restartSyncService()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L166 | neighbors=[syncSetup.ts, syncConfig.ts, restartSyncServiceIfInstalled()]
- "shared_barcode_canprintproductbarcode": "canPrintProductBarcode()" | kind=code-symbol | source=shelfPos/src/shared/barcode.ts:L16 | neighbors=[barcode.ts, barcodePrintValue(), isPrintableCode128Barcode()]
- "shared_carttabsnapshot_iscarttabsnapshotempty": "isCartTabSnapshotEmpty()" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L25 | neighbors=[cartTabs.ts, cartTabSnapshot.ts, parseCartTabSnapshotJson()]
- "shared_carttabsnapshot_parsecarttabsnapshotjson": "parseCartTabSnapshotJson()" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L12 | neighbors=[cartTabSnapshot.ts, cartTabSnapshotTotal(), isCartTabSnapshotEmpty()]
- "shared_money_appendmoneyinputdigit": "appendMoneyInputDigit()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L59 | neighbors=[money.ts, digitsFromMoneyInput(), formatMoneyInputFromDigits()]
- "shared_money_backspacemoneyinput": "backspaceMoneyInput()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L64 | neighbors=[money.ts, digitsFromMoneyInput(), formatMoneyInputFromDigits()]
- "shared_money_formatcolones": "formatColones()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L18 | neighbors=[money.ts, formatMoneyInputFromDigits(), formatMoneyInputFromNumber()]
- "shared_money_onmoneyinputchange": "onMoneyInputChange()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L55 | neighbors=[money.ts, digitsFromMoneyInput(), formatMoneyInputFromDigits()]
- "shared_printlimits": "printLimits.ts" | kind=code-symbol | source=shelfPos/src/shared/printLimits.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, ipc.ts]
- "shared_types_actionshortcutkey": "ActionShortcutKey" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L5 | neighbors=[settings.ts, settings.ts, types.ts]
- "shared_types_apiresult": "ApiResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1101 | neighbors=[helpers.ts, index.ts, types.ts]
- "shared_types_appuserrow": "AppUserRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L962 | neighbors=[users.ts, users.ts, types.ts]
- "shared_types_auditlogfilter": "AuditLogFilter" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1060 | neighbors=[audit.ts, audit.ts, types.ts]
- "shared_types_auditlogpage": "AuditLogPage" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1068 | neighbors=[audit.ts, audit.ts, types.ts]
- "shared_types_auditlogrow": "AuditLogRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1049 | neighbors=[audit.ts, dashboard.ts, types.ts]
- "shared_types_audituser": "AuditUser" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1075 | neighbors=[audit.ts, audit.ts, types.ts]
- "shared_types_cashmovementrow": "CashMovementRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1022 | neighbors=[cash.ts, cash.ts, types.ts]
- "shared_types_cashmovementtype": "CashMovementType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L46 | neighbors=[cash.ts, cashMovementTotals.ts, types.ts]
- "shared_types_cashsummary": "CashSummary" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L713 | neighbors=[cash.ts, types.ts, CashDrawerStatus]
- "shared_types_dashboardoverview": "DashboardOverview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L682 | neighbors=[dashboard.ts, dashboard.ts, types.ts]
- "shared_types_inventoryrow": "InventoryRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L445 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_ipcchannel": "IpcChannel" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1200 | neighbors=[helpers.ts, ipc.ts, types.ts]
- "shared_types_itemizedsalesreport": "ItemizedSalesReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L526 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_printerstatusinfo": "PrinterStatusInfo" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L22 | neighbors=[printer.ts, printer.ts, types.ts]
- "shared_types_printjoblistresult": "PrintJobListResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L857 | neighbors=[printQueue.ts, printJobs.ts, types.ts]
- "shared_types_productfilters": "ProductFilters" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L128 | neighbors=[products.ts, products.ts, types.ts]
- "shared_types_productimporterror": "ProductImportError" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L144 | neighbors=[productCsvImport.ts, productSupplierInvoicePdf.ts, types.ts]
- "shared_types_productimportpreview": "ProductImportPreview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L165 | neighbors=[products.ts, productCsvImport.ts, types.ts]
- "shared_types_productimportresult": "ProductImportResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L175 | neighbors=[products.ts, productCsvImport.ts, types.ts]
- "shared_types_productimportstockmode": "ProductImportStockMode" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L150 | neighbors=[products.ts, productCsvImport.ts, types.ts]
- "shared_types_productlistresult": "ProductListResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L137 | neighbors=[products.ts, products.ts, types.ts]
- "shared_types_salecustomer": "SaleCustomer" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L364 | neighbors=[sales.ts, printTemplates.ts, types.ts]
- "shared_types_salepaymentsnapshot": "SalePaymentSnapshot" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L480 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_salereprintrow": "SaleReprintRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L331 | neighbors=[sales.ts, salesReceipt.ts, types.ts]
- "shared_types_salessummaryreport": "SalesSummaryReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L414 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_sessionuser": "SessionUser" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L48 | neighbors=[auth.ts, session.ts, types.ts]
- "shared_types_stockalert": "StockAlert" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L255 | neighbors=[products.ts, products.ts, types.ts]
- "shared_types_supplierinvoiceconfirminput": "SupplierInvoiceConfirmInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L242 | neighbors=[products.ts, productSupplierInvoicePdf.ts, types.ts]

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
