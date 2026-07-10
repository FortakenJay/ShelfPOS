# Node Description Batch 24 of 42

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

- "scripts_generate_license_loadprivatekey": "loadPrivateKey()" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L38 | neighbors=[generate-license.ts, main()]
- "scripts_generate_license_parseargs": "parseArgs()" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L13 | neighbors=[generate-license.ts, main()]
- "scripts_print_colon_preprod_rawprintscriptpath": "rawPrintScriptPath()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L145 | neighbors=[print-colon-preprod.mjs, sendRaw()]
- "scripts_print_colon_preprod_sendraw": "sendRaw()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L170 | neighbors=[print-colon-preprod.mjs, rawPrintScriptPath()]
- "scripts_print_colon_sp_32_32_buildbuffer": "buildBuffer()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L34 | neighbors=[print-colon-sp-32-32.mjs, colonNvGraphicEscPos()]
- "scripts_print_colon_sp_32_32_colonnvgraphicescpos": "colonNvGraphicEscPos()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L17 | neighbors=[print-colon-sp-32-32.mjs, buildBuffer()]
- "scripts_print_colon_sp_32_32_port_buildbuffer": "buildBuffer()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L65 | neighbors=[print-colon-sp-32-32-port.mjs, matrixToUserDefinedChar()]
- "scripts_print_colon_sp_32_32_port_matrixtouserdefinedchar": "matrixToUserDefinedChar()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L46 | neighbors=[print-colon-sp-32-32-port.mjs, buildBuffer()]
- "scripts_print_colon_sp_32_32_rawprintscriptpath": "rawPrintScriptPath()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L21 | neighbors=[print-colon-sp-32-32.mjs, sendRaw()]
- "scripts_print_colon_sp_32_32_sendraw": "sendRaw()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L69 | neighbors=[print-colon-sp-32-32.mjs, rawPrintScriptPath()]
- "scripts_print_test_crc_main": "main()" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L89 | neighbors=[print-test-crc.ts, sendRaw()]
- "scripts_print_test_crc_sendraw": "sendRaw()" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L32 | neighbors=[print-test-crc.ts, main()]
- "services_csv_buildcsv": "buildCsv()" | kind=code-symbol | source=shelfPos/src/main/services/csv.ts:L6 | neighbors=[backup.ts, csv.ts]
- "services_csv_csvescape": "csvEscape()" | kind=code-symbol | source=shelfPos/src/main/services/csv.ts:L1 | neighbors=[csv.ts, productCsvExport.ts]
- "services_csv_parsecsv": "parseCsv()" | kind=code-symbol | source=shelfPos/src/main/services/csv.ts:L12 | neighbors=[csv.ts, productCsvImport.ts]
- "services_csvcolumns_formatpaymentmethod": "formatPaymentMethod()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L88 | neighbors=[backup.ts, csvColumns.ts]
- "services_csvcolumns_mapproductcsvheaders": "mapProductCsvHeaders()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L71 | neighbors=[csvColumns.ts, productCsvImport.ts]
- "services_csvcolumns_parsepaymentmethod": "parsePaymentMethod()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L94 | neighbors=[csvColumns.ts, normalizeHeader()]
- "services_csvcolumns_product_csv_keys": "PRODUCT_CSV_KEYS" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L21 | neighbors=[csvColumns.ts, productCsvExport.ts]
- "services_csvcolumns_productcsvheaders": "productCsvHeaders()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L42 | neighbors=[csvColumns.ts, productCsvExport.ts]
- "services_csvcolumns_sales_csv_keys": "SALES_CSV_KEYS" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L4 | neighbors=[backup.ts, csvColumns.ts]
- "services_csvcolumns_salescsvheaders": "salesCsvHeaders()" | kind=code-symbol | source=shelfPos/src/main/services/csvColumns.ts:L38 | neighbors=[backup.ts, csvColumns.ts]
- "services_csvspreadsheet_asspreadsheettext": "asSpreadsheetText()" | kind=code-symbol | source=shelfPos/src/main/services/csvSpreadsheet.ts:L2 | neighbors=[csvSpreadsheet.ts, productCsvExport.ts]
- "services_csvspreadsheet_parsespreadsheettext": "parseSpreadsheetText()" | kind=code-symbol | source=shelfPos/src/main/services/csvSpreadsheet.ts:L8 | neighbors=[csvSpreadsheet.ts, productCsvImport.ts]
- "services_csvstream_closewritestream": "closeWriteStream()" | kind=code-symbol | source=shelfPos/src/main/services/csvStream.ts:L27 | neighbors=[csvStream.ts, productCsvExport.ts]
- "services_csvstream_openutf8csvwritestream": "openUtf8CsvWriteStream()" | kind=code-symbol | source=shelfPos/src/main/services/csvStream.ts:L32 | neighbors=[csvStream.ts, productCsvExport.ts]
- "services_csvstream_writetostream": "writeToStream()" | kind=code-symbol | source=shelfPos/src/main/services/csvStream.ts:L4 | neighbors=[csvStream.ts, productCsvExport.ts]
- "services_dataretention_purgeexpiredreportdata": "purgeExpiredReportData()" | kind=code-symbol | source=shelfPos/src/main/services/dataRetention.ts:L22 | neighbors=[index.ts, dataRetention.ts]
- "services_dpapi_win": "dpapi-win.ts" | kind=code-symbol | source=shelfPos/src/main/services/dpapi-win.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, dpapi-win.ts]
- "services_escposrender_barcodedatacode128": "barcodeDataCode128()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L317 | neighbors=[escPosRender.ts, toEscPos()]
- "services_escposrender_centscalefor": "centScaleFor()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L83 | neighbors=[escPosRender.ts, pushCentSign()]
- "services_escposrender_drawerpulsebytes": "drawerPulseBytes()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L385 | neighbors=[escPosRender.ts, printer.ts]
- "services_escposrender_feed": "FEED()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L43 | neighbors=[escPosRender.ts, toEscPos()]
- "services_escposrender_normalizeprintspaces": "normalizePrintSpaces()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L129 | neighbors=[escPosRender.ts, encodePrintText()]
- "services_escposrender_replaceprintarrows": "replacePrintArrows()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L121 | neighbors=[escPosRender.ts, encodePrintText()]
- "services_escposrender_sizebig": "sizeBig()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L40 | neighbors=[escPosRender.ts, scaleCmd()]
- "services_escposrender_sizehuge": "sizeHuge()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L41 | neighbors=[escPosRender.ts, scaleCmd()]
- "services_escposrender_sizemega": "sizeMega()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L42 | neighbors=[escPosRender.ts, scaleCmd()]
- "services_escposrender_sizenormal": "sizeNormal()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L39 | neighbors=[escPosRender.ts, scaleCmd()]
- "services_facturapdf_buildtablerows": "buildTableRows()" | kind=code-symbol | source=shelfPos/src/main/services/facturaPdf.ts:L90 | neighbors=[facturaPdf.ts, buildPage()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-023.json

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
