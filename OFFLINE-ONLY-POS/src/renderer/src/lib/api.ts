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
  CierreConfirmInput,
  CierreConfirmResult,
  CierreDiscrepancyAlert,
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
  PrintJobRow,
  PrintStatus,
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
  SaleDetail,
  SessionUser,
  SettingsUpdateInput,
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
      call<null>('settings:changeCajaPin', { currentPin, newPin })
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
      call<ProductImportResult>('products:importEfacturaConfirm', { filePath, stockMode })
  },
  sales: {
    create: (input: CreateSaleInput) => call<CreateSaleResult>('sales:create', input),
    findForReturn: (params: { saleId?: number; date?: string }) =>
      call<SaleDetail[]>('sales:findForReturn', params)
  },
  returns: {
    create: (input: CreateReturnInput) => call<CreateReturnResult>('returns:create', input)
  },
  discount: {
    authorize: (input: DiscountAuthorizeInput) => call<null>('discount:authorize', input)
  },
  priceOverride: {
    authorize: (input: PriceOverrideAuthorizeInput) =>
      call<null>('priceOverride:authorize', input)
  },
  reports: {
    run: (type: ReportType, range: DateRange) => call<ReportData>('reports:run', { type, range }),
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
    history: () => call<CierreRecord[]>('cierre:history'),
    discrepancyAlerts: () => call<CierreDiscrepancyAlert[]>('cierre:discrepancyAlerts'),
    exportPdf: (cierreId: number) =>
      call<{ canceled: boolean; path?: string }>('cierre:exportPdf', { cierreId })
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
    list: () => call<PrintJobRow[]>('printQueue:list'),
    retry: (id: number) => call<{ printStatus: PrintStatus }>('printQueue:retry', { id })
  },
  backup: {
    info: () => call<BackupInfo>('backup:info'),
    runManual: () => call<{ canceled: boolean; path?: string }>('backup:runManual'),
    exportCsv: (range: DateRange) =>
      call<{ canceled: boolean; path?: string }>('backup:exportCsv', { range })
  }
}
