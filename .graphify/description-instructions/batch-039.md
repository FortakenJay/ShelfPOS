# Node Description Batch 40 of 43

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

- "scripts_print_test_crc_probeprinter": "probePrinter()" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L18 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_quirks": "quirks" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L69 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_rawprintscriptpath": "rawPrintScriptPath" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L16 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_receiptlines": "receiptLines" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L72 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_t81quirks": "t81Quirks()" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L61 | neighbors=[print-test-crc.ts]
- "scripts_screenshot_page": "page" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L10 | neighbors=[screenshot.mjs]
- "scripts_screenshot_pending": "pending" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L18 | neighbors=[screenshot.mjs]
- "scripts_screenshot_send": "send()" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L20 | neighbors=[screenshot.mjs]
- "scripts_screenshot_ws": "ws" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L16 | neighbors=[screenshot.mjs]
- "scripts_sync_vendor_libdir": "libDir" | kind=code-symbol | source=shelfPos/sync-service/scripts/sync-vendor.mjs:L9 | neighbors=[sync-vendor.mjs]
- "scripts_sync_vendor_root": "root" | kind=code-symbol | source=shelfPos/sync-service/scripts/sync-vendor.mjs:L6 | neighbors=[sync-vendor.mjs]
- "scripts_sync_vendor_shareddir": "sharedDir" | kind=code-symbol | source=shelfPos/sync-service/scripts/sync-vendor.mjs:L8 | neighbors=[sync-vendor.mjs]
- "scripts_sync_vendor_vendordir": "vendorDir" | kind=code-symbol | source=shelfPos/sync-service/scripts/sync-vendor.mjs:L7 | neighbors=[sync-vendor.mjs]
- "scripts_test_supplier_pdf_main": "main()" | kind=code-symbol | source=shelfPos/scripts/test-supplier-pdf.ts:L5 | neighbors=[test-supplier-pdf.ts]
- "services_backup_backupservice_constructor": ".constructor()" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L10 | neighbors=[BackupService]
- "services_backup_backupservice_listbackups": ".listBackups()" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L35 | neighbors=[BackupService]
- "services_csvcolumns_headeraliases": "headerAliases()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L53 | neighbors=[csvColumns.ts]
- "services_csvcolumns_languages": "LANGUAGES" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L39 | neighbors=[csvColumns.ts]
- "services_csvcolumns_normalized_to_product_key": "NORMALIZED_TO_PRODUCT_KEY" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L65 | neighbors=[csvColumns.ts]
- "services_csvcolumns_product_header_aliases": "PRODUCT_HEADER_ALIASES" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L61 | neighbors=[csvColumns.ts]
- "services_csvcolumns_salescsvkey": "SalesCsvKey" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L20 | neighbors=[csvColumns.ts]
- "services_dataretention_retentionpurgecounts": "RetentionPurgeCounts" | kind=code-symbol | source=shelfPos/src/main/services/dataRetention.ts:L10 | neighbors=[dataRetention.ts]
- "services_escposrender_cent_byte": "CENT_BYTE" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L29 | neighbors=[escPosRender.ts]
- "services_escposrender_codepage_pc437": "CODEPAGE_PC437" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L12 | neighbors=[escPosRender.ts]
- "services_escposrender_codepage_pc850": "CODEPAGE_PC850" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L13 | neighbors=[escPosRender.ts]
- "services_escposrender_defaultrenderctx": "defaultRenderCtx" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L51 | neighbors=[escPosRender.ts]
- "services_escposrender_init": "INIT" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L11 | neighbors=[escPosRender.ts]
- "services_escposrender_open_cash_drawer": "OPEN_CASH_DRAWER" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L45 | neighbors=[escPosRender.ts]
- "services_escposrender_parsecentbyte": "parseCentByte()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L20 | neighbors=[escPosRender.ts]
- "services_escposrender_partial_cut": "PARTIAL_CUT" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L44 | neighbors=[escPosRender.ts]
- "services_escposrender_renderctx": "RenderCtx" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L49 | neighbors=[escPosRender.ts]
- "services_escposrender_textscale": "TextScale" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L47 | neighbors=[escPosRender.ts]
- "services_facturapdf_facturapdfcustomer": "FacturaPdfCustomer" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L17 | neighbors=[facturaPdf.ts]
- "services_facturapdf_facturapdfitem": "FacturaPdfItem" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L7 | neighbors=[facturaPdf.ts]
- "services_facturapdf_formatfacturaqty": "formatFacturaQty()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L54 | neighbors=[facturaPdf.ts]
- "services_facturapdf_linediscountpercent": "lineDiscountPercent()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L59 | neighbors=[facturaPdf.ts]
- "services_labellayout_shelflabelpaperwidthdots": "shelfLabelPaperWidthDots()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L19 | neighbors=[labelLayout.ts]
- "services_labellayout_shelflabeltextdots": "shelfLabelTextDots()" | kind=code-symbol | source=shelfPos/src/main/services/labelLayout.ts:L89 | neighbors=[labelLayout.ts]
- "services_labelprintlines_labelprintkind": "LabelPrintKind" | kind=code-symbol | source=shelfPos/src/main/services/labelPrintLines.ts:L6 | neighbors=[labelPrintLines.ts]
- "services_printer_getrawprintscriptpath": "getRawPrintScriptPath()" | kind=code-symbol | source=shelfPos/src/main/services/printer.ts:L304 | neighbors=[printer.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-039.json

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
