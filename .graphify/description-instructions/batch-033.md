# Node Description Batch 34 of 42

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

- "lib_toast_toastapi": "ToastApi" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L22 | neighbors=[toast.tsx]
- "lib_toast_toastcontext": "ToastContext" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L31 | neighbors=[toast.tsx]
- "lib_toast_toastviewport": "ToastViewport()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L112 | neighbors=[toast.tsx]
- "lib_toast_usetoasts": "useToasts()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L157 | neighbors=[toast.tsx]
- "lib_usescanner_iswedgescan": "isWedgeScan()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/useScanner.ts:L4 | neighbors=[useScanner.ts]
- "lib_usescanner_shouldskipglobalscantarget": "shouldSkipGlobalScanTarget()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/useScanner.ts:L148 | neighbors=[useScanner.ts]
- "lib_usescanner_usedebouncedvalue": "useDebouncedValue()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/useScanner.ts:L161 | neighbors=[useScanner.ts]
- "lib_usescanner_useglobalbarcodescanner": "useGlobalBarcodeScanner()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/useScanner.ts:L56 | neighbors=[useScanner.ts]
- "lib_usescanner_usescannerdetector": "useScannerDetector()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/useScanner.ts:L22 | neighbors=[useScanner.ts]
- "main_errors_apperror_constructor": ".constructor()" | kind=code-symbol | source=shelfPos/src/main/errors.ts:L3 | neighbors=[AppError]
- "main_license_encryptedlicensefile": "EncryptedLicenseFile" | kind=code-symbol | source=shelfPos/src/main/license.ts:L26 | neighbors=[license.ts]
- "main_license_licensepayload": "LicensePayload" | kind=code-symbol | source=shelfPos/src/main/license.ts:L19 | neighbors=[license.ts]
- "node_dpapi_win_isencryptedsecret": "isEncryptedSecret()" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L47 | neighbors=[dpapi-win.ts]
- "node_dpapi_win_ps_decrypt": "PS_DECRYPT" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L15 | neighbors=[dpapi-win.ts]
- "node_dpapi_win_ps_encrypt": "PS_ENCRYPT" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L7 | neighbors=[dpapi-win.ts]
- "pos_carttabsbar_carttabsbarprops": "CartTabsBarProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartTabsBar.tsx:L7 | neighbors=[CartTabsBar.tsx]
- "pos_cashdrawerpage_cashdrawer": "CashDrawer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerPage.tsx:L16 | neighbors=[CashDrawerPage.tsx]
- "pos_cashdrawerpage_cashdrawerpage": "CashDrawerPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerPage.tsx:L8 | neighbors=[CashDrawerPage.tsx]
- "pos_cashdrawersummary_statbox": "StatBox()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashDrawerSummary.tsx:L5 | neighbors=[CashDrawerSummary.tsx]
- "pos_cashmovementspanel_pendingmovement": "PendingMovement" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CashMovementsPanel.tsx:L15 | neighbors=[CashMovementsPanel.tsx]
- "pos_customermodal_customerformstate": "customerFormState()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CustomerModal.tsx:L14 | neighbors=[CustomerModal.tsx]
- "pos_customermodal_customermodalprops": "CustomerModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CustomerModal.tsx:L8 | neighbors=[CustomerModal.tsx]
- "pos_customermodal_id_types": "ID_TYPES" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CustomerModal.tsx:L6 | neighbors=[CustomerModal.tsx]
- "pos_discountmodal_discountaction": "DiscountAction" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/DiscountModal.tsx:L29 | neighbors=[DiscountModal.tsx]
- "pos_discountmodal_discountmodalprops": "DiscountModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/DiscountModal.tsx:L11 | neighbors=[DiscountModal.tsx]
- "pos_discountmodal_discountreducer": "discountReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/DiscountModal.tsx:L36 | neighbors=[DiscountModal.tsx]
- "pos_discountmodal_discountstate": "DiscountState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/DiscountModal.tsx:L21 | neighbors=[DiscountModal.tsx]
- "pos_paymentcheckoutpad_grid_keys": "GRID_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPad.tsx:L4 | neighbors=[PaymentCheckoutPad.tsx]
- "pos_paymentcheckoutpanel_cashamountstrip": "CashAmountStrip()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPanel.tsx:L14 | neighbors=[PaymentCheckoutPanel.tsx]
- "pos_paymentmethodbuttons_methods": "METHODS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodButtons.tsx:L4 | neighbors=[PaymentMethodButtons.tsx]
- "pos_paymentmodal_entryamount": "entryAmount()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentModal.tsx:L33 | neighbors=[PaymentModal.tsx]
- "pos_paymentmodal_paymentmodalprops": "PaymentModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentModal.tsx:L20 | neighbors=[PaymentModal.tsx]
- "pos_paymentmodalstate_methods": "METHODS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L20 | neighbors=[paymentModalState.ts]
- "pos_paymentmodalstate_paymententry": "PaymentEntry" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L9 | neighbors=[paymentModalState.ts]
- "pos_paymentmodalstate_paymentmodalaction": "PaymentModalAction" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L30 | neighbors=[paymentModalState.ts]
- "pos_paymentmodalstate_paymentmodalstate": "PaymentModalState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L22 | neighbors=[paymentModalState.ts]
- "pos_paymentsplitsection_methods": "METHODS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentSplitSection.tsx:L8 | neighbors=[PaymentSplitSection.tsx]
- "pos_poscartpanel_cartqtyinput": "CartQtyInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSCartPanel.tsx:L18 | neighbors=[POSCartPanel.tsx]
- "pos_posmodals_posmodalsprops": "POSModalsProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSModals.tsx:L15 | neighbors=[POSModals.tsx]
- "pos_pospage_pospage": "POSPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSPage.tsx:L7 | neighbors=[POSPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-033.json

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
