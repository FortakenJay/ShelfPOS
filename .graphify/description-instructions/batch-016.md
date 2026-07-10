# Node Description Batch 17 of 42

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

- "shared_types_supplierinvoicepreview": "SupplierInvoicePreview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L215 | neighbors=[products.ts, productSupplierInvoicePdf.ts, types.ts]
- "shared_types_supplierinvoiceresult": "SupplierInvoiceResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L248 | neighbors=[products.ts, productSupplierInvoicePdf.ts, types.ts]
- "shared_types_taxbreakdownreport": "TaxBreakdownReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L472 | neighbors=[dashboard.ts, reports.ts, types.ts]
- "shared_types_taxbreakdownrow": "TaxBreakdownRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L464 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_taxregime": "TaxRegime" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L43 | neighbors=[settings.ts, printTemplates.ts, types.ts]
- "shared_types_topproductrow": "TopProductRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L435 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "shared_types_transactionlogreport": "TransactionLogReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L497 | neighbors=[reports.ts, printTemplates.ts, types.ts]
- "src_db_applypendingsyncstoreid": "applyPendingSyncStoreId()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L64 | neighbors=[db.ts, readSetting(), openDatabase()]
- "src_db_markerror": "markError()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L206 | neighbors=[db.ts, isTransientSyncError(), sync.ts]
- "src_db_opendatabase": "openDatabase()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L87 | neighbors=[db.ts, applyPendingSyncStoreId(), index.ts]
- "src_db_readposlastseenat": "readPosLastSeenAt()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L38 | neighbors=[db.ts, readSetting(), index.ts]
- "src_db_readstockthresholddefault": "readStockThresholdDefault()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L43 | neighbors=[db.ts, readSetting(), index.ts]
- "src_errorlog_logsyncqueuefailure": "logSyncQueueFailure()" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L29 | neighbors=[errorLog.ts, appendSyncErrorLog(), sync.ts]
- "src_main": "main.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/main.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, bootstrap(), queryClient]
- "src_sync_checkconnectivity": "checkConnectivity()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L21 | neighbors=[index.ts, sync.ts, claimStoreIfNeeded()]
- "src_vite_env_d": "vite-env.d.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/vite-env.d.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ImportMeta, ImportMetaEnv]
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
- "admin_reportspage_parsereportsearch": "parseReportSearch()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L40 | neighbors=[ReportsPage.tsx, Reports()]
- "admin_reportspage_periodfromrange": "periodFromRange()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L75 | neighbors=[ReportsPage.tsx, reportSearchFromRange()]
- "admin_reportspage_reports": "Reports()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L98 | neighbors=[ReportsPage.tsx, parseReportSearch()]
- "admin_reportspage_reportsearchfromrange": "reportSearchFromRange()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L61 | neighbors=[ReportsPage.tsx, periodFromRange()]
- "admin_settingscloudpanel_cloudstatuskey": "cloudStatusKey()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsCloudPanel.tsx:L8 | neighbors=[SettingsCloudPanel.tsx, SettingsCloudPanel()]
- "admin_settingsdraft_draftfromsettings": "draftFromSettings()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L32 | neighbors=[settingsDraft.ts, SettingsForm.tsx]
- "admin_settingsform_pinformsreducer": "pinFormsReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L108 | neighbors=[SettingsForm.tsx, emptyPinFields()]
- "admin_settingssections_settingscajapinsection": "SettingsCajaPinSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L459 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingsemisorsection": "SettingsEmisorSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L90 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingsgeneralsection": "SettingsGeneralSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L48 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingspinsection": "SettingsPinSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L401 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingsshortcutssection": "SettingsShortcutsSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L206 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingssections_settingstaxsection": "SettingsTaxSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsSections.tsx:L154 | neighbors=[SettingsForm.tsx, SettingsSections.tsx]
- "admin_userformmodal_userformmodal": "UserFormModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L58 | neighbors=[UserFormModal.tsx, UsersPage.tsx]

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
