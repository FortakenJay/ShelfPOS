# Graph Report - .  (2026-07-09)

## Corpus Check
- 276 files · ~338,783 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1644 nodes · 3619 edges · 85 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 1326 · imports: 902 · imports_from: 531 · calls: 422 · MODIFIES: 242 · ON_BRANCH: 119 · PARENT_OF: 64 · method: 9 · re_exports: 3 · inherits: 1


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 276 · Candidates: 363
- Excluded: 298 untracked · 42224 ignored · 1 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `e729c74`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `AppError` - 31 edges
2. `getDb()` - 27 edges
3. `localNow()` - 23 edges
4. `dashboardOverview()` - 22 edges
5. `handle()` - 22 edges
6. `writeAudit()` - 18 edges
7. `pushRowLine()` - 15 edges
8. `getAppSettings()` - 14 edges
9. `probePrinter()` - 14 edges
10. `session` - 14 edges

## Surprising Connections (you probably didn't know these)
- `0d0d88f Remove split-out repository entries from .gitignore` --PARENT_OF--> `1bdbad7 Consolidate shelfPos, shelfDashboard, shelfDocs back into one repo`  [EXTRACTED]
  git → git  _Bridges community 0 → community 13_
- `currentLanguage()` --calls--> `getSetting()`  [EXTRACTED]
  shelfPos/src/main/db/repos/settings.ts → shelfPos/src/main/db/repos/settings.ts  _Bridges community 12 → community 11_

## Communities

### Community 68 - "Community 68"
Cohesion: 0.29
Nodes (4): licensePub, appIcon, inAppLogo, copyBrandAssetsPlugin

### Community 86 - "Community 86"
Cohesion: 0.67
Nodes (2): reactFiles, nodeFiles

### Community 45 - "Community 45"
Cohesion: 0.30
Nodes (10): page, ws, pending, send(), evalJs(), sleep(), dumpState(), waitFor() (+2 more)

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (6): { generateKeyPairSync }, { writeFileSync, mkdirSync, existsSync }, { homedir }, { join, dirname }, privateDir, { publicKey, privateKey }

### Community 75 - "Community 75"
Cohesion: 0.60
Nodes (4): Args, parseArgs(), loadPrivateKey(), main()

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (11): MoneyInputProps, SaleReceiptActions(), ByPaymentReportTable(), InventoryReportTable(), ItemizedSalesReportTable(), SummaryReportTable(), TaxBreakdownReportTable(), TopProductsReportTable() (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (26): __dirname, INIT, CODEPAGE_PC850, CODEPAGE_PC437, PARTIAL_CUT, SELECT_USER_CHARS, CANCEL_USER_CHARS, COLON_SIGN_MATRIX (+18 more)

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (6): __dirname, COLON_SIGN_MATRIX, matrixToUserDefinedChar(), buildBuffer(), { name, port }, data

### Community 58 - "Community 58"
Cohesion: 0.28
Nodes (7): __dirname, colonNvGraphicEscPos(), rawPrintScriptPath(), buildBuffer(), sendRaw(), printer, data

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (5): __dirname, data, printer, dir, binPath

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (52): __dirname, rawPrintScriptPath, printer, quirks, receiptLines, __dirname, rawPrintScriptPath, sendRaw() (+44 more)

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (3): page, ws, pending

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (15): applyStockDelta(), updateProductCostPrice(), normalizePdfText(), parseMoney(), guessCategory(), extractTrailingNumbers(), parseSupplierInvoiceText(), readSupplierInvoicePdf() (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (37): activationUrl(), createActivationWindow(), closeActivationWindow(), resolveAppIcon(), setDb(), fatal(), initData(), createMainWindow() (+29 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (23): PRODUCT_COLUMNS, PRODUCT_POS_COLUMNS, productSelect(), isTombstoneBarcode(), tombstoneBarcodeValue(), releaseBarcodeForReuse(), buildProductListWhere(), getProduct() (+15 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (28): pad(), localNow(), todayLocal(), daysAgoLocal(), rangeBounds(), daysInRange(), EMPTY_SNAPSHOT, CartTabDbRow (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (52): round2(), openCashSummary(), cashSummaryForCierre(), listCashMovements(), listOpenCashMovements(), cashDrawerStatus(), insertCashMovement(), hasOpeningFloat() (+44 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (32): getDb(), getDbPath(), insertPrintJob(), SETTING_KEYS, ACTION_SHORTCUT_KEYS, resolvePayShortcuts(), getSetting(), setSetting() (+24 more)

### Community 38 - "Community 38"
Cohesion: 0.19
Nodes (11): Migration, migrations, getDbVersion(), runMigrations(), refreshOperatorPasswordHash(), loadOperatorEnv(), isOperatorLoginConfigured(), verifyOperatorPassword() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.28
Nodes (11): AuditMeta, auditWhere(), countAudit(), listAuditPage(), listAudit(), listAuditUsers(), listAuditActions(), registerAuditHandlers() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (31): writeAudit(), getSyncQueueHealth(), requeueFailedSync(), AppError, registerAuthHandlers(), PrivilegedAuthType, authorizeWithDiscountPin(), registerBackupHandlers() (+23 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (18): createCartTab(), saveCartTab(), renameCartTab(), getCartTabJson(), deleteCartTabRow(), removeCartTab(), completeCartTab(), reorderCartTabs() (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (41): kpiTrend(), monthRange(), grossProfit(), salesTrendLast30Days(), salesByHourToday(), inventorySummary(), inventoryHealth(), inventoryProductRows() (+33 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (36): getPrintJob(), markPrintJob(), listPrintJobsForPage(), listRetryablePrintJobIds(), registerPrintQueueHandlers(), PRINTER_ACTION, registerPrinterHandlers(), execFileAsync (+28 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (29): SaleReceiptRow, ItemReceiptRow, FacturaItemRow, PaymentReceiptRow, listPendingCierreSalesForReprint(), loadSaleForReceipt(), assertSaleInOpenShift(), buildFacturaPdfData() (+21 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (20): SYNC_TABLES, SyncTableName, SyncOperation, SyncQueueHealth, enqueueAllPosUsersSync(), enqueueSync(), UserDbRow, mapUser() (+12 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (14): MANAGE, normalizeBatchPrintItems(), isUniqueViolation(), mapProductDbError(), ProductPrintKind, assignProductBarcode(), productForBarcodePrint(), labelLinesForProduct() (+6 more)

### Community 65 - "Community 65"
Cohesion: 0.46
Nodes (1): BackupService

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (15): csvEscape(), buildCsv(), parseCsv(), asSpreadsheetText(), parseSpreadsheetText(), writeToStream(), closeWriteStream(), openUtf8CsvWriteStream() (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.14
Nodes (14): SALES_CSV_KEYS, SalesCsvKey, PRODUCT_CSV_KEYS, LANGUAGES, salesCsvHeaders(), productCsvHeaders(), normalizeHeader(), PRODUCT_HEADER_ALIASES (+6 more)

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (13): ProductCsvKey, ParsedCsv, EFACTURA_HEADERS, normalizeCell(), worksheetToMatrix(), findHeaderRow(), mapLetterColumns(), cell() (+5 more)

### Community 64 - "Community 64"
Cohesion: 0.32
Nodes (5): PS_ENCRYPT, PS_DECRYPT, runPs(), encryptDpapi(), decryptDpapi()

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (15): FacturaPdfItem, FacturaPdfCustomer, FacturaPdfData, escapeHtml(), formatFacturaAmount(), formatFacturaDateTime(), formatDocumentNumber(), itemCodeCell() (+7 more)

### Community 40 - "Community 40"
Cohesion: 0.20
Nodes (10): formatMoney(), formatDate(), shelfLabelBigCols(), shelfLabelTextCols(), wrapShelfLabelText(), estimateShelfLabelDots(), estimateShelfLabelDotsFromLines(), warnIfShelfLabelOverflow() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (47): t(), ReceiptItemLine, ReceiptArgs, PRINTER_TEST_RECEIPT_CATALOG, receiptItemsFromCatalog(), buildPrinterTestReceiptLines(), methodLabel(), idTypeLabel() (+39 more)

### Community 48 - "Community 48"
Cohesion: 0.25
Nodes (9): LabelPrintKind, resolveLabelPrintLines(), labelPrintPayload(), buildProductBarcodeLabelLines(), isPrintableCode128Barcode(), barcodePrintValue(), canPrintProductBarcode(), formatSpacedBarcode() (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.24
Nodes (13): validateProductInput(), cell(), parseOptionalNumber(), parseProductRow(), productInputDiffers(), previewRow(), readProductCsv(), buildProductImportPreview() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (49): Window, channelSet, StockStatus, PrintJobStatus, PrintJobType, ReportType, ReportPeriodPreset, BatchPrintItem (+41 more)

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (7): ERROR_MESSAGES, machineInput, licenseInput, feedback, activateBtn, showFeedback(), loadStatus()

### Community 15 - "Community 15"
Cohesion: 0.08
Nodes (20): withTimeDefaults(), presetWithTime(), NUMPAD_KEYS, NumPadProps, NumPad(), PinModalProps, shiftDays(), presetToday() (+12 more)

### Community 79 - "Community 79"
Cohesion: 0.50
Nodes (1): LANGUAGES

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (2): NavIconName, PATHS

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (3): PAGE_SIZE_OPTIONS, AuditLogState, AuditLogAction

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (9): dismissedListeners, emitDismissedChange(), readDismissedIds(), dismissCierreIds(), useDismissedCierreIds(), useCierreDiscrepancyAlerts(), CierreDiscrepancyBanner(), CierreDiscrepancyAlerts() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (28): PinCardPrintModal(), cloudStatusKey(), SettingsCloudPanel(), PinFields, PinFormsState, emptyPinFields(), PinFormsAction, pinFormsReducer() (+20 more)

### Community 49 - "Community 49"
Cohesion: 0.24
Nodes (8): REPORT_TYPES, PERIOD_PRESETS, ReportSearch, parseReportSearch(), reportSearchFromRange(), periodFromRange(), Reports(), ReportTable()

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (6): UserModalState, FormState, FormAction, UserFormModal(), UsersInitialSetupModal(), UserModalState

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (14): KpiOverview(), DashboardPanelToolbar(), DashboardCard(), DashboardEmpty(), SectionHeading(), KpiCard(), FooterLink(), ProductAnalyticsTables() (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (6): DashboardChartFallback(), CHART_COLORS, CHART_COLORS, PaymentMethodsPieChart(), RechartsModule, useRechartsModule()

### Community 62 - "Community 62"
Cohesion: 0.32
Nodes (5): TAB_LABEL_KEYS, DashboardTabNav(), DASHBOARD_TABS, DashboardTab, DASHBOARD_TAB_SEARCH

### Community 54 - "Community 54"
Cohesion: 0.28
Nodes (4): NotificationsCenterProps, dashboardAlertProductSearch(), notificationAlertSeverityClass(), panelAlertSeverityClass()

### Community 46 - "Community 46"
Cohesion: 0.27
Nodes (9): LazySalesAnalyticsSection(), LazyProductAnalyticsCharts(), LazyStockMovementChart(), LazyInventoryHealthChart(), DashboardHomeChartsLazy, SalesAnalyticsSectionLazy, ProductAnalyticsChartsLazy, StockMovementChartLazy (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.18
Nodes (8): AccountsStep(), Step, LanguagePicker(), AccountsPinFieldsProps, AccountsPinFields(), AdminAccountFieldsProps, AdminAccountFields(), useAccountsStep()

### Community 61 - "Community 61"
Cohesion: 0.25
Nodes (7): AccountDraft, EMPTY_ACCOUNT_DRAFT, PinFieldsState, EMPTY_PIN_FIELDS, ValidationState, EMPTY_VALIDATION, MANAGED_ROLES

### Community 33 - "Community 33"
Cohesion: 0.21
Nodes (10): CartLineDiscountInput(), CartMiscNameInput(), METHODS, PaymentSplitSection(), cartLineDiscountPercentDisplay(), formatPercentDisplay(), parseDiscountPercentInput(), isEditableElement() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (12): CartTabsBarProps, CartTabsBar(), OpenFloatModal(), POSCartPanel(), POSModals(), POSSearchPanelProps, POSSearchPanel(), POSSidebar() (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.28
Nodes (3): CashDrawerSummary(), PendingMovement, CashMovementsPanel()

### Community 31 - "Community 31"
Cohesion: 0.16
Nodes (10): ID_TYPES, CustomerModalProps, CustomerModal(), POSModalsProps, RemoveLineModalProps, RemoveLineModal(), ReturnModalState, ReturnModal() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (10): DiscountModalProps, DiscountState, DiscountAction, DiscountModal(), LineDiscountPinRequest, LineDiscountPinModal(), PriceOverrideState, PriceOverrideAction (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (11): GRID_KEYS, PaymentCheckoutPad(), PaymentCheckoutPanel(), PaymentInvoiceCustomerSection(), METHODS, PaymentMethodButtons(), PaymentMethodSidebar(), PaymentModalProps (+3 more)

### Community 72 - "Community 72"
Cohesion: 0.50
Nodes (1): ReprintReceiptsList()

### Community 51 - "Community 51"
Cohesion: 0.20
Nodes (7): lineDiscountFromPercent(), usePosSearchFocus(), usePosEnterShortcut(), DiscountTarget, CloseTabTarget, SaleState, WorkspaceState

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (9): defaultCashTendered(), PaymentEntry, newPaymentEntry(), METHODS, PaymentModalState, PaymentModalAction, createInitialPaymentState(), paymentModalReducer() (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (7): REASONS, AdjustStockModal(), ProductLabelPrintPromptModal(), ProductReceiveChoice, ProductReceiveChoiceModalProps, ProductReceiveChoiceModal(), ProductManagerModalsProps

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (5): QueueItem, clampCopies(), copiesFromText(), AddProductResult, BatchLabelPrintModal()

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (6): ProductCsvHelpModalProps, REQUIRED_COLS, OPTIONAL_COLS, STEP_KEYS, TIP_KEYS, ProductCsvHelpModal()

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (2): ProductFormModalProps, ProductFormModal()

### Community 73 - "Community 73"
Cohesion: 0.50
Nodes (3): ProductImportPreviewModalProps, importHasStockChanges(), ProductImportPreviewModal()

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (7): PAGE_SIZE_OPTIONS, ProductsPaginationProps, ProductsPagination(), ProductsTable(), ProductManagerModals(), ProductsPageToolbarProps, ProductsPageToolbar()

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (3): SupplierInvoicePreviewModalProps, NewItemDraft, SupplierInvoicePreviewModal()

### Community 67 - "Community 67"
Cohesion: 0.33
Nodes (5): ProductsPageFiltersProps, ProductsPageFilters(), ProductManagerUiState, ProductFiltersState, useProductManager()

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (3): NavItem, NAV_ITEMS, ADMIN_ITEMS

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (16): ApiError, call(), api, formatMoney(), useSession(), homeFor(), homeAfterLogin(), ToastAction (+8 more)

### Community 50 - "Community 50"
Cohesion: 0.27
Nodes (4): miscLineUnitPrice(), cartLineUnitPrice(), cartLineGross(), cartLineTotal()

### Community 63 - "Community 63"
Cohesion: 0.32
Nodes (5): CartTabSnapshot, EMPTY_CART_TAB_SNAPSHOT, serializeCartTabSnapshot(), snapshotTotal(), isEmptySnapshot()

### Community 81 - "Community 81"
Cohesion: 0.50
Nodes (1): Toasts

### Community 55 - "Community 55"
Cohesion: 0.25
Nodes (1): shouldIgnoreShortcutTarget()

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (1): queryClient

### Community 19 - "Community 19"
Cohesion: 0.07
Nodes (27): PRODUCT_STOCK_SEARCH, REPORT_TYPE_SEARCH, REPORT_PERIOD_SEARCH, rootRoute, indexRoute, firstRunRoute, syncSetupRoute, chooseLanguageRoute (+19 more)

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (2): ImportMetaEnv, ImportMeta

### Community 34 - "Community 34"
Cohesion: 0.21
Nodes (14): CartTabSnapshot, parseCartTabSnapshotJson(), isCartTabSnapshotEmpty(), cartTabSnapshotTotal(), roundColones(), formatColones(), digitsFromMoneyInput(), moneyInputIsEmpty() (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (50): languagePayloadSchema, pinChangeSchema, cajaPinChangeInputSchema, productInputSchema, productFiltersSchema, adjustStockInputSchema, salePaymentInputSchema, createSaleProductItemSchema (+42 more)

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (4): root, vendorDir, sharedDir, libDir

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (39): SyncConfig, defaultSyncConfigPath(), localSyncConfigPath(), loadEnvFile(), loadConfigFile(), readSecretKeyEnv(), resolveSecretKey(), loadConfig() (+31 more)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (64): 07768fd pagination and user tests, 07a5b84 more fixes, 0d0d88f Remove split-out repository entries from .gitignore, 0ef1588 stuff, 142aee3 mejorar el cierre y proprieratary data, 14a2364 Split monorepo into independent repos: shelfPos, shelfDashboard, shelfDocs, 1b80d1c build fix, 1e257f4 added a versioning disaply and fixed 2 issues regarding the CSV download and cierre (+56 more)

## Knowledge Gaps
- **340 isolated node(s):** `licensePub`, `appIcon`, `inAppLogo`, `copyBrandAssetsPlugin`, `reactFiles` (+335 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 86`** (2 nodes): `reactFiles`, `nodeFiles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `BackupService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `LANGUAGES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `NavIconName`, `PATHS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `ReprintReceiptsList()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (2 nodes): `ProductFormModalProps`, `ProductFormModal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `Toasts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `shouldIgnoreShortcutTarget()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `queryClient`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (2 nodes): `ImportMetaEnv`, `ImportMeta`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BackupService` connect `Community 65` to `Community 12`, `Community 8`, `Community 10`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `AppError` connect `Community 8` to `Community 26`, `Community 2`, `Community 12`, `Community 11`, `Community 30`, `Community 16`, `Community 18`, `Community 10`, `Community 22`, `Community 9`, `Community 41`, `Community 39`, `Community 28`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `getDb()` connect `Community 11` to `Community 12`, `Community 2`, `Community 30`, `Community 8`, `Community 16`, `Community 18`, `Community 44`, `Community 7`, `Community 9`, `Community 22`, `Community 29`, `Community 41`, `Community 28`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `licensePub`, `appIcon`, `inAppLogo` to the rest of the system?**
  _340 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 13` be split into smaller, more focused modules?**
  _Cohesion score 0.07564102564102564 - nodes in this community are weakly interconnected._
- **Should `Community 17` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06393442622950819 - nodes in this community are weakly interconnected._