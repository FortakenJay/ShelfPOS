# Node Description Batch 21 of 43

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

- "lib_carttabsnapshot_isemptysnapshot": "isEmptySnapshot()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L40 | neighbors=[cartTabSnapshot.ts, serializeCartTabSnapshot()]
- "lib_carttabsnapshot_snapshottotal": "snapshotTotal()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L36 | neighbors=[cartTabSnapshot.ts, serializeCartTabSnapshot()]
- "lib_format_formatmoney": "formatMoney()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/format.ts:L6 | neighbors=[format.ts, toast.tsx]
- "lib_printtoasts": "printToasts.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/printToasts.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, notifyPrintFailure()]
- "lib_session_homeafterlogin": "homeAfterLogin()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/session.ts:L31 | neighbors=[session.ts, homeFor()]
- "lib_session_homefor": "homeFor()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/session.ts:L19 | neighbors=[session.ts, homeAfterLogin()]
- "lib_session_usesession": "useSession()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/session.ts:L5 | neighbors=[session.ts, toast.tsx]
- "lib_shortcuts_shouldignoreshortcuttarget": "shouldIgnoreShortcutTarget()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/shortcuts.ts:L9 | neighbors=[shortcuts.ts, useScanner.ts]
- "lib_toast_toastprovider": "ToastProvider()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L48 | neighbors=[toast.tsx, toastsEnabledForRole()]
- "lib_toast_toastsenabledforrole": "toastsEnabledForRole()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L44 | neighbors=[toast.tsx, ToastProvider()]
- "main_activationwindow_activationurl": "activationUrl()" | kind=code-symbol | source=shelfPos/src/main/activationWindow.ts:L7 | neighbors=[activationWindow.ts, createActivationWindow()]
- "main_activationwindow_closeactivationwindow": "closeActivationWindow()" | kind=code-symbol | source=shelfPos/src/main/activationWindow.ts:L57 | neighbors=[license.ts, activationWindow.ts]
- "main_index_createmainwindow": "createMainWindow()" | kind=code-symbol | source=shelfPos/src/main/index.ts:L223 | neighbors=[index.ts, startLicensedApp()]
- "main_index_fatal": "fatal()" | kind=code-symbol | source=shelfPos/src/main/index.ts:L61 | neighbors=[index.ts, initData()]
- "main_license_assertpayloadshape": "assertPayloadShape()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L94 | neighbors=[license.ts, verifyLicenseJwt()]
- "main_license_invalidstatus": "invalidStatus()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L142 | neighbors=[license.ts, checkStoredLicense()]
- "main_license_loadpublickey": "loadPublicKey()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L36 | neighbors=[license.ts, verifyLicenseJwt()]
- "main_license_machineidsmatch": "machineIdsMatch()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L87 | neighbors=[license.ts, validatePayloadForMachine()]
- "main_window_appbrowserwindow": "appBrowserWindow()" | kind=code-symbol | source=shelfPos/src/main/window.ts:L5 | neighbors=[window.ts, showSaveDialog()]
- "node_dpapi_win_decryptdpapi": "decryptDpapi()" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L38 | neighbors=[dpapi-win.ts, runPs()]
- "node_dpapi_win_encryptdpapi": "encryptDpapi()" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L31 | neighbors=[dpapi-win.ts, runPs()]
- "node_parseenv_applyenvfile": "applyEnvFile()" | kind=code-symbol | source=shelfPos/src/shared/node/parseEnv.ts:L22 | neighbors=[parseEnv.ts, parseEnvLine()]
- "node_parseenv_parseenvfilecontent": "parseEnvFileContent()" | kind=code-symbol | source=shelfPos/src/shared/node/parseEnv.ts:L12 | neighbors=[parseEnv.ts, parseEnvLine()]
- "pos_cartlinediscountinput_cartlinediscountinput": "CartLineDiscountInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartLineDiscountInput.tsx:L7 | neighbors=[CartLineDiscountInput.tsx, POSCartPanel.tsx]
- "pos_cartmiscnameinput_cartmiscnameinput": "CartMiscNameInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartMiscNameInput.tsx:L7 | neighbors=[CartMiscNameInput.tsx, POSCartPanel.tsx]
- "pos_carttabsbar_carttabsbar": "CartTabsBar()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartTabsBar.tsx:L16 | neighbors=[CartTabsBar.tsx, POSTerminalView.tsx]
- "pos_cashdrawersummary_cashdrawersummary": "CashDrawerSummary()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerSummary.tsx:L27 | neighbors=[CashDrawerPage.tsx, CashDrawerSummary.tsx]
- "pos_cashmovementspanel_cashmovementspanel": "CashMovementsPanel()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashMovementsPanel.tsx:L18 | neighbors=[CashDrawerPage.tsx, CashMovementsPanel.tsx]
- "pos_customermodal_customermodal": "CustomerModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CustomerModal.tsx:L26 | neighbors=[CustomerModal.tsx, POSModals.tsx]
- "pos_discountmodal_discountmodal": "DiscountModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/DiscountModal.tsx:L54 | neighbors=[DiscountModal.tsx, POSModals.tsx]
- "pos_linediscount_formatpercentdisplay": "formatPercentDisplay()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/lineDiscount.ts:L21 | neighbors=[lineDiscount.ts, cartLineDiscountPercentDisplay()]
- "pos_linediscount_linediscountfrompercent": "lineDiscountFromPercent()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/lineDiscount.ts:L5 | neighbors=[lineDiscount.ts, usePOSTerminal.ts]
- "pos_linediscount_parsediscountpercentinput": "parseDiscountPercentInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/lineDiscount.ts:L26 | neighbors=[CartLineDiscountInput.tsx, lineDiscount.ts]
- "pos_linediscountpinmodal_linediscountpinmodal": "LineDiscountPinModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/LineDiscountPinModal.tsx:L13 | neighbors=[LineDiscountPinModal.tsx, POSTerminalView.tsx]
- "pos_linediscountpinmodal_linediscountpinrequest": "LineDiscountPinRequest" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/LineDiscountPinModal.tsx:L6 | neighbors=[LineDiscountPinModal.tsx, usePOSTerminal.ts]
- "pos_openfloatmodal_openfloatmodal": "OpenFloatModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/OpenFloatModal.tsx:L14 | neighbors=[OpenFloatModal.tsx, POSTerminalView.tsx]
- "pos_paymentcheckoutpanel_paymentcheckoutpanel": "PaymentCheckoutPanel()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPanel.tsx:L83 | neighbors=[PaymentCheckoutPanel.tsx, PaymentModal.tsx]
- "pos_paymentcustomer_buildpaymentcustomer": "buildPaymentCustomer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentCustomer.ts:L4 | neighbors=[paymentCustomer.ts, PaymentModal.tsx]
- "pos_paymentinvoicecustomersection_paymentinvoicecustomersection": "PaymentInvoiceCustomerSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentInvoiceCustomerSection.tsx:L6 | neighbors=[PaymentInvoiceCustomerSection.tsx, PaymentModal.tsx]
- "pos_paymentmethodbuttons_paymentmethodbuttons": "PaymentMethodButtons()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodButtons.tsx:L12 | neighbors=[PaymentMethodButtons.tsx, PaymentMethodSidebar.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-020.json

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
