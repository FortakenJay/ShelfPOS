# ShelfPOS DRY / Repetition Audit

Audit date: 2026-07-11

Scope: `shelfPos/` application and sync service. The wiki and Dashboard `SUPA.sql` were used as read-only references. `API_Hacienda-4.4/`, generated `.graphify/` output, and Dashboard application code were excluded.

## Remediation status

Updated 2026-07-11 after implementation:

- **Fixed:** DRY-01 through DRY-08 and DRY-10 through DRY-14.
- **Resolved with tests, no extraction:** DRY-09. Sale decrement, manual adjustment, and return restock remain separate because their transaction, audit, and ledger contracts differ.
- **Deferred by design:** DRY-15. Only two PIN-gated modals use the pattern; extraction remains unjustified until a third consumer exists.

### Outcome by finding

| ID | Status | Where it landed |
|---|---|---|
| DRY-01 | Fixed | Shared `sync-service/mirror-manifest.json` (+ `.cjs` loader). Live sync and backfill consume one projection list; failed pushes leave queue pending. |
| DRY-02 | Fixed | One analyzed import model in `productCsvImport.ts`; preview/apply share decisions; SHA-256 source version rejects confirm when file changed (`errors.productImportSourceChanged`). |
| DRY-03 | Fixed | `src/shared/productValidation.ts` — normalize then validate; CRUD + CSV/eFactura/supplier share limits. |
| DRY-04 | Fixed | `src/shared/pricing.ts` — `moneyEquals` (0.01), sanctioned Precio 1/2/3, custom override predicates used by caja, sales IPC, cart, receipts. |
| DRY-05 | Fixed | Named parsers in `src/shared/money.ts`: localized UI, machine/CSV, supplier PDF. Dialects preserved, not merged. |
| DRY-06 | Fixed | `src/shared/cartTotals.ts` + main `cartDiscountDistribution.ts`. |
| DRY-07 | Fixed | `src/main/services/productImportErrors.ts`. |
| DRY-08 | Fixed | `customerCredit` helpers — atomic balance delta + per-sale outstanding; returns no longer load full history. |
| DRY-09 | Tests only | Separate sale / adjust / return stock paths kept; `stockMutations.test.ts` locks contracts. |
| DRY-10 | Fixed | `src/renderer/src/lib/queryKeys.ts` + `invalidateAfterSale` / `invalidateProducts` / `invalidatePrintQueue`. |
| DRY-11 | Fixed | `PAYMENT_METHODS` / `CREDIT_PAYMENT_METHODS` in `src/shared/types.ts`. |
| DRY-12 | Fixed | Named product column constants in `db/columns.ts` + parity tests. |
| DRY-13 | Fixed | Shared preview/finalize callbacks in `useProductManager`; supplier invalid price uses translated toast. |
| DRY-14 | Fixed | `SALES_ACCESS` / `ADMIN_ACCESS` / `SALES_OR_ADMIN_ACCESS` / `PRODUCT_MANAGER_OR_ADMIN_ACCESS` in IPC helpers. |
| DRY-15 | Deferred | Wait for third PIN-gated modal before `usePendingPinGate`. |

The findings table below preserves the original audit evidence and pre-remediation line references.

## Executive summary

**Historical (pre-fix).** The risks below described the codebase before remediation. See **Remediation status** for current state.

ShelfPOS already has useful canonical seams: CRC rounding lives in `src/shared/money.ts`, catalog/bulk line pricing in `src/shared/pricing.ts`, product writes in `src/main/db/repos/products.ts`, CSV headers in `src/main/services/csvColumns.ts`, and PIN mutation invalidation in `usePinAuthorize.ts`. These should be extended rather than replaced.

The five duplication risks most likely to cause production bugs are:

1. **Sync mirror projection drift.** The live sync service knows about `customers`, `credit_payments`, `sales.customer_account_id`, and `cierres.total_credit`; the one-shot backfill does not. It can mark sales/cierre queue rows synced after pushing incomplete projections.
2. **CSV/eFactura preview and apply drift.** `productCsvImport.ts` parses, validates, deduplicates, looks up, and classifies rows in the preview pass, rebuilds that preview during apply, then repeats the same row decisions in a second apply loop. Confirm also re-reads the path selected during preview.
3. **Product validation has four authorities and a real import-only gap.** Zod IPC schemas, `validateProductInput`, CSV row parsing, and `ProductForm` independently encode price, stock, bulk-pair, and rounding rules. CSV/eFactura apply calls the service validator directly, but that validator does not enforce IPC limits for `costPrice`, `stockThreshold`, text length, or maximum `bulkQty`; it also validates alternate prices before mutating them through ₡10 rounding.
4. **Sanctioned-price and override classification is repeated.** Precio 1/2/3, bulk price, custom override detection, and the `0.01` equality rule are reimplemented in renderer, main IPC, receipt rendering, and cart display helpers. A future pricing change can alter PIN/audit behavior in only one layer.
5. **Money parsing and total construction use multiple dialects.** UI input, CSV, eFactura, and supplier PDF parsers interpret separators differently, while live cart, persisted cart, sale, credit, and return totals repeat rounding/clamping decisions.

Risk is amplified by limited automated coverage. Four Vitest files were found: money, pricing, CSV import, and eFactura import. No automated suites were found for checkout transactions, returns, customer credit, sync projections/backfill, renderer query invalidation, or supplier invoice apply.

## Findings

| ID | Severity | Area | Files | Problem | Recommended extraction | Effort | Safe to fix now? |
|---|---|---|---|---|---|---|---|
| DRY-01 | Critical | Sync/schema | `sync-service/src/db.ts:105-173`; `sync-service/scripts/backfill-mirror.cjs:86-135,213-255`; Dashboard `SUPA.sql:63-186` | **Near-duplicate projections, already divergent.** Live sync has 12 tables and current credit columns; backfill omits `customers` and `credit_payments`, plus `sales.customer_account_id` and `cierres.total_credit`. Backfill then marks included tables' pending rows synced. Bug risk: very high; 3 schema authorities. | Define one checked mirror manifest (table order + local table + columns), generate/consume projections where practical, and add a parity test against Supabase schema. At minimum, make backfill parity testable against `LIVE_ROW_SQL`. | L | No—Phase B with a disposable mirror/backfill test. |
| DRY-02 | High | Product import | `src/main/services/productCsvImport.ts:196-247,264-362`; `src/main/ipc/products.ts:233-245,382-409` | **Copy-pasted decision pipeline.** Preview classifies rows once; apply rebuilds preview and repeats parse/validate/dedupe/lookup/classification. Confirmation re-reads a mutable file path, so applied content need not match the displayed preview. Bug risk: high; 2 full loops plus preview rebuilt during apply. | Introduce a small `analyzeProductImport(parsed)` result containing normalized rows and decisions. Apply that result, or verify a file hash/version before re-analysis. Keep each row transaction isolated. | M | No—requires import behavior tests and a preview/confirm contract decision. |
| DRY-03 | High | Product validation | `src/shared/schemas/ipc.ts:38-53`; `src/main/services/productCsvImport.ts:25-57,70-125`; `src/renderer/src/features/products/ProductForm.tsx:77-115`; `src/main/services/productSupplierInvoicePdf.ts:288-320` | **Divergent validation with an import-only gap.** Bulk qty/price pairing is enforced by form/service but not by the base Zod object. Conversely, Zod caps text, money, threshold, and `bulkQty`, while `validateProductInput` omits `costPrice`, `stockThreshold`, text-length, and maximum-`bulkQty` checks. CSV/eFactura bypass `productInputSchema`, so values rejected by product CRUD can be imported. The service also validates alternate prices before mutating them through ₡10 rounding (for example, a tiny positive alternate price can become zero). Bug risk: high; 4 authorities. | Create pure `normalizeProductInput` and `validateProductBusinessRules` in `src/shared/`, or use a shared refined schema for normalized inputs. Keep source-specific parsing separate. Return a normalized copy, validate after normalization, and use it from CRUD plus every importer. | M | No—add characterization and import-boundary tests first. |
| DRY-04 | High | Pricing/override | `src/shared/pricing.ts:9-42`; `src/renderer/src/lib/cartLine.ts:32-57`; `src/renderer/src/features/pos/PriceOverrideModal.tsx:66-123,149-187`; `src/main/ipc/sales.ts:171-192`; `src/main/ipc/priceOverride.ts:14-17`; `src/main/services/printTemplates.ts:248` | **Near-duplicate pricing classification.** Bulk selection is canonical, but sanctioned Precio 1/2/3 detection, custom override detection, display badges, PIN bypass, and the `0.01` tolerance are separate. Bug risk: high; 5+ call sites. | Add small shared predicates such as `moneyEquals`, `sanctionedUnitPriceKind`, and `isCustomPriceOverride`. Do not move authorization or DB enforcement out of main IPC. | M | No—Phase B with checkout/PIN/receipt tests. |
| DRY-05 | High | Money parsing | `src/shared/money.ts:1-65`; `src/renderer/src/lib/format.ts:27-38`; `src/main/services/productCsvImport.ts:59-68`; `src/main/services/productEfacturaImport.ts:60-76`; `src/main/services/productSupplierInvoicePdf.ts:41-43` | **Similar parsers with different separator semantics.** For example, comma is treated as a decimal separator by UI parsing but stripped as a thousands separator by import parsing. Names hide the different contracts. Bug risk: high; 4 parser implementations and 10+ UI callers. | Move pure UI parsing to `src/shared/money.ts`; add explicitly named import parsers (`parseLocalizedMoneyInput`, `parseMachineNumber`, `parseSupplierAmount`) with fixtures for comma/dot/space cases. Do not force one ambiguous parser on every source. | M | No—separator behavior is cashier/import visible. |
| DRY-06 | High | Cart/sale totals | `src/shared/cartTabSnapshot.ts:30-62`; `src/renderer/src/lib/cartTabSnapshot.ts:43-47`; `src/renderer/src/features/pos/usePOSTerminal.ts:643-647`; `src/main/ipc/sales.ts:148-225`; `src/main/services/printTemplates.ts:130-170` | **Repeated total construction.** Product line math is shared, but misc lines, line discount clamping, cart discount clamping, subtotal/discount totals, and diagnostic receipt totals are recomputed in multiple shapes. Main additionally distributes cart discount. Bug risk: high; 4 production call sites plus print diagnostics. | Add pure shared total helpers over a minimal priced-line type. Keep cart-discount distribution as a separately tested main-side function because persisted per-line totals are authoritative. | L | No—Phase B; cash sale, split payment, discount, misc, and cart-tab tests required. |
| DRY-07 | High | DB/import errors | `src/main/ipc/products.ts:79-89`; `src/main/services/productSupplierInvoicePdf.ts:249-251,282-335`; `src/main/services/productCsvImport.ts:232-235,289-325` | **Identical error sniffing and repeated row catch blocks.** Product IPC maps UNIQUE/FK errors, supplier import duplicates UNIQUE detection, and CSV apply converts unexpected DB conflicts to `errors.unknown`. Bug risk: high; at least 6 catch/mapping sites. | Extract `mapProductDbErrorKey` and `toProductImportError(row, err, detail?)` in a main-only service. Preserve public `AppError` keys and never expose raw DB text to renderer. | S | Yes, with focused UNIQUE/FK/import tests. |
| DRY-08 | High | Customer credit | `src/main/ipc/sales.ts:123-131,339-349`; `src/main/db/repos/customers.ts:46-75,147-205,340-388`; `src/main/ipc/returns.ts:46-58` | **Balance and outstanding rules span three paths.** Sale charge and abono mutate balance with separate SQL; outstanding allocation is reconstructed in memory; returns call the full customer-detail history to decide whether a credit sale is returnable. `round2` means ₡10 rounding while SQL still says `ROUND(..., 2)`. Bug risk: high; 3 business operations. | Add main DB helpers for atomic customer balance delta and a targeted `outstandingCreditForSale` query/helper. Keep the unpaid-credit return rule authoritative inside the return transaction. | M/L | No—Phase B with split-credit, targeted/general abono, and return tests. |
| DRY-09 | Medium | Stock mutations | `src/main/db/repos/products.ts:167-190`; `src/main/ipc/sales.ts:299-333`; `src/main/ipc/returns.ts:86-120`; import services' `applyStockDelta` callers | **Similar SQL, intentionally different semantics.** Sale decrement is race-safe and emits sale-specific stock errors; generic adjustment records `stock_adjustments`; return restock directly increments. A naive DRY refactor could change audit history or `factura_negativo`. Bug risk: medium/high; 3 mutation families. | Keep separate domain operations, but extract a narrow conditional stock writer only if tests prove preserved error, sync, adjustment, and return behavior. Document why returns do or do not create `stock_adjustments`. | M | No—do not merge without transaction/race coverage. |
| DRY-10 | Medium | Query cache | `src/renderer/src/features/pos/PaymentModal.tsx:104-119`; `usePOSTerminal.ts:260-342,689-705`; `useProductManager.ts:75-90,93-279`; `CierrePage.tsx:74-93`; settings/print/cash screens | **String keys and invalidation bundles are copied widely.** `products`, `settings`, `cashStatus`, `cartTabs`, `printQueue`, and `salesForReprint` appear across many components/hooks. Bug risk: medium; 30+ invalidation calls. | Add a small `queryKeys` object and domain invalidation helpers (`invalidateAfterSale`, `invalidateProducts`, `invalidatePrintQueue`). Avoid a new data layer. | S/M | Yes—Phase A, then smoke affected screens. |
| DRY-11 | Medium | Payment methods | `src/shared/schemas/primitives.ts:60`; `src/main/ipc/sales.ts:43,119-122`; `src/main/services/csvColumns.ts:96-105`; `paymentModalState.ts:20`; `PaymentSplitSection.tsx:8`; `PaymentMethodButtons.tsx:4`; `AbonoModal.tsx:13` | **Identical enum lists with inconsistent order.** A new method can validate but disappear from one UI/parser, or vice versa. Bug risk: medium; 7 definitions. | Export `PAYMENT_METHODS` and `CREDIT_PAYMENT_METHODS` tuples from shared types/constants; derive Zod enum and UI iteration from them. Keep presentation order explicit only where UX intentionally differs. | S | Yes—Phase A with typecheck and payment smoke. |
| DRY-12 | Medium | Product repository | `src/main/db/repos/products.ts:243-324`; `src/main/services/productCsvExport.ts:16-51`; `src/main/db/columns.ts:3-12` | **Long near-duplicate field lists.** Product insert, two update branches, list projections, and CSV export repeat catalog fields. `includeStockProvider` causes two almost-identical UPDATE blocks. Bug risk: medium; 5 projections/statements. | Use named catalog field/parameter builders or two reviewed SQL constants; add a field-parity test. Do not reuse the full product projection for CSV because CSV intentionally excludes provider/internal fields. | M | Yes for constants/tests; defer dynamic SQL changes. |
| DRY-13 | Medium | Import UI/hook | `src/renderer/src/features/products/hooks/useProductManager.ts:134-229`; `ProductImportPreviewModal.tsx:15-23,84-194`; `SupplierInvoicePreviewModal.tsx:24-77` | **Parallel preview/confirm flows.** CSV and eFactura preview mutations are almost identical; result counting/toasts and modal draft submission repeat import orchestration. The supplier modal throws raw `Error('invalid price')` in an event path. Bug risk: medium; 3 flows. | Extract small hook callbacks for catalog invalidation/result summaries and a translated validation return for supplier drafts. Keep distinct modals because their decisions differ materially. | S/M | Yes for callbacks/error handling; no generic import framework. |
| DRY-14 | Low | IPC roles/session | Role arrays across `src/main/ipc/{sales,products,cierre,customers,cash,printer,cart,discount,priceOverride,users}.ts`; `session.require()` inside authenticated handlers | **Repeated policy literals.** Arrays such as `['sales','admin']` recur, while some handlers call `session.require()` after `handle` already authenticated them to obtain the user. Bug risk: low; 10+ modules. | Export a few readonly access constants from IPC helpers. Do not remove `session.require()` where the user record is needed unless `handle` deliberately passes a typed auth context. | S | Yes—Phase A, but benefit is modest. |
| DRY-15 | Low | PIN modal state | `src/renderer/src/features/pos/DiscountModal.tsx:21-50,83-120`; `PriceOverrideModal.tsx:11-40,78-135`; `usePinAuthorize.ts:3-17` | **Near-identical reducer state for PIN open/error/pending value.** The mutation lifecycle is already shared, but each modal repeats open/close/error transitions. Bug risk: low; 2 current call sites. | Keep as-is until a third modal needs the same pending-value flow, or extract a small `usePendingPinGate` hook then. | M | Optional Phase C only. |

### Audit boundaries and ruled-out duplication

- No `select('*')` or raw `throw new Error(...)` was found in main-process IPC handlers. The renderer's `SupplierInvoicePreviewModal.tsx:54-57` does throw a raw `"invalid price"` error during confirm construction; DRY-13 covers replacing that event-path exception with translated validation.
- Zod transport validation and authoritative main/transaction checks are intentionally two layers. The goal is shared constraints and normalized inputs, not removal of server-side enforcement.
- Sale decrement, generic stock adjustment, and return restock look similar but have different error, audit, and ledger semantics. DRY-09 explicitly rejects a generic stock helper unless tests preserve those differences.
- `session.require()` after `handle(..., access, ...)` is not redundant when the handler needs the authenticated user id/name. Removing it requires a typed auth context, not a search-and-replace.
- Misc lines remaining non-returnable is an intentional product rule, not a DRY defect.
- `round2` in `src/main/db/helpers.ts:43-45` is only an alias for `roundColones` (₡10 steps), despite its decimal-sounding name. Treat renaming as a safe clarity change; changing its behavior belongs in Phase B.

## Refactor plan

### Phase A — safe extractions, no behavior change

1. Add shared readonly payment-method tuples and derive validation/parser/UI lists.
2. Add renderer `queryKeys` plus two or three domain invalidation helpers; replace literals mechanically.
3. Extract product DB/import error classification and repeated `ProductImportError` construction.
4. Consolidate product SQL constants and add parity tests without changing selected/written fields.
5. Deduplicate CSV/eFactura preview mutation callbacks and import result summaries in `useProductManager`.
6. Add characterization tests before Phase B: product bulk-pair validation, DB conflicts, query key bundles, and current import separator behavior.

Verification: `npm run test`, `npm run typecheck`, focused ESLint, and smoke product CRUD/import/printing.

### Phase B — behavior-sensitive business logic

1. Build a canonical normalized product-input validator shared by IPC and imports; keep source parsers separate.
2. Replace preview/apply repetition with one analyzed import model and define file-change protection between preview and confirm.
3. Centralize money equality, sanctioned price classification, cart total construction, and cart-discount distribution as small pure functions.
4. Introduce targeted credit balance/outstanding helpers and tests; preserve transaction boundaries and unpaid-credit return blocking.
5. Review stock domain operations together, preserving race-safe sale decrement, `factura_negativo`, adjustment audit, return behavior, and sync enqueue.
6. Align one-shot backfill with the live sync manifest and Supabase schema; test against a disposable SQLite/Supabase-compatible fixture before marking queue rows synced.

Required smoke coverage: cash sale; split payment; bulk + Precio 2/3 + custom PIN override; line/cart discount; misc line; CSV round-trip and legacy omitted columns; eFactura; supplier invoice; partial and targeted credit payment; paid/unpaid credit return; sync queue and one-shot backfill.

### Phase C — optional UI consolidation

1. Extract PIN-gate modal state only after a third concrete consumer appears.
2. Generalize pagination labels/component naming (`ProductsPagination`) if reports and customer lists converge on the same controls.
3. Consolidate import summary/table presentation only where CSV/eFactura/supplier semantics genuinely match.
4. Move pure display-independent calculations out of large JSX files opportunistically; do not combine this with business-rule changes.

## Do-not-merge list

Do not merge any of the following without the stated automated and manual coverage:

- Pricing, rounding, sanctioned-price, or discount refactors without tests for base, bulk, Precio 2/3, custom override PIN, split payment, receipt totals, and cart-tab restore.
- Product validation/import refactors without CSV round-trip, duplicate barcode, malformed row, add/replace stock, omitted alternate-price columns, eFactura, supplier invoice, and preview-file-change cases.
- Stock helper consolidation without concurrent/conditional decrement tests, `factura_negativo`, negative manual adjustment, return restock/no-restock, sync enqueue, and adjustment-audit assertions.
- Credit balance/outstanding changes without mixed cash+credit sales, general and sale-targeted abonos, overpayment rejection, FIFO allocation, and paid/unpaid credit-return cases.
- Sync projection/backfill changes without verifying every table/column against the reference Supabase schema and proving rows are not marked synced after a partial projection failure.
- Separator/parser unification without an approved contract and fixtures for `1,234`, `1.234`, `1 234`, `₡1 234`, decimals, empty values, and malformed input.
- Broad “generic import framework,” “generic repository,” or “generic modal” abstractions that touch more than five files without a separate review. The current duplication does not justify a new architectural layer.
- Any cleanup that changes cashier-visible error keys, receipt text/totals, import counts, stock history, or return eligibility without both Spanish and Chinese locale checks and a manual smoke pass.
