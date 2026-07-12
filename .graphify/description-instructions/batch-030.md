# Node Description Batch 31 of 43

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

- "admin_settingssections_settingssaverow": "SettingsSaveRow()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L27 | neighbors=[SettingsSections.tsx]
- "admin_settingssections_shortcut_options": "SHORTCUT_OPTIONS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L12 | neighbors=[SettingsSections.tsx]
- "admin_userformmodal_formaction": "FormAction" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L21 | neighbors=[UserFormModal.tsx]
- "admin_userformmodal_formreducer": "formReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L29 | neighbors=[UserFormModal.tsx]
- "admin_userformmodal_formstate": "FormState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L12 | neighbors=[UserFormModal.tsx]
- "admin_userformmodal_initialformstate": "initialFormState()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L46 | neighbors=[UserFormModal.tsx]
- "admin_userformmodal_usermodalstate": "UserModalState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L10 | neighbors=[UserFormModal.tsx]
- "admin_userspage_usermodalstate": "UserModalState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UsersPage.tsx:L15 | neighbors=[UsersPage.tsx]
- "admin_userspage_users": "Users()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UsersPage.tsx:L28 | neighbors=[UsersPage.tsx]
- "admin_userspage_userspage": "UsersPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UsersPage.tsx:L20 | neighbors=[UsersPage.tsx]
- "auth_bootstrap_bootstrap": "Bootstrap()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/Bootstrap.tsx:L8 | neighbors=[Bootstrap.tsx]
- "auth_chooselanguagepage_chooselanguagepage": "ChooseLanguagePage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/ChooseLanguagePage.tsx:L4 | neighbors=[ChooseLanguagePage.tsx]
- "auth_firstrun_firstrunwizard": "FirstRunWizard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/FirstRun.tsx:L12 | neighbors=[FirstRun.tsx]
- "auth_firstrun_step": "Step" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/FirstRun.tsx:L10 | neighbors=[FirstRun.tsx]
- "auth_firstrun_types_accountdraft": "AccountDraft" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L3 | neighbors=[firstRun.types.ts]
- "auth_firstrun_types_empty_account_draft": "EMPTY_ACCOUNT_DRAFT" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L9 | neighbors=[firstRun.types.ts]
- "auth_firstrun_types_empty_pin_fields": "EMPTY_PIN_FIELDS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L16 | neighbors=[firstRun.types.ts]
- "auth_firstrun_types_empty_validation": "EMPTY_VALIDATION" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L24 | neighbors=[firstRun.types.ts]
- "auth_firstrun_types_managed_roles": "MANAGED_ROLES" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L30 | neighbors=[firstRun.types.ts]
- "auth_firstrun_types_pinfieldsstate": "PinFieldsState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L11 | neighbors=[firstRun.types.ts]
- "auth_firstrun_types_validationstate": "ValidationState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L18 | neighbors=[firstRun.types.ts]
- "auth_login_loginpage": "LoginPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/Login.tsx:L11 | neighbors=[Login.tsx]
- "components_accountspinfields_accountspinfieldsprops": "AccountsPinFieldsProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AccountsPinFields.tsx:L5 | neighbors=[AccountsPinFields.tsx]
- "components_adminaccountfields_adminaccountfieldsprops": "AdminAccountFieldsProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AdminAccountFields.tsx:L5 | neighbors=[AdminAccountFields.tsx]
- "components_applogo_applogo": "AppLogo()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/AppLogo.tsx:L3 | neighbors=[AppLogo.tsx]
- "components_dashboardcharts_chart_colors": "CHART_COLORS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardCharts.tsx:L9 | neighbors=[DashboardCharts.tsx]
- "components_dashboardcharts_inventoryhealthchart": "InventoryHealthChart()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardCharts.tsx:L212 | neighbors=[DashboardCharts.tsx]
- "components_dashboardcharts_moneytick": "moneyTick()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardCharts.tsx:L11 | neighbors=[DashboardCharts.tsx]
- "components_dashboardcharts_productanalyticscharts": "ProductAnalyticsCharts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardCharts.tsx:L140 | neighbors=[DashboardCharts.tsx]
- "components_dashboardcharts_salesanalyticssection": "SalesAnalyticsSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardCharts.tsx:L15 | neighbors=[DashboardCharts.tsx]
- "components_dashboardcharts_stockmovementchart": "StockMovementChart()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardCharts.tsx:L176 | neighbors=[DashboardCharts.tsx]
- "components_dashboardhomecharts_dashboardhomecharts": "DashboardHomeCharts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardHomeCharts.tsx:L13 | neighbors=[DashboardHomeCharts.tsx]
- "components_dashboardhomecharts_moneytick": "moneyTick()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardHomeCharts.tsx:L9 | neighbors=[DashboardHomeCharts.tsx]
- "components_dashboardprimitives_trendbadge": "TrendBadge()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L62 | neighbors=[DashboardPrimitives.tsx]
- "components_dashboardtables_inventoryproducttable": "InventoryProductTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L78 | neighbors=[DashboardTables.tsx]
- "components_dashboardtables_productperformancetable": "ProductPerformanceTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L31 | neighbors=[DashboardTables.tsx]
- "components_dashboardtables_statusbadge": "StatusBadge()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTables.tsx:L15 | neighbors=[DashboardTables.tsx]
- "components_dashboardtabnav_tab_label_keys": "TAB_LABEL_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardTabNav.tsx:L5 | neighbors=[DashboardTabNav.tsx]
- "components_daterangepicker_daterangepicker": "DateRangePicker()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/DateRangePicker.tsx:L21 | neighbors=[DateRangePicker.tsx]
- "components_languageswitcher_languages": "LANGUAGES" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L10 | neighbors=[LanguageSwitcher.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-030.json

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
