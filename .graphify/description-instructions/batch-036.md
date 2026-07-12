# Node Description Batch 37 of 43

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

- "products_productspagination_page_size_options": "PAGE_SIZE_OPTIONS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPagination.tsx:L4 | neighbors=[ProductsPagination.tsx]
- "products_productspagination_productspaginationprops": "ProductsPaginationProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductsPagination.tsx:L6 | neighbors=[ProductsPagination.tsx]
- "products_supplierinvoicepreviewmodal_buildconfirminput": "buildConfirmInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/SupplierInvoicePreviewModal.tsx:L32 | neighbors=[SupplierInvoicePreviewModal.tsx]
- "products_supplierinvoicepreviewmodal_initdrafts": "initDrafts()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/SupplierInvoicePreviewModal.tsx:L24 | neighbors=[SupplierInvoicePreviewModal.tsx]
- "products_supplierinvoicepreviewmodal_newitemdraft": "NewItemDraft" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/SupplierInvoicePreviewModal.tsx:L22 | neighbors=[SupplierInvoicePreviewModal.tsx]
- "products_supplierinvoicepreviewmodal_supplierinvoicepreviewmodalprops": "SupplierInvoicePreviewModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/SupplierInvoicePreviewModal.tsx:L14 | neighbors=[SupplierInvoicePreviewModal.tsx]
- "repos_audit_auditmeta": "AuditMeta" | kind=code-symbol | source=shelfPos/src/main/db/repos/audit.ts:L8 | neighbors=[audit.ts]
- "repos_carttabs_carttabdbrow": "CartTabDbRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L9 | neighbors=[cartTabs.ts]
- "repos_carttabs_empty_snapshot": "EMPTY_SNAPSHOT" | kind=code-symbol | source=shelfPos/src/main/db/repos/cartTabs.ts:L7 | neighbors=[cartTabs.ts]
- "repos_dashboard_mapaudittoactivity": "mapAuditToActivity()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L375 | neighbors=[dashboard.ts]
- "repos_dashboard_stockstatus": "stockStatus()" | kind=code-symbol | source=shelfPos/src/main/db/repos/dashboard.ts:L122 | neighbors=[dashboard.ts]
- "repos_printjobs_listfailedprintjobs": "listFailedPrintJobs()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L40 | neighbors=[printJobs.ts]
- "repos_printjobs_listpendingprintjobids": "listPendingPrintJobIds()" | kind=code-symbol | source=shelfPos/src/main/db/repos/printJobs.ts:L95 | neighbors=[printJobs.ts]
- "repos_products_updateproductcatalogopts": "UpdateProductCatalogOpts" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L289 | neighbors=[products.ts]
- "repos_reports_discardedtabauditrow": "DiscardedTabAuditRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L557 | neighbors=[reports.ts]
- "repos_reports_discountitemrow": "DiscountItemRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L349 | neighbors=[reports.ts]
- "repos_reports_discountsalerow": "DiscountSaleRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L340 | neighbors=[reports.ts]
- "repos_reports_priceoverrideitemrow": "PriceOverrideItemRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L457 | neighbors=[reports.ts]
- "repos_reports_priceoverridesalerow": "PriceOverrideSaleRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L450 | neighbors=[reports.ts]
- "repos_reports_salefilter": "SaleFilter" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L24 | neighbors=[reports.ts]
- "repos_reports_saleheaderrow": "SaleHeaderRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L629 | neighbors=[reports.ts]
- "repos_reports_saleitemreportrow": "SaleItemReportRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L647 | neighbors=[reports.ts]
- "repos_reports_salepaymentrow": "SalePaymentRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L640 | neighbors=[reports.ts]
- "repos_reports_tax_category_order": "TAX_CATEGORY_ORDER" | kind=code-symbol | source=shelfPos/src/main/db/repos/reports.ts:L22 | neighbors=[reports.ts]
- "repos_salesreceipt_facturaitemrow": "FacturaItemRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L37 | neighbors=[salesReceipt.ts]
- "repos_salesreceipt_itemreceiptrow": "ItemReceiptRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L28 | neighbors=[salesReceipt.ts]
- "repos_salesreceipt_paymentreceiptrow": "PaymentReceiptRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L47 | neighbors=[salesReceipt.ts]
- "repos_salesreceipt_salereceiptrow": "SaleReceiptRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/salesReceipt.ts:L12 | neighbors=[salesReceipt.ts]
- "repos_settings_action_shortcut_keys": "ACTION_SHORTCUT_KEYS" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L50 | neighbors=[settings.ts]
- "repos_syncqueue_sync_tables": "SYNC_TABLES" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L14 | neighbors=[syncQueue.ts]
- "repos_syncqueue_syncoperation": "SyncOperation" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L30 | neighbors=[syncQueue.ts]
- "repos_syncqueue_syncqueuehealth": "SyncQueueHealth" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L32 | neighbors=[syncQueue.ts]
- "repos_syncqueue_synctablename": "SyncTableName" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L29 | neighbors=[syncQueue.ts]
- "repos_users_deactivateappuser": "deactivateAppUser()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L184 | neighbors=[users.ts]
- "repos_users_insertappuser": "insertAppUser()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L99 | neighbors=[users.ts]
- "repos_users_patchappuser": "patchAppUser()" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L157 | neighbors=[users.ts]
- "repos_users_userdbrow": "UserDbRow" | kind=code-symbol | source=shelfPos/src/main/db/repos/users.ts:L14 | neighbors=[users.ts]
- "schemas_ipc_adjuststockinputschema": "adjustStockInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L75 | neighbors=[ipc.ts]
- "schemas_ipc_auditlogfilterschema": "auditLogFilterSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L238 | neighbors=[ipc.ts]
- "schemas_ipc_cajapinchangeinputschema": "cajaPinChangeInputSchema" | kind=code-symbol | source=shelfPos/src/shared/schemas/ipc.ts:L38 | neighbors=[ipc.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-036.json

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
