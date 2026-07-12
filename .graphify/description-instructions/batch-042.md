# Node Description Batch 43 of 43

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

- "src_router_creditroute": "creditRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L97 | neighbors=[router.tsx]
- "src_router_customersroute": "customersRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L228 | neighbors=[router.tsx]
- "src_router_dashboardroute": "dashboardRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L173 | neighbors=[router.tsx]
- "src_router_exportroute": "exportRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L210 | neighbors=[router.tsx]
- "src_router_firstrunroute": "firstRunRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L55 | neighbors=[router.tsx]
- "src_router_indexroute": "indexRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L49 | neighbors=[router.tsx]
- "src_router_loginroute": "loginRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L73 | neighbors=[router.tsx]
- "src_router_posroute": "posRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L85 | neighbors=[router.tsx]
- "src_router_printqueueroute": "printQueueRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L204 | neighbors=[router.tsx]
- "src_router_product_stock_search": "PRODUCT_STOCK_SEARCH" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L33 | neighbors=[router.tsx]
- "src_router_productsroute": "productsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L109 | neighbors=[router.tsx]
- "src_router_register": "Register" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L275 | neighbors=[router.tsx]
- "src_router_report_period_search": "REPORT_PERIOD_SEARCH" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L43 | neighbors=[router.tsx]
- "src_router_report_type_search": "REPORT_TYPE_SEARCH" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L34 | neighbors=[router.tsx]
- "src_router_reportsroute": "reportsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L125 | neighbors=[router.tsx]
- "src_router_reprintsroute": "reprintsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L103 | neighbors=[router.tsx]
- "src_router_rootroute": "rootRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L45 | neighbors=[router.tsx]
- "src_router_router": "router" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L268 | neighbors=[router.tsx]
- "src_router_routetree": "routeTree" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L240 | neighbors=[router.tsx]
- "src_router_settingsroute": "settingsRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L234 | neighbors=[router.tsx]
- "src_router_shellroute": "shellRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L79 | neighbors=[router.tsx]
- "src_router_syncsetuproute": "syncSetupRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L61 | neighbors=[router.tsx]
- "src_router_usersroute": "usersRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L222 | neighbors=[router.tsx]
- "src_sync_supabasehttperror_constructor": ".constructor()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L25 | neighbors=[SupabaseHttpError]
- "src_vite_env_d_importmeta": "ImportMeta" | kind=code-symbol | source=shelfPos/src/renderer/src/vite-env.d.ts:L7 | neighbors=[vite-env.d.ts]
- "src_vite_env_d_importmetaenv": "ImportMetaEnv" | kind=code-symbol | source=shelfPos/src/renderer/src/vite-env.d.ts:L3 | neighbors=[vite-env.d.ts]
- "sync_setup_syncsetuppage_syncsetuppage": "SyncSetupPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/sync-setup/SyncSetupPage.tsx:L10 | neighbors=[SyncSetupPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-042.json

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
