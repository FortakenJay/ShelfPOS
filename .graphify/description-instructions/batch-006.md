# Node Description Batch 7 of 42

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

- "db_columns": "columns.ts" | kind=code-symbol | source=shelfPos/src/main/db/columns.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PRODUCT_COLUMNS, PRODUCT_POS_COLUMNS, printJobs.ts, products.ts]
- "db_helpers_todaylocal": "todayLocal()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L12 | neighbors=[helpers.ts, localNow(), dashboard.ts, backup.ts, dataRetention.ts]
- "ipc_products_printproductlabel": "printProductLabel()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L135 | neighbors=[products.ts, printLabelForProduct(), labelLinesForProduct(), productForBarcodePrint(), runBatchPrint()]
- "lib_api": "api.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/api.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, api, ApiError, call(), session.ts]
- "main_window_showsavedialog": "showSaveDialog()" | kind=code-symbol | source=shelfPos/src/main/window.ts:L11 | neighbors=[cierre.ts, reports.ts, sales.ts, window.ts, appBrowserWindow()]
- "node_parseenv": "parseEnv.ts" | kind=code-symbol | source=shelfPos/src/shared/node/parseEnv.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, parseEnv.ts, applyEnvFile(), parseEnvFileContent(), parseEnvLine()]
- "pos_cartmiscnameinput": "CartMiscNameInput.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartMiscNameInput.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartMiscNameInput(), posKeyboard.ts, commitEditableOnEnter(), POSCartPanel.tsx]
- "pos_paymentcheckoutpad": "PaymentCheckoutPad.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPad.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, GRID_KEYS, PaymentCheckoutPad(), PaymentCheckoutPanel.tsx, PaymentModal.tsx]
- "pos_paymentinvoicecustomersection": "PaymentInvoiceCustomerSection.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentInvoiceCustomerSection.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentInvoiceCustomerSection(), posKeyboard.ts, commitEditableOnEnter(), PaymentModal.tsx]
- "pos_paymentmethodsidebar": "PaymentMethodSidebar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodSidebar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, PaymentMethodButtons.tsx, PaymentMethodButtons(), PaymentMethodSidebar(), PaymentModal.tsx]
- "pos_poscartsale": "posCartSale.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posCartSale.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cartLineToSaleInput(), types.ts, CartLine, POSModals.tsx]
- "pos_reprintreceiptspage": "ReprintReceiptsPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReprintReceiptsPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReprintReceiptsList.tsx, ReprintReceiptsList(), ReprintReceipts(), ReprintReceiptsPage()]
- "pos_returnmodal": "ReturnModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReturnModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSModals.tsx, initialReturnState(), ReturnModal(), ReturnModalState]
- "pos_usepinauthorize": "usePinAuthorize.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePinAuthorize.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DiscountModal.tsx, LineDiscountPinModal.tsx, PriceOverrideModal.tsx, usePinAuthorize()]
- "products_productform": "ProductForm.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductForm.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, ProductFormModal(), ProductFormModalProps, productFormState()]
- "products_productspagination": "ProductsPagination.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPagination.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPage.tsx, PAGE_SIZE_OPTIONS, ProductsPagination(), ProductsPaginationProps]
- "repos_audit_listauditpage": "listAuditPage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L74 | neighbors=[audit.ts, audit.ts, listAudit(), auditWhere(), countAudit()]
- "repos_products_getproductbybarcode": "getProductByBarcode()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L92 | neighbors=[products.ts, products.ts, productSelect(), productCsvImport.ts, productSupplierInvoicePdf.ts]
- "repos_products_insertproductrow": "insertProductRow()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L247 | neighbors=[products.ts, products.ts, releaseBarcodeForReuse(), productCsvImport.ts, productSupplierInvoicePdf.ts]
- "repos_products_productselect": "productSelect()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L10 | neighbors=[products.ts, getProduct(), getProductByBarcode(), listProducts(), searchProducts()]
- "repos_reports_transactionlog": "transactionLog()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L691 | neighbors=[reports.ts, reports.ts, listSaleHeaders(), listSalePayments(), paymentsBySale()]
- "scripts_e2e_full_dumpstate": "dumpState()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L52 | neighbors=[e2e-full.mjs, evalJs(), log(), send(), waitFor()]
- "scripts_e2e_full_evaljs": "evalJs()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L35 | neighbors=[e2e-full.mjs, dumpState(), send(), pinClicks(), waitFor()]
- "scripts_generate_license": "generate-license.ts" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, Args, loadPrivateKey(), main(), parseArgs()]
- "scripts_print_colon_preprod_align": "align()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L53 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob2(), buildJob3()]
- "scripts_print_colon_preprod_bold": "bold()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L57 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob2(), buildJob3()]
- "scripts_print_colon_preprod_feed": "feed()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L63 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob2(), buildJob3()]
- "scripts_screenshot": "screenshot.mjs" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, page, pending, send(), ws]
- "scripts_sync_vendor": "sync-vendor.mjs" | kind=code-symbol | source=shelfPos/sync-service/scripts/sync-vendor.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, libDir, root, sharedDir, vendorDir]
- "services_csvspreadsheet": "csvSpreadsheet.ts" | kind=code-symbol | source=shelfPos/src/main/services/csvSpreadsheet.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, asSpreadsheetText(), parseSpreadsheetText(), productCsvExport.ts, productCsvImport.ts]
- "services_csvstream": "csvStream.ts" | kind=code-symbol | source=shelfPos/src/main/services/csvStream.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, closeWriteStream(), openUtf8CsvWriteStream(), writeToStream(), productCsvExport.ts]
- "services_escposrender_capescposscale": "capEscPosScale()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L76 | neighbors=[escPosRender.ts, applyTextStyle(), pushMoneyAmount(), pushRowLine(), pushTextLine()]
- "services_escposrender_parsemoneytext": "parseMoneyText()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L183 | neighbors=[escPosRender.ts, compactMoneyText(), pushPlainText(), pushRowLine(), pushTextLine()]
- "services_i18n_t": "t()" | kind=code-symbol | source=shelfPos/src/main/services/i18n.ts:L6 | neighbors=[sales.ts, settings.ts, csvColumns.ts, i18n.ts, printTemplates.ts]
- "services_printer_getactiveprintername": "getActivePrinterName()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L68 | neighbors=[printer.ts, fallbackPrinterName(), openCashDrawer(), printLines(), toEscPosOptions()]
- "services_printer_scheduleprintjob": "schedulePrintJob()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L413 | neighbors=[cierre.ts, reports.ts, sales.ts, printer.ts, attemptPrintJob()]
- "services_printpdf_writeprintlinespdf": "writePrintLinesPdf()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L160 | neighbors=[cierre.ts, reports.ts, printPdf.ts, printLinesToHtml(), writeHtmlToPdf()]
- "services_printtemplates_buildprintertestreceiptlines": "buildPrinterTestReceiptLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L146 | neighbors=[print-test-big-receipt.ts, printer.ts, printTemplates.ts, buildReceiptLines(), receiptItemsFromCatalog()]
- "services_printtemplates_paymentlines": "paymentLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L337 | neighbors=[printTemplates.ts, buildCierreLines(), buildMultiDayPaymentReportLines(), buildPaymentReportLines(), methodLabel()]
- "services_productcsvimport_parseproductrow": "parseProductRow()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L62 | neighbors=[productCsvImport.ts, applyProductImport(), buildProductImportPreview(), cell(), parseOptionalNumber()]

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
