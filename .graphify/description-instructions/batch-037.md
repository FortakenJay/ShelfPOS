# Node Description Batch 38 of 42

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

- "scripts_print_colon_preprod_init": "INIT" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L18 | neighbors=[print-colon-preprod.mjs]
- "scripts_print_colon_preprod_jobs": "jobs" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L300 | neighbors=[print-colon-preprod.mjs]
- "scripts_print_colon_preprod_matrixtouserdefinedchar": "matrixToUserDefinedChar()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L124 | neighbors=[print-colon-preprod.mjs]
- "scripts_print_colon_preprod_partial_cut": "PARTIAL_CUT" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L21 | neighbors=[print-colon-preprod.mjs]
- "scripts_print_colon_preprod_printer": "printer" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L299 | neighbors=[print-colon-preprod.mjs]
- "scripts_print_colon_preprod_probeprinter": "probePrinter()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L158 | neighbors=[print-colon-preprod.mjs]
- "scripts_print_colon_preprod_select_user_chars": "SELECT_USER_CHARS" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L23 | neighbors=[print-colon-preprod.mjs]
- "scripts_print_colon_sp_32_32_data": "data" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L87 | neighbors=[print-colon-sp-32-32.mjs]
- "scripts_print_colon_sp_32_32_dirname": "__dirname" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L13 | neighbors=[print-colon-sp-32-32.mjs]
- "scripts_print_colon_sp_32_32_port_colon_sign_matrix": "COLON_SIGN_MATRIX" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L19 | neighbors=[print-colon-sp-32-32-port.mjs]
- "scripts_print_colon_sp_32_32_port_data": "data" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L121 | neighbors=[print-colon-sp-32-32-port.mjs]
- "scripts_print_colon_sp_32_32_port_dirname": "__dirname" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L13 | neighbors=[print-colon-sp-32-32-port.mjs]
- "scripts_print_colon_sp_32_32_port_getprinterandport": "getPrinterAndPort()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L84 | neighbors=[print-colon-sp-32-32-port.mjs]
- "scripts_print_colon_sp_32_32_port_name_port": "{ name, port }" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L120 | neighbors=[print-colon-sp-32-32-port.mjs]
- "scripts_print_colon_sp_32_32_port_sendtoport": "sendToPort()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L99 | neighbors=[print-colon-sp-32-32-port.mjs]
- "scripts_print_colon_sp_32_32_printer": "printer" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L86 | neighbors=[print-colon-sp-32-32.mjs]
- "scripts_print_colon_sp_32_32_probeprinter": "probePrinter()" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L57 | neighbors=[print-colon-sp-32-32.mjs]
- "scripts_print_smoke_test_binpath": "binPath" | kind=code-symbol | source=shelfPos/scripts/print-smoke-test.mjs:L28 | neighbors=[print-smoke-test.mjs]
- "scripts_print_smoke_test_data": "data" | kind=code-symbol | source=shelfPos/scripts/print-smoke-test.mjs:L12 | neighbors=[print-smoke-test.mjs]
- "scripts_print_smoke_test_dir": "dir" | kind=code-symbol | source=shelfPos/scripts/print-smoke-test.mjs:L27 | neighbors=[print-smoke-test.mjs]
- "scripts_print_smoke_test_dirname": "__dirname" | kind=code-symbol | source=shelfPos/scripts/print-smoke-test.mjs:L9 | neighbors=[print-smoke-test.mjs]
- "scripts_print_smoke_test_printer": "printer" | kind=code-symbol | source=shelfPos/scripts/print-smoke-test.mjs:L17 | neighbors=[print-smoke-test.mjs]
- "scripts_print_test_big_receipt_dirname": "__dirname" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L14 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_big_receipt_printer": "printer" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L67 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_big_receipt_probeprinter": "probePrinter()" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L17 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_big_receipt_quirks": "quirks" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L68 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_big_receipt_rawprintscriptpath": "rawPrintScriptPath" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L15 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_big_receipt_receiptlines": "receiptLines" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L71 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_big_receipt_sendraw": "sendRaw()" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L31 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_big_receipt_t81quirks": "t81Quirks()" | kind=code-symbol | source=shelfPos/scripts/print-test-big-receipt.ts:L60 | neighbors=[print-test-big-receipt.ts]
- "scripts_print_test_crc_dirname": "__dirname" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L15 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_labellines": "labelLines" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L80 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_printer": "printer" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L68 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_probeprinter": "probePrinter()" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L18 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_quirks": "quirks" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L69 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_rawprintscriptpath": "rawPrintScriptPath" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L16 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_receiptlines": "receiptLines" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L72 | neighbors=[print-test-crc.ts]
- "scripts_print_test_crc_t81quirks": "t81Quirks()" | kind=code-symbol | source=shelfPos/scripts/print-test-crc.ts:L61 | neighbors=[print-test-crc.ts]
- "scripts_screenshot_page": "page" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L10 | neighbors=[screenshot.mjs]
- "scripts_screenshot_pending": "pending" | kind=code-symbol | source=shelfPos/scripts/screenshot.mjs:L18 | neighbors=[screenshot.mjs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-037.json

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
