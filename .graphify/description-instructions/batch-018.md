# Node Description Batch 19 of 43

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

- "components_dashboardchartlazy_lazyproductanalyticscharts": "LazyProductAnalyticsCharts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLazy.tsx:L28 | neighbors=[dashboardChartLazy.tsx, DashboardPage.tsx]
- "components_dashboardchartlazy_lazysalesanalyticssection": "LazySalesAnalyticsSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLazy.tsx:L20 | neighbors=[dashboardChartLazy.tsx, DashboardPage.tsx]
- "components_dashboardchartlazy_lazystockmovementchart": "LazyStockMovementChart()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLazy.tsx:L38 | neighbors=[dashboardChartLazy.tsx, DashboardPage.tsx]
- "components_dashboardchartloaders_dashboardhomechartslazy": "DashboardHomeChartsLazy" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLoaders.ts:L3 | neighbors=[dashboardChartLazy.tsx, dashboardChartLoaders.ts]
- "components_dashboardchartloaders_inventoryhealthchartlazy": "InventoryHealthChartLazy" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLoaders.ts:L19 | neighbors=[dashboardChartLazy.tsx, dashboardChartLoaders.ts]
- "components_dashboardchartloaders_productanalyticschartslazy": "ProductAnalyticsChartsLazy" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLoaders.ts:L11 | neighbors=[dashboardChartLazy.tsx, dashboardChartLoaders.ts]
- "components_dashboardchartloaders_salesanalyticssectionlazy": "SalesAnalyticsSectionLazy" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLoaders.ts:L7 | neighbors=[dashboardChartLazy.tsx, dashboardChartLoaders.ts]
- "components_dashboardchartloaders_stockmovementchartlazy": "StockMovementChartLazy" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLoaders.ts:L15 | neighbors=[dashboardChartLazy.tsx, dashboardChartLoaders.ts]
- "components_dashboardoverview_kpioverview": "KpiOverview()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardOverview.tsx:L5 | neighbors=[DashboardOverview.tsx, DashboardPage.tsx]
- "components_dashboardpaneltoolbar_dashboardpaneltoolbar": "DashboardPanelToolbar()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPanelToolbar.tsx:L5 | neighbors=[DashboardPanelToolbar.tsx, DashboardPage.tsx]
- "components_dashboardprimitives_footerlink": "FooterLink()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L131 | neighbors=[DashboardPrimitives.tsx, DashboardTables.tsx]
- "components_dashboardprimitives_kpicard": "KpiCard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L92 | neighbors=[DashboardOverview.tsx, DashboardPrimitives.tsx]
- "components_dashboardprimitives_sectionheading": "SectionHeading()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L47 | neighbors=[DashboardPrimitives.tsx, DashboardPage.tsx]
- "components_dashboardtables_activityalertssection": "ActivityAlertsSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L305 | neighbors=[DashboardTables.tsx, DashboardPage.tsx]
- "components_dashboardtables_employeesection": "EmployeeSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L201 | neighbors=[DashboardTables.tsx, DashboardPage.tsx]
- "components_dashboardtables_inventorymanagementsection": "InventoryManagementSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L147 | neighbors=[DashboardTables.tsx, DashboardPage.tsx]
- "components_dashboardtables_productanalyticstables": "ProductAnalyticsTables()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L130 | neighbors=[DashboardTables.tsx, DashboardPage.tsx]
- "components_dashboardtables_taxsummarysection": "TaxSummarySection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L368 | neighbors=[DashboardTables.tsx, DashboardPage.tsx]
- "components_dashboardtabnav_dashboardtabnav": "DashboardTabNav()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTabNav.tsx:L12 | neighbors=[DashboardTabNav.tsx, DashboardPage.tsx]
- "components_daterangepicker_presetwithtime": "presetWithTime()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/DateRangePicker.tsx:L17 | neighbors=[DateRangePicker.tsx, withTimeDefaults()]
- "components_daterangepicker_withtimedefaults": "withTimeDefaults()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/DateRangePicker.tsx:L9 | neighbors=[DateRangePicker.tsx, presetWithTime()]
- "components_daterangepresets_shiftdays": "shiftDays()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L4 | neighbors=[dateRangePresets.ts, presetWeek()]
- "components_languageswitcher_currentlanguage": "currentLanguage()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L12 | neighbors=[LanguageSwitcher.tsx, LanguageSwitcher()]
- "components_languageswitcher_languagelabel": "languageLabel()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L16 | neighbors=[LanguageSwitcher.tsx, LanguageSwitcher()]
- "components_numpad_numpad": "NumPad()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NumPad.tsx:L9 | neighbors=[NumPad.tsx, PinModal.tsx]
- "components_productmanagermodals_productmanagermodals": "ProductManagerModals()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductManagerModals.tsx:L45 | neighbors=[ProductManagerModals.tsx, ProductsPage.tsx]
- "components_productspagefilters_productspagefilters": "ProductsPageFilters()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageFilters.tsx:L13 | neighbors=[ProductsPageFilters.tsx, ProductsPage.tsx]
- "components_productspagetoolbar_productspagetoolbar": "ProductsPageToolbar()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageToolbar.tsx:L17 | neighbors=[ProductsPageToolbar.tsx, ProductsPage.tsx]
- "components_ui_modal": "Modal()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L178 | neighbors=[PinModal.tsx, ui.tsx]
- "dashboard_dashboardalertseverity_notificationalertseverityclass": "notificationAlertSeverityClass()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSeverity.ts:L4 | neighbors=[NotificationsCenter.tsx, dashboardAlertSeverity.ts]
- "dashboard_dashboardalertseverity_panelalertseverityclass": "panelAlertSeverityClass()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSeverity.ts:L11 | neighbors=[DashboardTables.tsx, dashboardAlertSeverity.ts]
- "dashboard_dashboardtabs_dashboard_tabs": "DASHBOARD_TABS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardTabs.ts:L1 | neighbors=[DashboardTabNav.tsx, dashboardTabs.ts]
- "dashboard_usedashboard_usedashboard": "useDashboard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/useDashboard.ts:L7 | neighbors=[DashboardPage.tsx, useDashboard.ts]
- "db_columns_product_catalog_columns": "PRODUCT_CATALOG_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L3 | neighbors=[columns.ts, products.ts]
- "db_columns_product_catalog_write_columns": "PRODUCT_CATALOG_WRITE_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L23 | neighbors=[columns.ts, products.ts]
- "db_columns_product_catalog_write_columns_without_stock_provider": "PRODUCT_CATALOG_WRITE_COLUMNS_WITHOUT_STOCK_PROVIDER" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L27 | neighbors=[columns.ts, products.ts]
- "db_columns_product_columns": "PRODUCT_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L30 | neighbors=[columns.ts, products.ts]
- "db_columns_product_pos_columns": "PRODUCT_POS_COLUMNS" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L38 | neighbors=[columns.ts, products.ts]
- "db_columns_productcatalogwritecolumn": "ProductCatalogWriteColumn" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L21 | neighbors=[columns.ts, products.ts]
- "db_index_setdb": "setDb()" | kind=code-symbol | source=shelfPos/src/main/db/index.ts:L6 | neighbors=[index.ts, index.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-018.json

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
