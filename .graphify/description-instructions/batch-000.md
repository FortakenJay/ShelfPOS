# Node Description Batch 1 of 42

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

- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@1bdbad7afbeb62e4f0daa241c28358eab18b204a": "1bdbad7 Consolidate shelfPos, shelfDashboard, shelfDocs back into one repo" | kind=Commit | source=git | neighbors=[0d0d88f Remove split-out repository ent…, main.ts, AdminCashPage.tsx, AuditLogPage.tsx, CierreDiscrepancyAlerts.tsx, CierrePage.tsx]
- "shared_types": "types.ts" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, audit.ts, auth.ts, backup.ts, cart.ts]
- "ipc_products": "products.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, localNow(), index.ts, getDb()]
- "services_printtemplates": "printTemplates.ts" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cierre.ts, products.ts, reports.ts, sales.ts, settings.ts]
- "ipc_sales": "sales.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, localNow(), round2(), index.ts]
- "ipc_cierre": "cierre.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, localNow(), rangeBounds(), round2(), index.ts]
- "repos_dashboard": "dashboard.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, dashboard.ts, helpers.ts, daysAgoLocal(), daysInRange(), localNow()]
- "services_printer": "printer.ts" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cash.ts, cierre.ts, printer.ts, printQueue.ts, products.ts]
- "branch:repo:github.com/SakenEtAlOrg/ShelfPOS#Separation": "Separation" | kind=Branch | source=git | neighbors=[07768fd pagination and user tests, 07a5b84 more fixes, 0d0d88f Remove split-out repository ent…, 0ef1588 stuff, 142aee3 mejorar el cierre y proprierata…, 14a2364 Split monorepo into independent…]
- "repos_reports": "reports.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cierre.ts, reports.ts, cash.ts, dashboard.ts, helpers.ts]
- "branch:repo:github.com/SakenEtAlOrg/ShelfPOS#dev": "dev" | kind=Branch | source=git | neighbors=[07768fd pagination and user tests, 07a5b84 more fixes, 0ef1588 stuff, 142aee3 mejorar el cierre y proprierata…, 1b80d1c build fix, 1e257f4 added a versioning disaply and …]
- "ipc_reports": "reports.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, daysInRange(), rangeBounds(), helpers.ts]
- "schemas_ipc": "ipc.ts" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, adjustStockInputSchema, auditLogFilterSchema, cajaPinChangeInputSchema, cashMovementInputSchema]
- "repos_products": "products.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, returns.ts, sales.ts, dashboard.ts, columns.ts]
- "services_productcsvimport": "productCsvImport.ts" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, helpers.ts, localNow(), index.ts, getDb()]
- "services_escposrender": "escPosRender.ts" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, print-test-big-receipt.ts, print-test-crc.ts, align(), applyTextStyle(), barcodeDataCode128()]
- "ipc_index": "index.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/index.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, audit.ts, registerAuditHandlers(), auth.ts, registerAuthHandlers(), backup.ts]
- "repos_audit": "audit.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, audit.ts, auth.ts, authorize.ts, backup.ts, cart.ts]
- "db_helpers": "helpers.ts" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, daysAgoLocal(), daysInRange(), localNow(), pad(), rangeBounds()]
- "main_index": "index.ts" | kind=code-symbol | source=shelfPos/src/main/index.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, setDb(), migrations.ts, getDbVersion(), runMigrations()]
- "repos_salesreceipt": "salesReceipt.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, sales.ts, helpers.ts, localNow(), index.ts, getDb()]
- "repos_settings": "settings.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, backup.ts, cierre.ts, firstRun.ts, products.ts, reports.ts]
- "services_productsupplierinvoicepdf": "productSupplierInvoicePdf.ts" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, test-supplier-pdf.ts, helpers.ts, localNow(), index.ts]
- "ipc_settings": "settings.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/settings.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, handle(), ID_TYPES, registerSettingsHandlers()]
- "ipc_cash": "cash.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/cash.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, helpers.ts, rangeBounds(), round2(), index.ts, getDb()]
- "ipc_helpers": "helpers.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/helpers.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, audit.ts, auth.ts, backup.ts, cart.ts, cartTabs.ts]
- "db_index": "index.ts" | kind=code-symbol | source=shelfPos/src/main/db/index.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, getDb(), getDbPath(), setDb(), backup.ts, cash.ts]
- "services_session": "session.ts" | kind=code-symbol | source=shelfPos/src/main/services/session.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, auth.ts, authorize.ts, cart.ts, cartTabs.ts, cash.ts]
- "ipc_carttabs": "cartTabs.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/cartTabs.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, registerCartTabHandlers(), SELL, toListItem(), helpers.ts, handle()]
- "ipc_users": "users.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/users.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, index.ts, getDb(), helpers.ts, handle()]
- "main_errors": "errors.ts" | kind=code-symbol | source=shelfPos/src/main/errors.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, authorize.ts, cart.ts, cartTabs.ts, cash.ts, cierre.ts]
- "main_errors_apperror": "AppError" | kind=code-symbol | source=shelfPos/src/main/errors.ts:L2 | neighbors=[authorize.ts, cart.ts, cartTabs.ts, cash.ts, cierre.ts, discount.ts]
- "repos_cash": "cash.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/cash.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cash.ts, cierre.ts, returns.ts, sales.ts, helpers.ts]
- "repos_printjobs": "printJobs.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cierre.ts, printQueue.ts, products.ts, reports.ts, sales.ts]
- "scripts_print_colon_preprod": "print-colon-preprod.mjs" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, align(), appendColonMark(), appendColonTestStrip(), bold(), buildJob1()]
- "dashboard_dashboardpage": "DashboardPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/DashboardPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, dashboardChartLazy.tsx, LazyDashboardHomeCharts(), LazyInventoryHealthChart(), LazyProductAnalyticsCharts(), LazySalesAnalyticsSection()]
- "repos_carttabs": "cartTabs.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cartTabs.ts, cierre.ts, helpers.ts, localNow(), index.ts]
- "src_router": "router.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, adminCashRoute, adminIndexRoute, auditRoute, cashRoute, chooseLanguageRoute]
- "db_index_getdb": "getDb()" | kind=code-symbol | source=shelfPos/src/main/db/index.ts:L11 | neighbors=[index.ts, backup.ts, cash.ts, cierre.ts, firstRun.ts, products.ts]
- "ipc_returns": "returns.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/returns.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, localNow(), round2(), index.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-000.json

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
