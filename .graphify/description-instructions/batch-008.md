# Node Description Batch 9 of 42

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

- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@71a7bcbb936176c1b22ac4badecc71a2b5b263eb": "71a7bcb 1.3.3" | kind=Commit | source=git | neighbors=[Separation, dev, 6564709 added admin, cd0b86f v 1.3] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@7721f6597c8c270b2cef02f25f857e5055c8432e": "7721f65 fixed previous issues" | kind=Commit | source=git | neighbors=[526a635 fixed the build, Separation, dev, ee398bc clean and full rebuild] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@812fb042ff090e596c4f3c29f4b4669584df1470": "812fb04 more ui fixes." | kind=Commit | source=git | neighbors=[Separation, dev, 5b15131 more fixes, cf0fdc7 UI fixes (thansk andres)] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@81b3271ae8672e240883262ef034d29f124b5f29": "81b3271 more fixes on the websuites" | kind=Commit | source=git | neighbors=[4d467fe changes, Separation, dev, e32e315 sitea] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@830f6ac2adc622c2f3bc830296ccd879c202bfff": "830f6ac Printer QA: TM-T81III detection and docs" | kind=Commit | source=git | neighbors=[Separation, dev, 29f24aa dashboad online update, caf7d3c ui fixes, added add or replace …] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@841808da3834b3702f323d59f06bd2d0789df201": "841808d Update push" | kind=Commit | source=git | neighbors=[3da0d23 Merge branch 'dev' of https://g…, Separation, dev, 233e386 Merge branch 'dev' of https://g…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@924863275a74f7420670a7ded529b2de8f17e5a7": "9248632 number format fixed" | kind=Commit | source=git | neighbors=[07768fd pagination and user tests, Separation, dev, 24f0fbb fixed more UIs] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@a97eb0df08016748a1be4e1962ccaddd9a53b050": "a97eb0d fix3.0" | kind=Commit | source=git | neighbors=[233e386 Merge branch 'dev' of https://g…, Separation, dev, d282323 dumb fixes] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@b96d95ea9260ccf36e9d0ecf5771d36e93dcb32b": "b96d95e bug fixed an issue witth export CSV and cierr.e" | kind=Commit | source=git | neighbors=[Separation, dev, 1e257f4 added a versioning disaply and …, ea1fc8a new update] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@bcf4c2f22281d3bee6a899d3065fc30e9b305929": "bcf4c2f fixed links." | kind=Commit | source=git | neighbors=[3da0d23 Merge branch 'dev' of https://g…, Separation, dev, 233e386 Merge branch 'dev' of https://g…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@c0445867fb668dd51af91a974e52f28b02d66dd4": "c044586 fixed codebase and added cierres for the cajero." | kind=Commit | source=git | neighbors=[Separation, dev, 142aee3 mejorar el cierre y proprierata…, e66527e needed, react DOCTOR] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@caf7d3cd652880c608f05f19be18e200e6c2680e": "caf7d3c ui fixes, added add or replace logic for excel sheets" | kind=Commit | source=git | neighbors=[5b15131 more fixes, Separation, dev, 830f6ac Printer QA: TM-T81III detection…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@cd0b86f6f74223cd8d778ca1a81964146a35f61a": "cd0b86f v 1.3" | kind=Commit | source=git | neighbors=[Separation, dev, 71a7bcb 1.3.3, f61bbb3 big update.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@cf0fdc704abc9c9a2b94e8622acfb7c01b92c078": "cf0fdc7 UI fixes (thansk andres)" | kind=Commit | source=git | neighbors=[Separation, dev, 812fb04 more ui fixes., f884e64 added admin dashboard] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@cf3e43a9ee2e28db7bcaafcd53587a39f64e4dbb": "cf3e43a mode documentation." | kind=Commit | source=git | neighbors=[24e20c4 bug fixes and fully documented., Separation, dev, 2659acf more fixes and added more featu…] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@d1a0ec46563e8b0f4ba95a07140329a5b28621a0": "d1a0ec4 fix more stuff" | kind=Commit | source=git | neighbors=[1b80d1c build fix, Separation, dev, 526a635 fixed the build] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@d28232378833f3754d09fba66a3c4c09126465ba": "d282323 dumb fixes" | kind=Commit | source=git | neighbors=[a97eb0d fix3.0, Separation, dev, ea6caca more dumb ahhh fixes.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@e26c275df50d7d57c1ad29cb784dc9803c16e4cc": "e26c275 more fixes." | kind=Commit | source=git | neighbors=[Separation, dev, 4b18b22 fixes., ea6caca more dumb ahhh fixes.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@e32e315bfe5e152457f1709abc5c1b63b96d970d": "e32e315 sitea" | kind=Commit | source=git | neighbors=[81b3271 more fixes on the websuites, Separation, dev, 430f3aa lints] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@e5f80bdb977d1b8edb99db2876f3150fa73c7ba9": "e5f80bd graphs" | kind=Commit | source=git | neighbors=[1e257f4 added a versioning disaply and …, Separation, dev, f69ed35 graph] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@ea1fc8ac846c61b0ba66675219b6c167502624e6": "ea1fc8a new update" | kind=Commit | source=git | neighbors=[641f6af fixed UI., Separation, dev, b96d95e bug fixed an issue witth export…] | lang=pt
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@ea6cacade726465f607a769ac20d6add44cceb15": "ea6caca more dumb ahhh fixes." | kind=Commit | source=git | neighbors=[d282323 dumb fixes, Separation, dev, e26c275 more fixes.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@ee398bc07a9a781e46fba36a9ccb490ef51a2fe6": "ee398bc clean and full rebuild" | kind=Commit | source=git | neighbors=[7721f65 fixed previous issues, Separation, dev, 4d467fe changes] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@f3113275b97a295a70f238e2b2080dc1432d35dd": "f311327 updated PDF and fixed bug. (STILLL NEEDS FIXING)" | kind=Commit | source=git | neighbors=[Separation, dev, 14a2364 Split monorepo into independent…, f69ed35 graph] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@f61bbb37be8535b83c430af3187686017fd71ba7": "f61bbb3 big update." | kind=Commit | source=git | neighbors=[33bb2b3 changed on nonsense, Separation, dev, cd0b86f v 1.3] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@f69ed35f395db78c93537d38993c994e59988831": "f69ed35 graph" | kind=Commit | source=git | neighbors=[e5f80bd graphs, Separation, dev, f311327 updated PDF and fixed bug. (STI…] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@f846cf6291d7f8d03d359e8d5860585dd16bfc5c": "f846cf6 updates." | kind=Commit | source=git | neighbors=[4b18b22 fixes., Separation, dev, 641f6af fixed UI.] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@f884e6420ad283f74e20262e8226a87b08939cef": "f884e64 added admin dashboard" | kind=Commit | source=git | neighbors=[24f0fbb fixed more UIs, Separation, dev, cf0fdc7 UI fixes (thansk andres)] | lang=en
- "commit:repo:github.com/SakenEtAlOrg/ShelfPOS@fcdc3084cf98760f64d69b8210ff27c867aac3a5": "fcdc308 stuff" | kind=Commit | source=git | neighbors=[29f24aa dashboad online update, Separation, dev, 36c67a5 added nitro] | lang=en
- "components_accountspinfields": "AccountsPinFields.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AccountsPinFields.tsx:L1 | neighbors=[AccountsStep.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, AccountsPinFields(), AccountsPinFieldsProps] | lang=en
- "components_adminaccountfields": "AdminAccountFields.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/auth/components/AdminAccountFields.tsx:L1 | neighbors=[AccountsStep.tsx, 1bdbad7 Consolidate shelfPos, shelfDash…, AdminAccountFields(), AdminAccountFieldsProps] | lang=en
- "components_dashboardprimitives_dashboardcard": "DashboardCard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L7 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, DashboardPrimitives.tsx, DashboardTables.tsx] | lang=en
- "components_dashboardprimitives_dashboardempty": "DashboardEmpty()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/DashboardPrimitives.tsx:L39 | neighbors=[DashboardCharts.tsx, DashboardHomeCharts.tsx, DashboardPrimitives.tsx, DashboardTables.tsx] | lang=en
- "components_daterangepresets_presetweek": "presetWeek()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L16 | neighbors=[DateRangePicker.tsx, dateRangePresets.ts, shiftDays(), rangeForReportPeriod()] | lang=en
- "components_daterangepresets_rangeforreportperiod": "rangeForReportPeriod()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/dateRangePresets.ts:L27 | neighbors=[dateRangePresets.ts, presetMonth(), presetToday(), presetWeek()] | lang=en
- "components_languageswitcher": "LanguageSwitcher.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, LANGUAGES, languageShortLabel(), LanguageSwitcher()] | lang=en
- "components_navicon": "NavIcon.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NavIcon.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, NavIcon(), NavIconName, PATHS] | lang=en
- "components_productspagetoolbar": "ProductsPageToolbar.tsx" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageToolbar.tsx:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, ProductsPageToolbar(), ProductsPageToolbarProps, ProductsPage.tsx] | lang=en
- "dashboard_dashboardalertsearch": "dashboardAlertSearch.ts" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardAlertSearch.ts:L1 | neighbors=[1bdbad7 Consolidate shelfPos, shelfDash…, DashboardTables.tsx, NotificationsCenter.tsx, dashboardAlertProductSearch()] | lang=en
- "db_helpers_daysagolocal": "daysAgoLocal()" | kind=code-symbol | source=shelfPos/src/main/db/helpers.ts:L17 | neighbors=[helpers.ts, pad(), dashboard.ts, dataRetention.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-008.json

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
