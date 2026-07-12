# Node Description Batch 18 of 43

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

- "src_sync_supabasedelete": "supabaseDelete()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L68 | neighbors=[sync.ts, processEntry(), SupabaseHttpError]
- "src_sync_supabaseupsert": "supabaseUpsert()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L47 | neighbors=[sync.ts, processEntry(), SupabaseHttpError]
- "src_sync_syncstoreregistry": "syncStoreRegistry()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L173 | neighbors=[index.ts, sync.ts, SupabaseHttpError]
- "src_vite_env_d": "vite-env.d.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/vite-env.d.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ImportMeta, ImportMetaEnv]
- "sync_setup_syncsetuppage": "SyncSetupPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/sync-setup/SyncSetupPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, SyncSetupPage()]
- "tables_bypaymentreporttable": "ByPaymentReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/ByPaymentReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, ByPaymentReportTable()]
- "tables_inventoryreporttable": "InventoryReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/InventoryReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, InventoryReportTable()]
- "tables_summaryreporttable": "SummaryReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/SummaryReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, SummaryReportTable()]
- "tables_taxbreakdownreporttable": "TaxBreakdownReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/TaxBreakdownReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, TaxBreakdownReportTable()]
- "tables_topproductsreporttable": "TopProductsReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/TopProductsReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, TopProductsReportTable()]
- "activation_main_loadstatus": "loadStatus()" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L23 | neighbors=[main.ts, showFeedback()]
- "activation_main_showfeedback": "showFeedback()" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L17 | neighbors=[main.ts, loadStatus()]
- "admin_cierrediscrepancyalerts_cierrediscrepancybanner": "CierreDiscrepancyBanner()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L95 | neighbors=[CierreDiscrepancyAlerts.tsx, useCierreDiscrepancyAlerts()]
- "admin_cierrediscrepancyalerts_emitdismissedchange": "emitDismissedChange()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L13 | neighbors=[CierreDiscrepancyAlerts.tsx, dismissCierreIds()]
- "admin_pincardprintmodal_pincardprintmodal": "PinCardPrintModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PinCardPrintModal.tsx:L9 | neighbors=[PinCardPrintModal.tsx, SettingsForm.tsx]
- "admin_reportspage_parsereportsearch": "parseReportSearch()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L41 | neighbors=[ReportsPage.tsx, Reports()]
- "admin_reportspage_periodfromrange": "periodFromRange()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L76 | neighbors=[ReportsPage.tsx, reportSearchFromRange()]
- "admin_reportspage_reports": "Reports()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L99 | neighbors=[ReportsPage.tsx, parseReportSearch()]
- "admin_reportspage_reportsearchfromrange": "reportSearchFromRange()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L62 | neighbors=[ReportsPage.tsx, periodFromRange()]
- "admin_settingscloudpanel_cloudstatuskey": "cloudStatusKey()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsCloudPanel.tsx:L8 | neighbors=[SettingsCloudPanel.tsx, SettingsCloudPanel()]
- "admin_settingsdraft_draftfromsettings": "draftFromSettings()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L32 | neighbors=[settingsDraft.ts, SettingsForm.tsx]
- "admin_settingsform_pinformsreducer": "pinFormsReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L109 | neighbors=[SettingsForm.tsx, emptyPinFields()]
- "admin_settingssections_settingscajapinsection": "SettingsCajaPinSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L459 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingsemisorsection": "SettingsEmisorSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L90 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingsgeneralsection": "SettingsGeneralSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L48 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingspinsection": "SettingsPinSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L401 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingsshortcutssection": "SettingsShortcutsSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L206 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingstaxsection": "SettingsTaxSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L154 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_userformmodal_userformmodal": "UserFormModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L58 | neighbors=[UserFormModal.tsx, UsersPage.tsx]
- "admin_usersinitialsetupmodal_usersinitialsetupmodal": "UsersInitialSetupModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UsersInitialSetupModal.tsx:L9 | neighbors=[UsersInitialSetupModal.tsx, UsersPage.tsx]
- "auth_accountsstep_accountsstep": "AccountsStep()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/AccountsStep.tsx:L7 | neighbors=[AccountsStep.tsx, FirstRun.tsx]
- "auth_bootstrap": "Bootstrap.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/Bootstrap.tsx:L1 | neighbors=[Bootstrap(), 1bdbad7 Consolidate shelfPos, shelfDash…]
- "auth_chooselanguagepage": "ChooseLanguagePage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/ChooseLanguagePage.tsx:L1 | neighbors=[ChooseLanguagePage(), 1bdbad7 Consolidate shelfPos, shelfDash…]
- "auth_languagepicker_languagepicker": "LanguagePicker()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/LanguagePicker.tsx:L5 | neighbors=[FirstRun.tsx, LanguagePicker.tsx]
- "auth_login": "Login.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/Login.tsx:L1 | neighbors=[LoginPage(), 1bdbad7 Consolidate shelfPos, shelfDash…]
- "components_accountspinfields_accountspinfields": "AccountsPinFields()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AccountsPinFields.tsx:L13 | neighbors=[AccountsStep.tsx, AccountsPinFields.tsx]
- "components_adminaccountfields_adminaccountfields": "AdminAccountFields()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AdminAccountFields.tsx:L12 | neighbors=[AccountsStep.tsx, AdminAccountFields.tsx]
- "components_applogo": "AppLogo.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/AppLogo.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, AppLogo()]
- "components_dashboardchartlazy_lazydashboardhomecharts": "LazyDashboardHomeCharts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLazy.tsx:L12 | neighbors=[dashboardChartLazy.tsx, DashboardPage.tsx]
- "components_dashboardchartlazy_lazyinventoryhealthchart": "LazyInventoryHealthChart()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLazy.tsx:L48 | neighbors=[dashboardChartLazy.tsx, DashboardPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-017.json

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
