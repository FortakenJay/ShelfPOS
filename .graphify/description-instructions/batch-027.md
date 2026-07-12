# Node Description Batch 28 of 43

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

- "shared_types_createsalemisciteminput": "CreateSaleMiscItemInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L302 | neighbors=[sales.ts, types.ts]
- "shared_types_createsaleresult": "CreateSaleResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L331 | neighbors=[sales.ts, types.ts]
- "shared_types_customercreateinput": "CustomerCreateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1016 | neighbors=[types.ts, CustomerUpdateInput]
- "shared_types_customerinput": "CustomerInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L284 | neighbors=[cartTabSnapshot.ts, types.ts]
- "shared_types_customerupdateinput": "CustomerUpdateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1023 | neighbors=[types.ts, CustomerCreateInput]
- "shared_types_dashboardactivityitem": "DashboardActivityItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L668 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardalert": "DashboardAlert" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L686 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardcategoryrow": "DashboardCategoryRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L586 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardemployeeoverview": "DashboardEmployeeOverview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L639 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardemployeeperformancerow": "DashboardEmployeePerformanceRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L645 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardinventoryhealth": "DashboardInventoryHealth" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L615 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardinventoryproductrow": "DashboardInventoryProductRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L628 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardinventorysummary": "DashboardInventorySummary" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L605 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardkpitrend": "DashboardKpiTrend" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L555 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardproductperformancerow": "DashboardProductPerformanceRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L593 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardrolesummary": "DashboardRoleSummary" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L654 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardsalesbyhour": "DashboardSalesByHour" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L578 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardsalestrendpoint": "DashboardSalesTrendPoint" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L572 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardstockmovementpoint": "DashboardStockMovementPoint" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L622 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardstockstatus": "DashboardStockStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L584 | neighbors=[dashboard.ts, types.ts]
- "shared_types_discountauthorizeinput": "DiscountAuthorizeInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L910 | neighbors=[discount.ts, types.ts]
- "shared_types_firstrunsetupinput": "FirstRunSetupInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L969 | neighbors=[firstRun.ts, types.ts]
- "shared_types_firstrunstatus": "FirstRunStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L880 | neighbors=[firstRun.ts, types.ts]
- "shared_types_inventoryreport": "InventoryReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L468 | neighbors=[reports.ts, types.ts]
- "shared_types_ipc_channels": "IPC_CHANNELS" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1215 | neighbors=[index.ts, types.ts]
- "shared_types_openfloatinput": "OpenFloatInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1138 | neighbors=[cash.ts, types.ts]
- "shared_types_periodcashtotals": "PeriodCashTotals" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L417 | neighbors=[reports.ts, types.ts]
- "shared_types_priceoverrideauthorizeinput": "PriceOverrideAuthorizeInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L960 | neighbors=[priceOverride.ts, types.ts]
- "shared_types_printjobrow": "PrintJobRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L862 | neighbors=[printJobs.ts, types.ts]
- "shared_types_printjobstatus": "PrintJobStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L21 | neighbors=[printJobs.ts, types.ts]
- "shared_types_printjobtype": "PrintJobType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L22 | neighbors=[printJobs.ts, types.ts]
- "shared_types_productimportpreviewrow": "ProductImportPreviewRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L159 | neighbors=[productCsvImport.ts, types.ts]
- "shared_types_reportdata": "ReportData" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L544 | neighbors=[reports.ts, types.ts]
- "shared_types_reporttype": "ReportType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L32 | neighbors=[reports.ts, types.ts]
- "shared_types_reprintreceiptresult": "ReprintReceiptResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L349 | neighbors=[sales.ts, types.ts]
- "shared_types_saledetail": "SaleDetail" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L383 | neighbors=[sales.ts, types.ts]
- "shared_types_salepaymentdetail": "SalePaymentDetail" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L354 | neighbors=[sales.ts, types.ts]
- "shared_types_settingsupdateinput": "SettingsUpdateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1093 | neighbors=[settings.ts, types.ts]
- "shared_types_supplierinvoiceline": "SupplierInvoiceLine" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L190 | neighbors=[productSupplierInvoicePdf.ts, types.ts]
- "shared_types_syncqueuehealth": "SyncQueueHealth" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L887 | neighbors=[syncSetup.ts, types.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-027.json

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
