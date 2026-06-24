# ShelfPOS — UML Diagrams

Parent: [LLM Index](README.md) · Related: [Codebase graph](08-codebase-graph.md)

Standard **UML views** of ShelfPOS using [Mermaid](https://mermaid.js.org/) (renders in GitHub, Obsidian, and many IDEs).

| Diagram type | UML intent | Section |
|--------------|------------|---------|
| Deployment | Nodes & artifacts | [§1](#1-deployment-diagram) |
| Component | Packages & interfaces | [§2](#2-component-diagram) |
| Class | Domain model | [§3](#3-domain-class-diagram) |
| Class | Application layers | [§4](#4-application-layer-class-diagram) |
| Sequence | Checkout | [§5](#5-sequence-checkout) |
| Sequence | Barcode scan | [§6](#6-sequence-barcode-scan) |
| Sequence | Sync queue | [§7](#7-sequence-sync-queue) |
| State | `sync_queue` row | [§8](#8-state-machine-sync_queue) |
| State | Cart tab lifecycle | [§9](#9-state-machine-cart-tab) |
| Activity | `onEnter` decision | [§10](#10-activity-onenter) |
| ER | Persistent entities | [§11](#11-entity-relationship-diagram) |

---

## 1. Deployment diagram

Physical/runtime nodes and what runs where.

```mermaid
flowchart TB
  subgraph RegisterPC["«device» Register PC (Windows)"]
    subgraph ElectronNode["«executionEnvironment» Electron"]
      RendererArt["«artifact» renderer.bundle"]
      MainArt["«artifact» main.bundle"]
      PreloadArt["«artifact» preload.js"]
    end
    ServiceNode["«executionEnvironment» ShelfPOSSync Service"]
    SyncArt["«artifact» sync-service.js"]
    DbArt["«artifact» shelf.db"]
    EnvArt["«artifact» sync.env"]
    PrinterDev["«device» Thermal printer"]
  end

  subgraph Cloud["«node» Cloud"]
    Vercel["«executionEnvironment» Vercel"]
    DashArt["«artifact» dashboard bundle"]
    SupaNode["«node» Supabase"]
    PgArt["«artifact» PostgreSQL mirror"]
    AuthArt["«artifact» Supabase Auth"]
  end

  RendererArt --> PreloadArt
  PreloadArt --> MainArt
  MainArt --> DbArt
  ServiceNode --> SyncArt
  SyncArt --> DbArt
  SyncArt --> EnvArt
  SyncArt -->|HTTPS REST| PgArt
  MainArt --> PrinterDev

  Vercel --> DashArt
  DashArt -->|HTTPS JWT| PgArt
  DashArt --> AuthArt
```

---

## 2. Component diagram

Logical components and provided/required interfaces.

```mermaid
flowchart LR
  subgraph POS["«subsystem» OFFLINE-ONLY-POS"]
    direction TB
    UI["«component»<br/>features/*"]
    API["«component»<br/>lib/api.ts"]
    PRE["«interface»<br/>preload IPC whitelist"]
    IPC["«component»<br/>main/ipc/*"]
    REPO["«component»<br/>db/repos/*"]
    SVC["«component»<br/>services/*"]
    SQLITE[("«database»<br/>SQLite")]

    UI --> API
    API --> PRE
    PRE --> IPC
    IPC --> REPO
    IPC --> SVC
    REPO --> SQLITE
    SVC --> SQLITE
  end

  subgraph SYNC["«subsystem» sync-service"]
    POLL["«component»<br/>poll loop"]
    SYNCER["«component»<br/>sync.ts"]
    POLL --> SYNCER
    SYNCER --> SQLITE
  end

  subgraph DASH["«subsystem» DASHBOARD"]
    ROUTES["«component»<br/>routes/*"]
    QUERIES["«component»<br/>lib/queries/*"]
    SBCLIENT["«component»<br/>supabase.ts"]
    ROUTES --> QUERIES
    QUERIES --> SBCLIENT
  end

  SB[("«database»<br/>Supabase PG")]
  SYNCER -->|«REST»| SB
  SBCLIENT -->|«read»| SB
```

---

## 3. Domain class diagram

Core business types (`src/shared/types.ts`) and relationships.

```mermaid
classDiagram
  direction TB

  class Product {
    +int id
    +string barcode
    +string name
    +float price
    +int stock
    +string? stock_provider
    +TaxCategory tax_category
  }

  class CartLine {
    <<union>>
    +kind product | misc
    +int quantity
    +float discount
  }

  class CartProductLine {
    +Product product
    +float? priceOverride
  }

  class CartMiscLine {
    +string lineId
    +float unitPrice
    +string? customName
  }

  class CreateSaleInput {
    +CartLine[] items
    +SalePaymentInput[] payments
    +CustomerInput? customer
    +float cartDiscount
  }

  class SalePaymentInput {
    +PaymentMethod method
    +float amount
    +string? ref
  }

  class Sale {
    +int id
    +int user_id
    +float total
    +int? cierre_id
    +datetime created_at
  }

  class SaleItem {
    +int id
    +int sale_id
    +int? product_id
    +string product_name_snapshot
    +string? barcode_snapshot
    +int quantity
    +float unit_price
  }

  class SalePayment {
    +int sale_id
    +PaymentMethod method
    +float amount
  }

  class Cierre {
    +int id
    +float total_cash
    +float total_card
    +float total_sinpe
    +datetime closed_at
  }

  class CartTab {
    +int id
    +string cart_json
    +string label
    +int sort_order
  }

  class SyncQueueEntry {
    +int id
    +string table_name
    +int row_id
    +SyncOperation operation
    +SyncStatus status
    +int retry_count
  }

  class SessionUser {
    +int id
    +string username
    +Role role
  }

  CartLine <|-- CartProductLine
  CartLine <|-- CartMiscLine
  CartProductLine --> Product : references
  CreateSaleInput --> CartLine : contains
  CreateSaleInput --> SalePaymentInput : contains
  Sale "1" --> "*" SaleItem : lines
  Sale "1" --> "*" SalePayment : tenders
  Sale --> SessionUser : cashier
  Sale --> Cierre : shift
  SaleItem --> Product : product_id optional
  CartTab --> CreateSaleInput : snapshot JSON
  SyncQueueEntry ..> Sale : mirrors
  SyncQueueEntry ..> Product : mirrors
```

---

## 4. Application layer class diagram

POS internal layers (simplified).

```mermaid
classDiagram
  direction LR

  class POSTerminalView {
    +render()
  }

  class usePOSTerminal {
    +cart CartLine[]
    +onEnter() bool
    +addToCart(Product) bool
  }

  class ApiClient {
    <<lib/api.ts>>
    +products.byBarcode()
    +sales.create()
    +cartTabs.save()
  }

  class PreloadBridge {
    <<interface>>
    +invoke(channel, payload)
  }

  class IpcHandler {
    <<abstract>>
    +handle(input) Result
  }

  class SalesHandler {
    +sales:create()
  }

  class ProductsHandler {
    +products:byBarcode()
  }

  class ProductRepository {
    +getByBarcode()
    +decrementStock()
  }

  class SalesRepository {
    +insertSale()
    +insertItems()
  }

  class SyncQueueRepository {
    +enqueueSync()
  }

  class AppError {
    +string key
    +object? vars
  }

  POSTerminalView --> usePOSTerminal
  usePOSTerminal --> ApiClient
  ApiClient --> PreloadBridge
  PreloadBridge --> IpcHandler
  IpcHandler <|-- SalesHandler
  IpcHandler <|-- ProductsHandler
  SalesHandler --> ProductRepository
  SalesHandler --> SalesRepository
  SalesHandler --> SyncQueueRepository
  IpcHandler ..> AppError : throws
```

---

## 5. Sequence — checkout

```mermaid
sequenceDiagram
  autonumber
  actor Cashier
  participant UI as PaymentModal
  participant Hook as usePOSTerminal
  participant API as lib/api.ts
  participant IPC as ipc/sales.ts
  participant Stock as repos/stock
  participant Sales as repos/salesReceipt
  participant Queue as repos/syncQueue
  participant Print as services/printer
  participant DB as SQLite

  Cashier->>UI: Confirm payment
  UI->>API: sales.create(input)
  API->>IPC: invoke sales:create

  IPC->>DB: BEGIN TRANSACTION
  IPC->>Stock: assertSaleStock(items)
  alt insufficient stock
    Stock-->>IPC: AppError outOfStock
    IPC-->>UI: error toast
  end

  IPC->>Sales: insert sale + items + payments
  IPC->>Stock: UPDATE stock WHERE stock >= qty
  IPC->>Queue: enqueueSync(products, sales, ...)
  IPC->>Print: schedulePrintJob(receipt)
  IPC->>DB: COMMIT

  IPC-->>API: CreateSaleResult
  API-->>UI: success
  UI-->>Cashier: receipt prints
```

---

## 6. Sequence — barcode scan

```mermaid
sequenceDiagram
  autonumber
  actor Scanner as USB scanner
  participant Input as POSSearchPanel
  participant Scan as useScannerDetector
  participant Hook as usePOSTerminal
  participant API as lib/api.ts
  participant IPC as ipc/products.ts
  participant Repo as repos/products.ts
  participant DB as SQLite

  Scanner->>Input: rapid digits + Enter
  Input->>Scan: onKeyDown (burst count)
  Input->>Hook: onEnter via usePosEnterShortcut
  Hook->>Hook: read inputRef.value
  Hook->>Scan: consumeIsScan(length)

  alt classified scan OR numeric fallback
    Hook->>API: products.byBarcode(value)
    API->>IPC: invoke
    IPC->>Repo: getByBarcode
    Repo->>DB: SELECT products
    DB-->>Repo: Product | null
    Repo-->>IPC: Product
    IPC-->>API: Product
    alt found
      Hook->>Hook: addToCart(product)
      Hook-->>Input: clear search
    else not found
      Hook-->>Cashier: toast productNotFound
    end
  else manual search
    Hook->>Hook: single search result?
  end
```

---

## 7. Sequence — sync queue

```mermaid
sequenceDiagram
  autonumber
  participant POS as Electron main
  participant DB as SQLite
  participant SVC as ShelfPOSSync
  participant Live as db.getLiveRow
  participant SB as Supabase REST

  POS->>DB: business write + enqueueSync
  Note over DB: status = pending

  loop every 5s when online
    SVC->>DB: listPendingQueue()
    SVC->>Live: read current row
    Live->>DB: SELECT by id
    SVC->>SB: POST upsert + store_id
    alt success
      SVC->>DB: markSynced
    else failure
      SVC->>DB: retry_count++
      Note over DB: error after 10 retries
    end
  end
```

---

## 8. State machine — `sync_queue`

```mermaid
stateDiagram-v2
  [*] --> pending : enqueueSync in txn

  pending --> synced : upsert OK
  pending --> pending : retry (count < 10)
  pending --> error : retry_count >= 10

  error --> pending : manual reset / diagnose
  synced --> pending : row updated again

  note right of pending
    Sync service polls
    getLiveRow before push
  end note

  note right of error
    Logged to sync.txt [GAVE_UP]
  end note
```

---

## 9. State machine — cart tab

```mermaid
stateDiagram-v2
  [*] --> active : create tab

  active --> active : add items / save snapshot
  active --> suspended : switch to another tab
  suspended --> active : switch back

  active --> completed : sale checkout OK
  completed --> [*] : cartTabs.complete

  active --> discarded : close + PIN (non-empty)
  suspended --> discarded : close + PIN
  discarded --> [*] : audit_log + remove row

  active --> removed : close empty tab
  removed --> [*]
```

---

## 10. Activity — `onEnter`

```mermaid
flowchart TD
  Start([Enter key]) --> Blocked{cashBlocked or modal?}
  Blocked -->|yes| Stop([no op])
  Blocked -->|no| Read[Read inputRef.value]
  Read --> Empty{value empty?}
  Empty -->|yes| Charge[onCharge open payment]
  Empty -->|no| Misc{PRECIO* misc?}
  Misc -->|yes| AddMisc[addMiscLine]
  Misc -->|no| Scan{isScan burst?}
  Scan -->|yes| ByBarcode1[products.byBarcode]
  Scan -->|no| Numeric{4+ digits?}
  Numeric -->|yes| ByBarcode2[products.byBarcode silent miss]
  Numeric -->|no| Search{searchResults length = 1?}
  ByBarcode1 --> Found{product?}
  ByBarcode2 --> Found
  Found -->|yes| Add[addToCart]
  Found -->|no| Toast[toast productNotFound]
  Search -->|yes| Add
  Search -->|no| Stop2([no op])
  Add --> Clear[clear search]
  AddMisc --> Clear
  Clear --> Done([done])
  Toast --> Stop2
```

---

## 11. Entity-relationship diagram

Persistent schema (SQLite source of truth). Supabase mirror uses same entities + `store_id`.

```mermaid
erDiagram
  users ||--o{ sales : "user_id"
  users ||--o{ cierres : "closed_by_user_id"
  users ||--o{ stock_adjustments : "user_id"
  users ||--o{ cash_movements : "user_id"

  cierres ||--o{ sales : "cierre_id"
  cierres ||--o{ cash_movements : "cierre_id"

  sales ||--|{ sale_items : "sale_id"
  sales ||--|{ sale_payments : "sale_id"
  sales ||--o{ return_items : "sale_id"

  products ||--o{ sale_items : "product_id nullable"
  products ||--o{ stock_adjustments : "product_id"
  products ||--o{ return_items : "product_id"

  users {
    int id PK
    string username UK
    string password_hash
    string role
  }

  products {
    int id PK
    string barcode UK
    string name
    float price
    int stock
    string stock_provider
    datetime deleted_at
  }

  sales {
    int id PK
    int user_id FK
    float total
    int cierre_id FK
    datetime created_at
  }

  sale_items {
    int id PK
    int sale_id FK
    int product_id FK "nullable"
    string barcode_snapshot
    int quantity
    float unit_price
  }

  sale_payments {
    int id PK
    int sale_id FK
    string method
    float amount
  }

  cierres {
    int id PK
    datetime closed_at
    float total_cash
    float total_card
  }

  cart_tabs {
    int id PK
    string cart_json "local only"
  }

  sync_queue {
    int id PK
    string table_name
    int row_id
    string status
  }

  settings {
    string key PK
    string value
  }
```

---

## 12. Dashboard component diagram (UML)

```mermaid
flowchart TB
  subgraph Browser["«node» Browser"]
    subgraph DashApp["«component» Dashboard App"]
      AuthP["«component» AuthProvider"]
      StoreP["«component» StoreProvider"]
      Pages["«component» routes/_app/*"]
      Queries["«component» lib/queries/*"]
      Reports["«component» lib/reports/*"]
    end
  end

  subgraph Supabase["«node» Supabase"]
    RLS["«interface» RLS policies"]
    Mirror[("mirror tables")]
    RPC["«interface» pairing RPCs"]
  end

  Pages --> AuthP
  Pages --> StoreP
  Pages --> Queries
  Pages --> Reports
  Queries --> RLS
  RLS --> Mirror
  Pages --> RPC
```

---

## PlantUML export (optional)

If your tool prefers PlantUML, equivalent checkout sequence:

```plantuml
@startuml checkout
actor Cashier
participant "PaymentModal" as UI
participant "lib/api.ts" as API
participant "ipc/sales.ts" as IPC
database SQLite as DB

Cashier -> UI : confirm
UI -> API : sales.create
API -> IPC : invoke
IPC -> DB : BEGIN
IPC -> DB : stock check + insert
IPC -> DB : enqueueSync
IPC -> DB : COMMIT
IPC --> UI : success
@enduml
```

Paste into [plantuml.com](https://www.plantuml.com/plantuml) or a PlantUML Obsidian plugin.

---

## Related

- [Codebase dependency graph](08-codebase-graph.md) — flowcharts by zoom level
- [Architecture](03-architecture.md)
- [Database reference](04-database.md)
- [Master LLM context](../shelfpos_context.md)
