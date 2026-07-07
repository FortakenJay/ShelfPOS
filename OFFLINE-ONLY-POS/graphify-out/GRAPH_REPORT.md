# Graph Report - OFFLINE-ONLY-POS  (2026-07-06)

## Corpus Check
- 276 files · ~191,021 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1965 nodes · 4686 edges · 105 communities (101 shown, 4 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 246 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f69ed35f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 111|Community 111]]

## God Nodes (most connected - your core abstractions)
1. `t()` - 142 edges
2. `getDb()` - 119 edges
3. `localNow()` - 44 edges
4. `handle()` - 43 edges
5. `round2()` - 34 edges
6. `dashboardOverview()` - 32 edges
7. `formatMoney()` - 32 edges
8. `AppError` - 29 edges
9. `useToasts()` - 24 edges
10. `getAppSettings()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `parseSupplierInvoiceText()`  [EXTRACTED]
  scripts/test-supplier-pdf.ts → src/main/services/productSupplierInvoicePdf.ts
- `DateRangePicker()` --calls--> `t()`  [INFERRED]
  src/renderer/src/components/DateRangePicker.tsx → src/main/services/i18n.ts
- `LanguageSwitcher()` --calls--> `t()`  [INFERRED]
  src/renderer/src/components/LanguageSwitcher.tsx → src/main/services/i18n.ts
- `PinModal()` --calls--> `t()`  [INFERRED]
  src/renderer/src/components/PinModal.tsx → src/main/services/i18n.ts
- `ConfirmDialog()` --calls--> `t()`  [INFERRED]
  src/renderer/src/components/ui.tsx → src/main/services/i18n.ts

## Import Cycles
- 1-file cycle: `src/renderer/src/lib/cartTabSnapshot.ts -> src/renderer/src/lib/cartTabSnapshot.ts`

## Communities (105 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (98): daysAgoLocal(), daysInRange(), pad(), rangeBounds(), round2(), todayLocal(), getDb(), auditWhere() (+90 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (66): activationUrl(), closeActivationWindow(), createActivationWindow(), resolveAppIcon(), getDbPath(), setDb(), getDbVersion(), Migration (+58 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (59): labelLinesForProduct(), boundsForReport(), buildReportPrintLines(), isMultiDay(), reportRangeLabel(), formatDate(), formatMoney(), t() (+51 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (61): AdjustStockInput, BackupInfo, BatchPrintItem, CashMovementInput, CierreConfirmInput, CierreConfirmResult, CierreDiscardedTabRow, CierreDiscountItem (+53 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (50): defaultSyncConfigPath(), loadConfig(), loadConfigFile(), loadEnvFile(), localSyncConfigPath(), readSecretKeyEnv(), resolveSecretKey(), SyncConfig (+42 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (50): __dirname, printer, quirks, rawPrintScriptPath, receiptLines, __dirname, labelLines, main() (+42 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (50): adjustStockInputSchema, auditLogFilterSchema, cajaPinChangeInputSchema, cashMovementInputSchema, cierreConfirmInputSchema, createReturnInputSchema, createSaleInputSchema, createSaleItemInputSchema (+42 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (43): Activación en el PC del cliente, Actualizar la app sin reactivar, Al ejecutar `license:generate`, Al ejecutar `license:keypair`, Cambiar de computadora, Comandos de referencia, Configuración inicial (una sola vez), Contenido del JWT (+35 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (39): buildCsv(), csvEscape(), formatPaymentMethod(), headerAliases(), LANGUAGES, NORMALIZED_TO_PRODUCT_KEY, normalizeHeader(), parsePaymentMethod() (+31 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (27): AdjustStockModal(), REASONS, ProductManagerModals(), ProductManagerModalsProps, ProductsPageFilters(), ProductsPageFiltersProps, ProductsPageToolbar(), ProductsPageToolbarProps (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (35): PRODUCT_COLUMNS, localNow(), insertPrintJob(), alertsForProducts(), applyStockDelta(), buildProductListWhere(), enqueueProductSync(), getProduct() (+27 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (26): writeAudit(), SETTING_KEYS, AppError, authorizeWithDiscountPin(), PrivilegedAuthType, SELL, SELL, assertFirstRun() (+18 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (26): FormAction, formReducer(), FormState, initialFormState(), UserFormModal(), UserModalState, UsersInitialSetupModal(), UserModalState (+18 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (16): ButtonProps, ButtonSize, ButtonVariant, ConfirmDialog(), MODAL_WIDTHS, SIZE_CLASSES, VARIANT_CLASSES, SaleReceiptActions() (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (26): align(), appendColonMark(), appendColonTestStrip(), bold(), buildJob1(), buildJob2(), buildJob3(), buildJob4() (+18 more)

### Community 15 - "Community 15"
Cohesion: 0.05
Nodes (39): Cloud sync (optional), Data & backups, Development, First run, Packaging, Printer notes, ShelfPOS, Stack (+31 more)

### Community 16 - "Community 16"
Cohesion: 0.11
Nodes (27): PinCardPrintModal(), draftFromSettings(), EMISOR_KEYS, emisorDraftDirty(), GENERAL_KEYS, generalDraftDirty(), sectionDirty(), SettingsDraft (+19 more)

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (28): devDependencies, electron, electron-builder, electron-vite, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-compiler (+20 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (28): getPrintJob(), PRINTER_ACTION, drawerPulseBytes(), attemptPrintJob(), configuredPrinterName(), enqueuePrinterTask(), ensurePrinterExists(), execFileAsync (+20 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (25): dependencies, better-sqlite3, node-windows, description, devDependencies, tsx, @types/better-sqlite3, @types/node (+17 more)

### Community 20 - "Community 20"
Cohesion: 0.07
Nodes (27): adminCashRoute, adminIndexRoute, auditRoute, cashRoute, chooseLanguageRoute, cierreRoute, dashboardRoute, exportRoute (+19 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (17): GRID_KEYS, PaymentCheckoutPad(), CashAmountStrip(), PaymentCheckoutPanel(), buildPaymentCustomer(), PaymentInvoiceCustomerSection(), METHODS, PaymentMethodButtons() (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (18): NumPad(), NUMPAD_KEYS, NumPadProps, PinModal(), PinModalProps, Modal(), DiscountAction, DiscountModal() (+10 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (22): CartTabDbRow, completeCartTab(), createCartTab(), deleteCartTabRow(), discardCartTabAudited(), EMPTY_SNAPSHOT, getCartTabJson(), listCartTabs() (+14 more)

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (23): registerAuditHandlers(), registerAuthHandlers(), registerBackupHandlers(), registerCartHandlers(), registerCartTabHandlers(), registerCashHandlers(), registerCierreHandlers(), registerDashboardHandlers() (+15 more)

### Community 25 - "Community 25"
Cohesion: 0.09
Nodes (19): assertSaleInOpenShift(), listPendingCierreSalesForReprint(), assertSaleStock(), ID_TYPES, PAYMENT_METHODS, PricedSaleLine, SALES_OR_ADMIN, SELL (+11 more)

### Community 26 - "Community 26"
Cohesion: 0.14
Nodes (18): KpiOverview(), DashboardCard(), DashboardEmpty(), FooterLink(), KpiCard(), SectionHeading(), ActivityAlertsSection(), EmployeeSection() (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (19): SYNC_TABLES, SyncOperation, SyncTableName, countActiveAdmins(), deactivateAppUser(), getAppUserById(), getHiddenOperatorUserId(), insertAppUser() (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (15): AdminCierreSummary(), CierreDiscardedTabs(), CierreDiscounts(), CierreHistory(), CierrePriceOverrides(), CierreReconciliation(), CierreStep, moneyTick() (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (15): AccountsStep(), AccountsPinFields(), AccountsPinFieldsProps, AdminAccountFields(), AdminAccountFieldsProps, Step, AccountDraft, EMPTY_ACCOUNT_DRAFT (+7 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (14): usePosEnterShortcut(), usePosSearchFocus(), POSTerminal(), POSTerminalView(), CloseTabTarget, SaleState, usePOSTerminal(), WorkspaceState (+6 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (12): LANGUAGES, LanguageSwitcher(), Cierre(), LoginPage(), ADMIN_ITEMS, NAV_ITEMS, NavItem, RequireRole() (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.12
Nodes (10): cloudStatusKey(), SettingsCloudPanel(), Settings(), initialReturnState(), ReturnModal(), ReturnModalState, api, ApiError (+2 more)

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (17): SaleReceiptRow, buildFacturaHtml(), buildPage(), buildSummaryBlock(), buildTableRows(), escapeHtml(), FacturaPdfCustomer, FacturaPdfData (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.10
Nodes (19): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, jsx, lib, module, moduleResolution, noEmit (+11 more)

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (13): DateRangePicker(), presetWithTime(), withTimeDefaults(), presetMonth(), presetToday(), presetWeek(), rangeForReportPeriod(), shiftDays() (+5 more)

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (18): getProductByBarcode(), confirmProductImport(), parseCsv(), mapProductCsvHeaders(), parseFacturaNegativo(), parseSpreadsheetText(), applyProductImport(), buildProductImportPreview() (+10 more)

### Community 37 - "Community 37"
Cohesion: 0.11
Nodes (18): scripts, build, dev, dist, dist:dir, doctor, license:generate, license:keypair (+10 more)

### Community 38 - "Community 38"
Cohesion: 0.16
Nodes (15): main(), updateProductCostPrice(), applySupplierInvoiceImport(), buildSupplierInvoicePreview(), extractTrailingNumbers(), guessCategory(), normalizePdfText(), parseMoney() (+7 more)

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (11): DashboardChartFallback(), CHART_COLORS, InventoryHealthChart(), ProductAnalyticsCharts(), SalesAnalyticsSection(), StockMovementChart(), DashboardHomeCharts(), CHART_COLORS (+3 more)

### Community 40 - "Community 40"
Cohesion: 0.21
Nodes (12): lineDiscountFromPercent(), cartLineGross(), cartLineShowsBulk(), cartLineTotal(), cartLineUnitPrice(), miscLineUnitPrice(), catalogUnitPrice(), effectiveUnitPrice() (+4 more)

### Community 41 - "Community 41"
Cohesion: 0.13
Nodes (12): PrintQueue(), ReportTable(), parseReportSearch(), PERIOD_PRESETS, periodFromRange(), REPORT_TYPES, Reports(), ReportSearch (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (10): CustomerModal(), CustomerModalProps, ID_TYPES, cartLineToSaleInput(), POSModals(), POSModalsProps, RemoveLineModal(), RemoveLineModalProps (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.24
Nodes (10): MoneyInputProps, OpenFloatModal(), appendMoneyInputDigit(), backspaceMoneyInput(), digitsFromMoneyInput(), formatColones(), formatMoneyInputFromDigits(), formatMoneyInputFromNumber() (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.14
Nodes (12): Commands, Config shape, Decision guide, Educating the user, Explaining and configuring rules, Workflow, After making React code changes:, Command (+4 more)

### Community 45 - "Community 45"
Cohesion: 0.14
Nodes (12): Commands, Config shape, Decision guide, Educating the user, Explaining and configuring rules, Workflow, After making React code changes:, Command (+4 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, better-sqlite3, exceljs, i18next, iconv-lite, jsonwebtoken, node-machine-id (+8 more)

### Community 47 - "Community 47"
Cohesion: 0.27
Nodes (8): CartLineDiscountInput(), CartMiscNameInput(), cartLineDiscountPercentDisplay(), formatPercentDisplay(), parseDiscountPercentInput(), commitEditableOnEnter(), isEditableElement(), shouldKeepSearchFocused()

### Community 48 - "Community 48"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit, noUnusedLocals (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.26
Nodes (12): SalePaymentRow, buildFacturaPdfData(), FacturaItemRow, ItemReceiptRow, loadSaleForReceipt(), PaymentReceiptRow, reprintSaleReceipt(), receiptLanguage() (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (7): NavIconName, PATHS, NotificationsCenter(), NotificationsCenterProps, dashboardAlertProductSearch(), notificationAlertSeverityClass(), panelAlertSeverityClass()

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (8): CartTabsBar(), CartTabsBarProps, POSCartPanel(), POSSearchPanel(), POSSearchPanelProps, POSSidebar(), POSTerminalState, useVerticalDragResize()

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (10): listFailedPrintJobs(), listPendingPrintJobIds(), listPrintJobsForPage(), markPrintJob(), PrintJobListResult, PrintJobRow, PrintJobStatus, PrintJobType (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.15
Nodes (13): A1. Compilar el instalador, A2. Verificar que tienes llave de licencias, B1. Pedir acceso al cliente, B2. Copiar el instalador al PC del cliente, Checklist copiar/pegar (cada cliente), Comandos de referencia rápida, Parte A — Preparar en tu PC (sin TeamViewer), Parte B — Conectar por TeamViewer (+5 more)

### Community 54 - "Community 54"
Cohesion: 0.26
Nodes (9): Get-ShelfPosSyncServices(), Invoke-ShelfPosUninstaller(), Remove-ShelfPosWindowsService(), Stop-AndRemove-Service(), Stop-ShelfPosAppProcesses(), Test-SyncRemovalNeeded(), Write-Ok(), Write-Skip() (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.30
Nodes (10): CierreDiscrepancyAlerts(), CierreDiscrepancyBanner(), dismissCierreIds(), dismissedListeners, dismissedSnapshot(), emitDismissedChange(), readDismissedIds(), subscribeDismissed() (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.24
Nodes (10): LazyDashboardHomeCharts(), LazyInventoryHealthChart(), LazyProductAnalyticsCharts(), LazySalesAnalyticsSection(), LazyStockMovementChart(), DashboardHomeChartsLazy, InventoryHealthChartLazy, ProductAnalyticsChartsLazy (+2 more)

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (8): Build-SyncServiceBundle(), Ensure-WindowsIcon(), Invoke-ElectronDist(), Invoke-Npm(), Remove-BuildOutputs(), Remove-PathWithRetry(), Stop-BuildLockingProcesses(), Try-RemovePath()

### Community 58 - "Community 58"
Cohesion: 0.30
Nodes (10): dumpState(), evalJs(), log(), page, pending, pinClicks(), send(), sleep() (+2 more)

### Community 59 - "Community 59"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, esModuleInterop, module, moduleResolution, outDir, rootDir, skipLibCheck (+3 more)

### Community 60 - "Community 60"
Cohesion: 0.18
Nodes (10): author, description, license, main, name, overrides, esbuild, uuid (+2 more)

### Community 61 - "Community 61"
Cohesion: 0.24
Nodes (5): Ensure-Administrator(), Get-SyncSourceCandidates(), Resolve-SyncSource(), Test-IsAdministrator(), Test-SyncBundleDir()

### Community 62 - "Community 62"
Cohesion: 0.20
Nodes (3): ReprintReceiptsList(), ReprintReceipts(), Toasts

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (9): saleFromTab(), parseCartTabSnapshot(), CartTabSnapshot, catalogUnitPrice(), isCartTabSnapshotEmpty(), lineTotalFromProduct(), lineUnitPrice(), parseCartTabSnapshotJson() (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.22
Nodes (6): AddProductResult, BatchLabelPrintModalFooter(), BatchLabelPrintQueueTable(), clampCopies(), copiesFromText(), QueueItem

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (9): Checklist copiar/pegar (cada cliente), Comandos de referencia rápida, Dos pasos (envío de USB o visita corta), Flujos según cómo trabajes, Parte E — Primera configuración del negocio, Parte F — Actualizar a una versión nueva (USB), Seguridad (recordatorio), ShelfPOS — Instalación con memoria USB (+1 more)

### Community 66 - "Community 66"
Cohesion: 0.36
Nodes (7): AuditMeta, listAuditActions(), listAuditUsers(), AuditLogFilter, AuditLogPage, AuditLogRow, AuditUser

### Community 67 - "Community 67"
Cohesion: 0.31
Nodes (6): estimateShelfLabelDots(), estimateShelfLabelDotsFromLines(), shelfLabelBigCols(), shelfLabelTextCols(), warnIfShelfLabelOverflow(), wrapShelfLabelText()

### Community 68 - "Community 68"
Cohesion: 0.28
Nodes (7): buildBuffer(), colonNvGraphicEscPos(), data, __dirname, printer, rawPrintScriptPath(), sendRaw()

### Community 69 - "Community 69"
Cohesion: 0.25
Nodes (6): buildBuffer(), COLON_SIGN_MATRIX, data, __dirname, matrixToUserDefinedChar(), { name, port }

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (8): createInitialPaymentState(), defaultCashTendered(), METHODS, newPaymentEntry(), PaymentEntry, PaymentModalAction, paymentModalReducer(), PaymentModalState

### Community 71 - "Community 71"
Cohesion: 0.32
Nodes (5): decryptDpapi(), encryptDpapi(), PS_DECRYPT, PS_ENCRYPT, runPs()

### Community 72 - "Community 72"
Cohesion: 0.29
Nodes (7): activateBtn, ERROR_MESSAGES, feedback, licenseInput, loadStatus(), machineInput, showFeedback()

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (6): AuditLog(), AuditLogAction, auditLogReducer(), AuditLogState, formatAuditDetail(), PAGE_SIZE_OPTIONS

### Community 74 - "Community 74"
Cohesion: 0.32
Nodes (5): DashboardTabNav(), TAB_LABEL_KEYS, DASHBOARD_TAB_SEARCH, DASHBOARD_TABS, DashboardTab

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (5): channelSet, Window, ApiResult, IPC_CHANNELS, LicenseStatus

### Community 76 - "Community 76"
Cohesion: 0.43
Nodes (5): CartTabSnapshot, EMPTY_CART_TAB_SNAPSHOT, isEmptySnapshot(), serializeCartTabSnapshot(), snapshotTotal()

### Community 77 - "Community 77"
Cohesion: 0.60
Nodes (5): escapeHtml(), loadWindowHtml(), printLinesToHtml(), writeHtmlToPdf(), writePrintLinesPdf()

### Community 79 - "Community 79"
Cohesion: 0.29
Nodes (4): appIcon, copyBrandAssetsPlugin, inAppLogo, licensePub

### Community 80 - "Community 80"
Cohesion: 0.40
Nodes (4): libDir, root, sharedDir, vendorDir

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (3): alertMessage(), DashboardPanelToolbar(), formatDate()

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (6): { generateKeyPairSync }, { homedir }, { join, dirname }, privateDir, { publicKey, privateKey }, { writeFileSync, mkdirSync, existsSync }

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (3): C1. Ejecutar el instalador, C2. Qué instala (referencia), Parte C — Instalar en el PC del cliente

### Community 87 - "Community 87"
Cohesion: 0.33
Nodes (5): ignore, include, rules, react-doctor/async-await-in-loop, $schema

### Community 88 - "Community 88"
Cohesion: 0.33
Nodes (6): allowScripts, better-sqlite3@12.10.0, electron@41.7.2, electron-winstaller@5.4.0, esbuild@0.25.12, esbuild@0.27.7

### Community 90 - "Community 90"
Cohesion: 0.33
Nodes (5): binPath, data, dir, __dirname, printer

### Community 93 - "Community 93"
Cohesion: 0.40
Nodes (5): D1. Obtener el ID de equipo del cliente, D2. Generar la clave en tu PC, D3. Activar en el PC del cliente, Errores frecuentes, Parte D — Licencia (obligatorio en producción)

### Community 94 - "Community 94"
Cohesion: 0.40
Nodes (5): D1. Obtener el ID de equipo, D2. Generar la clave (en tu PC de desarrollo), D3. Entregar la licencia al cliente, Errores frecuentes, Parte D — Licencia (obligatorio en producción)

### Community 96 - "Community 96"
Cohesion: 0.60
Nodes (4): Args, loadPrivateKey(), main(), parseArgs()

### Community 97 - "Community 97"
Cohesion: 0.40
Nodes (3): page, pending, ws

### Community 100 - "Community 100"
Cohesion: 0.50
Nodes (4): Antes de empezar, Archivos que llevas al cliente, En el PC del cliente, En tu PC (tú / soporte)

### Community 101 - "Community 101"
Cohesion: 0.50
Nodes (4): A1. Compilar el instalador, A2. Verificar que tienes llave de licencias, A3. (Opcional) Licencia anticipada, Parte A — Preparar en tu PC (antes de ir al cliente)

### Community 102 - "Community 102"
Cohesion: 0.50
Nodes (4): Antes de empezar, En el PC del cliente, En tu PC (tú / soporte), Qué puede ir en el USB

### Community 103 - "Community 103"
Cohesion: 0.50
Nodes (4): B1. Estructura recomendada, B2. Contenido sugerido para `LEEME.txt`, B3. Antes de desconectar el USB, Parte B — Preparar la memoria USB

### Community 104 - "Community 104"
Cohesion: 0.50
Nodes (4): C1. Copiar del USB al disco local, C2. Ejecutar el instalador, C3. Qué instala (referencia), Parte C — En el PC del cliente (con USB)

### Community 107 - "Community 107"
Cohesion: 0.50
Nodes (3): compilerOptions, strict, files

## Knowledge Gaps
- **586 isolated node(s):** `$schema`, `include`, `ignore`, `react-doctor/async-await-in-loop`, `licensePub` (+581 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `t()` connect `Community 2` to `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 16`, `Community 21`, `Community 22`, `Community 25`, `Community 26`, `Community 28`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 35`, `Community 39`, `Community 41`, `Community 42`, `Community 43`, `Community 47`, `Community 50`, `Community 51`, `Community 55`, `Community 62`, `Community 64`, `Community 73`, `Community 74`, `Community 82`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `getDb()` connect `Community 0` to `Community 1`, `Community 66`, `Community 36`, `Community 38`, `Community 8`, `Community 10`, `Community 11`, `Community 49`, `Community 18`, `Community 52`, `Community 23`, `Community 25`, `Community 27`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `BackupService` connect `Community 0` to `Community 24`, `Community 1`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 111 inferred relationships involving `t()` (e.g. with `DateRangePicker()` and `LanguageSwitcher()`) actually correct?**
  _`t()` has 111 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `round2()` (e.g. with `PaymentModal()` and `usePOSTerminal()`) actually correct?**
  _`round2()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `include`, `ignore` to the rest of the system?**
  _586 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05434173669467787 - nodes in this community are weakly interconnected._