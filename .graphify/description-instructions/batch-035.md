# Node Description Batch 36 of 43

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

- "pos_pospage_pospage": "POSPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSPage.tsx:L7 | neighbors=[POSPage.tsx]
- "pos_pospage_posterminal": "POSTerminal()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSPage.tsx:L15 | neighbors=[POSPage.tsx]
- "pos_possearchpanel_possearchpanelprops": "POSSearchPanelProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSSearchPanel.tsx:L11 | neighbors=[POSSearchPanel.tsx]
- "pos_posterminalview_posterminalstate": "POSTerminalState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSTerminalView.tsx:L15 | neighbors=[POSTerminalView.tsx]
- "pos_priceoverridemodal_priceoverrideaction": "PriceOverrideAction" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PriceOverrideModal.tsx:L19 | neighbors=[PriceOverrideModal.tsx]
- "pos_priceoverridemodal_priceoverridereducer": "priceOverrideReducer()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PriceOverrideModal.tsx:L25 | neighbors=[PriceOverrideModal.tsx]
- "pos_priceoverridemodal_priceoverridestate": "PriceOverrideState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PriceOverrideModal.tsx:L12 | neighbors=[PriceOverrideModal.tsx]
- "pos_removelinemodal_removelinemodalprops": "RemoveLineModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/RemoveLineModal.tsx:L6 | neighbors=[RemoveLineModal.tsx]
- "pos_reprintreceiptspage_reprintreceipts": "ReprintReceipts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReprintReceiptsPage.tsx:L13 | neighbors=[ReprintReceiptsPage.tsx]
- "pos_reprintreceiptspage_reprintreceiptspage": "ReprintReceiptsPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReprintReceiptsPage.tsx:L5 | neighbors=[ReprintReceiptsPage.tsx]
- "pos_returnmodal_initialreturnstate": "initialReturnState()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReturnModal.tsx:L21 | neighbors=[ReturnModal.tsx]
- "pos_returnmodal_returnmodalstate": "ReturnModalState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/ReturnModal.tsx:L13 | neighbors=[ReturnModal.tsx]
- "pos_usepaymentkeyboard_commitsplitamount": "commitSplitAmount()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePaymentKeyboard.ts:L97 | neighbors=[usePaymentKeyboard.ts]
- "pos_useposterminal_closetabtarget": "CloseTabTarget" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L27 | neighbors=[usePOSTerminal.ts]
- "pos_useposterminal_findcartline": "findCartLine()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L35 | neighbors=[usePOSTerminal.ts]
- "pos_useposterminal_salefromtab": "saleFromTab()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L47 | neighbors=[usePOSTerminal.ts]
- "pos_useposterminal_salestate": "SaleState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L29 | neighbors=[usePOSTerminal.ts]
- "pos_useposterminal_workspacestate": "WorkspaceState" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/usePOSTerminal.ts:L39 | neighbors=[usePOSTerminal.ts]
- "preload_index_channelset": "channelSet" | kind=code-symbol | source=shelfPos/src/preload/index.ts:L5 | neighbors=[index.ts]
- "preload_index_d_window": "Window" | kind=code-symbol | source=shelfPos/src/preload/index.d.ts:L6 | neighbors=[index.d.ts]
- "products_adjuststockmodal_reasons": "REASONS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/AdjustStockModal.tsx:L11 | neighbors=[AdjustStockModal.tsx]
- "products_batchlabelprintmodal_addproductresult": "AddProductResult" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L49 | neighbors=[BatchLabelPrintModal.tsx]
- "products_batchlabelprintmodal_batchlabelprintmodalfooter": "BatchLabelPrintModalFooter()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L167 | neighbors=[BatchLabelPrintModal.tsx]
- "products_batchlabelprintmodal_batchlabelprintqueuetable": "BatchLabelPrintQueueTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L51 | neighbors=[BatchLabelPrintModal.tsx]
- "products_batchlabelprintmodal_copiesdigitsonly": "copiesDigitsOnly()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L22 | neighbors=[BatchLabelPrintModal.tsx]
- "products_batchlabelprintmodal_queueitem": "QueueItem" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L20 | neighbors=[BatchLabelPrintModal.tsx]
- "products_batchlabelprintmodal_resolveproductlookup": "resolveProductLookup()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/BatchLabelPrintModal.tsx:L36 | neighbors=[BatchLabelPrintModal.tsx]
- "products_productcsvhelpmodal_optional_cols": "OPTIONAL_COLS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L11 | neighbors=[ProductCsvHelpModal.tsx]
- "products_productcsvhelpmodal_productcsvhelpmodalprops": "ProductCsvHelpModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L4 | neighbors=[ProductCsvHelpModal.tsx]
- "products_productcsvhelpmodal_required_cols": "REQUIRED_COLS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L10 | neighbors=[ProductCsvHelpModal.tsx]
- "products_productcsvhelpmodal_step_keys": "STEP_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L22 | neighbors=[ProductCsvHelpModal.tsx]
- "products_productcsvhelpmodal_tip_keys": "TIP_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L23 | neighbors=[ProductCsvHelpModal.tsx]
- "products_productform_productformmodalprops": "ProductFormModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductForm.tsx:L35 | neighbors=[ProductForm.tsx]
- "products_productform_productformstate": "productFormState()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductForm.tsx:L17 | neighbors=[ProductForm.tsx]
- "products_productimportpreviewmodal_previewtable": "PreviewTable()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductImportPreviewModal.tsx:L26 | neighbors=[ProductImportPreviewModal.tsx]
- "products_productimportpreviewmodal_productimportpreviewmodalprops": "ProductImportPreviewModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductImportPreviewModal.tsx:L7 | neighbors=[ProductImportPreviewModal.tsx]
- "products_productreceivechoicemodal_productreceivechoicemodalprops": "ProductReceiveChoiceModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductReceiveChoiceModal.tsx:L6 | neighbors=[ProductReceiveChoiceModal.tsx]
- "products_productspage_productmanager": "ProductManager()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPage.tsx:L34 | neighbors=[ProductsPage.tsx]
- "products_productspage_productspage": "ProductsPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPage.tsx:L16 | neighbors=[ProductsPage.tsx]
- "products_productspage_singlefilteredproduct": "singleFilteredProduct()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPage.tsx:L29 | neighbors=[ProductsPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-035.json

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
