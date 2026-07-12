# Node Description Batch 14 of 43

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

- "main_license_licensefilepath": "licenseFilePath()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L32 | neighbors=[license.ts, activateLicense(), readEncryptedLicense()]
- "main_license_payloadtostatus": "payloadToStatus()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L132 | neighbors=[license.ts, activateLicense(), checkStoredLicense()]
- "main_license_readencryptedlicense": "readEncryptedLicense()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L77 | neighbors=[license.ts, checkStoredLicense(), licenseFilePath()]
- "main_license_validatepayloadformachine": "validatePayloadForMachine()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L111 | neighbors=[license.ts, machineIdsMatch(), verifyLicenseJwt()]
- "node_dpapi_win_runps": "runPs()" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L23 | neighbors=[dpapi-win.ts, decryptDpapi(), encryptDpapi()]
- "node_parseenv_parseenvline": "parseEnvLine()" | kind=code-symbol | source=shelfPos/src/shared/node/parseEnv.ts:L2 | neighbors=[parseEnv.ts, applyEnvFile(), parseEnvFileContent()]
- "pos_linediscount_cartlinediscountpercentdisplay": "cartLineDiscountPercentDisplay()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/lineDiscount.ts:L11 | neighbors=[CartLineDiscountInput.tsx, lineDiscount.ts, formatPercentDisplay()]
- "pos_paymentcheckoutpad_paymentcheckoutpad": "PaymentCheckoutPad()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPad.tsx:L9 | neighbors=[PaymentCheckoutPad.tsx, PaymentCheckoutPanel.tsx, PaymentModal.tsx]
- "pos_paymentcustomer": "paymentCustomer.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentCustomer.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, buildPaymentCustomer(), PaymentModal.tsx]
- "pos_paymentmodalstate_createinitialpaymentstate": "createInitialPaymentState()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L38 | neighbors=[paymentModalState.ts, defaultCashTendered(), newPaymentEntry()]
- "pos_paymentmodalstate_defaultcashtendered": "defaultCashTendered()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L6 | neighbors=[paymentModalState.ts, createInitialPaymentState(), paymentModalReducer()]
- "pos_paymentmodalstate_newpaymententry": "newPaymentEntry()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L17 | neighbors=[paymentModalState.ts, createInitialPaymentState(), paymentModalReducer()]
- "pos_paymentmodalstate_paymentmodalreducer": "paymentModalReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L51 | neighbors=[paymentModalState.ts, defaultCashTendered(), newPaymentEntry()]
- "pos_poskeyboard_iseditableelement": "isEditableElement()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posKeyboard.ts:L3 | neighbors=[posKeyboard.ts, shouldKeepSearchFocused(), usePaymentKeyboard.ts]
- "pos_possidebar": "POSSidebar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSSidebar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSSidebar(), POSTerminalView.tsx]
- "pos_reprintreceiptslist": "ReprintReceiptsList.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReprintReceiptsList.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReprintReceiptsList(), ReprintReceiptsPage.tsx]
- "pos_useposterminal_useposterminal": "usePOSTerminal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L56 | neighbors=[POSPage.tsx, POSTerminalView.tsx, usePOSTerminal.ts]
- "pos_useverticaldragresize": "useVerticalDragResize.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/useVerticalDragResize.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSSearchPanel.tsx, useVerticalDragResize()]
- "products_productimportpreviewmodal_productimportpreviewmodal": "ProductImportPreviewModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductImportPreviewModal.tsx:L84 | neighbors=[ProductManagerModals.tsx, ProductImportPreviewModal.tsx, importHasStockChanges()]
- "products_productlabelprintpromptmodal": "ProductLabelPrintPromptModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductLabelPrintPromptModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, ProductLabelPrintPromptModal()]
- "products_productreceivechoicemodal_productreceivechoice": "ProductReceiveChoice" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductReceiveChoiceModal.tsx:L4 | neighbors=[ProductManagerModals.tsx, ProductReceiveChoiceModal.tsx, ProductsPage.tsx]
- "products_productstable": "ProductsTable.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsTable.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPage.tsx, ProductsTable()]
- "reports_salereceiptactions_salereceiptactions": "SaleReceiptActions()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/SaleReceiptActions.tsx:L5 | neighbors=[SaleReceiptActions.tsx, ItemizedSalesReportTable.tsx, TransactionLogReportTable.tsx]
- "reports_usesalereceiptactions": "useSaleReceiptActions.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/useSaleReceiptActions.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, SaleReceiptActions.tsx, useSaleReceiptActions()]
- "repos_audit_auditwhere": "auditWhere()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L14 | neighbors=[audit.ts, countAudit(), listAuditPage()]
- "repos_audit_countaudit": "countAudit()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L66 | neighbors=[audit.ts, auditWhere(), listAuditPage()]
- "repos_audit_listaudit": "listAudit()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L89 | neighbors=[audit.ts, listAuditPage(), dashboard.ts]
- "repos_carttabs_completecarttab": "completeCartTab()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L74 | neighbors=[cartTabs.ts, cartTabs.ts, deleteCartTabRow()]
- "repos_carttabs_deletecarttabrow": "deleteCartTabRow()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L61 | neighbors=[cartTabs.ts, completeCartTab(), removeCartTab()]
- "repos_carttabs_getcarttabjson": "getCartTabJson()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L53 | neighbors=[cartTabs.ts, cartTabs.ts, removeCartTab()]
- "repos_carttabs_listcarttabs": "listCartTabs()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L16 | neighbors=[cartTabs.ts, cartTabs.ts, listHeldCartTabsForCierre()]
- "repos_carttabs_listheldcarttabsforcierre": "listHeldCartTabsForCierre()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L142 | neighbors=[cierre.ts, cartTabs.ts, listCartTabs()]
- "repos_cashmovementtotals_cashmovementtotals": "cashMovementTotals()" | kind=code-symbol | source=shelfPos/src/main/db/repos/cashMovementTotals.ts:L5 | neighbors=[cash.ts, cashMovementTotals.ts, reports.ts]
- "repos_products_istombstonebarcode": "isTombstoneBarcode()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L28 | neighbors=[products.ts, releaseBarcodeForReuse(), softDeleteProduct()]
- "repos_products_productcatalogparams": "productCatalogParams()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L259 | neighbors=[products.ts, insertProductRow(), updateProductCatalogFields()]
- "repos_products_tombstonebarcodevalue": "tombstoneBarcodeValue()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L32 | neighbors=[products.ts, releaseBarcodeForReuse(), softDeleteProduct()]
- "repos_reports_cierrepriceoverrides": "cierrePriceOverrides()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L467 | neighbors=[cierre.ts, reports.ts, saleWhere()]
- "repos_reports_inventorysnapshotpage": "inventorySnapshotPage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L292 | neighbors=[reports.ts, reports.ts, inventoryTotals()]
- "repos_reports_paymentsbysale": "paymentsBySale()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L684 | neighbors=[reports.ts, itemizedSales(), transactionLog()]
- "repos_reports_periodopenedat": "periodOpenedAt()" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L310 | neighbors=[cierre.ts, cash.ts, reports.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-013.json

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
