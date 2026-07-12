# Node Description Batch 7 of 43

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

- "services_productsupplierinvoicepdf_parsesupplierinvoicetext": "parseSupplierInvoiceText()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L72 | neighbors=[test-supplier-pdf.ts, productSupplierInvoicePdf.ts, extractTrailingNumbers(), guessCategory(), normalizePdfText(), readSupplierInvoicePdf()]
- "services_syncconfig_writepairingcodeonly": "writePairingCodeOnly()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L113 | neighbors=[syncSetup.ts, syncConfig.ts, getSyncConfigPath(), parseEnvFile(), readSyncSecretKey(), writeSyncConfig()]
- "shared_barcode_isprintablecode128barcode": "isPrintableCode128Barcode()" | kind=code-symbol | source=shelfPos/src/shared/barcode.ts:L2 | neighbors=[products.ts, escPosRender.ts, shelfLabelLines.ts, barcode.ts, barcodePrintValue(), canPrintProductBarcode()]
- "shared_operator_account_ishiddenoperatorusername": "isHiddenOperatorUsername()" | kind=code-symbol | source=shelfPos/src/shared/operator-account.ts:L4 | neighbors=[firstRun.ts, users.ts, audit.ts, users.ts, session.ts, operator-account.ts]
- "shared_pricing_moneyequals": "moneyEquals()" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L16 | neighbors=[priceOverride.ts, sales.ts, printTemplates.ts, pricing.ts, isCustomPriceOverride(), SanctionedUnitPriceKind]
- "shared_types_daterange": "DateRange" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L410 | neighbors=[helpers.ts, backup.ts, cash.ts, reports.ts, dashboard.ts, types.ts]
- "shared_types_paymentmethod": "PaymentMethod" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L3 | neighbors=[sales.ts, reports.ts, salesReceipt.ts, csvColumns.ts, printTemplates.ts, types.ts]
- "admin_exportpage": "ExportPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ExportPage.tsx:L1 | neighbors=[ExportBackup(), ExportPage(), InfoRow(), 1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…]
- "admin_settingscloudpanel": "SettingsCloudPanel.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsCloudPanel.tsx:L1 | neighbors=[cloudStatusKey(), SettingsCloudPanel(), SettingsPage.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…]
- "admin_settingsdraft_sectiondirty": "sectionDirty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/settingsDraft.ts:L90 | neighbors=[settingsDraft.ts, emisorDraftDirty(), generalDraftDirty(), shortcutsDraftDirty(), taxDraftDirty()]
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@233e386bf4c144c13cd9187ce67c384eaae3b034": "233e386 Merge branch 'dev' of https://github.com/SakenEtAlOrg/ShelfPOS into dev" | kind=Commit | source=git | neighbors=[Separation, dev, a97eb0d fix3.0, 841808d Update push, bcf4c2f fixed links.]
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@4274ea519ade680afc96ed822b5aa9106121ba47": "4274ea5 graphify" | kind=Commit | source=git | neighbors=[2659acf more fixes and added more featu…, Separation, dev, 5f4f7d2 document to push so deployment …, 660d33a fixed mail.]
- "components_dashboardchartfallback_dashboardchartfallback": "DashboardChartFallback()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardChartFallback.tsx:L1 | neighbors=[DashboardChartFallback.tsx, dashboardChartLazy.tsx, DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx]
- "components_dashboardoverview": "DashboardOverview.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardOverview.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, KpiOverview(), DashboardPrimitives.tsx, KpiCard(), DashboardPage.tsx]
- "components_numpad": "NumPad.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NumPad.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, NumPad(), NUMPAD_KEYS, NumPadProps, PinModal.tsx]
- "dashboard_dashboardalertseverity": "dashboardAlertSeverity.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSeverity.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardTables.tsx, NotificationsCenter.tsx, notificationAlertSeverityClass(), panelAlertSeverityClass()]
- "db_helpers_todaylocal": "todayLocal()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L12 | neighbors=[helpers.ts, localNow(), dashboard.ts, backup.ts, dataRetention.ts]
- "ipc_products_printproductlabel": "printProductLabel()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L126 | neighbors=[products.ts, printLabelForProduct(), labelLinesForProduct(), productForBarcodePrint(), runBatchPrint()]
- "main_window_showsavedialog": "showSaveDialog()" | kind=code-symbol | source=shelfPos/src/main/window.ts:L11 | neighbors=[cierre.ts, reports.ts, sales.ts, window.ts, appBrowserWindow()]
- "node_parseenv": "parseEnv.ts" | kind=code-symbol | source=shelfPos/src/shared/node/parseEnv.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, parseEnv.ts, applyEnvFile(), parseEnvFileContent(), parseEnvLine()]
- "pos_cartmiscnameinput": "CartMiscNameInput.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartMiscNameInput.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartMiscNameInput(), posKeyboard.ts, commitEditableOnEnter(), POSCartPanel.tsx]
- "pos_cashmovementspanel": "CashMovementsPanel.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashMovementsPanel.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, CashDrawerPage.tsx, CashMovementsPanel(), PendingMovement]
- "pos_paymentcheckoutpad": "PaymentCheckoutPad.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPad.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, GRID_KEYS, PaymentCheckoutPad(), PaymentCheckoutPanel.tsx, PaymentModal.tsx]
- "pos_paymentinvoicecustomersection": "PaymentInvoiceCustomerSection.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentInvoiceCustomerSection.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentInvoiceCustomerSection(), posKeyboard.ts, commitEditableOnEnter(), PaymentModal.tsx]
- "pos_paymentmethodsidebar": "PaymentMethodSidebar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodSidebar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentMethodButtons.tsx, PaymentMethodButtons(), PaymentMethodSidebar(), PaymentModal.tsx]
- "pos_poscartsale": "posCartSale.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posCartSale.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cartLineToSaleInput(), types.ts, CartLine, POSModals.tsx]
- "pos_reprintreceiptspage": "ReprintReceiptsPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReprintReceiptsPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReprintReceiptsList.tsx, ReprintReceiptsList(), ReprintReceipts(), ReprintReceiptsPage()]
- "pos_usepinauthorize": "usePinAuthorize.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePinAuthorize.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DiscountModal.tsx, LineDiscountPinModal.tsx, PriceOverrideModal.tsx, usePinAuthorize()]
- "products_adjuststockmodal": "AdjustStockModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/AdjustStockModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, ProductManagerModals.tsx, AdjustStockModal(), REASONS]
- "products_productform": "ProductForm.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductForm.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, ProductFormModal(), ProductFormModalProps, productFormState()]
- "products_productspagination": "ProductsPagination.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPagination.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPage.tsx, PAGE_SIZE_OPTIONS, ProductsPagination(), ProductsPaginationProps]
- "repos_audit_listauditpage": "listAuditPage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L74 | neighbors=[audit.ts, audit.ts, listAudit(), auditWhere(), countAudit()]
- "repos_products_getproductbybarcode": "getProductByBarcode()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L99 | neighbors=[products.ts, products.ts, productSelect(), productCsvImport.ts, productSupplierInvoicePdf.ts]
- "repos_products_productselect": "productSelect()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L17 | neighbors=[products.ts, getProduct(), getProductByBarcode(), listProducts(), searchProducts()]
- "repos_products_updateproductcatalogfields": "updateProductCatalogFields()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L294 | neighbors=[products.ts, products.ts, productCatalogParams(), releaseBarcodeForReuse(), productCsvImport.ts]
- "repos_reports_transactionlog": "transactionLog()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L699 | neighbors=[reports.ts, reports.ts, listSaleHeaders(), listSalePayments(), paymentsBySale()]
- "scripts_e2e_full_dumpstate": "dumpState()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L52 | neighbors=[e2e-full.mjs, evalJs(), log(), send(), waitFor()]
- "scripts_e2e_full_evaljs": "evalJs()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L35 | neighbors=[e2e-full.mjs, dumpState(), send(), pinClicks(), waitFor()]
- "scripts_generate_license": "generate-license.ts" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, Args, loadPrivateKey(), main(), parseArgs()]
- "scripts_print_colon_preprod_align": "align()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L53 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob2(), buildJob3()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-006.json

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
