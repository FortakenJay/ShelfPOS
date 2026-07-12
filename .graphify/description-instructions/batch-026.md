# Node Description Batch 27 of 43

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

- "services_productefacturaimport_parseefacturastock": "parseEfacturaStock()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L70 | neighbors=[productEfacturaImport.ts, efacturaRowToProductCsvRow()]
- "services_productefacturaimport_parseoptionalmoney": "parseOptionalMoney()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L66 | neighbors=[productEfacturaImport.ts, efacturaRowToProductCsvRow()]
- "services_productefacturaimport_worksheettomatrix": "worksheetToMatrix()" | kind=code-symbol | source=shelfPos/src/main/services/productEfacturaImport.ts:L32 | neighbors=[productEfacturaImport.ts, readEfacturaXlsx()]
- "services_productsupplierinvoicepdf_applysupplierinvoiceimport": "applySupplierInvoiceImport()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L250 | neighbors=[products.ts, productSupplierInvoicePdf.ts]
- "services_productsupplierinvoicepdf_guesscategory": "guessCategory()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L47 | neighbors=[productSupplierInvoicePdf.ts, parseSupplierInvoiceText()]
- "services_productsupplierinvoicepdf_normalizepdftext": "normalizePdfText()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L32 | neighbors=[productSupplierInvoicePdf.ts, parseSupplierInvoiceText()]
- "services_productsupplierinvoicepdf_parsemoney": "parseMoney()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L41 | neighbors=[productSupplierInvoicePdf.ts, extractTrailingNumbers()]
- "services_productsupplierinvoicepdf_requiresupplieramount": "requireSupplierAmount()" | kind=code-symbol | source=shelfPos/src/main/services/productSupplierInvoicePdf.ts:L41 | neighbors=[productSupplierInvoicePdf.ts, extractTrailingNumbers()]
- "services_syncconfig_writesyncconfig": "writeSyncConfig()" | kind=code-symbol | source=shelfPos/src/main/services/syncConfig.ts:L146 | neighbors=[syncConfig.ts, writePairingCodeOnly()]
- "shared_barcode_formatspacedbarcode": "formatSpacedBarcode()" | kind=code-symbol | source=shelfPos/src/shared/barcode.ts:L21 | neighbors=[shelfLabelLines.ts, barcode.ts]
- "shared_miscitem": "miscItem.ts" | kind=code-symbol | source=shelfPos/src/shared/miscItem.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, parseMiscPriceInput()]
- "shared_money_formatcolonesprint": "formatColonesPrint()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L52 | neighbors=[format.ts, money.ts]
- "shared_money_formatmoneyinputfromnumber": "formatMoneyInputFromNumber()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L70 | neighbors=[money.ts, formatColones()]
- "shared_money_moneyinputisempty": "moneyInputIsEmpty()" | kind=code-symbol | source=shelfPos/src/shared/money.ts:L65 | neighbors=[money.ts, digitsFromMoneyInput()]
- "shared_pendingstoreid_parsependingstoreidfilecontent": "parsePendingStoreIdFileContent()" | kind=code-symbol | source=shelfPos/src/shared/pendingStoreId.ts:L5 | neighbors=[pendingStoreId.ts, pendingStoreId.ts]
- "shared_pendingstoreid_shouldapplypendingstoreid": "shouldApplyPendingStoreId()" | kind=code-symbol | source=shelfPos/src/shared/pendingStoreId.ts:L10 | neighbors=[pendingStoreId.ts, pendingStoreId.ts]
- "shared_pricing_sanctionedunitpricekind": "SanctionedUnitPriceKind" | kind=code-symbol | source=shelfPos/src/shared/pricing.ts:L12 | neighbors=[pricing.ts, moneyEquals()]
- "shared_types_adjuststockinput": "AdjustStockInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L271 | neighbors=[products.ts, types.ts]
- "shared_types_backupinfo": "BackupInfo" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1087 | neighbors=[backup.ts, types.ts]
- "shared_types_cartremoveauthorizeinput": "CartRemoveAuthorizeInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L917 | neighbors=[cart.ts, types.ts]
- "shared_types_carttabcreateinput": "CartTabCreateInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L930 | neighbors=[cartTabs.ts, types.ts]
- "shared_types_carttabdiscardauditedinput": "CartTabDiscardAuditedInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L945 | neighbors=[cartTabs.ts, types.ts]
- "shared_types_carttabdiscardresult": "CartTabDiscardResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L956 | neighbors=[cartTabs.ts, types.ts]
- "shared_types_carttablistitem": "CartTabListItem" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L923 | neighbors=[cartTabs.ts, types.ts]
- "shared_types_carttabrenameinput": "CartTabRenameInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L940 | neighbors=[cartTabs.ts, types.ts]
- "shared_types_carttabreorderinput": "CartTabReorderInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L952 | neighbors=[cartTabs.ts, types.ts]
- "shared_types_carttabsaveinput": "CartTabSaveInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L935 | neighbors=[cartTabs.ts, types.ts]
- "shared_types_cashmovementinput": "CashMovementInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L1142 | neighbors=[cash.ts, types.ts]
- "shared_types_cierreconfirminput": "CierreConfirmInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L845 | neighbors=[cierre.ts, types.ts]
- "shared_types_cierreconfirmresult": "CierreConfirmResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L857 | neighbors=[cierre.ts, types.ts]
- "shared_types_cierrediscardedtabsreport": "CierreDiscardedTabsReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L790 | neighbors=[printTemplates.ts, types.ts]
- "shared_types_cierrediscountreport": "CierreDiscountReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L752 | neighbors=[printTemplates.ts, types.ts]
- "shared_types_cierrediscrepancyalert": "CierreDiscrepancyAlert" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L835 | neighbors=[cierre.ts, types.ts]
- "shared_types_cierrepreview": "CierrePreview" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L795 | neighbors=[cierre.ts, types.ts]
- "shared_types_cierrepriceoverridereport": "CierrePriceOverrideReport" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L776 | neighbors=[printTemplates.ts, types.ts]
- "shared_types_cierrerecord": "CierreRecord" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L814 | neighbors=[cierre.ts, types.ts]
- "shared_types_createreturninput": "CreateReturnInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L399 | neighbors=[returns.ts, types.ts]
- "shared_types_createreturnresult": "CreateReturnResult" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L406 | neighbors=[returns.ts, types.ts]
- "shared_types_createsaleinput": "CreateSaleInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L315 | neighbors=[sales.ts, types.ts]
- "shared_types_createsalelineinput": "CreateSaleLineInput" | kind=code-symbol | source=shelfPos/src/shared/types.ts:L313 | neighbors=[sales.ts, types.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-026.json

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
