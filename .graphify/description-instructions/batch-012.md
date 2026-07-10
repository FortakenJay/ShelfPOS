# Node Description Batch 13 of 42

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

- "ipc_products_assignproductbarcode": "assignProductBarcode()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L97 | neighbors=[products.ts, mapProductDbError(), productForBarcodePrint()]
- "ipc_products_mapproductdberror": "mapProductDbError()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L83 | neighbors=[products.ts, assignProductBarcode(), isUniqueViolation()]
- "ipc_products_printlabelforproduct": "printLabelForProduct()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L167 | neighbors=[products.ts, printProductLabel(), runBatchPrint()]
- "ipc_products_productforbarcodeprint": "productForBarcodePrint()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L113 | neighbors=[products.ts, printProductLabel(), assignProductBarcode()]
- "ipc_reports_boundsforreport": "boundsForReport()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L42 | neighbors=[reports.ts, buildReportPrintLines(), runReport()]
- "lib_api_apierror": "ApiError" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/api.ts:L69 | neighbors=[api.ts, .constructor(), call()]
- "lib_cartline_cartlinegross": "cartLineGross()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L18 | neighbors=[cartLine.ts, miscLineUnitPrice(), cartLineTotal()]
- "lib_cartline_misclineunitprice": "miscLineUnitPrice()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L9 | neighbors=[cartLine.ts, cartLineGross(), cartLineUnitPrice()]
- "lib_carttabsnapshot_serializecarttabsnapshot": "serializeCartTabSnapshot()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L31 | neighbors=[cartTabSnapshot.ts, isEmptySnapshot(), snapshotTotal()]
- "main_activationwindow_createactivationwindow": "createActivationWindow()" | kind=code-symbol | source=shelfPos/src/main/activationWindow.ts:L14 | neighbors=[activationWindow.ts, activationUrl(), index.ts]
- "main_appicon_resolveappicon": "resolveAppIcon()" | kind=code-symbol | source=shelfPos/src/main/appIcon.ts:L9 | neighbors=[activationWindow.ts, appIcon.ts, index.ts]
- "main_index_initdata": "initData()" | kind=code-symbol | source=shelfPos/src/main/index.ts:L83 | neighbors=[index.ts, fatal(), startLicensedApp()]
- "main_index_startlicensedapp": "startLicensedApp()" | kind=code-symbol | source=shelfPos/src/main/index.ts:L300 | neighbors=[index.ts, createMainWindow(), initData()]
- "main_license_checklicense": "checkLicense()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L162 | neighbors=[index.ts, license.ts, checkStoredLicense()]
- "main_license_decryptlicensetoken": "decryptLicenseToken()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L67 | neighbors=[license.ts, checkStoredLicense(), deriveStorageKey()]
- "main_license_derivestoragekey": "deriveStorageKey()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L51 | neighbors=[license.ts, decryptLicenseToken(), encryptLicenseToken()]
- "main_license_devlicensestatus": "devLicenseStatus()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L152 | neighbors=[license.ts, getMachineId(), getLicenseStatus()]
- "main_license_encryptlicensetoken": "encryptLicenseToken()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L55 | neighbors=[license.ts, activateLicense(), deriveStorageKey()]
- "main_license_licensefilepath": "licenseFilePath()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L32 | neighbors=[license.ts, activateLicense(), readEncryptedLicense()]
- "main_license_payloadtostatus": "payloadToStatus()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L132 | neighbors=[license.ts, activateLicense(), checkStoredLicense()]
- "main_license_readencryptedlicense": "readEncryptedLicense()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L77 | neighbors=[license.ts, checkStoredLicense(), licenseFilePath()]
- "main_license_validatepayloadformachine": "validatePayloadForMachine()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L111 | neighbors=[license.ts, machineIdsMatch(), verifyLicenseJwt()]
- "node_dpapi_win_runps": "runPs()" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L23 | neighbors=[dpapi-win.ts, decryptDpapi(), encryptDpapi()]
- "node_parseenv_parseenvline": "parseEnvLine()" | kind=code-symbol | source=shelfPos/src/shared/node/parseEnv.ts:L2 | neighbors=[parseEnv.ts, applyEnvFile(), parseEnvFileContent()]
- "pos_linediscount_cartlinediscountpercentdisplay": "cartLineDiscountPercentDisplay()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/lineDiscount.ts:L11 | neighbors=[CartLineDiscountInput.tsx, lineDiscount.ts, formatPercentDisplay()]
- "pos_openfloatmodal": "OpenFloatModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/OpenFloatModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, OpenFloatModal(), POSTerminalView.tsx]
- "pos_paymentcheckoutpad_paymentcheckoutpad": "PaymentCheckoutPad()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPad.tsx:L9 | neighbors=[PaymentCheckoutPad.tsx, PaymentCheckoutPanel.tsx, PaymentModal.tsx]
- "pos_paymentcustomer": "paymentCustomer.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentCustomer.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, buildPaymentCustomer(), PaymentModal.tsx]
- "pos_paymentmodalstate_createinitialpaymentstate": "createInitialPaymentState()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L39 | neighbors=[paymentModalState.ts, defaultCashTendered(), newPaymentEntry()]
- "pos_paymentmodalstate_defaultcashtendered": "defaultCashTendered()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L5 | neighbors=[paymentModalState.ts, createInitialPaymentState(), paymentModalReducer()]
- "pos_paymentmodalstate_newpaymententry": "newPaymentEntry()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L16 | neighbors=[paymentModalState.ts, createInitialPaymentState(), paymentModalReducer()]
- "pos_paymentmodalstate_paymentmodalreducer": "paymentModalReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L52 | neighbors=[paymentModalState.ts, defaultCashTendered(), newPaymentEntry()]
- "pos_poskeyboard_iseditableelement": "isEditableElement()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posKeyboard.ts:L3 | neighbors=[posKeyboard.ts, shouldKeepSearchFocused(), usePaymentKeyboard.ts]
- "pos_possidebar": "POSSidebar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSSidebar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSSidebar(), POSTerminalView.tsx]
- "pos_reprintreceiptslist": "ReprintReceiptsList.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReprintReceiptsList.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ReprintReceiptsList(), ReprintReceiptsPage.tsx]
- "pos_useposterminal_useposterminal": "usePOSTerminal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L61 | neighbors=[POSPage.tsx, POSTerminalView.tsx, usePOSTerminal.ts]
- "pos_useverticaldragresize": "useVerticalDragResize.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/useVerticalDragResize.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSSearchPanel.tsx, useVerticalDragResize()]
- "products_productimportpreviewmodal_productimportpreviewmodal": "ProductImportPreviewModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductImportPreviewModal.tsx:L84 | neighbors=[ProductManagerModals.tsx, ProductImportPreviewModal.tsx, importHasStockChanges()]
- "products_productlabelprintpromptmodal": "ProductLabelPrintPromptModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductLabelPrintPromptModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, ProductLabelPrintPromptModal()]
- "products_productreceivechoicemodal_productreceivechoice": "ProductReceiveChoice" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductReceiveChoiceModal.tsx:L4 | neighbors=[ProductManagerModals.tsx, ProductReceiveChoiceModal.tsx, ProductsPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-012.json

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
