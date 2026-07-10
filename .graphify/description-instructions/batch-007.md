# Node Description Batch 8 of 42

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

- "services_productcsvimport_validateproductinput": "validateProductInput()" | kind=code-symbol | source=shelfPos/src/main/services/productCsvImport.ts:L25 | neighbors=[products.ts, productCsvImport.ts, applyProductImport(), buildProductImportPreview(), productSupplierInvoicePdf.ts] | lang=en
- "services_productefacturaimport_efacturarowtoproductcsvrow": "efacturaRowToProductCsvRow()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L79 | neighbors=[productEfacturaImport.ts, cell(), parseEfacturaStock(), parseOptionalMoney(), readEfacturaXlsx()] | lang=en
- "shared_barcode_barcodeprintvalue": "barcodePrintValue()" | kind=code-symbol | source=shelfPos/src/shared/barcode.ts:L10 | neighbors=[products.ts, labelPrintLines.ts, barcode.ts, isPrintableCode128Barcode(), canPrintProductBarcode()] | lang=en
- "shared_money_digitsfrommoneyinput": "digitsFromMoneyInput()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L35 | neighbors=[money.ts, appendMoneyInputDigit(), backspaceMoneyInput(), moneyInputIsEmpty(), onMoneyInputChange()] | lang=en
- "shared_money_formatmoneyinputfromdigits": "formatMoneyInputFromDigits()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L49 | neighbors=[money.ts, appendMoneyInputDigit(), backspaceMoneyInput(), formatColones(), onMoneyInputChange()] | lang=en
- "shared_money_roundcolones": "roundColones()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L4 | neighbors=[helpers.ts, productCsvImport.ts, productSupplierInvoicePdf.ts, cartTabSnapshot.ts, money.ts] | lang=en
- "shared_types_licensestatus": "LicenseStatus" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1105 | neighbors=[license.ts, license.ts, index.ts, index.d.ts, types.ts] | lang=en
- "shared_types_role": "Role" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1 | neighbors=[helpers.ts, dashboard.ts, users.ts, session.ts, types.ts] | lang=en
- "src_config_loadconfig": "loadConfig()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L60 | neighbors=[config.ts, loadConfigFile(), readSecretKeyEnv(), resolveSecretKey(), index.ts] | lang=en
- "src_config_loadconfigfile": "loadConfigFile()" | kind=code-symbol | source=shelfPos/sync-service/src/config.ts:L33 | neighbors=[config.ts, loadConfig(), defaultSyncConfigPath(), loadEnvFile(), localSyncConfigPath()] | lang=en
- "src_sync_processentry": "processEntry()" | kind=code-symbol | source=shelfPos/sync-service/src/sync.ts:L107 | neighbors=[index.ts, sync.ts, sanitizeMirrorRow(), supabaseDelete(), supabaseUpsert()] | lang=en
- "tables_itemizedsalesreporttable": "ItemizedSalesReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/ItemizedSalesReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, SaleReceiptActions.tsx, SaleReceiptActions(), ItemizedSalesReportTable()] | lang=en
- "tables_transactionlogreporttable": "TransactionLogReportTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/tables/TransactionLogReportTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReportTable.tsx, SaleReceiptActions.tsx, SaleReceiptActions(), TransactionLogReportTable()] | lang=en
- "admin_cierrediscrepancyalerts_usecierrediscrepancyalerts": "useCierreDiscrepancyAlerts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/CierreDiscrepancyAlerts.tsx:L54 | neighbors=[CierreDiscrepancyAlerts.tsx, CierreDiscrepancyAlerts(), CierreDiscrepancyBanner(), useDismissedCierreIds()] | lang=en
- "admin_exportpage": "ExportPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/ExportPage.tsx:L1 | neighbors=[ExportBackup(), ExportPage(), InfoRow(), 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "admin_pincardprintmodal": "PinCardPrintModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/PinCardPrintModal.tsx:L1 | neighbors=[normalizePin(), PinCardPrintModal(), SettingsForm.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "admin_settingscloudpanel": "SettingsCloudPanel.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/SettingsCloudPanel.tsx:L1 | neighbors=[cloudStatusKey(), SettingsCloudPanel(), SettingsPage.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@07768fddedefc9e678b573eb021ed5a8aee2ca88": "07768fd pagination and user tests" | kind=Commit | source=git | neighbors=[Separation, dev, 9248632 number format fixed, 142aee3 mejorar el cierre y proprierata…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@07a5b841e2f46bb047b596c87cdc00a4f0aa93b6": "07a5b84 more fixes" | kind=Commit | source=git | neighbors=[Separation, dev, 28828b3 TO PROD, 35ec2de more changes.] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@0ef15888cec9e5472679927022838c2706c04688": "0ef1588 stuff" | kind=Commit | source=git | neighbors=[Separation, dev, 1b80d1c build fix, 36c67a5 added nitro] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@142aee3eb85c3dcaa1beec8869cdc0c8a1ac59dc": "142aee3 mejorar el cierre y proprieratary data" | kind=Commit | source=git | neighbors=[Separation, dev, 07768fd pagination and user tests, c044586 fixed codebase and added cierre…] | lang=es
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@1b80d1ca631aecb5bbcb4a76391d9524230d9d95": "1b80d1c build fix" | kind=Commit | source=git | neighbors=[0ef1588 stuff, Separation, dev, d1a0ec4 fix more stuff] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@1e257f436fc021d4597aa464eb34cfd73fc80165": "1e257f4 added a versioning disaply and fixed 2 issues regarding the CSV downloa…" | kind=Commit | source=git | neighbors=[Separation, dev, e5f80bd graphs, b96d95e bug fixed an issue witth export…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@24e20c422234d8ea3f8c1c0ae0bf6efce1c2a266": "24e20c4 bug fixes and fully documented." | kind=Commit | source=git | neighbors=[Separation, dev, cf3e43a mode documentation., 28828b3 TO PROD] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@24f0fbb7d0e20d9327c3605e61e2718cdb523b1f": "24f0fbb fixed more UIs" | kind=Commit | source=git | neighbors=[Separation, dev, f884e64 added admin dashboard, 9248632 number format fixed] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@2659acf08c9741df95ed3a0317e6bb24d06e0df7": "2659acf more fixes and added more features" | kind=Commit | source=git | neighbors=[Separation, dev, 4274ea5 graphify, cf3e43a mode documentation.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@28828b3fca647aae068799cb79bb8d9b7ff8409c": "28828b3 TO PROD" | kind=Commit | source=git | neighbors=[07a5b84 more fixes, Separation, dev, 24e20c4 bug fixes and fully documented.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@29f24aa5857eca47c126597559ed019d0c1d7635": "29f24aa dashboad online update" | kind=Commit | source=git | neighbors=[Separation, dev, fcdc308 stuff, 830f6ac Printer QA: TM-T81III detection…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@33bb2b32da538442ba12fb75a9aa428adaa70700": "33bb2b3 changed on nonsense" | kind=Commit | source=git | neighbors=[Separation, dev, f61bbb3 big update., 430f3aa lints] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@35ec2ded9138edaa85ac019c9d69fd64c96aac94": "35ec2de more changes." | kind=Commit | source=git | neighbors=[Separation, dev, 07a5b84 more fixes, 6564709 added admin] | lang=nl
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@36c67a5ec5d9540db53ff2da9123e37eee443c22": "36c67a5 added nitro" | kind=Commit | source=git | neighbors=[Separation, dev, 0ef1588 stuff, fcdc308 stuff] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@430f3aac88e04f634a2f35b1ca9e8a20768a4bb2": "430f3aa lints" | kind=Commit | source=git | neighbors=[Separation, dev, 33bb2b3 changed on nonsense, e32e315 sitea] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@4b18b22fc40dad33472cb5dbd031ccd7b7e390f8": "4b18b22 fixes." | kind=Commit | source=git | neighbors=[Separation, dev, f846cf6 updates., e26c275 more fixes.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@4d467fe30a69863c6e898835dc233e2a4d95d676": "4d467fe changes" | kind=Commit | source=git | neighbors=[Separation, dev, 81b3271 more fixes on the websuites, ee398bc clean and full rebuild] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@526a635547da8385f52de8a9b9f3052742e41a49": "526a635 fixed the build" | kind=Commit | source=git | neighbors=[Separation, dev, 7721f65 fixed previous issues, d1a0ec4 fix more stuff] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@5b151317c7cfa85fee16db5a9829105ab6961979": "5b15131 more fixes" | kind=Commit | source=git | neighbors=[Separation, dev, caf7d3c ui fixes, added add or replace …, 812fb04 more ui fixes.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@5f4f7d2c7160f70c7df2111955117d3c1c9a7bdd": "5f4f7d2 document to push so deployment is from another account" | kind=Commit | source=git | neighbors=[4274ea5 graphify, Separation, dev, 3da0d23 Merge branch 'dev' of https://g…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@641f6af79ed95f5a43d9caf13df2e2d7fdde2008": "641f6af fixed UI." | kind=Commit | source=git | neighbors=[Separation, dev, ea1fc8a new update, f846cf6 updates.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@6564709b322d47fba5326a2b506ea75ae6bf813b": "6564709 added admin" | kind=Commit | source=git | neighbors=[Separation, dev, 35ec2de more changes., 71a7bcb 1.3.3] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@660d33a239cccdcbfde443721c6d558c4ca9fadf": "660d33a fixed mail." | kind=Commit | source=git | neighbors=[4274ea5 graphify, Separation, dev, 3da0d23 Merge branch 'dev' of https://g…] | lang=pt

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
