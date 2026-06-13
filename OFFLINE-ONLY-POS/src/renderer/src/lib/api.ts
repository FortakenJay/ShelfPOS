import type {
  AdjustStockInput,
  ApiResult,
  AppSettings,
  AuditLogFilter,
  AuditLogRow,
  AuditUser,
  BackupInfo,
  CashDrawerStatus,
  CashMovementInput,
  CierreConfirmInput,
  CierreConfirmResult,
  CierrePreview,
  CierreRecord,
  CreateReturnInput,
  CreateReturnResult,
  CreateSaleInput,
  CreateSaleResult,
  DateRange,
  FirstRunSetupInput,
  FirstRunStatus,
  IpcChannel,
  Language,
  OpenFloatInput,
  PrintJobRow,
  PrintStatus,
  Product,
  ProductFilters,
  ProductImportPreview,
  ProductImportResult,
  ProductInput,
  ReportData,
  ReportType,
  SaleDetail,
  SessionUser,
  SettingsUpdateInput,
  StockAlert
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
  const result = (await window.api.invoke(channel, payload)) as ApiResult<T>
  if (!result.ok) throw new ApiError(result.error, result.vars, result.message)
  return result.data
}

export const api = {
  firstRun: {
    status: () => call<FirstRunStatus>('firstRun:status'),
    setLanguage: (language: Language) => call<null>('firstRun:setLanguage', { language }),
    testCjk: () => call<null>('firstRun:testCjk'),
    setCjkCapable: (capable: boolean) => call<null>('firstRun:setCjkCapable', { capable }),
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
    testCjk: () => call<null>('settings:testCjk'),
    setCjkCapable: (capable: boolean) => call<null>('settings:setCjkCapable', { capable })
  },
  products: {
    list: (filters: ProductFilters) => call<Product[]>('products:list', filters),
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
    importConfirm: (filePath: string) =>
      call<ProductImportResult>('products:importCsvConfirm', { filePath })
  },
  sales: {
    create: (input: CreateSaleInput) => call<CreateSaleResult>('sales:create', input),
    findForReturn: (params: { saleId?: number; date?: string }) =>
      call<SaleDetail[]>('sales:findForReturn', params)
  },
  returns: {
    create: (input: CreateReturnInput) => call<CreateReturnResult>('returns:create', input)
  },
  reports: {
    run: (type: ReportType, range: DateRange) => call<ReportData>('reports:run', { type, range }),
    print: (type: ReportType, range: DateRange) =>
      call<{ printStatus: PrintStatus }>('reports:print', { type, range })
  },
  cierre: {
    preview: () => call<CierrePreview>('cierre:preview'),
    confirm: (input: CierreConfirmInput) => call<CierreConfirmResult>('cierre:confirm', input),
    history: () => call<CierreRecord[]>('cierre:history')
  },
  cash: {
    status: () => call<CashDrawerStatus>('cash:status'),
    openFloat: (input: OpenFloatInput) => call<CashDrawerStatus>('cash:openFloat', input),
    movement: (input: CashMovementInput) => call<CashDrawerStatus>('cash:movement', input)
  },
  audit: {
    list: (filter: AuditLogFilter) => call<AuditLogRow[]>('audit:list', filter),
    users: () => call<AuditUser[]>('audit:users')
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
