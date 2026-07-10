# Node Description Batch 14 of 42

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

- "products_productstable": "ProductsTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPage.tsx, ProductsTable()]
- "reports_salereceiptactions_salereceiptactions": "SaleReceiptActions()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/SaleReceiptActions.tsx:L5 | neighbors=[SaleReceiptActions.tsx, ItemizedSalesReportTable.tsx, TransactionLogReportTable.tsx]
- "reports_usesalereceiptactions": "useSaleReceiptActions.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/useSaleReceiptActions.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, SaleReceiptActions.tsx, useSaleReceiptActions()]
- "repos_audit_auditwhere": "auditWhere()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L14 | neighbors=[audit.ts, countAudit(), listAuditPage()]
- "repos_audit_countaudit": "countAudit()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L66 | neighbors=[audit.ts, auditWhere(), listAuditPage()]
- "repos_audit_listaudit": "listAudit()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L89 | neighbors=[audit.ts, listAuditPage(), dashboard.ts]
- "repos_carttabs_completecarttab": "completeCartTab()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L74 | neighbors=[cartTabs.ts, cartTabs.ts, deleteCartTabRow()]
- "repos_carttabs_deletecarttabrow": "deleteCartTabRow()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L61 | neighbors=[cartTabs.ts, completeCartTab(), removeCartTab()]
- "repos_carttabs_getcarttabjson": "getCartTabJson()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L53 | neighbors=[cartTabs.ts, cartTabs.ts, removeCartTab()]
- "repos_carttabs_listcarttabs": "listCartTabs()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L16 | neighbors=[cartTabs.ts, cartTabs.ts, listHeldCartTabsForCierre()]
- "repos_carttabs_listheldcarttabsforcierre": "listHeldCartTabsForCierre()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L142 | neighbors=[cierre.ts, cartTabs.ts, listCartTabs()]
- "repos_cashmovementtotals_cashmovementtotals": "cashMovementTotals()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cashMovementTotals.ts:L5 | neighbors=[cash.ts, cashMovementTotals.ts, reports.ts]
- "repos_products_istombstonebarcode": "isTombstoneBarcode()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L21 | neighbors=[products.ts, releaseBarcodeForReuse(), softDeleteProduct()]
- "repos_products_tombstonebarcodevalue": "tombstoneBarcodeValue()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L25 | neighbors=[products.ts, releaseBarcodeForReuse(), softDeleteProduct()]
- "repos_reports_cierrepriceoverrides": "cierrePriceOverrides()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L462 | neighbors=[cierre.ts, reports.ts, saleWhere()]
- "repos_reports_inventorysnapshotpage": "inventorySnapshotPage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L287 | neighbors=[reports.ts, reports.ts, inventoryTotals()]
- "repos_reports_paymentsbysale": "paymentsBySale()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L676 | neighbors=[reports.ts, itemizedSales(), transactionLog()]
- "repos_reports_periodopenedat": "periodOpenedAt()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L305 | neighbors=[cierre.ts, cash.ts, reports.ts]
- "repos_reports_returntotals": "returnTotals()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L152 | neighbors=[reports.ts, returnFilterClause(), salesSummary()]
- "repos_reports_salescount": "salesCount()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L89 | neighbors=[cierre.ts, reports.ts, saleWhere()]
- "repos_salesreceipt_buildfacturapdfdata": "buildFacturaPdfData()" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L116 | neighbors=[sales.ts, salesReceipt.ts, loadSaleForReceipt()]
- "repos_salesreceipt_loadsaleforreceipt": "loadSaleForReceipt()" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L67 | neighbors=[salesReceipt.ts, buildFacturaPdfData(), reprintSaleReceipt()]
- "repos_salesreceipt_reprintsalereceipt": "reprintSaleReceipt()" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L162 | neighbors=[sales.ts, salesReceipt.ts, loadSaleForReceipt()]
- "repos_settings_ivaratefor": "ivaRateFor()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L195 | neighbors=[reports.ts, settings.ts, getAppSettings()]
- "repos_users_deactivateappuserrow": "deactivateAppUserRow()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L176 | neighbors=[users.ts, users.ts, getAppUserById()]
- "repos_users_insertappuserrow": "insertAppUserRow()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L81 | neighbors=[users.ts, users.ts, getAppUserById()]
- "repos_users_patchappuserrow": "patchAppUserRow()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L108 | neighbors=[users.ts, users.ts, getAppUserById()]
- "scripts_e2e_full_pinclicks": "pinClicks()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L108 | neighbors=[e2e-full.mjs, evalJs(), sleep()]
- "scripts_e2e_full_send": "send()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L15 | neighbors=[e2e-full.mjs, dumpState(), evalJs()]
- "scripts_e2e_full_sleep": "sleep()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L50 | neighbors=[e2e-full.mjs, pinClicks(), waitFor()]
- "scripts_generate_license_main": "main()" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L54 | neighbors=[generate-license.ts, loadPrivateKey(), parseArgs()]
- "scripts_print_colon_preprod_buildjob4": "buildJob4()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L267 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), colonMatrixToEscPos()]
- "scripts_print_colon_preprod_colonheightfromtext": "colonHeightFromText()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L99 | neighbors=[print-colon-preprod.mjs, buildJob1(), buildJob3()]
- "scripts_print_colon_preprod_colonmatrixtoescpos": "colonMatrixToEscPos()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L67 | neighbors=[print-colon-preprod.mjs, appendColonMark(), buildJob4()]
- "scripts_print_colon_preprod_pushprinttext": "pushPrintText()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L110 | neighbors=[print-colon-preprod.mjs, buildJob3(), appendColonMark()]
- "services_backup_backupservice_backupto": ".backupTo()" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L12 | neighbors=[BackupService, .dailyBackup(), .onCierre()]
- "services_backup_backupservice_cleanup": ".cleanup()" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L43 | neighbors=[BackupService, .dailyBackup(), .onCierre()]
- "services_backup_backupservice_dailypath": ".dailyPath()" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L17 | neighbors=[BackupService, .dailyBackup(), .onCierre()]
- "services_csvcolumns_normalizeheader": "normalizeHeader()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L46 | neighbors=[csvColumns.ts, parseFacturaNegativo(), parsePaymentMethod()]
- "services_csvcolumns_parsefacturanegativo": "parseFacturaNegativo()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L81 | neighbors=[csvColumns.ts, normalizeHeader(), productCsvImport.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-013.json

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
