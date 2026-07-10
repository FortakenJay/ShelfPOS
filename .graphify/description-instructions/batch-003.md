# Node Description Batch 4 of 42

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

- "pos_cartlinediscountinput": "CartLineDiscountInput.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/CartLineDiscountInput.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartLineDiscountInput(), lineDiscount.ts, cartLineDiscountPercentDisplay(), parseDiscountPercentInput(), posKeyboard.ts]
- "repos_cashmovementtotals": "cashMovementTotals.ts" | kind=code-symbol | source=shelfPos/src/main/db/repos/cashMovementTotals.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, cash.ts, helpers.ts, round2(), index.ts, getDb()]
- "repos_settings_setting_keys": "SETTING_KEYS" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L11 | neighbors=[firstRun.ts, sales.ts, settings.ts, dashboard.ts, products.ts, settings.ts]
- "services_backup": "backup.ts" | kind=code-symbol | source=shelfPos/src/main/services/backup.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, backup.ts, cierre.ts, index.ts, index.ts, helpers.ts]
- "services_pendingstoreid": "pendingStoreId.ts" | kind=code-symbol | source=shelfPos/src/main/services/pendingStoreId.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, settings.ts, getSetting(), setSetting(), SETTING_KEYS]
- "services_posheartbeat": "posHeartbeat.ts" | kind=code-symbol | source=shelfPos/src/main/services/posHeartbeat.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, index.ts, helpers.ts, localNow(), settings.ts, setSetting()]
- "auth_accountsstep": "AccountsStep.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/AccountsStep.tsx:L1 | neighbors=[AccountsStep(), AccountsPinFields.tsx, AccountsPinFields(), AdminAccountFields.tsx, AdminAccountFields(), useAccountsStep.ts]
- "components_dashboardchartloaders": "dashboardChartLoaders.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/dashboardChartLoaders.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, dashboardChartLazy.tsx, DashboardHomeChartsLazy, InventoryHealthChartLazy, ProductAnalyticsChartsLazy, SalesAnalyticsSectionLazy]
- "components_paymentmethodspiechart": "PaymentMethodsPieChart.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/PaymentMethodsPieChart.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardCharts.tsx, DashboardHomeCharts.tsx, DashboardChartFallback.tsx, DashboardChartFallback(), CHART_COLORS]
- "ipc_dashboard": "dashboard.ts" | kind=code-symbol | source=shelfPos/src/main/ipc/dashboard.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, registerDashboardHandlers(), helpers.ts, handle(), dashboard.ts, dashboardOverview()]
- "main_license_checkstoredlicense": "checkStoredLicense()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L171 | neighbors=[license.ts, checkLicense(), decryptLicenseToken(), getMachineId(), invalidStatus(), payloadToStatus()]
- "pos_discountmodal": "DiscountModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/DiscountModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DiscountAction, DiscountModal(), DiscountModalProps, discountReducer(), DiscountState]
- "pos_pospage": "POSPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/POSPage.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSPage(), POSTerminal(), POSTerminalView.tsx, POSTerminalView(), types.ts]
- "repos_settings_setsetting": "setSetting()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L121 | neighbors=[firstRun.ts, sales.ts, settings.ts, settings.ts, getAppSettings(), dataRetention.ts]
- "scripts_print_colon_sp_32_32": "print-colon-sp-32-32.mjs" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, buildBuffer(), colonNvGraphicEscPos(), data, __dirname, printer]
- "scripts_print_colon_sp_32_32_port": "print-colon-sp-32-32-port.mjs" | kind=code-symbol | source=shelfPos/scripts/print-colon-sp-32-32-port.mjs:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, buildBuffer(), COLON_SIGN_MATRIX, data, __dirname, getPrinterAndPort()]
- "services_escposrender_pushplaintext": "pushPlainText()" | kind=code-symbol | source=shelfPos/src/main/services/escPosRender.ts:L208 | neighbors=[escPosRender.ts, applyTextStyle(), encodeDigits(), encodePrintText(), parseMoneyText(), pushCentSign()]
- "services_operatorconfig": "operatorConfig.ts" | kind=code-symbol | source=shelfPos/src/main/services/operatorConfig.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, migrations.ts, index.ts, parseEnv.ts, isOperatorLoginConfigured(), loadOperatorEnv()]
- "services_printtemplates_buildcierrelines": "buildCierreLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L659 | neighbors=[cierre.ts, printTemplates.ts, cierreCashLines(), cierreDiscardedTabLines(), cierreDiscountLines(), cierrePriceOverrideLines()]
- "services_printtemplates_buildreceiptlines": "buildReceiptLines()" | kind=code-symbol | source=shelfPos/src/main/services/printTemplates.ts:L228 | neighbors=[sales.ts, salesReceipt.ts, printTemplates.ts, buildPrinterTestReceiptLines(), customerLines(), emisorLines()]
- "shared_barcode": "barcode.ts" | kind=code-symbol | source=shelfPos/src/shared/barcode.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, products.ts, escPosRender.ts, labelPrintLines.ts, shelfLabelLines.ts, barcodePrintValue()]
- "shared_operator_account": "operator-account.ts" | kind=code-symbol | source=shelfPos/src/shared/operator-account.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, migrations.ts, firstRun.ts, users.ts, audit.ts, dashboard.ts]
- "activation_main": "main.ts" | kind=code-symbol | source=shelfPos/src/renderer/activation/main.ts:L1 | neighbors=[activateBtn, ERROR_MESSAGES, feedback, licenseInput, loadStatus(), machineInput]
- "admin_auditlogpage": "AuditLogPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/AuditLogPage.tsx:L1 | neighbors=[AuditLog(), AuditLogAction, AuditLogPage(), auditLogReducer(), AuditLogState, formatAuditDetail()]
- "admin_userformmodal": "UserFormModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UserFormModal.tsx:L1 | neighbors=[FormAction, formReducer(), FormState, initialFormState(), UserFormModal(), UserModalState]
- "admin_userspage": "UsersPage.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/UsersPage.tsx:L1 | neighbors=[UserFormModal.tsx, UserFormModal(), UsersInitialSetupModal.tsx, UsersInitialSetupModal(), UserModalState, Users()]
- "auth_firstrun_types": "firstRun.types.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/firstRun.types.ts:L1 | neighbors=[AccountDraft, EMPTY_ACCOUNT_DRAFT, EMPTY_PIN_FIELDS, EMPTY_VALIDATION, MANAGED_ROLES, PinFieldsState]
- "components_notificationscenter": "NotificationsCenter.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/NotificationsCenter.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, NotificationsCenter(), NotificationsCenterProps, positionDialogNearTrigger(), dashboardAlertSearch.ts, dashboardAlertProductSearch()]
- "db_migrations": "migrations.ts" | kind=code-symbol | source=shelfPos/src/main/db/migrations.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, getDbVersion(), Migration, migrations, runMigrations(), operatorConfig.ts]
- "lib_carttabsnapshot": "cartTabSnapshot.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartTabSnapshot, EMPTY_CART_TAB_SNAPSHOT, isEmptySnapshot(), liveSaleTotal(), parseCartTabSnapshot()]
- "lib_session": "session.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/session.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, api.ts, api, homeAfterLogin(), homeFor(), useInvalidateSession()]
- "lib_usescanner": "useScanner.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/useScanner.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, shortcuts.ts, shouldIgnoreShortcutTarget(), isWedgeScan(), shouldSkipGlobalScanTarget(), useDebouncedValue()]
- "main_activationwindow": "activationWindow.ts" | kind=code-symbol | source=shelfPos/src/main/activationWindow.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, license.ts, activationUrl(), closeActivationWindow(), createActivationWindow(), appIcon.ts]
- "node_dpapi_win": "dpapi-win.ts" | kind=code-symbol | source=shelfPos/src/shared/node/dpapi-win.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, decryptDpapi(), encryptDpapi(), isEncryptedSecret(), PS_DECRYPT, PS_ENCRYPT]
- "pos_priceoverridemodal": "PriceOverrideModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/PriceOverrideModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, POSModals.tsx, PriceOverrideAction, PriceOverrideModal(), priceOverrideReducer(), PriceOverrideState]
- "pos_types": "types.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/pos/types.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, CartLineDiscountInput.tsx, POSCartPanel.tsx, posCartSale.ts, POSModals.tsx, POSPage.tsx]
- "products_productcsvhelpmodal": "ProductCsvHelpModal.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/ProductCsvHelpModal.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductManagerModals.tsx, OPTIONAL_COLS, ProductCsvHelpModal(), ProductCsvHelpModalProps, REQUIRED_COLS]
- "repos_products_getproduct": "getProduct()" | kind=code-symbol | source=shelfPos/src/main/db/repos/products.ts:L85 | neighbors=[products.ts, sales.ts, products.ts, productSelect(), searchProducts(), labelPrintLines.ts]
- "repos_settings_receiptlanguage": "receiptLanguage()" | kind=code-symbol | source=shelfPos/src/main/db/repos/settings.ts:L204 | neighbors=[cierre.ts, products.ts, reports.ts, sales.ts, settings.ts, salesReceipt.ts]
- "repos_syncqueue_enqueuesync": "enqueueSync()" | kind=code-symbol | source=shelfPos/src/main/db/repos/syncQueue.ts:L65 | neighbors=[cierre.ts, returns.ts, sales.ts, users.ts, audit.ts, cash.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-003.json

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
