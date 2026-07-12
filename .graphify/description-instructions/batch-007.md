# Node Description Batch 8 of 43

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
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "scripts_print_colon_preprod_bold": "bold()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L57 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob2(), buildJob3()] | lang=en
- "scripts_print_colon_preprod_feed": "feed()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L63 | neighbors=[print-colon-preprod.mjs, appendColonTestStrip(), buildJob1(), buildJob2(), buildJob3()] | lang=en
- "scripts_screenshot": "screenshot.mjs" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, page, pending, send(), ws] | lang=en
- "services_csvspreadsheet": "csvSpreadsheet.ts" | kind=code-symbol | source=shelfPos/src/main/services/csvSpreadsheet.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, asSpreadsheetText(), parseSpreadsheetText(), productCsvExport.ts, productCsvImport.ts] | lang=en
- "services_csvstream": "csvStream.ts" | kind=code-symbol | source=shelfPos/src/main/services/csvStream.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, closeWriteStream(), openUtf8CsvWriteStream(), writeToStream(), productCsvExport.ts] | lang=en
- "services_escposrender_capescposscale": "capEscPosScale()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L76 | neighbors=[escPosRender.ts, applyTextStyle(), pushMoneyAmount(), pushRowLine(), pushTextLine()] | lang=en
- "services_escposrender_parsemoneytext": "parseMoneyText()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L183 | neighbors=[escPosRender.ts, compactMoneyText(), pushPlainText(), pushRowLine(), pushTextLine()] | lang=en
- "services_i18n_t": "t()" | kind=code-symbol | source=shelfPos/src/main/services/i18n.ts:L6 | neighbors=[sales.ts, settings.ts, csvColumns.ts, i18n.ts, printTemplates.ts] | lang=en
- "services_printer_getactiveprintername": "getActivePrinterName()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L72 | neighbors=[printer.ts, fallbackPrinterName(), openCashDrawer(), printLines(), toEscPosOptions()] | lang=en
- "services_printer_scheduleprintjob": "schedulePrintJob()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L422 | neighbors=[cierre.ts, reports.ts, sales.ts, printer.ts, attemptPrintJob()] | lang=en
- "services_printer_tryopencashdrawer": "tryOpenCashDrawer()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L388 | neighbors=[cash.ts, printer.ts, attemptPrintJob(), isTestMode(), openCashDrawer()] | lang=en
- "services_printpdf_writeprintlinespdf": "writePrintLinesPdf()" | kind=code-symbol | source=shelfPos/src/main/services/printPdf.ts:L160 | neighbors=[cierre.ts, reports.ts, printPdf.ts, printLinesToHtml(), writeHtmlToPdf()] | lang=en
- "services_printtemplates_buildprintertestreceiptlines": "buildPrinterTestReceiptLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L148 | neighbors=[print-test-big-receipt.ts, printer.ts, printTemplates.ts, buildReceiptLines(), receiptItemsFromCatalog()] | lang=en
- "services_printtemplates_paymentlines": "paymentLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L339 | neighbors=[printTemplates.ts, buildCierreLines(), buildMultiDayPaymentReportLines(), buildPaymentReportLines(), methodLabel()] | lang=en
- "services_productcsvimport_readproductcsv": "readProductCsv()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L199 | neighbors=[products.ts, productCsvImport.ts, productImportSourceVersion(), readProductImportSource(), applyProductImport()] | lang=en
- "services_productcsvimport_readproductimportsource": "readProductImportSource()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L174 | neighbors=[productCsvImport.ts, readProductCsv(), assertProductImportSourceVersion(), verifyProductImportSourceVersion(), productEfacturaImport.ts] | lang=en
- "services_productefacturaimport_efacturarowtoproductcsvrow": "efacturaRowToProductCsvRow()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L77 | neighbors=[productEfacturaImport.ts, cell(), parseEfacturaStock(), readEfacturaXlsx(), parseOptionalMoney()] | lang=en
- "shared_barcode_barcodeprintvalue": "barcodePrintValue()" | kind=code-symbol | source=shelfPos/src/shared/barcode.ts:L10 | neighbors=[products.ts, labelPrintLines.ts, barcode.ts, isPrintableCode128Barcode(), canPrintProductBarcode()] | lang=en
- "shared_money_digitsfrommoneyinput": "digitsFromMoneyInput()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L61 | neighbors=[money.ts, appendMoneyInputDigit(), backspaceMoneyInput(), moneyInputIsEmpty(), onMoneyInputChange()] | lang=en
- "shared_money_formatmoneyinputfromdigits": "formatMoneyInputFromDigits()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L75 | neighbors=[money.ts, appendMoneyInputDigit(), backspaceMoneyInput(), formatColones(), onMoneyInputChange()] | lang=en
- "shared_types_licensestatus": "LicenseStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1207 | neighbors=[license.ts, license.ts, index.ts, index.d.ts, types.ts] | lang=en
- "shared_types_role": "Role" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1 | neighbors=[helpers.ts, dashboard.ts, users.ts, session.ts, types.ts] | lang=en
- "src_config_loadconfig": "loadConfig()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L60 | neighbors=[config.ts, loadConfigFile(), readSecretKeyEnv(), resolveSecretKey(), index.ts] | lang=en
- "src_config_loadconfigfile": "loadConfigFile()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L33 | neighbors=[config.ts, loadConfig(), defaultSyncConfigPath(), loadEnvFile(), localSyncConfigPath()] | lang=en
- "src_sync_claimstoreifneeded": "claimStoreIfNeeded()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L227 | neighbors=[index.ts, sync.ts, checkConnectivity(), storeHasDashboardAccess(), SupabaseHttpError] | lang=en
- "src_sync_processentry": "processEntry()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L119 | neighbors=[index.ts, sync.ts, sanitizeMirrorRow(), supabaseDelete(), supabaseUpsert()] | lang=en
- "tables_itemizedsalesreporttable": "ItemizedSalesReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/ItemizedSalesReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, SaleReceiptActions.tsx, SaleReceiptActions(), ItemizedSalesReportTable()] | lang=en
- "tables_transactionlogreporttable": "TransactionLogReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/TransactionLogReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, SaleReceiptActions.tsx, SaleReceiptActions(), TransactionLogReportTable()] | lang=en
- "admin_cierrediscrepancyalerts_usecierrediscrepancyalerts": "useCierreDiscrepancyAlerts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L54 | neighbors=[CierreDiscrepancyAlerts.tsx, CierreDiscrepancyAlerts(), CierreDiscrepancyBanner(), useDismissedCierreIds()] | lang=en
- "admin_pincardprintmodal": "PinCardPrintModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PinCardPrintModal.tsx:L1 | neighbors=[normalizePin(), PinCardPrintModal(), SettingsForm.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "admin_printqueuepage": "PrintQueuePage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PrintQueuePage.tsx:L1 | neighbors=[PrintQueue(), PrintQueuePage(), 1bdbad7 Consolidate shelfPos, shelfDash…, af2caa3 updates updates updates. bug fi…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@07768fddedefc9e678b573eb021ed5a8aee2ca88": "07768fd pagination and user tests" | kind=Commit | source=git | neighbors=[Separation, dev, 9248632 number format fixed, 142aee3 mejorar el cierre y proprierata…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@07a5b841e2f46bb047b596c87cdc00a4f0aa93b6": "07a5b84 more fixes" | kind=Commit | source=git | neighbors=[Separation, dev, 28828b3 TO PROD, 35ec2de more changes.] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@0ef15888cec9e5472679927022838c2706c04688": "0ef1588 stuff" | kind=Commit | source=git | neighbors=[Separation, dev, 1b80d1c build fix, 36c67a5 added nitro] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@142aee3eb85c3dcaa1beec8869cdc0c8a1ac59dc": "142aee3 mejorar el cierre y proprieratary data" | kind=Commit | source=git | neighbors=[Separation, dev, 07768fd pagination and user tests, c044586 fixed codebase and added cierre…] | lang=es
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@1b80d1ca631aecb5bbcb4a76391d9524230d9d95": "1b80d1c build fix" | kind=Commit | source=git | neighbors=[0ef1588 stuff, Separation, dev, d1a0ec4 fix more stuff] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@1e257f436fc021d4597aa464eb34cfd73fc80165": "1e257f4 added a versioning disaply and fixed 2 issues regarding the CSV downloa…" | kind=Commit | source=git | neighbors=[Separation, dev, e5f80bd graphs, b96d95e bug fixed an issue witth export…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@24e20c422234d8ea3f8c1c0ae0bf6efce1c2a266": "24e20c4 bug fixes and fully documented." | kind=Commit | source=git | neighbors=[Separation, dev, cf3e43a mode documentation., 28828b3 TO PROD] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@24f0fbb7d0e20d9327c3605e61e2718cdb523b1f": "24f0fbb fixed more UIs" | kind=Commit | source=git | neighbors=[Separation, dev, f884e64 added admin dashboard, 9248632 number format fixed] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@2659acf08c9741df95ed3a0317e6bb24d06e0df7": "2659acf more fixes and added more features" | kind=Commit | source=git | neighbors=[Separation, dev, 4274ea5 graphify, cf3e43a mode documentation.] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-007.json

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
