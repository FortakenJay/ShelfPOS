# Node Description Batch 41 of 42

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

- "shell_shell_adminsidebarnotifications": "AdminSidebarNotifications()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L172 | neighbors=[Shell.tsx]
- "shell_shell_nav_items": "NAV_ITEMS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L24 | neighbors=[Shell.tsx]
- "shell_shell_navitem": "NavItem" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L17 | neighbors=[Shell.tsx]
- "shell_shell_navlinkclass": "navLinkClass()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L46 | neighbors=[Shell.tsx]
- "shell_shell_requirerole": "RequireRole()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L186 | neighbors=[Shell.tsx]
- "shell_shell_shell": "Shell()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/Shell.tsx:L52 | neighbors=[Shell.tsx]
- "shell_usesidebarcollapsed_readcollapsed": "readCollapsed()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L5 | neighbors=[useSidebarCollapsed.ts]
- "shell_usesidebarcollapsed_usesidebarcollapsed": "useSidebarCollapsed()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L21 | neighbors=[useSidebarCollapsed.ts]
- "shell_usesidebarcollapsed_writecollapsed": "writeCollapsed()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/shell/useSidebarCollapsed.ts:L13 | neighbors=[useSidebarCollapsed.ts]
- "src_db_live_row_sql": "LIVE_ROW_SQL" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L120 | neighbors=[db.ts]
- "src_index_main": "main()" | kind=code-symbol | source=shelfPos/sync-service/src/index.ts:L51 | neighbors=[index.ts]
- "src_index_runsynccycle": "runSyncCycle()" | kind=code-symbol | source=shelfPos/sync-service/src/index.ts:L17 | neighbors=[index.ts]
- "src_main_bootstrap": "bootstrap()" | kind=code-symbol | source=shelfPos/src/renderer/src/main.tsx:L23 | neighbors=[main.tsx]
- "src_main_queryclient": "queryClient" | kind=code-symbol | source=shelfPos/src/renderer/src/main.tsx:L12 | neighbors=[main.tsx]
- "src_router_admincashroute": "adminCashRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L208 | neighbors=[router.tsx]
- "src_router_adminindexroute": "adminIndexRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L178 | neighbors=[router.tsx]
- "src_router_auditroute": "auditRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L190 | neighbors=[router.tsx]
- "src_router_cashroute": "cashRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L89 | neighbors=[router.tsx]
- "src_router_chooselanguageroute": "chooseLanguageRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L65 | neighbors=[router.tsx]
- "src_router_cierreroute": "cierreRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L184 | neighbors=[router.tsx]
- "src_router_dashboardroute": "dashboardRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L165 | neighbors=[router.tsx]
- "src_router_exportroute": "exportRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L202 | neighbors=[router.tsx]
- "src_router_firstrunroute": "firstRunRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L53 | neighbors=[router.tsx]
- "src_router_indexroute": "indexRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L47 | neighbors=[router.tsx]
- "src_router_loginroute": "loginRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L71 | neighbors=[router.tsx]
- "src_router_posroute": "posRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L83 | neighbors=[router.tsx]
- "src_router_printqueueroute": "printQueueRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L196 | neighbors=[router.tsx]
- "src_router_product_stock_search": "PRODUCT_STOCK_SEARCH" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L31 | neighbors=[router.tsx]
- "src_router_productsroute": "productsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L101 | neighbors=[router.tsx]
- "src_router_register": "Register" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L259 | neighbors=[router.tsx]
- "src_router_report_period_search": "REPORT_PERIOD_SEARCH" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L41 | neighbors=[router.tsx]
- "src_router_report_type_search": "REPORT_TYPE_SEARCH" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L32 | neighbors=[router.tsx]
- "src_router_reportsroute": "reportsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L117 | neighbors=[router.tsx]
- "src_router_reprintsroute": "reprintsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L95 | neighbors=[router.tsx]
- "src_router_rootroute": "rootRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L43 | neighbors=[router.tsx]
- "src_router_router": "router" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L252 | neighbors=[router.tsx]
- "src_router_routetree": "routeTree" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L226 | neighbors=[router.tsx]
- "src_router_settingsroute": "settingsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L220 | neighbors=[router.tsx]
- "src_router_shellroute": "shellRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L77 | neighbors=[router.tsx]
- "src_router_syncsetuproute": "syncSetupRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L59 | neighbors=[router.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-040.json

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
