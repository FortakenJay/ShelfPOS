# Graph Report - .  (2026-07-12)

## Corpus Check
- 321 files · ~375,142 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1707 nodes · 3805 edges · 84 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 1386 · imports: 928 · imports_from: 541 · calls: 459 · MODIFIES: 291 · ON_BRANCH: 120 · PARENT_OF: 65 · method: 10 · re_exports: 3 · inherits: 2


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 321 · Candidates: 675
- Excluded: 514 untracked · 42767 ignored · 1 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `af2caa3`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `AppError` - 31 edges
2. `getDb()` - 27 edges
3. `localNow()` - 23 edges
4. `dashboardOverview()` - 22 edges
5. `handle()` - 22 edges
6. `writeAudit()` - 18 edges
7. `pushRowLine()` - 15 edges
8. `probePrinter()` - 15 edges
9. `getAppSettings()` - 14 edges
10. `session` - 14 edges

## Surprising Connections (you probably didn't know these)
- `0d0d88f Remove split-out repository entries from .gitignore` --PARENT_OF--> `1bdbad7 Consolidate shelfPos, shelfDashboard, shelfDocs back into one repo`  [EXTRACTED]
  git → git  _Bridges community 0 → community 4_
- `af2caa3 updates updates updates. bug fixes with fable` --ON_BRANCH--> `Separation`  [EXTRACTED]
  git → git  _Bridges community 11 → community 0_
- `currentLanguage()` --calls--> `getSetting()`  [EXTRACTED]
  shelfPos/src/main/db/repos/settings.ts → shelfPos/src/main/db/repos/settings.ts  _Bridges community 11 → community 8_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (64): Separation, dev, 07768fd pagination and user tests, 07a5b84 more fixes, 0d0d88f Remove split-out repository entries from .gitignore, 0ef1588 stuff, 142aee3 mejorar el cierre y proprieratary data, 14a2364 Split monorepo into independent repos: shelfPos, shelfDashboard, shelfDocs (+56 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (60): channelSet, Window, ApiResult, BackupInfo, BatchPrintItem, CartRemoveAuthorizeInput, CierreConfirmInput, CierreConfirmResult (+52 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (52): __dirname, printer, quirks, rawPrintScriptPath, receiptLines, __dirname, labelLines, main() (+44 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (52): round2(), CASH, CASH_READ, registerCashHandlers(), cashDrawerStatus(), cashSummaryForCierre(), hasOpeningFloat(), insertCashMovement() (+44 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (12): 1bdbad7 Consolidate shelfPos, shelfDashboard, shelfDocs back into one repo, MoneyInputProps, SaleReceiptActions(), useSaleReceiptActions(), queryClient, ByPaymentReportTable(), InventoryReportTable(), ItemizedSalesReportTable() (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (41): defaultSyncConfigPath(), loadConfig(), loadConfigFile(), loadEnvFile(), localSyncConfigPath(), readSecretKeyEnv(), resolveSecretKey(), SyncConfig (+33 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (47): t(), buildCierreLines(), buildInventoryReportLines(), buildItemizedSalesReportLines(), buildMultiDayPaymentReportLines(), buildMultiDaySummaryReportLines(), buildPaymentReportLines(), buildPinCardLines() (+39 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (38): PRINTER_ACTION, registerPrinterHandlers(), registerPrintQueueHandlers(), getPrintJob(), listPrintJobsForPage(), listRetryablePrintJobIds(), markPrintJob(), attemptPrintJob() (+30 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (34): getDb(), getDbPath(), ID_TYPES, registerSettingsHandlers(), SHORTCUT_KEYS, insertPrintJob(), ACTION_SHORTCUT_KEYS, getAppSettings() (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (32): registerAuthHandlers(), authorizeWithDiscountPin(), PrivilegedAuthType, registerBackupHandlers(), registerCartHandlers(), SELL, registerCierreHandlers(), registerDiscountHandlers() (+24 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (41): registerDashboardHandlers(), buildAlerts(), categoryPerformance(), dashboardOverview(), employeeOverview(), employeePerformance(), grossProfit(), inventoryHealth() (+33 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (29): af2caa3 updates updates updates. bug fixes with fable, daysAgoLocal(), daysInRange(), localNow(), pad(), rangeBounds(), todayLocal(), CIERRE (+21 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (35): setDb(), OnLicenseActivated, registerLicenseHandlers(), activationUrl(), closeActivationWindow(), createActivationWindow(), resolveAppIcon(), createMainWindow() (+27 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (28): PinCardPrintModal(), cloudStatusKey(), SettingsCloudPanel(), draftFromSettings(), EMISOR_KEYS, emisorDraftDirty(), GENERAL_KEYS, generalDraftDirty() (+20 more)

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (20): presetWithTime(), withTimeDefaults(), presetMonth(), presetToday(), presetWeek(), rangeForReportPeriod(), shiftDays(), NumPad() (+12 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (30): ID_TYPES, PAYMENT_METHOD_SET, PAYMENT_METHODS, PricedSaleLine, SALES_OR_ADMIN, SELL, assertSaleInOpenShift(), buildFacturaPdfData() (+22 more)

### Community 16 - "Community 16"
Cohesion: 0.09
Nodes (19): LazyDashboardHomeCharts(), KpiOverview(), DashboardPanelToolbar(), DashboardCard(), DashboardEmpty(), FooterLink(), KpiCard(), SectionHeading() (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.06
Nodes (32): adjustStockInputSchema, auditLogFilterSchema, cajaPinChangeInputSchema, cashMovementInputSchema, cierreConfirmInputSchema, createReturnInputSchema, createSaleInputSchema, createSaleItemInputSchema (+24 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (27): formatDate(), formatMoney(), CartTabSnapshot, cartTabSnapshotTotal(), isCartTabSnapshotEmpty(), parseCartTabSnapshotJson(), appendMoneyInputDigit(), backspaceMoneyInput() (+19 more)

### Community 19 - "Community 19"
Cohesion: 0.07
Nodes (29): adminCashRoute, adminIndexRoute, auditRoute, cashRoute, chooseLanguageRoute, cierreRoute, creditRoute, customersRoute (+21 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (27): PRODUCT_CATALOG_COLUMNS, PRODUCT_CATALOG_WRITE_COLUMNS, PRODUCT_CATALOG_WRITE_COLUMNS_WITHOUT_STOCK_PROVIDER, PRODUCT_COLUMNS, PRODUCT_POS_COLUMNS, ProductCatalogColumn, ProductCatalogWriteColumn, alertsForProducts() (+19 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (26): align(), appendColonMark(), appendColonTestStrip(), bold(), buildJob1(), buildJob2(), buildJob3(), buildJob4() (+18 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (20): ADMIN, registerUserHandlers(), enqueueAllPosUsersSync(), enqueueSync(), SYNC_TABLES, SyncOperation, SyncQueueHealth, SyncTableName (+12 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (16): api, ApiError, call(), formatMoney(), homeAfterLogin(), homeFor(), useSession(), KIND_BAR (+8 more)

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (9): CierreDiscrepancyAlerts(), CierreDiscrepancyBanner(), dismissCierreIds(), dismissedListeners, emitDismissedChange(), readDismissedIds(), useCierreDiscrepancyAlerts(), useDismissedCierreIds() (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.08
Nodes (23): actionShortcutKeySchema, barcodeSchema, dateRangeSchema, filePathSchema, idTypeSchema, languageSchema, localDateSchema, localTimeSchema (+15 more)

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (19): assignProductBarcode(), BatchPrintMode, EMPTY_IMPORT_PREVIEW, isUniqueViolation(), labelLinesForProduct(), MANAGE, mapProductDbError(), normalizeBatchPrintItems() (+11 more)

### Community 27 - "Community 27"
Cohesion: 0.13
Nodes (11): GRID_KEYS, PaymentCheckoutPad(), PaymentCheckoutPanel(), buildPaymentCustomer(), PaymentInvoiceCustomerSection(), METHODS, PaymentMethodButtons(), PaymentMethodSidebar() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.20
Nodes (21): AnalyzedProductImport, analyzeProductImport(), applyImportStock(), applyProductImport(), assertProductImportSourceVersion(), buildProductImportPreview(), cell(), parseOptionalNumber() (+13 more)

### Community 29 - "Community 29"
Cohesion: 0.13
Nodes (12): CartTabsBar(), CartTabsBarProps, OpenFloatModal(), POSCartPanel(), POSModals(), POSSearchPanel(), POSSearchPanelProps, POSSidebar() (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.11
Nodes (18): registerCartTabHandlers(), SELL, completeCartTab(), createCartTab(), deleteCartTabRow(), discardCartTabAudited(), getCartTabJson(), removeCartTab() (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.14
Nodes (16): applyStockDelta(), updateProductCostPrice(), applySupplierInvoiceImport(), buildSupplierInvoicePreview(), extractTrailingNumbers(), guessCategory(), normalizePdfText(), parseMoney() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (6): DashboardChartFallback(), CHART_COLORS, CHART_COLORS, PaymentMethodsPieChart(), RechartsModule, useRechartsModule()

### Community 33 - "Community 33"
Cohesion: 0.16
Nodes (15): buildCsv(), csvEscape(), parseCsv(), asSpreadsheetText(), parseSpreadsheetText(), closeWriteStream(), openUtf8CsvWriteStream(), writeToStream() (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.16
Nodes (10): CustomerModal(), CustomerModalProps, ID_TYPES, cartLineToSaleInput(), POSModalsProps, RemoveLineModal(), RemoveLineModalProps, ReturnModal() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.18
Nodes (15): buildFacturaHtml(), buildPage(), buildSummaryBlock(), buildTableRows(), escapeHtml(), FacturaPdfCustomer, FacturaPdfData, FacturaPdfItem (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.21
Nodes (10): CartLineDiscountInput(), CartMiscNameInput(), cartLineDiscountPercentDisplay(), formatPercentDisplay(), parseDiscountPercentInput(), METHODS, PaymentSplitSection(), commitEditableOnEnter() (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.13
Nodes (15): formatPaymentMethod(), LANGUAGES, mapProductCsvHeaders(), NORMALIZED_TO_PRODUCT_KEY, normalizeHeader(), parseFacturaNegativo(), parsePaymentMethod(), PRODUCT_CSV_KEYS (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.15
Nodes (10): DiscountAction, DiscountModal(), DiscountModalProps, DiscountState, LineDiscountPinModal(), LineDiscountPinRequest, PriceOverrideAction, PriceOverrideModal() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.18
Nodes (8): AccountsStep(), Step, LanguagePicker(), AccountsPinFields(), AccountsPinFieldsProps, AdminAccountFields(), AdminAccountFieldsProps, useAccountsStep()

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (11): getDbVersion(), Migration, migrations, runMigrations(), applyEnvFile(), parseEnvFileContent(), parseEnvLine(), isOperatorLoginConfigured() (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.21
Nodes (13): ProductCsvKey, ParsedCsv, cell(), EFACTURA_HEADERS, efacturaRowToProductCsvRow(), findHeaderRow(), mapLetterColumns(), normalizeCell() (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (7): ProductManagerModals(), ProductsPageToolbar(), ProductsPageToolbarProps, PAGE_SIZE_OPTIONS, ProductsPagination(), ProductsPaginationProps, ProductsTable()

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (6): FormAction, FormState, UserFormModal(), UserModalState, UsersInitialSetupModal(), UserModalState

### Community 44 - "Community 44"
Cohesion: 0.28
Nodes (11): registerAuditHandlers(), AuditMeta, auditWhere(), countAudit(), listAudit(), listAuditActions(), listAuditPage(), listAuditUsers() (+3 more)

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (7): cartLineGross(), cartLineHasCustomPrice(), cartLineTotal(), cartLineUnitPrice(), cartLineUsesPrice2(), cartLineUsesPrice3(), miscLineUnitPrice()

### Community 46 - "Community 46"
Cohesion: 0.30
Nodes (10): dumpState(), evalJs(), log(), page, pending, pinClicks(), send(), sleep() (+2 more)

### Community 47 - "Community 47"
Cohesion: 0.27
Nodes (9): LazyInventoryHealthChart(), LazyProductAnalyticsCharts(), LazySalesAnalyticsSection(), LazyStockMovementChart(), DashboardHomeChartsLazy, InventoryHealthChartLazy, ProductAnalyticsChartsLazy, SalesAnalyticsSectionLazy (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.25
Nodes (7): ProductManagerModalsProps, AdjustStockModal(), REASONS, ProductLabelPrintPromptModal(), ProductReceiveChoice, ProductReceiveChoiceModal(), ProductReceiveChoiceModalProps

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (7): estimateShelfLabelDots(), estimateShelfLabelDotsFromLines(), shelfLabelBigCols(), shelfLabelTextCols(), warnIfShelfLabelOverflow(), wrapShelfLabelText(), PrintLine

### Community 50 - "Community 50"
Cohesion: 0.25
Nodes (9): LabelPrintKind, labelPrintPayload(), resolveLabelPrintLines(), buildProductBarcodeLabelLines(), barcodePrintValue(), canPrintProductBarcode(), formatSpacedBarcode(), isPrintableCode128Barcode() (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (8): parseReportSearch(), PERIOD_PRESETS, periodFromRange(), REPORT_TYPES, Reports(), ReportSearch, reportSearchFromRange(), ReportTable()

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (7): lineDiscountFromPercent(), usePosEnterShortcut(), usePosSearchFocus(), CloseTabTarget, DiscountTarget, SaleState, WorkspaceState

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (9): createInitialPaymentState(), defaultCashTendered(), METHODS, newPaymentEntry(), PaymentEntry, PaymentModalAction, paymentModalReducer(), PaymentModalState (+1 more)

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (5): AddProductResult, BatchLabelPrintModal(), clampCopies(), copiesFromText(), QueueItem

### Community 55 - "Community 55"
Cohesion: 0.28
Nodes (4): NotificationsCenterProps, dashboardAlertProductSearch(), notificationAlertSeverityClass(), panelAlertSeverityClass()

### Community 56 - "Community 56"
Cohesion: 0.25
Nodes (1): shouldIgnoreShortcutTarget()

### Community 57 - "Community 57"
Cohesion: 0.28
Nodes (3): CashDrawerSummary(), CashMovementsPanel(), PendingMovement

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (6): buildBuffer(), COLON_SIGN_MATRIX, data, __dirname, matrixToUserDefinedChar(), { name, port }

### Community 59 - "Community 59"
Cohesion: 0.28
Nodes (7): buildBuffer(), colonNvGraphicEscPos(), data, __dirname, printer, rawPrintScriptPath(), sendRaw()

### Community 60 - "Community 60"
Cohesion: 0.29
Nodes (7): activateBtn, ERROR_MESSAGES, feedback, licenseInput, loadStatus(), machineInput, showFeedback()

### Community 61 - "Community 61"
Cohesion: 0.25
Nodes (3): AuditLogAction, AuditLogState, PAGE_SIZE_OPTIONS

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (7): AccountDraft, EMPTY_ACCOUNT_DRAFT, EMPTY_PIN_FIELDS, EMPTY_VALIDATION, MANAGED_ROLES, PinFieldsState, ValidationState

### Community 63 - "Community 63"
Cohesion: 0.32
Nodes (5): currentLanguage(), languageLabel(), LANGUAGES, LanguageSwitcher(), MenuPlacement

### Community 64 - "Community 64"
Cohesion: 0.32
Nodes (5): CartTabSnapshot, EMPTY_CART_TAB_SNAPSHOT, isEmptySnapshot(), serializeCartTabSnapshot(), snapshotTotal()

### Community 65 - "Community 65"
Cohesion: 0.32
Nodes (5): decryptDpapi(), encryptDpapi(), PS_DECRYPT, PS_ENCRYPT, runPs()

### Community 66 - "Community 66"
Cohesion: 0.46
Nodes (1): BackupService

### Community 67 - "Community 67"
Cohesion: 0.25
Nodes (3): ADMIN_ITEMS, NAV_ITEMS, NavItem

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (5): ProductsPageFilters(), ProductsPageFiltersProps, ProductFiltersState, ProductManagerUiState, useProductManager()

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (4): appIcon, copyBrandAssetsPlugin, inAppLogo, licensePub

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (6): OPTIONAL_COLS, ProductCsvHelpModal(), ProductCsvHelpModalProps, REQUIRED_COLS, STEP_KEYS, TIP_KEYS

### Community 71 - "Community 71"
Cohesion: 0.29
Nodes (6): { generateKeyPairSync }, { homedir }, { join, dirname }, privateDir, { publicKey, privateKey }, { writeFileSync, mkdirSync, existsSync }

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (3): NewItemDraft, SupplierInvoicePreviewModal(), SupplierInvoicePreviewModalProps

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (5): binPath, data, dir, __dirname, printer

### Community 74 - "Community 74"
Cohesion: 0.50
Nodes (1): ReprintReceiptsList()

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (3): importHasStockChanges(), ProductImportPreviewModal(), ProductImportPreviewModalProps

### Community 76 - "Community 76"
Cohesion: 0.60
Nodes (4): Args, loadPrivateKey(), main(), parseArgs()

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (3): page, pending, ws

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (4): libDir, root, sharedDir, vendorDir

### Community 79 - "Community 79"
Cohesion: 0.50
Nodes (2): NavIconName, PATHS

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (1): Toasts

### Community 81 - "Community 81"
Cohesion: 0.50
Nodes (2): ProductFormModal(), ProductFormModalProps

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (2): nodeFiles, reactFiles

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (2): ImportMeta, ImportMetaEnv

## Knowledge Gaps
- **364 isolated node(s):** `licensePub`, `appIcon`, `inAppLogo`, `copyBrandAssetsPlugin`, `reactFiles` (+359 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 56`** (1 nodes): `shouldIgnoreShortcutTarget()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `BackupService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `ReprintReceiptsList()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `NavIconName`, `PATHS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `Toasts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `ProductFormModal()`, `ProductFormModalProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (2 nodes): `nodeFiles`, `reactFiles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (2 nodes): `ImportMeta`, `ImportMetaEnv`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BackupService` connect `Community 66` to `Community 11`, `Community 9`, `Community 12`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `AppError` connect `Community 9` to `Community 30`, `Community 3`, `Community 11`, `Community 8`, `Community 26`, `Community 15`, `Community 22`, `Community 12`, `Community 20`, `Community 7`, `Community 28`, `Community 41`, `Community 31`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `localNow()` connect `Community 11` to `Community 8`, `Community 26`, `Community 9`, `Community 15`, `Community 44`, `Community 3`, `Community 10`, `Community 7`, `Community 20`, `Community 22`, `Community 6`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `licensePub`, `appIcon`, `inAppLogo` to the rest of the system?**
  _364 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08928571428571429 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.033282130056323606 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06393442622950819 - nodes in this community are weakly interconnected._