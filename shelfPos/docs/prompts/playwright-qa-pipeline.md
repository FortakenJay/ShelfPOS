You are designing and implementing an automated QA pipeline for **ShelfPOS** (`shelfPos/`), an Electron + SQLite offline POS for Costa Rica.

There are no unit or E2E tests today. CI only runs React Doctor (`.github/workflows/react-doctor.yml`). Your job is to add tests and wire them into GitHub Actions.

## Step 1 — Orient (mandatory)

```bash
graphify query "login first run IPC auth session preload"
graphify query "sales create payment modal POS terminal"
```

Read:

- `shelfpos-general-Wiki/wiki/07-POS-Main-Process.md`
- `shelfpos-general-Wiki/wiki/09-IPC-Reference.md`
- `shelfpos-general-Wiki/wiki/19-Edge-Cases-And-Runbooks.md`
- `shelfPos/src/main/index.ts`
- `shelfPos/src/preload/`
- `shelfPos/src/renderer/src/router.tsx`
- `shelfPos/.github/workflows/`

## Step 2 — Goals

1. Catch regressions in cashier-critical flows: caja, payment, credit, returns, product pricing (including Precio 2/3).
2. Run on pull requests and `main`.
3. PR feedback under ~15 minutes where possible; optional nightly for heavier cases.
4. Deterministic runs: isolated temp DB, seeded users/products, no real printer or Supabase.

## Step 3 — Architecture (use hybrid Option C)

**Option C — Hybrid (required unless blocked):**

- **Vitest** for pure logic: `shared/pricing.ts`, `shared/money.ts`, CSV parsers, Zod schemas.
- **Playwright + Electron** for 5–10 golden-path E2E tests on a Windows runner.

Document why Option C was chosen in `shelfPos/docs/QA.md`.

E2E: use Playwright `_electron.launch()` on the built app (`npm run build` → `out/main/index.js`).

Do not choose renderer-only mocking unless Electron launch is impossible; document the blocker if so.

## Step 4 — Create this layout

```
shelfPos/
  playwright.config.ts
  vitest.config.ts
  e2e/
    fixtures/
      electron-app.ts
      test-users.ts
      test-products.ts
    helpers/
      login.ts
      pos.ts
    specs/
      smoke.login.spec.ts
      smoke.sale-cash.spec.ts
      smoke.sale-precio2.spec.ts
      smoke.sale-bulk-precio1.spec.ts
      smoke.credit-sale.spec.ts
      smoke.return-blocked.spec.ts
      smoke.product-crud.spec.ts
      smoke.language.spec.ts
    global-setup.ts
  src/
    shared/pricing.test.ts
    shared/money.test.ts
    main/services/productCsvImport.test.ts
    main/services/productEfacturaImport.test.ts
  .github/workflows/
    qa.yml
  docs/
    QA.md
```

## Step 5 — Test environment

- Set `SHELFPOS_DATA_DIR` to a unique temp directory per run (see `src/main/index.ts`).
- Stub or bypass: license activation, sync Windows service, physical printer. Use `SHELFPOS_TEST=1` (add if needed) to noop `attemptPrintJob`.
- Seed data:
  - Admin + sales users with known passwords/PINs
  - Products: standard, bulk tier, with `price2` and `price3`
  - One customer with credit balance
- Fresh migrations per test file or documented isolation strategy.

## Step 6 — Minimum E2E specs

| Spec | Assert |
|------|--------|
| `smoke.login.spec.ts` | Sales login → `/pos` |
| `smoke.sale-cash.spec.ts` | Add product → cash pay → cart clears |
| `smoke.sale-precio2.spec.ts` | Precio 2 applies without PIN; total correct |
| `smoke.sale-bulk-precio1.spec.ts` | Bulk qty active → Precio 1 restores `product.price` |
| `smoke.credit-sale.spec.ts` | Credit requires customer; balance updates |
| `smoke.return-blocked.spec.ts` | Unpaid credit sale cannot return; correct error key |
| `smoke.product-crud.spec.ts` | Admin creates product with `price2`; visible in list |
| `smoke.language.spec.ts` | Globe menu switches es ↔ zh-CN |

## Step 7 — Minimum unit tests

- `pricing.test.ts` — bulk, overrides, sanctioned prices
- `money.test.ts` — ₡10 rounding
- `productCsvImport.test.ts` — parse row; omitted columns preserve existing `price2`/`price3`
- `productEfacturaImport.test.ts` — import does not clear alternate prices

## Step 8 — package.json scripts

Add to `shelfPos/package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:qa": "npm run test && npm run build && npm run test:e2e"
```

## Step 9 — CI workflow

Create `shelfPos/.github/workflows/qa.yml`:

- **Triggers:** `pull_request`, `push` to `main`
- **Job `unit`:** `ubuntu-latest` → `npm ci` → `npm run test`
- **Job `e2e`:** `windows-latest` → `npm ci` → `npm run build` → `npx playwright install` → `npm run test:e2e`
- Upload Playwright HTML report and traces on failure
- Fail the workflow if any smoke spec fails

Optionally add `typecheck`, `lint:eslint`, and `react-doctor --scope changed` to the same workflow or a separate job.

## Step 10 — Implementation rules

- Add `data-testid` only where needed: payment modal, POS search, cart, language menu.
- No `sleep()`; use Playwright `expect` auto-waiting.
- Default E2E locale: `es`. One spec covers `zh-CN`.
- Never commit credentials or production DB paths.
- After code changes: `graphify update .` from repo root.

## Step 11 — Deliverables checklist

- [ ] `vitest.config.ts` + unit tests passing locally
- [ ] `playwright.config.ts` + Electron fixtures working on Windows
- [ ] All MVP specs green locally via `npm run test:qa`
- [ ] `qa.yml` passing on a test branch/PR
- [ ] `docs/QA.md` — run locally, debug traces, seed contract, how to add specs

## Out of scope (unless user asks)

- ShelfPOS-Dashboard Playwright tests
- Live Supabase sync tests
- Physical printer tests
- 100k-row CSV performance (separate job later)

## Execution order

1. Short implementation plan in chat (or `docs/QA.md` draft).
2. Phase 1: Vitest + unit tests.
3. Phase 2: Playwright + Electron smoke specs.
4. Phase 3: GitHub Actions.
5. Verify locally, then confirm CI green.

Do not create git commits unless the user asks.
