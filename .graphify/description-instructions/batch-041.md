# Node Description Batch 42 of 43

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

- "shared_types_customerdetail": "CustomerDetail" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1065 | neighbors=[types.ts]
- "shared_types_customerlistinput": "CustomerListInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1011 | neighbors=[types.ts]
- "shared_types_customerpurchaseitem": "CustomerPurchaseItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1043 | neighbors=[types.ts]
- "shared_types_customerrow": "CustomerRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L999 | neighbors=[types.ts]
- "shared_types_dashboardactivitykind": "DashboardActivityKind" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L660 | neighbors=[types.ts]
- "shared_types_dashboardalertkind": "DashboardAlertKind" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L678 | neighbors=[types.ts]
- "shared_types_dashboardkpis": "DashboardKpis" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L561 | neighbors=[types.ts]
- "shared_types_itemizedsaleslinerow": "ItemizedSalesLineRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L515 | neighbors=[types.ts]
- "shared_types_itemizedsalessalerow": "ItemizedSalesSaleRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L525 | neighbors=[types.ts]
- "shared_types_pendingcreditcustomersummary": "PendingCreditCustomerSummary" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1070 | neighbors=[types.ts]
- "shared_types_reportperiodpreset": "ReportPeriodPreset" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L42 | neighbors=[types.ts]
- "shared_types_saleitemdetail": "SaleItemDetail" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L360 | neighbors=[types.ts]
- "shared_types_salepaymentinput": "SalePaymentInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L278 | neighbors=[types.ts]
- "shared_types_stockstatus": "StockStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L7 | neighbors=[types.ts]
- "shared_types_supplierinvoicenewiteminput": "SupplierInvoiceNewItemInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L233 | neighbors=[types.ts]
- "shared_types_supplierinvoicenewrow": "SupplierInvoiceNewRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L213 | neighbors=[types.ts]
- "shared_types_supplierinvoicerestockinput": "SupplierInvoiceRestockInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L243 | neighbors=[types.ts]
- "shared_types_supplierinvoicerestockrow": "SupplierInvoiceRestockRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L202 | neighbors=[types.ts]
- "shared_types_transactionlogrow": "TransactionLogRow" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L498 | neighbors=[types.ts]
- "shell_shell_admin_items": "ADMIN_ITEMS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L34 | neighbors=[Shell.tsx]
- "shell_shell_adminsidebarnotifications": "AdminSidebarNotifications()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L174 | neighbors=[Shell.tsx]
- "shell_shell_nav_items": "NAV_ITEMS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L24 | neighbors=[Shell.tsx]
- "shell_shell_navitem": "NavItem" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L17 | neighbors=[Shell.tsx]
- "shell_shell_navlinkclass": "navLinkClass()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L48 | neighbors=[Shell.tsx]
- "shell_shell_requirerole": "RequireRole()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L188 | neighbors=[Shell.tsx]
- "shell_shell_shell": "Shell()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L54 | neighbors=[Shell.tsx]
- "shell_usesidebarcollapsed_readcollapsed": "readCollapsed()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L5 | neighbors=[useSidebarCollapsed.ts]
- "shell_usesidebarcollapsed_usesidebarcollapsed": "useSidebarCollapsed()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L21 | neighbors=[useSidebarCollapsed.ts]
- "shell_usesidebarcollapsed_writecollapsed": "writeCollapsed()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L13 | neighbors=[useSidebarCollapsed.ts]
- "src_db_live_row_sql": "LIVE_ROW_SQL" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L132 | neighbors=[db.ts]
- "src_index_main": "main()" | kind=code-symbol | source=shelfPos/sync-service/src/index.ts:L52 | neighbors=[index.ts]
- "src_index_runsynccycle": "runSyncCycle()" | kind=code-symbol | source=shelfPos/sync-service/src/index.ts:L17 | neighbors=[index.ts]
- "src_main_bootstrap": "bootstrap()" | kind=code-symbol | source=shelfPos/src/renderer/src/main.tsx:L23 | neighbors=[main.tsx]
- "src_main_queryclient": "queryClient" | kind=code-symbol | source=shelfPos/src/renderer/src/main.tsx:L12 | neighbors=[main.tsx]
- "src_router_admincashroute": "adminCashRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L216 | neighbors=[router.tsx]
- "src_router_adminindexroute": "adminIndexRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L186 | neighbors=[router.tsx]
- "src_router_auditroute": "auditRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L198 | neighbors=[router.tsx]
- "src_router_cashroute": "cashRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L91 | neighbors=[router.tsx]
- "src_router_chooselanguageroute": "chooseLanguageRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L67 | neighbors=[router.tsx]
- "src_router_cierreroute": "cierreRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L192 | neighbors=[router.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-041.json

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
