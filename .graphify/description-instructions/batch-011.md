# Node Description Batch 12 of 42

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "src_db_readstoreid": "readStoreId()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L24 | neighbors=[db.ts, readStoreDisplayName(), readSetting(), index.ts] | lang=en
- "src_errorlog_appendsyncerrorlog": "appendSyncErrorLog()" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L18 | neighbors=[errorLog.ts, syncErrorLogFile(), logSyncQueueFailure(), logSyncServiceError()] | lang=en
- "src_errorlog_logsyncserviceerror": "logSyncServiceError()" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L46 | neighbors=[errorLog.ts, appendSyncErrorLog(), index.ts, sync.ts] | lang=en
- "src_sync_claimstoreifneeded": "claimStoreIfNeeded()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L211 | neighbors=[index.ts, sync.ts, checkConnectivity(), storeHasDashboardAccess()] | lang=en
- "admin_admincashpage": "AdminCashPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AdminCashPage.tsx:L1 | neighbors=[AdminCash(), AdminCashPage(), 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "admin_cierrediscrepancyalerts_cierrediscrepancyalerts": "CierreDiscrepancyAlerts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L115 | neighbors=[CierreDiscrepancyAlerts.tsx, useCierreDiscrepancyAlerts(), CierrePage.tsx] | lang=en
- "admin_cierrediscrepancyalerts_dismisscierreids": "dismissCierreIds()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L38 | neighbors=[CierreDiscrepancyAlerts.tsx, emitDismissedChange(), readDismissedIds()] | lang=en
- "admin_cierrediscrepancyalerts_readdismissedids": "readDismissedIds()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L22 | neighbors=[CierreDiscrepancyAlerts.tsx, dismissCierreIds(), useDismissedCierreIds()] | lang=en
- "admin_cierrediscrepancyalerts_usedismissedcierreids": "useDismissedCierreIds()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L46 | neighbors=[CierreDiscrepancyAlerts.tsx, useCierreDiscrepancyAlerts(), readDismissedIds()] | lang=en
- "admin_printqueuepage": "PrintQueuePage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PrintQueuePage.tsx:L1 | neighbors=[PrintQueue(), PrintQueuePage(), 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "admin_settingscloudpanel_settingscloudpanel": "SettingsCloudPanel()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsCloudPanel.tsx:L26 | neighbors=[SettingsCloudPanel.tsx, cloudStatusKey(), SettingsPage.tsx] | lang=en
- "admin_settingsdraft_emisordraftdirty": "emisorDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L102 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx] | lang=en
- "admin_settingsdraft_generaldraftdirty": "generalDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L98 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx] | lang=en
- "admin_settingsdraft_settingsdraft": "SettingsDraft" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L3 | neighbors=[settingsDraft.ts, SettingsForm.tsx, SettingsSections.tsx] | lang=en
- "admin_settingsdraft_shortcutsdraftdirty": "shortcutsDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L110 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx] | lang=en
- "admin_settingsdraft_taxdraftdirty": "taxDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L106 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx] | lang=en
- "admin_settingsform_emptypinfields": "emptyPinFields()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L98 | neighbors=[SettingsForm.tsx, pinFormsReducer(), SettingsForm()] | lang=en
- "admin_settingsform_settingsform": "SettingsForm()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L127 | neighbors=[SettingsForm.tsx, emptyPinFields(), SettingsPage.tsx] | lang=en
- "admin_usersinitialsetupmodal": "UsersInitialSetupModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UsersInitialSetupModal.tsx:L1 | neighbors=[UsersInitialSetupModal(), UsersPage.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "auth_languagepicker": "LanguagePicker.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/LanguagePicker.tsx:L1 | neighbors=[FirstRun.tsx, LanguagePicker(), 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@0d0d88f5c6d806b32661ac39ca303da8c9460cb3": "0d0d88f Remove split-out repository entries from .gitignore" | kind=Commit | source=git | neighbors=[Separation, 1bdbad7 Consolidate shelfPos, shelfDash…, 14a2364 Split monorepo into independent…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@14a236405498baf91b313756215e541de2010194": "14a2364 Split monorepo into independent repos: shelfPos, shelfDashboard, shelfD…" | kind=Commit | source=git | neighbors=[Separation, 0d0d88f Remove split-out repository ent…, f311327 updated PDF and fixed bug. (STI…] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@5b432e4b311e8a610102a334319dce591cc46185": "5b432e4 Add documentation consistency audit and findings for shelfDocs" | kind=Commit | source=git | neighbors=[Separation, 6901179 fixed some bugs., 8c9e4fc Add raw output files for ESLint…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@690117903095e55a5a6486078a84d5010b3dcc26": "6901179 fixed some bugs." | kind=Commit | source=git | neighbors=[5b432e4 Add documentation consistency a…, Separation, e729c74 its just POS now.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@8c9e4fc8102429ca996ea31fe4c72c092c46247a": "8c9e4fc Add raw output files for ESLint, Knip, npm audit, React Doctor, and Typ…" | kind=Commit | source=git | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, Separation, 5b432e4 Add documentation consistency a…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@e66527e21353f5bdba58848e545c0cee43ba4ede": "e66527e needed, react DOCTOR" | kind=Commit | source=git | neighbors=[Separation, dev, c044586 fixed codebase and added cierre…] | lang=en
- "components_dashboardpaneltoolbar": "DashboardPanelToolbar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPanelToolbar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardPanelToolbar(), DashboardPage.tsx] | lang=en
- "components_daterangepresets_presetmonth": "presetMonth()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L22 | neighbors=[DateRangePicker.tsx, dateRangePresets.ts, rangeForReportPeriod()] | lang=en
- "components_daterangepresets_presettoday": "presetToday()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L11 | neighbors=[DateRangePicker.tsx, dateRangePresets.ts, rangeForReportPeriod()] | lang=en
- "components_moneyinput": "MoneyInput.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/MoneyInput.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, MoneyInput(), MoneyInputProps] | lang=en
- "components_paymentmethodspiechart_paymentmethodspiechart": "PaymentMethodsPieChart()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/PaymentMethodsPieChart.tsx:L7 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx] | lang=en
- "components_ui_button": "Button()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L58 | neighbors=[DateRangePicker.tsx, PinModal.tsx, ui.tsx] | lang=en
- "components_ui_input": "Input()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L83 | neighbors=[DateRangePicker.tsx, PinModal.tsx, ui.tsx] | lang=en
- "dashboard_dashboardalertsearch_dashboardalertproductsearch": "dashboardAlertProductSearch()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSearch.ts:L4 | neighbors=[DashboardTables.tsx, NotificationsCenter.tsx, dashboardAlertSearch.ts] | lang=en
- "dashboard_dashboardtabs_dashboardtab": "DashboardTab" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardTabs.ts:L3 | neighbors=[DashboardTabNav.tsx, DashboardPage.tsx, dashboardTabs.ts] | lang=en
- "dashboard_usedashboard": "useDashboard.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/useDashboard.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardPage.tsx, useDashboard()] | lang=en
- "db_migrations_getdbversion": "getDbVersion()" | kind=code-symbol | source=shelfPos/src/main/db/migrations.ts:L541 | neighbors=[migrations.ts, runMigrations(), index.ts] | lang=en
- "db_migrations_runmigrations": "runMigrations()" | kind=code-symbol | source=shelfPos/src/main/db/migrations.ts:L546 | neighbors=[migrations.ts, getDbVersion(), index.ts] | lang=en
- "hooks_useaccountsstep": "useAccountsStep.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/hooks/useAccountsStep.ts:L1 | neighbors=[AccountsStep.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, useAccountsStep()] | lang=en
- "ipc_authorize_authorizewithdiscountpin": "authorizeWithDiscountPin()" | kind=code-symbol | source=shelfPos/src/main/ipc/authorize.ts:L7 | neighbors=[authorize.ts, discount.ts, priceOverride.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-011.json

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
