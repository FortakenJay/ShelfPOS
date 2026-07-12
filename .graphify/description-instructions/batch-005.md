# Node Description Batch 6 of 43

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
Write every description in Portuguese (pt). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "services_syncconfig_readsyncsetupstatus": "readSyncSetupStatus()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L80 | neighbors=[syncSetup.ts, syncConfig.ts, getSyncConfigPath(), isSyncServiceInstalled(), parseEnvFile(), querySyncServiceRunning()]
- "shared_money_roundcolones": "roundColones()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L4 | neighbors=[helpers.ts, productSupplierInvoicePdf.ts, cartTabSnapshot.ts, money.ts, parseSupplierAmount(), pricing.ts]
- "shared_types_idtype": "IdType" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L48 | neighbors=[sales.ts, settings.ts, salesReceipt.ts, settings.ts, facturaPdf.ts, printTemplates.ts]
- "src_db_readsetting": "readSetting()" | kind=code-symbol | source=shelfPos/sync-service/src/db.ts:L24 | neighbors=[db.ts, applyPendingSyncStoreId(), readIvaRateStandard(), readPosLastSeenAt(), readStockThresholdDefault(), readStoreDisplayName()]
- "src_sync_supabasehttperror": "SupabaseHttpError" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L24 | neighbors=[sync.ts, claimStoreIfNeeded(), storeHasDashboardAccess(), supabaseDelete(), .constructor(), supabaseUpsert()]
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@3da0d23850e94bd3bf1c6c8b8ea3909116fca2ec": "3da0d23 Merge branch 'dev' of https://github.com/SakenEtAlOrg/ShelfPOS into dev" | kind=Commit | source=git | neighbors=[Separation, dev, 841808d Update push, bcf4c2f fixed links., 5f4f7d2 document to push so deployment …, 660d33a fixed mail.]
- "components_dashboardchartfallback": "DashboardChartFallback.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardChartFallback.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardChartFallback(), dashboardChartLazy.tsx, DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx]
- "components_productspagefilters": "ProductsPageFilters.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageFilters.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPageFilters(), ProductsPageFiltersProps, useProductManager.ts, ProductFiltersState, ProductsPage.tsx]
- "electron_vite_config": "electron.vite.config.ts" | kind=code-symbol | source=shelfPos/electron.vite.config.ts:L1 | neighbors=[appIcon, closeBundle(), copyBrandAssets(), copyBrandAssetsPlugin, inAppLogo, licensePub]
- "lib_api": "api.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/api.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, api, ApiError, call(), session.ts]
- "lib_format": "format.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/format.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, formatDate(), formatMoney(), todayStr(), toast.tsx, parseColonesInput()]
- "main_license_verifylicensejwt": "verifyLicenseJwt()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L120 | neighbors=[license.ts, activateLicense(), checkStoredLicense(), assertPayloadShape(), loadPublicKey(), validatePayloadForMachine()]
- "main_window": "window.ts" | kind=code-symbol | source=shelfPos/src/main/window.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cierre.ts, reports.ts, sales.ts, appBrowserWindow(), showSaveDialog()]
- "pos_customermodal": "CustomerModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CustomerModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, customerFormState(), CustomerModal(), CustomerModalProps, ID_TYPES, POSModals.tsx]
- "pos_paymentcheckoutpanel": "PaymentCheckoutPanel.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPanel.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentCheckoutPad.tsx, PaymentCheckoutPad(), CashAmountStrip(), PaymentCheckoutPanel(), PaymentModal.tsx]
- "pos_paymentsplitsection": "PaymentSplitSection.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentSplitSection.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentModal.tsx, PaymentSplitSection(), posKeyboard.ts, commitEditableOnEnter(), METHODS]
- "pos_poskeyboard_commiteditableonenter": "commitEditableOnEnter()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posKeyboard.ts:L58 | neighbors=[CartLineDiscountInput.tsx, CartMiscNameInput.tsx, PaymentInvoiceCustomerSection.tsx, PaymentSplitSection.tsx, POSCartPanel.tsx, posKeyboard.ts]
- "pos_possearchpanel": "POSSearchPanel.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSSearchPanel.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSSearchPanel(), POSSearchPanelProps, useVerticalDragResize.ts, useVerticalDragResize(), POSTerminalView.tsx]
- "pos_returnmodal": "ReturnModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReturnModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, POSModals.tsx, initialReturnState(), ReturnModal(), ReturnModalState]
- "pos_usepaymentkeyboard": "usePaymentKeyboard.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePaymentKeyboard.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentModal.tsx, posKeyboard.ts, isEditableElement(), commitSplitAmount(), usePaymentKeyboard()]
- "preload_index": "index.ts" | kind=code-symbol | source=shelfPos/src/preload/index.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, channelSet, types.ts, ApiResult, IPC_CHANNELS, LicenseStatus]
- "products_productimportpreviewmodal": "ProductImportPreviewModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductImportPreviewModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, importHasStockChanges(), PreviewTable(), ProductImportPreviewModal(), ProductImportPreviewModalProps]
- "products_productreceivechoicemodal": "ProductReceiveChoiceModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductReceiveChoiceModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, ProductReceiveChoice, ProductReceiveChoiceModal(), ProductReceiveChoiceModalProps, ProductsPage.tsx]
- "reports_salereceiptactions": "SaleReceiptActions.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/SaleReceiptActions.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, SaleReceiptActions(), useSaleReceiptActions.ts, useSaleReceiptActions(), ItemizedSalesReportTable.tsx, TransactionLogReportTable.tsx]
- "repos_products_insertproductrow": "insertProductRow()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L278 | neighbors=[products.ts, products.ts, productCatalogParams(), releaseBarcodeForReuse(), productCsvImport.ts, productSupplierInvoicePdf.ts]
- "repos_products_releasebarcodeforreuse": "releaseBarcodeForReuse()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L37 | neighbors=[products.ts, products.ts, insertProductRow(), isTombstoneBarcode(), tombstoneBarcodeValue(), updateProductCatalogFields()]
- "repos_reports_itemizedsales": "itemizedSales()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L719 | neighbors=[reports.ts, reports.ts, listSaleHeaders(), listSalePayments(), paymentsBySale(), saleWhere()]
- "repos_settings_currentlanguage": "currentLanguage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L199 | neighbors=[backup.ts, cierre.ts, products.ts, reports.ts, settings.ts, getSetting()]
- "repos_users_getappuserbyid": "getAppUserById()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L52 | neighbors=[users.ts, users.ts, deactivateAppUserRow(), mapUser(), insertAppUserRow(), patchAppUserRow()]
- "scripts_print_colon_preprod_appendcolonteststrip": "appendColonTestStrip()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L252 | neighbors=[print-colon-preprod.mjs, align(), bold(), feed(), size(), buildJob4()]
- "scripts_print_smoke_test": "print-smoke-test.mjs" | kind=code-symbol | source=shelfPos/scripts/print-smoke-test.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, binPath, data, dir, __dirname, printer]
- "scripts_sync_vendor": "sync-vendor.mjs" | kind=code-symbol | source=shelfPos/sync-service/scripts/sync-vendor.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…, libDir, root, sharedDir, vendorDir]
- "services_escposrender_encodeprinttext": "encodePrintText()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L163 | neighbors=[escPosRender.ts, normalizePrintSpaces(), replacePrintArrows(), pushPlainText(), pushRowLine(), toEscPos()]
- "services_escposrender_resettextstyle": "resetTextStyle()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L71 | neighbors=[escPosRender.ts, pushRowLine(), pushTextLine(), doubleStrike(), scaleCmd(), toEscPos()]
- "services_printer_opencashdrawer": "openCashDrawer()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L381 | neighbors=[printer.ts, printer.ts, ensurePrinterExists(), getActivePrinterName(), sendRawToPrinter(), tryOpenCashDrawer()]
- "services_productcsvexport_exportproductstocsv": "exportProductsToCsv()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvExport.ts:L88 | neighbors=[products.ts, productCsvExport.ts, createExportBatchStatement(), flushLines(), formatProductExportLine(), writeProductCsvTemplate()]
- "services_productcsvimport_analyzeproductimport": "analyzeProductImport()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L233 | neighbors=[products.ts, productCsvImport.ts, parseProductRow(), preserveAlternatePricesWhenColumnsAreOm…, productInputDiffers(), validateProductInput()]
- "services_productcsvimport_parseproductrow": "parseProductRow()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L43 | neighbors=[productCsvImport.ts, analyzeProductImport(), cell(), applyProductImport(), buildProductImportPreview(), parseOptionalNumber()]
- "services_productcsvimport_validateproductinput": "validateProductInput()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L30 | neighbors=[products.ts, productCsvImport.ts, analyzeProductImport(), productSupplierInvoicePdf.ts, applyProductImport(), buildProductImportPreview()]
- "services_productefacturaimport_readefacturaxlsx": "readEfacturaXlsx()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L141 | neighbors=[products.ts, productEfacturaImport.ts, efacturaRowToProductCsvRow(), findHeaderRow(), mapLetterColumns(), worksheetToMatrix()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-005.json

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
