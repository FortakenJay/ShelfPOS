# Node Description Batch 13 of 43

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@14a236405498baf91b313756215e541de2010194": "14a2364 Split monorepo into independent repos: shelfPos, shelfDashboard, shelfD…" | kind=Commit | source=git | neighbors=[Separation, 0d0d88f Remove split-out repository ent…, f311327 updated PDF and fixed bug. (STI…] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@5b432e4b311e8a610102a334319dce591cc46185": "5b432e4 Add documentation consistency audit and findings for shelfDocs" | kind=Commit | source=git | neighbors=[Separation, 6901179 fixed some bugs., 8c9e4fc Add raw output files for ESLint…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@690117903095e55a5a6486078a84d5010b3dcc26": "6901179 fixed some bugs." | kind=Commit | source=git | neighbors=[5b432e4 Add documentation consistency a…, Separation, e729c74 its just POS now.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@8c9e4fc8102429ca996ea31fe4c72c092c46247a": "8c9e4fc Add raw output files for ESLint, Knip, npm audit, React Doctor, and Typ…" | kind=Commit | source=git | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, Separation, 5b432e4 Add documentation consistency a…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@e66527e21353f5bdba58848e545c0cee43ba4ede": "e66527e needed, react DOCTOR" | kind=Commit | source=git | neighbors=[Separation, dev, c044586 fixed codebase and added cierre…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@e729c744b0fa01e3f1ddfc4db6e48a523591b055": "e729c74 its just POS now." | kind=Commit | source=git | neighbors=[6901179 fixed some bugs., Separation, af2caa3 updates updates updates. bug fi…] | lang=en
- "components_dashboardpaneltoolbar": "DashboardPanelToolbar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPanelToolbar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardPanelToolbar(), DashboardPage.tsx] | lang=en
- "components_daterangepresets_presetmonth": "presetMonth()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L22 | neighbors=[DateRangePicker.tsx, dateRangePresets.ts, rangeForReportPeriod()] | lang=en
- "components_daterangepresets_presettoday": "presetToday()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L11 | neighbors=[DateRangePicker.tsx, dateRangePresets.ts, rangeForReportPeriod()] | lang=en
- "components_languageswitcher_languageswitcher": "LanguageSwitcher()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L36 | neighbors=[LanguageSwitcher.tsx, currentLanguage(), languageLabel()] | lang=en
- "components_moneyinput": "MoneyInput.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/MoneyInput.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, MoneyInput(), MoneyInputProps] | lang=en
- "components_paymentmethodspiechart_paymentmethodspiechart": "PaymentMethodsPieChart()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/PaymentMethodsPieChart.tsx:L7 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, PaymentMethodsPieChart.tsx] | lang=en
- "components_ui_button": "Button()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L58 | neighbors=[DateRangePicker.tsx, PinModal.tsx, ui.tsx] | lang=en
- "components_ui_input": "Input()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L83 | neighbors=[DateRangePicker.tsx, PinModal.tsx, ui.tsx] | lang=en
- "dashboard_dashboardalertsearch_dashboardalertproductsearch": "dashboardAlertProductSearch()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSearch.ts:L4 | neighbors=[DashboardTables.tsx, NotificationsCenter.tsx, dashboardAlertSearch.ts] | lang=en
- "dashboard_dashboardtabs_dashboardtab": "DashboardTab" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardTabs.ts:L3 | neighbors=[DashboardTabNav.tsx, DashboardPage.tsx, dashboardTabs.ts] | lang=en
- "dashboard_usedashboard": "useDashboard.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/useDashboard.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardPage.tsx, useDashboard()] | lang=en
- "db_migrations_getdbversion": "getDbVersion()" | kind=code-symbol | source=shelfPos/src/main/db/migrations.ts:L612 | neighbors=[migrations.ts, runMigrations(), index.ts] | lang=en
- "db_migrations_runmigrations": "runMigrations()" | kind=code-symbol | source=shelfPos/src/main/db/migrations.ts:L617 | neighbors=[migrations.ts, getDbVersion(), index.ts] | lang=en
- "hooks_useaccountsstep": "useAccountsStep.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/hooks/useAccountsStep.ts:L1 | neighbors=[AccountsStep.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, useAccountsStep()] | lang=en
- "ipc_authorize_authorizewithdiscountpin": "authorizeWithDiscountPin()" | kind=code-symbol | source=shelfPos/src/main/ipc/authorize.ts:L7 | neighbors=[authorize.ts, discount.ts, priceOverride.ts] | lang=en
- "ipc_products_assignproductbarcode": "assignProductBarcode()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L86 | neighbors=[products.ts, productForBarcodePrint(), mapProductDbError()] | lang=en
- "ipc_products_mapproductdberror": "mapProductDbError()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L83 | neighbors=[products.ts, assignProductBarcode(), isUniqueViolation()] | lang=en
- "ipc_products_printlabelforproduct": "printLabelForProduct()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L158 | neighbors=[products.ts, printProductLabel(), runBatchPrint()] | lang=en
- "ipc_products_productforbarcodeprint": "productForBarcodePrint()" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L104 | neighbors=[products.ts, printProductLabel(), assignProductBarcode()] | lang=en
- "ipc_reports_boundsforreport": "boundsForReport()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L42 | neighbors=[reports.ts, buildReportPrintLines(), runReport()] | lang=en
- "lib_api_apierror": "ApiError" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/api.ts:L76 | neighbors=[api.ts, .constructor(), call()] | lang=en
- "lib_cartline_cartlinegross": "cartLineGross()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L27 | neighbors=[cartLine.ts, miscLineUnitPrice(), cartLineTotal()] | lang=en
- "lib_cartline_cartlinehascustomprice": "cartLineHasCustomPrice()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L49 | neighbors=[cartLine.ts, cartLineUsesPrice2(), cartLineUsesPrice3()] | lang=en
- "lib_cartline_misclineunitprice": "miscLineUnitPrice()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L18 | neighbors=[cartLine.ts, cartLineGross(), cartLineUnitPrice()] | lang=en
- "lib_carttabsnapshot_serializecarttabsnapshot": "serializeCartTabSnapshot()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L32 | neighbors=[cartTabSnapshot.ts, isEmptySnapshot(), snapshotTotal()] | lang=en
- "main_activationwindow_createactivationwindow": "createActivationWindow()" | kind=code-symbol | source=shelfPos/src/main/activationWindow.ts:L14 | neighbors=[activationWindow.ts, activationUrl(), index.ts] | lang=en
- "main_appicon_resolveappicon": "resolveAppIcon()" | kind=code-symbol | source=shelfPos/src/main/appIcon.ts:L9 | neighbors=[activationWindow.ts, appIcon.ts, index.ts] | lang=en
- "main_index_initdata": "initData()" | kind=code-symbol | source=shelfPos/src/main/index.ts:L83 | neighbors=[index.ts, fatal(), startLicensedApp()] | lang=en
- "main_index_startlicensedapp": "startLicensedApp()" | kind=code-symbol | source=shelfPos/src/main/index.ts:L305 | neighbors=[index.ts, createMainWindow(), initData()] | lang=en
- "main_license_checklicense": "checkLicense()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L162 | neighbors=[index.ts, license.ts, checkStoredLicense()] | lang=en
- "main_license_decryptlicensetoken": "decryptLicenseToken()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L67 | neighbors=[license.ts, checkStoredLicense(), deriveStorageKey()] | lang=en
- "main_license_derivestoragekey": "deriveStorageKey()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L51 | neighbors=[license.ts, decryptLicenseToken(), encryptLicenseToken()] | lang=en
- "main_license_devlicensestatus": "devLicenseStatus()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L152 | neighbors=[license.ts, getMachineId(), getLicenseStatus()] | lang=en
- "main_license_encryptlicensetoken": "encryptLicenseToken()" | kind=code-symbol | source=shelfPos/src/main/license.ts:L55 | neighbors=[license.ts, activateLicense(), deriveStorageKey()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-012.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
