import type {
  AdjustStockInput,
  ApiResult,
  AppSettings,
  AppUserRow,
  AuditLogFilter,
  AuditLogPage,
  AuditUser,
  BackupInfo,
  CashDrawerStatus,
  CashMovementInput,
  CashMovementRow,
  CartRemoveAuthorizeInput,
  CartTabCreateInput,
  CartTabDiscardAuditedInput,
  CartTabDiscardResult,
  CartTabListItem,
  CartTabRenameInput,
  CartTabReorderInput,
  CartTabSaveInput,
  CierreConfirmInput,
  CierreConfirmResult,
  CierreDiscrepancyAlert,
  CierreHistoryFilter,
  CierrePreview,
  CierreRecord,
  CreateReturnInput,
  CreateReturnResult,
  CreateSaleInput,
  CreateSaleResult,
  DateRange,
  DashboardOverview,
  DiscountAuthorizeInput,
  FirstRunSetupInput,
  FirstRunStatus,
  IpcChannel,
  Language,
  OpenFloatInput,
  PrintJobListResult,
  PrintStatus,
  PrinterStatusInfo,
  PriceOverrideAuthorizeInput,
  Product,
  ProductFilters,
  ProductListResult,
  ProductImportPreview,
  ProductImportResult,
  ProductImportStockMode,
  ProductInput,
  ReportData,
  ReportType,
  ReprintReceiptResult,
  SaleDetail,
  SaleReprintRow,
  SessionUser,
  SettingsUpdateInput,
  SyncSetupSaveInput,
  SyncSetupStatus,
  StockAlert,
  UserCreateInput,
  UserUpdateInput
} from '@shared/types'

export class ApiError extends Error {
  constructor(
    public readonly key: string,
    public readonly vars?: Record<string, string | number>,
    detail?: string
  ) {
    super(detail ?? key)
    this.name = 'ApiError'
  }
}

async function call<T>(channel: IpcChannel, payload?: unknown): Promise<T> {
  let result: ApiResult<T>
  try {
    result = (await window.api.invoke(channel, payload)) as ApiResult<T>
  } catch (err) {
    console.error(`[api] ${channel}`, err)
    const message = err instanceof Error ? err.message : String(err)
    if (
      message.includes('No handler registered') ||
      message.includes('Unknown IPC channel')
    ) {
      throw new ApiError('errors.restartRequired')
    }
    throw new ApiError('errors.unknown')
  }
  if (!result.ok) throw new ApiError(result.error, result.vars, result.message)
  return result.data
}

export const api = {
  firstRun: {
    status: () => call<FirstRunStatus>('firstRun:status'),
    setLanguage: (language: Language) => call<null>('firstRun:setLanguage', { language }),
    complete: (input: FirstRunSetupInput) => call<null>('firstRun:complete', input)
  },
  syncSetup: {
    status: () => call<SyncSetupStatus>('syncSetup:status'),
    save: (input: SyncSetupSaveInput) => call<SyncSetupStatus>('syncSetup:save', input),
    restartService: () => call<null>('syncSetup:restartService'),
  },
  auth: {
    login: (username: string, password: string) =>
      call<SessionUser>('auth:login', { username, password }),
    logout: () => call<null>('auth:logout'),
    session: () => call<SessionUser | null>('auth:session')
  },
  settings: {
    get: () => call<AppSettings>('settings:get'),
    setLanguage: (language: Language) => call<null>('settings:setLanguage', { language }),
    update: (input: SettingsUpdateInput) => call<AppSettings>('settings:update', input),
    changePin: (currentPin: string, newPin: string) =>
      call<null>('settings:changePin', { currentPin, newPin }),
    changeCajaPin: (currentPin: string, newPin: string) =>
      call<null>('settings:changeCajaPin', { currentPin, newPin }),
    printPinCard: (managerPin: string, cajaPin: string) =>
      call<{ printStatus: PrintStatus }>('settings:printPinCard', { managerPin, cajaPin })
  },
  products: {
    list: (filters: ProductFilters) => call<ProductListResult>('products:list', filters),
    categories: () => call<string[]>('products:categories'),
    byBarcode: (barcode: string) => call<Product | null>('products:byBarcode', { barcode }),
    search: (query: string) => call<Product[]>('products:search', { query }),
    create: (input: ProductInput) => call<Product>('products:create', input),
    update: (id: number, input: ProductInput) =>
      call<Product>('products:update', { id, ...input }),
    delete: (id: number) => call<null>('products:delete', { id }),
    adjustStock: (input: AdjustStockInput) =>
      call<{ product: Product; stockAlerts: StockAlert[] }>('products:adjustStock', input),
    exportCsv: (template?: boolean) =>
      call<{ canceled: boolean; path?: string }>('products:exportCsv', { template }),
    importPreview: () => call<ProductImportPreview>('products:importCsvPreview'),
    importEfacturaPreview: () => call<ProductImportPreview>('products:importEfacturaPreview'),
    importConfirm: (filePath: string, stockMode: ProductImportStockMode = 'add') =>
      call<ProductImportResult>('products:importCsvConfirm', { filePath, stockMode }),
    importEfacturaConfirm: (filePath: string, stockMode: ProductImportStockMode = 'add') =>
      call<ProductImportResult>('products:importEfacturaConfirm', { filePath, stockMode }),
    printLabel: (productId: number, copies = 1) =>
      call<{ printStatus: PrintStatus }>('products:printLabel', { productId, copies }),
    printLabelBatch: (productIds: number[]) =>
      call<{ printStatus: PrintStatus; printed: number; failed: number; total: number }>(
        'products:printLabelBatch',
        { productIds },
      )
  },
  sales: {
    create: (input: CreateSaleInput) => call<CreateSaleResult>('sales:create', input),
    findForReturn: (params: { saleId?: number; date?: string }) =>
      call<SaleDetail[]>('sales:findForReturn', params),
    listForReprint: () => call<SaleReprintRow[]>('sales:listForReprint'),
    reprintReceipt: (saleId: number) =>
      call<ReprintReceiptResult>('sales:reprintReceipt', { saleId }),
    exportFacturaPdf: (saleId: number) =>
      call<{ canceled: boolean; path?: string }>('sales:exportFacturaPdf', { saleId })
  },
  returns: {
    create: (input: CreateReturnInput) => call<CreateReturnResult>('returns:create', input)
  },
  discount: {
    authorize: (input: DiscountAuthorizeInput) => call<null>('discount:authorize', input)
  },
  cart: {
    removeAuthorize: (input: CartRemoveAuthorizeInput) =>
      call<null>('cart:removeAuthorize', input)
  },
  cartTabs: {
    list: () => call<CartTabListItem[]>('cartTabs:list'),
    create: (input: CartTabCreateInput) => call<CartTabListItem>('cartTabs:create', input),
    save: (input: CartTabSaveInput) => call<null>('cartTabs:save', input),
    rename: (input: CartTabRenameInput) => call<null>('cartTabs:rename', input),
    remove: (id: number) => call<null>('cartTabs:remove', { id }),
    complete: (id: number) => call<null>('cartTabs:complete', { id }),
    discardAudited: (input: CartTabDiscardAuditedInput) =>
      call<CartTabDiscardResult>('cartTabs:discardAudited', input),
    reorder: (input: CartTabReorderInput) => call<null>('cartTabs:reorder', input)
  },
  priceOverride: {
    authorize: (input: PriceOverrideAuthorizeInput) =>
      call<null>('priceOverride:authorize', input)
  },
  reports: {
    run: (type: ReportType, range: DateRange, opts?: { page?: number; pageSize?: number }) =>
      call<ReportData>('reports:run', { type, range, ...opts }),
    print: (type: ReportType, range: DateRange) =>
      call<{ printStatus: PrintStatus }>('reports:print', { type, range }),
    exportPdf: (type: ReportType, range: DateRange) =>
      call<{ canceled: boolean; path?: string }>('reports:exportPdf', { type, range })
  },
  dashboard: {
    overview: () => call<DashboardOverview>('dashboard:overview')
  },
  cierre: {
    preview: () => call<CierrePreview>('cierre:preview'),
    confirm: (input: CierreConfirmInput) => call<CierreConfirmResult>('cierre:confirm', input),
    history: (filter: CierreHistoryFilter) => call<CierreRecord[]>('cierre:history', filter),
    discrepancyAlerts: () => call<CierreDiscrepancyAlert[]>('cierre:discrepancyAlerts'),
    exportPdf: (cierreId: number) =>
      call<{ canceled: boolean; path?: string }>('cierre:exportPdf', { cierreId }),
    print: (cierreId: number) => call<{ printStatus: PrintStatus }>('cierre:print', { cierreId })
  },
  cash: {
    status: () => call<CashDrawerStatus>('cash:status'),
    openFloat: (input: OpenFloatInput) => call<CashDrawerStatus>('cash:openFloat', input),
    movement: (input: CashMovementInput) => call<CashDrawerStatus>('cash:movement', input),
    listMovements: (range: DateRange) => call<CashMovementRow[]>('cash:listMovements', range)
  },
  audit: {
    list: (filter: AuditLogFilter) => call<AuditLogPage>('audit:list', filter),
    users: () => call<AuditUser[]>('audit:users'),
    actions: () => call<string[]>('audit:actions')
  },
  users: {
    list: () => call<AppUserRow[]>('users:list'),
    create: (input: UserCreateInput) => call<AppUserRow>('users:create', input),
    update: (input: UserUpdateInput) => call<AppUserRow>('users:update', input),
    delete: (id: number) => call<null>('users:delete', { id })
  },
  printQueue: {
    list: (opts?: { page?: number; pageSize?: number }) =>
      call<PrintJobListResult>('printQueue:list', {
        page: opts?.page ?? 1,
        pageSize: opts?.pageSize ?? 25
      }),
    retry: (id: number) => call<{ printStatus: PrintStatus }>('printQueue:retry', { id })
  },
  printer: {
    openDrawer: () => call<null>('printer:openDrawer'),
    colonTest: () => call<null>('printer:colonTest'),
    status: () => call<PrinterStatusInfo>('printer:status'),
    test: () => call<null>('printer:test')
  },
  backup: {
    info: () => call<BackupInfo>('backup:info'),
    runManual: () => call<{ canceled: boolean; path?: string }>('backup:runManual'),
    exportCsv: (range: DateRange) =>
      call<{ canceled: boolean; path?: string }>('backup:exportCsv', { range })
  }
}
