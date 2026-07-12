# Node Description Batch 38 of 43

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

- "schemas_ipc_cashmovementinputschema": "cashMovementInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L261 | neighbors=[ipc.ts]
- "schemas_ipc_cierreconfirminputschema": "cierreConfirmInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L255 | neighbors=[ipc.ts]
- "schemas_ipc_createreturninputschema": "createReturnInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L157 | neighbors=[ipc.ts]
- "schemas_ipc_createsaleinputschema": "createSaleInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L114 | neighbors=[ipc.ts]
- "schemas_ipc_createsaleiteminputschema": "createSaleItemInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L103 | neighbors=[ipc.ts]
- "schemas_ipc_createsalemiscitemschema": "createSaleMiscItemSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L94 | neighbors=[ipc.ts]
- "schemas_ipc_createsaleproductitemschema": "createSaleProductItemSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L87 | neighbors=[ipc.ts]
- "schemas_ipc_creditpaymentinputschema": "creditPaymentInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L148 | neighbors=[ipc.ts]
- "schemas_ipc_customercreateinputschema": "customerCreateInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L132 | neighbors=[ipc.ts]
- "schemas_ipc_customerinputschema": "customerInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L105 | neighbors=[ipc.ts]
- "schemas_ipc_customerlistinputschema": "customerListInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L125 | neighbors=[ipc.ts]
- "schemas_ipc_customerupdateinputschema": "customerUpdateInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L139 | neighbors=[ipc.ts]
- "schemas_ipc_discountauthorizeinputschema": "discountAuthorizeInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L172 | neighbors=[ipc.ts]
- "schemas_ipc_firstrunsetupinputschema": "firstRunSetupInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L188 | neighbors=[ipc.ts]
- "schemas_ipc_languagepayloadschema": "languagePayloadSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L35 | neighbors=[ipc.ts]
- "schemas_ipc_licenseactivateinputschema": "licenseActivateInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L268 | neighbors=[ipc.ts]
- "schemas_ipc_pinchangeschema": "pinChangeSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L36 | neighbors=[ipc.ts]
- "schemas_ipc_priceoverrideauthorizeinputschema": "priceOverrideAuthorizeInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L179 | neighbors=[ipc.ts]
- "schemas_ipc_printqueuelistinputschema": "printQueueListInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L280 | neighbors=[ipc.ts]
- "schemas_ipc_productfiltersschema": "productFiltersSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L64 | neighbors=[ipc.ts]
- "schemas_ipc_productinputobjectschema": "productInputObjectSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L43 | neighbors=[ipc.ts]
- "schemas_ipc_productinputschema": "productInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L60 | neighbors=[ipc.ts]
- "schemas_ipc_productupdateinputschema": "productUpdateInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L272 | neighbors=[ipc.ts]
- "schemas_ipc_reportpayloadschema": "reportPayloadSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L248 | neighbors=[ipc.ts]
- "schemas_ipc_salepaymentinputschema": "salePaymentInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L81 | neighbors=[ipc.ts]
- "schemas_ipc_settingsupdateinputschema": "settingsUpdateInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L209 | neighbors=[ipc.ts]
- "schemas_ipc_usercreateinputschema": "userCreateInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L195 | neighbors=[ipc.ts]
- "schemas_ipc_userupdateinputschema": "userUpdateInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L201 | neighbors=[ipc.ts]
- "schemas_primitives_localtimeschema": "localTimeSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/primitives.ts:L79 | neighbors=[primitives.ts]
- "scripts_e2e_full_fail": "fail()" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L116 | neighbors=[e2e-full.mjs]
- "scripts_e2e_full_page": "page" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L8 | neighbors=[e2e-full.mjs]
- "scripts_e2e_full_pending": "pending" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L13 | neighbors=[e2e-full.mjs]
- "scripts_e2e_full_ws": "ws" | kind=code-symbol | source=shelfPos/scripts/e2e-full.mjs:L11 | neighbors=[e2e-full.mjs]
- "scripts_generate_keypair_generatekeypairsync": "{ generateKeyPairSync }" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L6 | neighbors=[generate-keypair.js]
- "scripts_generate_keypair_homedir": "{ homedir }" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L8 | neighbors=[generate-keypair.js]
- "scripts_generate_keypair_join_dirname": "{ join, dirname }" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L9 | neighbors=[generate-keypair.js]
- "scripts_generate_keypair_privatedir": "privateDir" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L14 | neighbors=[generate-keypair.js]
- "scripts_generate_keypair_publickey_privatekey": "{ publicKey, privateKey }" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L17 | neighbors=[generate-keypair.js]
- "scripts_generate_keypair_writefilesync_mkdirsync_existssync": "{ writeFileSync, mkdirSync, existsSync }" | kind=code-symbol | source=shelfPos/scripts/generate-keypair.js:L7 | neighbors=[generate-keypair.js]
- "scripts_generate_license_args": "Args" | kind=code-symbol | source=shelfPos/scripts/generate-license.ts:L7 | neighbors=[generate-license.ts]

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
