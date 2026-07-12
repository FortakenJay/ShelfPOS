# Node Description Batch 29 of 43

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

- "shared_types_syncsetupsaveinput": "SyncSetupSaveInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L906 | neighbors=[syncSetup.ts, types.ts]
- "shared_types_syncsetupstatus": "SyncSetupStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L894 | neighbors=[syncSetup.ts, types.ts]
- "shared_types_usercreateinput": "UserCreateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L985 | neighbors=[users.ts, types.ts]
- "shared_types_userupdateinput": "UserUpdateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L991 | neighbors=[users.ts, types.ts]
- "src_config_defaultsyncconfigpath": "defaultSyncConfigPath()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L16 | neighbors=[config.ts, loadConfigFile()]
- "src_config_loadenvfile": "loadEnvFile()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L28 | neighbors=[config.ts, loadConfigFile()]
- "src_config_localsyncconfigpath": "localSyncConfigPath()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L22 | neighbors=[config.ts, loadConfigFile()]
- "src_config_readsecretkeyenv": "readSecretKeyEnv()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L46 | neighbors=[config.ts, loadConfig()]
- "src_config_resolvesecretkey": "resolveSecretKey()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L50 | neighbors=[config.ts, loadConfig()]
- "src_db_clearsyncownerclaimed": "clearSyncOwnerClaimed()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L71 | neighbors=[db.ts, sync.ts]
- "src_db_enqueueallposusersbackfill": "enqueueAllPosUsersBackfill()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L217 | neighbors=[db.ts, index.ts]
- "src_db_getliverow": "getLiveRow()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L124 | neighbors=[db.ts, sync.ts]
- "src_db_istransientsyncerror": "isTransientSyncError()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L171 | neighbors=[db.ts, markError()]
- "src_db_listpendingqueue": "listPendingQueue()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L135 | neighbors=[db.ts, index.ts]
- "src_db_marksynced": "markSynced()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L159 | neighbors=[db.ts, sync.ts]
- "src_db_syncdbcontext": "SyncDbContext" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L244 | neighbors=[db.ts, sync.ts]
- "src_db_syncqueuerow": "SyncQueueRow" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L112 | neighbors=[db.ts, sync.ts]
- "src_db_synctablename": "SyncTableName" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L110 | neighbors=[db.ts, sync.ts]
- "src_db_writesyncownerclaimed": "writeSyncOwnerClaimed()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L64 | neighbors=[db.ts, sync.ts]
- "src_dpapi_win": "dpapi-win.ts" | kind=code-symbol | source=shelfPos/sync-service/src/dpapi-win.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, config.ts]
- "src_errorlog_syncerrorlogfile": "syncErrorLogFile()" | kind=code-symbol | source=shelfPos/sync-service/src/errorLog.ts:L10 | neighbors=[errorLog.ts, appendSyncErrorLog()]
- "src_parseenv": "parseEnv.ts" | kind=code-symbol | source=shelfPos/sync-service/src/parseEnv.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, config.ts]
- "src_sync_sanitizemirrorrow": "sanitizeMirrorRow()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L98 | neighbors=[sync.ts, processEntry()]
- "tables_bypaymentreporttable_bypaymentreporttable": "ByPaymentReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/ByPaymentReportTable.tsx:L6 | neighbors=[ReportTable.tsx, ByPaymentReportTable.tsx]
- "tables_inventoryreporttable_inventoryreporttable": "InventoryReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/InventoryReportTable.tsx:L6 | neighbors=[ReportTable.tsx, InventoryReportTable.tsx]
- "tables_itemizedsalesreporttable_itemizedsalesreporttable": "ItemizedSalesReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/ItemizedSalesReportTable.tsx:L7 | neighbors=[ReportTable.tsx, ItemizedSalesReportTable.tsx]
- "tables_summaryreporttable_summaryreporttable": "SummaryReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/SummaryReportTable.tsx:L6 | neighbors=[ReportTable.tsx, SummaryReportTable.tsx]
- "tables_taxbreakdownreporttable_taxbreakdownreporttable": "TaxBreakdownReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/TaxBreakdownReportTable.tsx:L6 | neighbors=[ReportTable.tsx, TaxBreakdownReportTable.tsx]
- "tables_topproductsreporttable_topproductsreporttable": "TopProductsReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/TopProductsReportTable.tsx:L6 | neighbors=[ReportTable.tsx, TopProductsReportTable.tsx]
- "tables_transactionlogreporttable_transactionlogreporttable": "TransactionLogReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/TransactionLogReportTable.tsx:L7 | neighbors=[ReportTable.tsx, TransactionLogReportTable.tsx]
- "activation_main_activatebtn": "activateBtn" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L15 | neighbors=[main.ts]
- "activation_main_error_messages": "ERROR_MESSAGES" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L3 | neighbors=[main.ts]
- "activation_main_feedback": "feedback" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L14 | neighbors=[main.ts]
- "activation_main_licenseinput": "licenseInput" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L13 | neighbors=[main.ts]
- "activation_main_machineinput": "machineInput" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L12 | neighbors=[main.ts]
- "admin_admincashpage_admincash": "AdminCash()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AdminCashPage.tsx:L19 | neighbors=[AdminCashPage.tsx]
- "admin_admincashpage_admincashpage": "AdminCashPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AdminCashPage.tsx:L11 | neighbors=[AdminCashPage.tsx]
- "admin_auditlogpage_auditlog": "AuditLog()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L80 | neighbors=[AuditLogPage.tsx]
- "admin_auditlogpage_auditlogaction": "AuditLogAction" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L39 | neighbors=[AuditLogPage.tsx]
- "admin_auditlogpage_auditlogpage": "AuditLogPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L72 | neighbors=[AuditLogPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-028.json

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
