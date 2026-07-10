# Node Description Batch 27 of 42

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

- "shared_types_createsaleresult": "CreateSaleResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L321 | neighbors=[sales.ts, types.ts]
- "shared_types_customerinput": "CustomerInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L276 | neighbors=[cartTabSnapshot.ts, types.ts]
- "shared_types_dashboardactivityitem": "DashboardActivityItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L656 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardalert": "DashboardAlert" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L674 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardcategoryrow": "DashboardCategoryRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L574 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardemployeeoverview": "DashboardEmployeeOverview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L627 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardemployeeperformancerow": "DashboardEmployeePerformanceRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L633 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardinventoryhealth": "DashboardInventoryHealth" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L603 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardinventoryproductrow": "DashboardInventoryProductRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L616 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardinventorysummary": "DashboardInventorySummary" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L593 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardkpitrend": "DashboardKpiTrend" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L543 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardproductperformancerow": "DashboardProductPerformanceRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L581 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardrolesummary": "DashboardRoleSummary" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L642 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardsalesbyhour": "DashboardSalesByHour" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L566 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardsalestrendpoint": "DashboardSalesTrendPoint" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L560 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardstockmovementpoint": "DashboardStockMovementPoint" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L610 | neighbors=[dashboard.ts, types.ts]
- "shared_types_dashboardstockstatus": "DashboardStockStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L572 | neighbors=[dashboard.ts, types.ts]
- "shared_types_discountauthorizeinput": "DiscountAuthorizeInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L896 | neighbors=[discount.ts, types.ts]
- "shared_types_firstrunsetupinput": "FirstRunSetupInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L955 | neighbors=[firstRun.ts, types.ts]
- "shared_types_firstrunstatus": "FirstRunStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L866 | neighbors=[firstRun.ts, types.ts]
- "shared_types_inventoryreport": "InventoryReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L456 | neighbors=[reports.ts, types.ts]
- "shared_types_ipc_channels": "IPC_CHANNELS" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1113 | neighbors=[index.ts, types.ts]
- "shared_types_openfloatinput": "OpenFloatInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1036 | neighbors=[cash.ts, types.ts]
- "shared_types_periodcashtotals": "PeriodCashTotals" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L407 | neighbors=[reports.ts, types.ts]
- "shared_types_priceoverrideauthorizeinput": "PriceOverrideAuthorizeInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L946 | neighbors=[priceOverride.ts, types.ts]
- "shared_types_printjobrow": "PrintJobRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L848 | neighbors=[printJobs.ts, types.ts]
- "shared_types_printjobstatus": "PrintJobStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L18 | neighbors=[printJobs.ts, types.ts]
- "shared_types_printjobtype": "PrintJobType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L19 | neighbors=[printJobs.ts, types.ts]
- "shared_types_productimportpreviewrow": "ProductImportPreviewRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L152 | neighbors=[productCsvImport.ts, types.ts]
- "shared_types_reportdata": "ReportData" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L532 | neighbors=[reports.ts, types.ts]
- "shared_types_reporttype": "ReportType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L29 | neighbors=[reports.ts, types.ts]
- "shared_types_reprintreceiptresult": "ReprintReceiptResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L339 | neighbors=[sales.ts, types.ts]
- "shared_types_saledetail": "SaleDetail" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L373 | neighbors=[sales.ts, types.ts]
- "shared_types_salepaymentdetail": "SalePaymentDetail" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L344 | neighbors=[sales.ts, types.ts]
- "shared_types_settingsupdateinput": "SettingsUpdateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L991 | neighbors=[settings.ts, types.ts]
- "shared_types_supplierinvoiceline": "SupplierInvoiceLine" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L182 | neighbors=[productSupplierInvoicePdf.ts, types.ts]
- "shared_types_syncqueuehealth": "SyncQueueHealth" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L873 | neighbors=[syncSetup.ts, types.ts]
- "shared_types_syncsetupsaveinput": "SyncSetupSaveInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L892 | neighbors=[syncSetup.ts, types.ts]
- "shared_types_syncsetupstatus": "SyncSetupStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L880 | neighbors=[syncSetup.ts, types.ts]
- "shared_types_usercreateinput": "UserCreateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L971 | neighbors=[users.ts, types.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-026.json

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
