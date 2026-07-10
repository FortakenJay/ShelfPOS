# Node Description Batch 21 of 42

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

- "pos_paymentcheckoutpanel_paymentcheckoutpanel": "PaymentCheckoutPanel()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentCheckoutPanel.tsx:L83 | neighbors=[PaymentCheckoutPanel.tsx, PaymentModal.tsx]
- "pos_paymentcustomer_buildpaymentcustomer": "buildPaymentCustomer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentCustomer.ts:L4 | neighbors=[paymentCustomer.ts, PaymentModal.tsx]
- "pos_paymentinvoicecustomersection_paymentinvoicecustomersection": "PaymentInvoiceCustomerSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentInvoiceCustomerSection.tsx:L6 | neighbors=[PaymentInvoiceCustomerSection.tsx, PaymentModal.tsx]
- "pos_paymentmethodbuttons_paymentmethodbuttons": "PaymentMethodButtons()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodButtons.tsx:L6 | neighbors=[PaymentMethodButtons.tsx, PaymentMethodSidebar.tsx]
- "pos_paymentmethodsidebar_paymentmethodsidebar": "PaymentMethodSidebar()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentMethodSidebar.tsx:L6 | neighbors=[PaymentMethodSidebar.tsx, PaymentModal.tsx]
- "pos_paymentmodal_paymentmodal": "PaymentModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentModal.tsx:L37 | neighbors=[PaymentModal.tsx, POSModals.tsx]
- "pos_paymentmodalstate_usepaymentmodalstate": "usePaymentModalState()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/paymentModalState.ts:L114 | neighbors=[PaymentModal.tsx, paymentModalState.ts]
- "pos_paymentsplitsection_paymentsplitsection": "PaymentSplitSection()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PaymentSplitSection.tsx:L13 | neighbors=[PaymentModal.tsx, PaymentSplitSection.tsx]
- "pos_poscartpanel_poscartpanel": "POSCartPanel()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSCartPanel.tsx:L53 | neighbors=[POSCartPanel.tsx, POSTerminalView.tsx]
- "pos_poscartsale_cartlinetosaleinput": "cartLineToSaleInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posCartSale.ts:L8 | neighbors=[posCartSale.ts, POSModals.tsx]
- "pos_poskeyboard_shouldkeepsearchfocused": "shouldKeepSearchFocused()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posKeyboard.ts:L10 | neighbors=[posKeyboard.ts, isEditableElement()]
- "pos_poskeyboard_useposentershortcut": "usePosEnterShortcut()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posKeyboard.ts:L66 | neighbors=[posKeyboard.ts, usePOSTerminal.ts]
- "pos_poskeyboard_usepossearchfocus": "usePosSearchFocus()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/posKeyboard.ts:L20 | neighbors=[posKeyboard.ts, usePOSTerminal.ts]
- "pos_posmodals_posmodals": "POSModals()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSModals.tsx:L44 | neighbors=[POSModals.tsx, POSTerminalView.tsx]
- "pos_possearchpanel_possearchpanel": "POSSearchPanel()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSSearchPanel.tsx:L21 | neighbors=[POSSearchPanel.tsx, POSTerminalView.tsx]
- "pos_possidebar_possidebar": "POSSidebar()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSSidebar.tsx:L6 | neighbors=[POSSidebar.tsx, POSTerminalView.tsx]
- "pos_posterminalview_posterminalview": "POSTerminalView()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSTerminalView.tsx:L16 | neighbors=[POSPage.tsx, POSTerminalView.tsx]
- "pos_priceoverridemodal_priceoverridemodal": "PriceOverrideModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PriceOverrideModal.tsx:L42 | neighbors=[POSModals.tsx, PriceOverrideModal.tsx]
- "pos_removelinemodal_removelinemodal": "RemoveLineModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/RemoveLineModal.tsx:L13 | neighbors=[POSModals.tsx, RemoveLineModal.tsx]
- "pos_reprintreceiptslist_reprintreceiptslist": "ReprintReceiptsList()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReprintReceiptsList.tsx:L12 | neighbors=[ReprintReceiptsList.tsx, ReprintReceiptsPage.tsx]
- "pos_returnmodal_returnmodal": "ReturnModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReturnModal.tsx:L30 | neighbors=[POSModals.tsx, ReturnModal.tsx]
- "pos_usepaymentkeyboard_usepaymentkeyboard": "usePaymentKeyboard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePaymentKeyboard.ts:L6 | neighbors=[PaymentModal.tsx, usePaymentKeyboard.ts]
- "pos_useposterminal_discounttarget": "DiscountTarget" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L30 | neighbors=[POSModals.tsx, usePOSTerminal.ts]
- "pos_useverticaldragresize_useverticaldragresize": "useVerticalDragResize()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/useVerticalDragResize.ts:L3 | neighbors=[POSSearchPanel.tsx, useVerticalDragResize.ts]
- "products_adjuststockmodal_adjuststockmodal": "AdjustStockModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/AdjustStockModal.tsx:L12 | neighbors=[ProductManagerModals.tsx, AdjustStockModal.tsx]
- "products_batchlabelprintmodal_batchlabelprintmodal": "BatchLabelPrintModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L224 | neighbors=[ProductManagerModals.tsx, BatchLabelPrintModal.tsx]
- "products_batchlabelprintmodal_clampcopies": "clampCopies()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L25 | neighbors=[BatchLabelPrintModal.tsx, copiesFromText()]
- "products_batchlabelprintmodal_copiesfromtext": "copiesFromText()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L30 | neighbors=[BatchLabelPrintModal.tsx, clampCopies()]
- "products_productcsvhelpmodal_productcsvhelpmodal": "ProductCsvHelpModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L23 | neighbors=[ProductManagerModals.tsx, ProductCsvHelpModal.tsx]
- "products_productform_productformmodal": "ProductFormModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductForm.tsx:L38 | neighbors=[ProductManagerModals.tsx, ProductForm.tsx]
- "products_productimportpreviewmodal_importhasstockchanges": "importHasStockChanges()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductImportPreviewModal.tsx:L15 | neighbors=[ProductImportPreviewModal.tsx, ProductImportPreviewModal()]
- "products_productlabelprintpromptmodal_productlabelprintpromptmodal": "ProductLabelPrintPromptModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductLabelPrintPromptModal.tsx:L6 | neighbors=[ProductManagerModals.tsx, ProductLabelPrintPromptModal.tsx]
- "products_productreceivechoicemodal_productreceivechoicemodal": "ProductReceiveChoiceModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductReceiveChoiceModal.tsx:L11 | neighbors=[ProductManagerModals.tsx, ProductReceiveChoiceModal.tsx]
- "products_productspagination_productspagination": "ProductsPagination()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPagination.tsx:L15 | neighbors=[ProductsPage.tsx, ProductsPagination.tsx]
- "products_productstable_productstable": "ProductsTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsTable.tsx:L7 | neighbors=[ProductsPage.tsx, ProductsTable.tsx]
- "products_supplierinvoicepreviewmodal_supplierinvoicepreviewmodal": "SupplierInvoicePreviewModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/SupplierInvoicePreviewModal.tsx:L32 | neighbors=[ProductManagerModals.tsx, SupplierInvoicePreviewModal.tsx]
- "reports_reporttable_reporttable": "ReportTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/ReportTable.tsx:L10 | neighbors=[ReportsPage.tsx, ReportTable.tsx]
- "reports_usesalereceiptactions_usesalereceiptactions": "useSaleReceiptActions()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/reports/useSaleReceiptActions.ts:L9 | neighbors=[SaleReceiptActions.tsx, useSaleReceiptActions.ts]
- "repos_audit_listauditactions": "listAuditActions()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L103 | neighbors=[audit.ts, audit.ts]
- "repos_audit_listauditusers": "listAuditUsers()" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L93 | neighbors=[audit.ts, audit.ts]

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
