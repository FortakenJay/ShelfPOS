You are auditing **ShelfPOS** (`shelfPos/`) for duplicated logic, near-duplicates, and cleanup opportunities. Your goal is a smaller, clearer codebase. Do not change runtime behavior unless the user explicitly approves a listed refactor.

Work in the ShelfPOS repo root unless a path says otherwise. Dashboard (`ShelfPOS-Dashboard/`) and wiki (`shelfpos-general-Wiki/`) are reference only.

## Step 1 — Orient with graphify (mandatory before Read/Grep/Glob)

Run:

```bash
graphify query "duplicate validation money pricing CSV import IPC handlers"
graphify query "product import preview apply patterns"
graphify explain "sales"
graphify explain "products"
```

Read when useful:

- `shelfpos-general-Wiki/wiki/07-POS-Main-Process.md`
- `shelfpos-general-Wiki/wiki/08-POS-Renderer.md`
- `shelfpos-general-Wiki/wiki/09-IPC-Reference.md`

## Step 2 — Rules you must follow

- Business math belongs in `src/shared/` (`pricing.ts`, `money.ts`). Authoritative enforcement stays in main IPC + SQLite transactions.
- Renderer: features → hooks → api → IPC. No Supabase in components.
- Errors: `AppError('errors.someKey')` only; every key in `es.json` and `zh-CN.json`.
- Extract helpers only when duplication is real (3+ call sites or shared bug risk). No speculative frameworks.
- Surgical diffs only. Do not mix cleanup with new features.
- Out of scope unless asked: `API_Hacienda-4.4/`, `.graphify/` generated output, Dashboard app.

## Step 3 — Search for repetition (priority order)

### P0 — Business logic drift (highest risk)

- Money: `roundColones`, `parseColonesInput`, `formatMoney` — renderer vs `shared/schemas/ipc.ts` vs `productCsvImport.validateProductInput` vs `sales.ts`.
- Pricing: `catalogUnitPrice`, Precio 1/2/3, bulk tier, override detection — `cartLine.ts`, `PriceOverrideModal.tsx` vs `sales.ts`.
- Stock: conditional `UPDATE … WHERE stock >= ?` and `factura_negativo` — sales, returns, adjust stock, CSV import.
- Credit: balance updates, return blocking on unpaid credit, ₡10 rounding.

### P1 — Import/export pipelines

- `productCsvImport.ts`, `productCsvExport.ts`, `productEfacturaImport.ts`, `productSupplierInvoicePdf.ts`
- Shared parsing, column preservation, preview/apply loops, `validateProductInput`
- Repeated `insertProductRow` / `updateProductCatalogFields` / `applyStockDelta`

### P2 — IPC and validation

- Zod in `shared/schemas/ipc.ts` vs handler validation
- Repeated patterns in `ipc/*.ts`: roles, `session.require()`, `mapProductDbError`, preview→confirm pairs

### P3 — Renderer

- Modal state (PIN, payment, discount, price override)
- Duplicated TanStack Query keys / invalidation
- Table + pagination + filters (`ProductsPage`, reports, credit)
- i18n drift (hardcoded strings vs locale keys)

### P4 — Sync and schema

- Column lists: `db/columns.ts`, `sync-service/src/db.ts`, `backfill-mirror.cjs`, `SUPA.sql`
- Sync transient vs permanent errors in `sync-service/src/db.ts`

## Step 4 — Method

1. Inventory each cluster: file paths, line ranges, type (identical / near-duplicate / similar pattern).
2. Score: bug risk, number of call sites, extraction effort (S/M/L).
3. Recommend extractions only when justified:
   - Pure logic → `src/shared/`
   - Node/DB helpers → `src/main/services/`
   - Small named functions, not new layers
4. Flag anti-patterns: divergent validation, magic numbers, `select('*')`, business logic in JSX, copy-pasted 10+ line blocks.

## Step 5 — Write the report

Create **`shelfPos/docs/DRY_AUDIT.md`** with:

### Executive summary

Top 5 duplication risks ranked by likelihood of causing a production bug.

### Findings table

| ID | Severity | Area | Files | Problem | Recommended extraction | Effort | Safe to fix now? |

### Refactor plan

- **Phase A:** safe extractions (helpers, constants, types) — no behavior change
- **Phase B:** behavior-sensitive (pricing, sales, imports) — requires smoke tests
- **Phase C:** optional UI consolidation

### Do-not-merge list

Refactors that change cashier-visible behavior without automated or manual test coverage.

## Step 6 — If the user asks you to fix findings

Per batch:

```bash
cd shelfPos
npm run typecheck
npx eslint <touched-files>
npx react-doctor@latest --verbose --scope changed
graphify update .
```

Manual smoke: cash sale, bulk + Precio 2/3, CSV round-trip, language switch, credit payment.

Do not create git commits unless the user asks. Ask before refactors touching more than 5 files or changing business rules.
