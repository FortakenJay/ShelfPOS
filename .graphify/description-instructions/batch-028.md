# Node Description Batch 29 of 42

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

- "admin_auditlogpage_auditlogaction": "AuditLogAction" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L39 | neighbors=[AuditLogPage.tsx]
- "admin_auditlogpage_auditlogpage": "AuditLogPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L72 | neighbors=[AuditLogPage.tsx]
- "admin_auditlogpage_auditlogreducer": "auditLogReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L47 | neighbors=[AuditLogPage.tsx]
- "admin_auditlogpage_auditlogstate": "AuditLogState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L30 | neighbors=[AuditLogPage.tsx]
- "admin_auditlogpage_formatauditdetail": "formatAuditDetail()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L12 | neighbors=[AuditLogPage.tsx]
- "admin_auditlogpage_page_size_options": "PAGE_SIZE_OPTIONS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L27 | neighbors=[AuditLogPage.tsx]
- "admin_cierrediscrepancyalerts_alertmessage": "alertMessage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L71 | neighbors=[CierreDiscrepancyAlerts.tsx]
- "admin_cierrediscrepancyalerts_dismissbutton": "DismissButton()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L82 | neighbors=[CierreDiscrepancyAlerts.tsx]
- "admin_cierrediscrepancyalerts_dismissedlisteners": "dismissedListeners" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L11 | neighbors=[CierreDiscrepancyAlerts.tsx]
- "admin_cierrediscrepancyalerts_dismissedsnapshot": "dismissedSnapshot()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L34 | neighbors=[CierreDiscrepancyAlerts.tsx]
- "admin_cierrediscrepancyalerts_subscribedismissed": "subscribeDismissed()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L17 | neighbors=[CierreDiscrepancyAlerts.tsx]
- "admin_cierrepage_admincierresummary": "AdminCierreSummary()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L262 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierre": "Cierre()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L34 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierrediscardedtabs": "CierreDiscardedTabs()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L528 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierrediscounts": "CierreDiscounts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L362 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierrehistory": "CierreHistory()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L588 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierrepage": "CierrePage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L26 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierrepriceoverrides": "CierrePriceOverrides()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L446 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierrereconciliation": "CierreReconciliation()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L319 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_cierrestep": "CierreStep" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L24 | neighbors=[CierrePage.tsx]
- "admin_cierrepage_summarycell": "SummaryCell()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierrePage.tsx:L693 | neighbors=[CierrePage.tsx]
- "admin_exportpage_exportbackup": "ExportBackup()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ExportPage.tsx:L30 | neighbors=[ExportPage.tsx]
- "admin_exportpage_exportpage": "ExportPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ExportPage.tsx:L13 | neighbors=[ExportPage.tsx]
- "admin_exportpage_inforow": "InfoRow()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ExportPage.tsx:L21 | neighbors=[ExportPage.tsx]
- "admin_pincardprintmodal_normalizepin": "normalizePin()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PinCardPrintModal.tsx:L5 | neighbors=[PinCardPrintModal.tsx]
- "admin_printqueuepage_printqueue": "PrintQueue()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PrintQueuePage.tsx:L22 | neighbors=[PrintQueuePage.tsx]
- "admin_printqueuepage_printqueuepage": "PrintQueuePage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PrintQueuePage.tsx:L14 | neighbors=[PrintQueuePage.tsx]
- "admin_reportspage_period_presets": "PERIOD_PRESETS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L26 | neighbors=[ReportsPage.tsx]
- "admin_reportspage_report_types": "REPORT_TYPES" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L16 | neighbors=[ReportsPage.tsx]
- "admin_reportspage_reportsearch": "ReportSearch" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L28 | neighbors=[ReportsPage.tsx]
- "admin_reportspage_reportspage": "ReportsPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ReportsPage.tsx:L90 | neighbors=[ReportsPage.tsx]
- "admin_settingsdraft_emisor_keys": "EMISOR_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L64 | neighbors=[settingsDraft.ts]
- "admin_settingsdraft_general_keys": "GENERAL_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L63 | neighbors=[settingsDraft.ts]
- "admin_settingsdraft_shortcut_keys": "SHORTCUT_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L78 | neighbors=[settingsDraft.ts]
- "admin_settingsdraft_tax_keys": "TAX_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L77 | neighbors=[settingsDraft.ts]
- "admin_settingsform_commitsaveddraft": "commitSavedDraft()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L28 | neighbors=[SettingsForm.tsx]
- "admin_settingsform_pinfields": "PinFields" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L89 | neighbors=[SettingsForm.tsx]
- "admin_settingsform_pinformsaction": "PinFormsAction" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L100 | neighbors=[SettingsForm.tsx]
- "admin_settingsform_pinformsstate": "PinFormsState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsForm.tsx:L91 | neighbors=[SettingsForm.tsx]
- "admin_settingspage_settings": "Settings()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsPage.tsx:L17 | neighbors=[SettingsPage.tsx]

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
