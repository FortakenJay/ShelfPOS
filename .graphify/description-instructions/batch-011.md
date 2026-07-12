# Node Description Batch 12 of 43

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "services_productsupplierinvoicepdf_extracttrailingnumbers": "extractTrailingNumbers()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L54 | neighbors=[productSupplierInvoicePdf.ts, requireSupplierAmount(), parseSupplierInvoiceText(), parseMoney()]
- "services_shelflabellines_buildshelflabellines": "buildShelfLabelLines()" | kind=code-symbol | source=shelfPos/src/main/services/shelfLabelLines.ts:L12 | neighbors=[print-test-crc.ts, printer.ts, printTemplates.ts, shelfLabelLines.ts]
- "services_syncconfig_issyncserviceinstalled": "isSyncServiceInstalled()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L66 | neighbors=[syncConfig.ts, querySyncServiceRunning(), readSyncSetupStatus(), restartSyncServiceIfInstalled()]
- "services_syncconfig_restartsyncserviceifinstalled": "restartSyncServiceIfInstalled()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L150 | neighbors=[syncSetup.ts, syncConfig.ts, restartSyncService(), isSyncServiceInstalled()]
- "shared_carttabsnapshot_carttabsnapshottotal": "cartTabSnapshotTotal()" | kind=code-symbol | source=shelfPos/src/shared/cartTabSnapshot.ts:L32 | neighbors=[cartTabs.ts, cartTabs.ts, cartTabSnapshot.ts, parseCartTabSnapshotJson()]
- "shared_money_parsemachinenumber": "parseMachineNumber()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L22 | neighbors=[productCsvImport.ts, productEfacturaImport.ts, money.ts, parseSupplierAmount()]
- "shared_money_parsesupplieramount": "parseSupplierAmount()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L29 | neighbors=[productSupplierInvoicePdf.ts, money.ts, parseMachineNumber(), roundColones()]
- "shared_pendingstoreid": "pendingStoreId.ts" | kind=code-symbol | source=shelfPos/src/shared/pendingStoreId.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, pendingStoreId.ts, parsePendingStoreIdFileContent(), shouldApplyPendingStoreId()]
- "shared_pricing_catalogunitprice": "catalogUnitPrice()" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L48 | neighbors=[priceOverride.ts, sales.ts, pricing.ts, lineUnitPrice()]
- "shared_pricing_iscustompriceoverride": "isCustomPriceOverride()" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L35 | neighbors=[priceOverride.ts, sales.ts, pricing.ts, moneyEquals()]
- "shared_pricing_linegross": "lineGross()" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L65 | neighbors=[cartTabSnapshot.ts, pricing.ts, lineUnitPrice(), lineTotal()]
- "shared_types_appsettings": "AppSettings" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L57 | neighbors=[settings.ts, settings.ts, printTemplates.ts, types.ts]
- "shared_types_cashdrawerstatus": "CashDrawerStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1133 | neighbors=[cash.ts, cash.ts, types.ts, CashSummary]
- "shared_types_payment_methods": "PAYMENT_METHODS" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L2 | neighbors=[sales.ts, primitives.ts, csvColumns.ts, types.ts]
- "shared_types_paymentmethodreport": "PaymentMethodReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L435 | neighbors=[dashboard.ts, reports.ts, printTemplates.ts, types.ts]
- "shared_types_printpayload": "PrintPayload" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1191 | neighbors=[printJobs.ts, labelPrintLines.ts, printer.ts, types.ts]
- "shared_types_productinput": "ProductInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L113 | neighbors=[products.ts, products.ts, productCsvImport.ts, types.ts]
- "shared_types_taxcategory": "TaxCategory" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L45 | neighbors=[sales.ts, reports.ts, settings.ts, types.ts]
- "shell_usesidebarcollapsed": "useSidebarCollapsed.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, readCollapsed(), useSidebarCollapsed(), writeCollapsed()]
- "src_config_syncconfig": "SyncConfig" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L8 | neighbors=[config.ts, db.ts, index.ts, sync.ts]
- "src_db_readstoredisplayname": "readStoreDisplayName()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L41 | neighbors=[db.ts, readSetting(), readStoreId(), index.ts]
- "src_db_readstoreid": "readStoreId()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L31 | neighbors=[db.ts, readStoreDisplayName(), readSetting(), index.ts]
- "src_errorlog_appendsyncerrorlog": "appendSyncErrorLog()" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L18 | neighbors=[errorLog.ts, syncErrorLogFile(), logSyncQueueFailure(), logSyncServiceError()]
- "src_errorlog_logsyncserviceerror": "logSyncServiceError()" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L46 | neighbors=[errorLog.ts, appendSyncErrorLog(), index.ts, sync.ts]
- "admin_admincashpage": "AdminCashPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AdminCashPage.tsx:L1 | neighbors=[AdminCash(), AdminCashPage(), 1bdbad7 Consolidate shelfPos, shelfDash…]
- "admin_cierrediscrepancyalerts_cierrediscrepancyalerts": "CierreDiscrepancyAlerts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L115 | neighbors=[CierreDiscrepancyAlerts.tsx, useCierreDiscrepancyAlerts(), CierrePage.tsx]
- "admin_cierrediscrepancyalerts_dismisscierreids": "dismissCierreIds()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L38 | neighbors=[CierreDiscrepancyAlerts.tsx, emitDismissedChange(), readDismissedIds()]
- "admin_cierrediscrepancyalerts_readdismissedids": "readDismissedIds()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L22 | neighbors=[CierreDiscrepancyAlerts.tsx, dismissCierreIds(), useDismissedCierreIds()]
- "admin_cierrediscrepancyalerts_usedismissedcierreids": "useDismissedCierreIds()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L46 | neighbors=[CierreDiscrepancyAlerts.tsx, useCierreDiscrepancyAlerts(), readDismissedIds()]
- "admin_settingscloudpanel_settingscloudpanel": "SettingsCloudPanel()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsCloudPanel.tsx:L26 | neighbors=[SettingsCloudPanel.tsx, cloudStatusKey(), SettingsPage.tsx]
- "admin_settingsdraft_emisordraftdirty": "emisorDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L102 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx]
- "admin_settingsdraft_generaldraftdirty": "generalDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L98 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx]
- "admin_settingsdraft_settingsdraft": "SettingsDraft" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L3 | neighbors=[settingsDraft.ts, SettingsForm.tsx, SettingsSections.tsx]
- "admin_settingsdraft_shortcutsdraftdirty": "shortcutsDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L110 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx]
- "admin_settingsdraft_taxdraftdirty": "taxDraftDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L106 | neighbors=[settingsDraft.ts, sectionDirty(), SettingsForm.tsx]
- "admin_settingsform_emptypinfields": "emptyPinFields()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L99 | neighbors=[SettingsForm.tsx, pinFormsReducer(), SettingsForm()]
- "admin_settingsform_settingsform": "SettingsForm()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L128 | neighbors=[SettingsForm.tsx, emptyPinFields(), SettingsPage.tsx]
- "admin_usersinitialsetupmodal": "UsersInitialSetupModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UsersInitialSetupModal.tsx:L1 | neighbors=[UsersInitialSetupModal(), UsersPage.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…]
- "auth_languagepicker": "LanguagePicker.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/LanguagePicker.tsx:L1 | neighbors=[FirstRun.tsx, LanguagePicker(), 1bdbad7 Consolidate shelfPos, shelfDash…]
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@0d0d88f5c6d806b32661ac39ca303da8c9460cb3": "0d0d88f Remove split-out repository entries from .gitignore" | kind=Commit | source=git | neighbors=[Separation, 1bdbad7 Consolidate shelfPos, shelfDash…, 14a2364 Split monorepo into independent…]

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
