# Node Description Batch 23 of 43

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

- "repos_carttabs_resetcarttabsfornewshift": "resetCartTabsForNewShift()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L110 | neighbors=[cierre.ts, cartTabs.ts]
- "repos_carttabs_savecarttab": "saveCartTab()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L39 | neighbors=[cartTabs.ts, cartTabs.ts]
- "repos_cash_cashsummaryforcierre": "cashSummaryForCierre()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L38 | neighbors=[cierre.ts, cash.ts]
- "repos_cash_insertcashmovement": "insertCashMovement()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L89 | neighbors=[cash.ts, cash.ts]
- "repos_cash_listcashmovements": "listCashMovements()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L60 | neighbors=[cash.ts, cash.ts]
- "repos_cash_listopencashmovements": "listOpenCashMovements()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L71 | neighbors=[cash.ts, cashDrawerStatus()]
- "repos_dashboard_buildalerts": "buildAlerts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L431 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_categoryperformance": "categoryPerformance()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L266 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_employeeoverview": "employeeOverview()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L316 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_employeeperformance": "employeePerformance()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L334 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_grossprofit": "grossProfit()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L53 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_inventoryhealth": "inventoryHealth()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L155 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_inventoryproductrows": "inventoryProductRows()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L171 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_inventorysummary": "inventorySummary()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L129 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_kpitrend": "kpiTrend()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L35 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_lowstockcountweekago": "lowStockCountWeekAgo()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L501 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_monthrange": "monthRange()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L42 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_outofstockweekago": "outOfStockWeekAgo()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L515 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_productcountat": "productCountAt()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L494 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_productperformance": "productPerformance()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L208 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_recentactivityfeed": "recentActivityFeed()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L405 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_rolesummaries": "roleSummaries()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L351 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_salesbyhourtoday": "salesByHourToday()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L97 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_salestrendlast30days": "salesTrendLast30Days()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L71 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_stockmovementtrend": "stockMovementTrend()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L290 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_dashboard_taxablesalestotal": "taxableSalesTotal()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L371 | neighbors=[dashboard.ts, dashboardOverview()]
- "repos_printjobs_getprintjob": "getPrintJob()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L28 | neighbors=[printJobs.ts, printer.ts]
- "repos_printjobs_listprintjobsforpage": "listPrintJobsForPage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L59 | neighbors=[printQueue.ts, printJobs.ts]
- "repos_printjobs_listqueuedprintjobs": "listQueuedPrintJobs()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L48 | neighbors=[dashboard.ts, printJobs.ts]
- "repos_printjobs_listretryableprintjobids": "listRetryablePrintJobIds()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L102 | neighbors=[printJobs.ts, printer.ts]
- "repos_printjobs_markprintjob": "markPrintJob()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L34 | neighbors=[printJobs.ts, printer.ts]
- "repos_products_buildproductlistwhere": "buildProductListWhere()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L54 | neighbors=[products.ts, listProducts()]
- "repos_products_listcategories": "listCategories()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L156 | neighbors=[products.ts, products.ts]
- "repos_products_liststockproviders": "listStockProviders()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L165 | neighbors=[products.ts, products.ts]
- "repos_products_updateproductcostprice": "updateProductCostPrice()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L314 | neighbors=[products.ts, productSupplierInvoicePdf.ts]
- "repos_reports_cierrediscardedtabs": "cierreDiscardedTabs()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L566 | neighbors=[cierre.ts, reports.ts]
- "repos_reports_inventorysnapshot": "inventorySnapshot()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L285 | neighbors=[reports.ts, reports.ts]
- "repos_reports_inventorytotals": "inventoryTotals()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L275 | neighbors=[reports.ts, inventorySnapshotPage()]
- "repos_reports_returnfilterclause": "returnFilterClause()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L137 | neighbors=[reports.ts, returnTotals()]
- "repos_reports_returnscountbetween": "returnsCountBetween()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L333 | neighbors=[cierre.ts, reports.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-022.json

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
