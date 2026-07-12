# ShelfPOS QA

ShelfPOS uses a hybrid QA pipeline:

- Vitest covers deterministic business logic quickly on Node: pricing/overrides, CRC money parsers, cart totals, product validation, CSV/eFactura import analysis, product DB errors, query-key helpers, credit outstanding helpers, stock mutation contracts, and sync mirror parity (sync-service).
- Playwright launches the built Electron main process and exercises the real renderer, preload allowlist, IPC handlers, migrations, and SQLite database.

This keeps pull-request feedback fast while retaining end-to-end coverage for cashier-critical flows. Renderer-only IPC mocks are intentionally not used.

## Run locally

From `shelfPos/`:

```powershell
npm ci
npm run test
npm run test:watch
npm run build
npm run test:e2e
npm run test:qa
```

Use `npm run test:e2e:ui` after a build for Playwright UI mode. E2E tests launch `out/main/index.js`; `test:e2e` reports a clear error if the build is missing.

To inspect a retained failure trace:

```powershell
npx playwright show-trace test-results\<test-folder>\trace.zip
```

The HTML report is written to `playwright-report/`.

## Isolation and test mode

Every Playwright test launches a separate Electron process with:

- `SHELFPOS_TEST=1`
- A unique temporary `SHELFPOS_DATA_DIR`
- A fresh `shelf.db` with all production migrations applied

Test mode requires an explicit data directory before seeding, preventing accidental writes to the normal `%APPDATA%\shelfpos` database. It bypasses license activation and marks queued print jobs as printed without probing or using a physical printer. It does not start or call Supabase.

The fixture closes Electron and removes the temporary directory after each test. Specs therefore do not depend on execution order.

## Seed contract

These values exist only in temporary test databases:

- Admin: `qa-admin` / `QaPassword!`
- Sales: `qa-sales` / `QaPassword!`
- Manager PIN: `2468`
- Caja PIN: `1357`
- Standard product: `QA-STD`, Precio 1 `₡1 000`, Precio 2 `₡800`, Precio 3 `₡700`
- Bulk product: `QA-BULK`, Precio 1 `₡1 000`, bulk tier 5 at `₡750`
- Credit customer: `QA Credit Customer`, opening balance `₡500`
- Opening float: `₡50 000`

Keep `src/main/services/testSeed.ts` and `e2e/fixtures/test-*.ts` synchronized when changing the contract.

## Adding coverage

Pure logic belongs beside the source as `*.test.ts`. Electron smoke specs belong in `e2e/specs/` and should use the shared login/POS helpers.

Prefer role, label, and visible-text locators. Add `data-testid` only when a stable user-facing locator is not practical. Never add fixed sleeps; rely on Playwright assertions and locator auto-waiting.

For a new E2E scenario:

1. Use the `page` fixture from `e2e/fixtures/electron-app.ts`.
2. Log in through the UI.
3. Perform the cashier or admin flow through the UI.
4. Assert visible behavior; use raw preload IPC only for authoritative database/error-key assertions that are not rendered.
5. Keep each test independent of other specs.

## CI

`.github/workflows/qa.yml` runs Vitest on `ubuntu-latest` and the built Electron smoke suite on `windows-latest` for pull requests and pushes to `main`. Failed Windows E2E jobs upload the HTML report, screenshots, and retained traces for 14 days.

The Windows job requires GitHub-hosted desktop-session support for Playwright Electron and successful native dependency installation for the repository's Electron version. No browser is used by the smoke suite, though Chromium is installed to keep Playwright tooling available for report and UI diagnostics.
