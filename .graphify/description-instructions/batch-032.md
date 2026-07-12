# Node Description Batch 33 of 43

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

- "db_columns_productcatalogcolumn": "ProductCatalogColumn" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L20 | neighbors=[columns.ts]
- "db_migrations_migration": "Migration" | kind=code-symbol | source=shelfPos/src/main/db/migrations.ts:L7 | neighbors=[migrations.ts]
- "db_migrations_migrations": "migrations" | kind=code-symbol | source=shelfPos/src/main/db/migrations.ts:L10 | neighbors=[migrations.ts]
- "electron_vite_config_appicon": "appIcon" | kind=code-symbol | source=shelfPos/electron.vite.config.ts:L8 | neighbors=[electron.vite.config.ts]
- "electron_vite_config_closebundle": "closeBundle()" | kind=code-symbol | source=shelfPos/electron.vite.config.ts:L42 | neighbors=[electron.vite.config.ts]
- "electron_vite_config_copybrandassets": "copyBrandAssets()" | kind=code-symbol | source=shelfPos/electron.vite.config.ts:L14 | neighbors=[electron.vite.config.ts]
- "electron_vite_config_copybrandassetsplugin": "copyBrandAssetsPlugin" | kind=code-symbol | source=shelfPos/electron.vite.config.ts:L25 | neighbors=[electron.vite.config.ts]
- "electron_vite_config_inapplogo": "inAppLogo" | kind=code-symbol | source=shelfPos/electron.vite.config.ts:L9 | neighbors=[electron.vite.config.ts]
- "electron_vite_config_licensepub": "licensePub" | kind=code-symbol | source=shelfPos/electron.vite.config.ts:L7 | neighbors=[electron.vite.config.ts]
- "eslint_config_nodefiles": "nodeFiles" | kind=code-symbol | source=shelfPos/eslint.config.mjs:L9 | neighbors=[eslint.config.mjs]
- "eslint_config_reactfiles": "reactFiles" | kind=code-symbol | source=shelfPos/eslint.config.mjs:L8 | neighbors=[eslint.config.mjs]
- "hooks_userechartsmodule_loadrechartsmodule": "loadRechartsModule()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/hooks/useRechartsModule.ts:L7 | neighbors=[useRechartsModule.ts]
- "hooks_userechartsmodule_rechartsmodule": "RechartsModule" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/hooks/useRechartsModule.ts:L3 | neighbors=[useRechartsModule.ts]
- "i18n_index_initi18n": "initI18n()" | kind=code-symbol | source=shelfPos/src/renderer/src/i18n/index.ts:L7 | neighbors=[index.ts]
- "ipc_authorize_privilegedauthtype": "PrivilegedAuthType" | kind=code-symbol | source=shelfPos/src/main/ipc/authorize.ts:L5 | neighbors=[authorize.ts]
- "ipc_cart_sell": "SELL" | kind=code-symbol | source=shelfPos/src/main/ipc/cart.ts:L7 | neighbors=[cart.ts]
- "ipc_carttabs_sell": "SELL" | kind=code-symbol | source=shelfPos/src/main/ipc/cartTabs.ts:L26 | neighbors=[cartTabs.ts]
- "ipc_carttabs_tolistitem": "toListItem()" | kind=code-symbol | source=shelfPos/src/main/ipc/cartTabs.ts:L26 | neighbors=[cartTabs.ts]
- "ipc_cash_cash": "CASH" | kind=code-symbol | source=shelfPos/src/main/ipc/cash.ts:L24 | neighbors=[cash.ts]
- "ipc_cash_cash_read": "CASH_READ" | kind=code-symbol | source=shelfPos/src/main/ipc/cash.ts:L25 | neighbors=[cash.ts]
- "ipc_cash_validatedaterange": "validateDateRange()" | kind=code-symbol | source=shelfPos/src/main/ipc/cash.ts:L24 | neighbors=[cash.ts]
- "ipc_cierre_cierre": "CIERRE" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L42 | neighbors=[cierre.ts]
- "ipc_cierre_cierre_admin": "CIERRE_ADMIN" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L43 | neighbors=[cierre.ts]
- "ipc_cierre_cierre_export": "CIERRE_EXPORT" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L44 | neighbors=[cierre.ts]
- "ipc_cierre_cierreprintlines": "cierrePrintLines()" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L79 | neighbors=[cierre.ts]
- "ipc_cierre_formatcashdifferenceauditdetail": "formatCashDifferenceAuditDetail()" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L42 | neighbors=[cierre.ts]
- "ipc_cierre_getcierrebyid": "getCierreById()" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L65 | neighbors=[cierre.ts]
- "ipc_cierre_listcierrediscrepancyalerts": "listCierreDiscrepancyAlerts()" | kind=code-symbol | source=shelfPos/src/main/ipc/cierre.ts:L53 | neighbors=[cierre.ts]
- "ipc_discount_sell": "SELL" | kind=code-symbol | source=shelfPos/src/main/ipc/discount.ts:L7 | neighbors=[discount.ts]
- "ipc_firstrun_assertfirstrun": "assertFirstRun()" | kind=code-symbol | source=shelfPos/src/main/ipc/firstRun.ts:L12 | neighbors=[firstRun.ts]
- "ipc_helpers_access": "Access" | kind=code-symbol | source=shelfPos/src/main/ipc/helpers.ts:L7 | neighbors=[helpers.ts]
- "ipc_license_onlicenseactivated": "OnLicenseActivated" | kind=code-symbol | source=shelfPos/src/main/ipc/license.ts:L6 | neighbors=[license.ts]
- "ipc_priceoverride_sell": "SELL" | kind=code-symbol | source=shelfPos/src/main/ipc/priceOverride.ts:L7 | neighbors=[priceOverride.ts]
- "ipc_printer_printer_action": "PRINTER_ACTION" | kind=code-symbol | source=shelfPos/src/main/ipc/printer.ts:L11 | neighbors=[printer.ts]
- "ipc_products_batchprintmode": "BatchPrintMode" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L166 | neighbors=[products.ts]
- "ipc_products_confirmproductimport": "confirmProductImport()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L222 | neighbors=[products.ts]
- "ipc_products_empty_import_preview": "EMPTY_IMPORT_PREVIEW" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L203 | neighbors=[products.ts]
- "ipc_products_manage": "MANAGE" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L60 | neighbors=[products.ts]
- "ipc_products_openimportfilepath": "openImportFilePath()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L211 | neighbors=[products.ts]
- "ipc_products_productincludescost": "productIncludesCost()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L80 | neighbors=[products.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-032.json

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
