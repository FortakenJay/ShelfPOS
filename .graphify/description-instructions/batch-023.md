# Node Description Batch 24 of 43

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

- "repos_reports_returnscountsince": "returnsCountSince()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L326 | neighbors=[cierre.ts, reports.ts]
- "repos_salesreceipt_assertsaleinopenshift": "assertSaleInOpenShift()" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L108 | neighbors=[sales.ts, salesReceipt.ts]
- "repos_salesreceipt_listpendingcierresalesforreprint": "listPendingCierreSalesForReprint()" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L54 | neighbors=[sales.ts, salesReceipt.ts]
- "repos_settings_resolvepayshortcuts": "resolvePayShortcuts()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L65 | neighbors=[settings.ts, getAppSettings()]
- "repos_stock_assertsalestock": "assertSaleStock()" | kind=code-symbol | source=shelfPos/src/main/db/repos/stock.ts:L5 | neighbors=[sales.ts, stock.ts]
- "repos_syncqueue_enqueueallposuserssync": "enqueueAllPosUsersSync()" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L40 | neighbors=[index.ts, syncQueue.ts]
- "repos_syncqueue_getsyncqueuehealth": "getSyncQueueHealth()" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L96 | neighbors=[syncSetup.ts, syncQueue.ts]
- "repos_syncqueue_requeuefailedsync": "requeueFailedSync()" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L129 | neighbors=[syncSetup.ts, syncQueue.ts]
- "repos_users_countactiveadmins": "countActiveAdmins()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L71 | neighbors=[users.ts, users.ts]
- "repos_users_gethiddenoperatoruserid": "getHiddenOperatorUserId()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L34 | neighbors=[syncQueue.ts, users.ts]
- "repos_users_listappusers": "listAppUsers()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L41 | neighbors=[users.ts, users.ts]
- "repos_users_mapuser": "mapUser()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L23 | neighbors=[users.ts, getAppUserById()]
- "repos_users_usernametaken": "usernameTaken()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L62 | neighbors=[users.ts, users.ts]
- "schemas_primitives_actionshortcutkeyschema": "actionShortcutKeySchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L46 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_barcodeschema": "barcodeSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L32 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_daterangeschema": "dateRangeSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L81 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_filepathschema": "filePathSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L40 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_idtypeschema": "idTypeSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L65 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_languageschema": "languageSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L42 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_localdateschema": "localDateSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L12 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_moneyschema": "moneySchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L14 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_optionallongtextschema": "optionalLongTextSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L38 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_optionaltextschema": "optionalTextSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L36 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_passwordschema": "passwordSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L30 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_paymentmethodschema": "paymentMethodSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L61 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_pinschema": "pinSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L10 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_positiveidschema": "positiveIdSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L16 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_quantityschema": "quantitySchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L18 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_reporttypeschema": "reportTypeSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L69 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_roleschema": "roleSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L44 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_shorttextschema": "shortTextSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L34 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_stockstatusschema": "stockStatusSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L67 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_taxcategoryschema": "taxCategorySchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L63 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_usernameschema": "usernameSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L23 | neighbors=[ipc.ts, primitives.ts]
- "schemas_primitives_voidinput": "voidInput" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L8 | neighbors=[ipc.ts, primitives.ts]
- "scripts_e2e_full_log": "log()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L115 | neighbors=[e2e-full.mjs, dumpState()]
- "scripts_generate_license_loadprivatekey": "loadPrivateKey()" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L38 | neighbors=[generate-license.ts, main()]
- "scripts_generate_license_parseargs": "parseArgs()" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L13 | neighbors=[generate-license.ts, main()]
- "scripts_print_colon_preprod_rawprintscriptpath": "rawPrintScriptPath()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L145 | neighbors=[print-colon-preprod.mjs, sendRaw()]
- "scripts_print_colon_preprod_sendraw": "sendRaw()" | kind=code-symbol | source=shelfPos/scripts/print-colon-preprod.mjs:L170 | neighbors=[print-colon-preprod.mjs, rawPrintScriptPath()]

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
