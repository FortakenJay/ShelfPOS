# Findings — shelfDashboard

Confidence levels: **verified** (root-caused by reading the actual code) or **tool-flagged**
(not independently re-checked — verify before acting).

---

### 1. No typecheck step in `lint`, CI, or anywhere — [verified]

**File:** `package.json`
**Problem:** `"lint": "eslint ."` — no `tsc` step. No `"typecheck"` script exists at all. The
`.github/workflows/react-doctor.yml` CI (added during the repo split) doesn't run `tsc` either;
neither does anything else in the repo.
**Impact:** all 30 findings below (#2–#7) were sitting in committed code, invisible to every
existing gate. This is the actual root cause behind the rest of this report, not just one item
among many.
**Fix:** add `"typecheck": "tsc --noEmit"` to `package.json` scripts, change `"lint"` to
`"npm run typecheck && eslint ."` (mirrors `shelfPos`'s existing pattern exactly), and add a
typecheck step to CI.

---

### 2. `tsconfig.json` `lib` doesn't include ES2023 — [verified]

**File:** `tsconfig.json` (`"lib": ["ES2022", "DOM", "DOM.Iterable"]`)
**Problem:** `Array.prototype.toSorted` (ES2023) is used in `src/lib/queries/audit.ts:44,62` and
`src/lib/queries/dashboard.ts:224,290,293,295` — 5 call sites, but each one throws 2-3 cascading
errors (the missing method, plus implicit-`any` on the sort callback's parameters since TS can't
resolve the call), totaling **15 of the 30 tsc errors**.
**Fix:** change `"lib"` to `["ES2023", "DOM", "DOM.Iterable"]` (ES2023 is a superset of ES2022).
One-line change, resolves half the error count immediately once typecheck is wired up.

---

### 3. Real type-narrowing gap in `queries/reports.ts` — [verified]

**File:** `src/lib/queries/reports.ts:663–698` (the inventory pagination/full-export helper)
**Problem:**
```ts
if (type !== 'inventory') {
  return runReport(storeId, type, range)
}
const first = await runReport(storeId, type, range, { page: 1, pageSize: INVENTORY_PAGE_SIZE_MAX })
const data = first.data
if (data.rows.length >= data.total) { ... }   // ← .rows / .total don't exist on the full union
```
`runReport()`'s return type is `ReportData`, a union keyed by the `type` argument
(`SalesSummaryReport | PaymentMethodReport | InventoryReport | ...`). TypeScript narrows the local
`type` *variable* to `'inventory'` after the early return, but that narrowing doesn't propagate
through the `runReport()` call's return type — TS has no way to know the function's overload
resolution correlates with the narrowed argument unless `runReport` is declared with matching
overload signatures.
**Risk:** probably correct at runtime (the early return does guarantee `type === 'inventory'`
when this code runs), but the type system can't verify it, which means a future refactor of
`runReport`'s internals could silently break this in a way tsc *should* catch but currently can't.
**Fix (two options):** (a) add overload signatures to `runReport` so
`runReport(storeId, 'inventory', range, opts): Promise<{ type: 'inventory'; data: InventoryReport }>`
is a distinct overload from the general case — the correct fix, more work; or (b) narrow
explicitly with `data as InventoryReport['data']` plus a one-line comment explaining why it's safe
— faster, acceptable given the early-return guard already proves it.

---

### 4. Four navigation call sites broken by `/dashboard`'s required search param — [verified]

**Files:** `src/components/NotFoundPage.tsx:13`, `src/routes/_app/admin.tsx:128`,
`src/routes/_app/link-pos.tsx:61`, `src/routes/create-account.tsx:74`, `src/routes/index.tsx:19`
(5 call sites, not 4 — corrected from the summary's rough count)
**Problem:** `src/routes/_app/dashboard.tsx`'s `validateSearch` is:
```ts
validateSearch: (search: Record<string, unknown>) => ({
  tab: parseDashboardTab(search.tab),
}),
```
`parseDashboardTab` presumably defaults to a valid tab when `search.tab` is missing/invalid at
*runtime*, but its return type isn't optional, so TanStack Router infers `/dashboard`'s search
schema as `{ tab: T }` (required) rather than `{ tab?: T }`. Every `<Link to="/dashboard">` /
`navigate({ to: '/dashboard' })` call site that doesn't pass `search` now fails to typecheck.
**Fix (two options):** (a) if a default tab is always intended when unspecified, make
`parseDashboardTab`'s call site type-correct by giving the 5 call sites an explicit
`search={{ tab: 'overview' }}` (or whatever the default tab is); or (b) if navigating without a
tab and landing on the default is the actual intended UX, that's what should happen automatically
— check whether TanStack Router's `Partial<>` inference needs an explicit default value in
`validateSearch` (e.g. `search.tab ?? 'overview'` pattern is usually what makes the param
optional in the inferred type). Given 5 independent call sites all hit this the same way, (b) is
likely the more correct fix — one config change instead of 5 call-site edits.

---

### 5. Type hole in `OperatorStoresTable.tsx` bypasses an existing type guard — [verified]

**File:** `src/components/operator/OperatorStoresTable.tsx:75,99`
**Problem:**
```ts
billingInterval: draft.billingInterval || null,
```
`draft.billingInterval` is typed `BillingInterval | string | null` (per
`src/lib/queries/operator-stores.ts:8`), but `updateOperatorStoreBilling`'s input expects
`BillingInterval | null`. The codebase already has `isBillingInterval(value): value is
BillingInterval` in `src/lib/billing.ts:5`, used correctly elsewhere
(`src/lib/server/operator-stores.ts:105`, `src/lib/server/billing-reminders.ts`) — just not here.
**Risk:** in practice `draft.billingInterval` is very likely constrained by a `<select>` with only
the 3 valid options (not independently confirmed by reading the form JSX this pass), so this is
probably not exploitable today. But the type gap means nothing *enforces* that constraint — if the
input ever becomes free-text, or the draft state is ever populated from an untrusted source, an
invalid string reaches the billing-update API path with no compile-time or runtime check at this
call site.
**Fix:** `billingInterval: draft.billingInterval && isBillingInterval(draft.billingInterval) ?
draft.billingInterval : null` (or extract a small helper if this pattern repeats).

---

### 6. Dead file: `src/lib/reports/print-lines-to-xlsx.ts` — [verified, agreed by 2 tools]

**Problem:** zero imports anywhere in `src/` (confirmed by grep, not just tool output). Both React
Doctor and knip independently flag it. Very likely superseded by
`src/lib/reports/report-grid-to-xlsx.ts` (489 lines, actively used) after a rename/refactor from a
"print lines" model to a "report grid" model.
**Fix:** delete the file. Low risk — nothing imports it.

---

### 7. `npm audit`: 2 moderate vulnerabilities, already fixed in the sibling package — [verified]

**File:** `package.json`
**Problem:** `exceljs@4.4.0` depends on vulnerable `uuid@8.3.2` (buffer bounds check issue, fixed
upstream in `uuid@11.1.1`+). `shelfPos/package.json` has:
```json
"overrides": { "esbuild": "^0.28.1", "uuid": "^11.1.0" }
```
for this exact transitive dependency (both packages depend on `exceljs`). `shelfDashboard` has no
`overrides` section.
**Fix:** add the same `"overrides": { "uuid": "^11.1.0" }` (or `^11.1.1` to be precise about the
fixed version) to `shelfDashboard/package.json`, then reinstall.

---

### 8. Smaller items

- **`src/lib/auth.tsx:36`** — `authSliceReducer`'s `state` parameter is never read (every case
  fully replaces state rather than merging). TS flags this via `noUnusedParameters`. **Verify
  intent before silencing**: if the reducer is meant to always fully replace state, prefix with
  `_state` or remove the parameter; if it was meant to merge/preserve some prior state fields
  (e.g. keep `loading` across a session refresh), this might be an actual logic gap, not just an
  unused-var warning.
- **`src/routes/api/operator/invite-owner.ts:69`** — `data.properties.expires_at` accessed but
  doesn't exist on Supabase JS's `GenerateLinkProperties` type. Worth checking against the actual
  API response shape (log it once in a dev environment) — either the field is named differently
  in the current `@supabase/supabase-js` version and this has silently been reading `undefined`
  (masked by the `?? null` fallback, so `expiresAt` may always be `null` in practice), or the type
  package is stale relative to the API.
- **4 unused exports** (agreed by React Doctor + knip): `src/lib/billing.ts:29`
  `parseOptionalIsoDate`, `src/lib/server/operator-auth-api.ts:23`
  `PRODUCTION_DASHBOARD_ORIGIN`, `src/lib/signup-invite.ts:16` `buildOwnerSignupUrl`, plus
  `src/lib/i18n.ts:8` `LANG_STORAGE_KEY` and `src/lib/queries/dashboard.ts:337`
  `fetchDashboardProducts` (knip only, not independently re-verified) — same guidance as the
  `shelfPos` pass: check internal usage first, then either drop `export` or delete.
- **Two pairs of near-duplicate constants in `src/lib/stores.ts`** (knip's "duplicates" check):
  `DASHBOARD_POLL_MS`/`DASHBOARD_STALE_MS` and `PRESENCE_POLL_MS`/`PRESENCE_STALE_MS` — not
  necessarily a problem (poll/stale pairs are a normal pattern), flagged only because knip's
  duplicate-value detector caught them; worth a glance to confirm the values are intentionally
  related, not copy-paste of the wrong constant.
- **Unused devDependencies** (`@tailwindcss/typography`, `@testing-library/dom`,
  `@testing-library/react`, `typescript-eslint`) — knip-only, not independently verified this
  pass. `@testing-library/*` being "unused" is suspicious given `"test": "vitest run
  --passWithNoTests"` exists — worth checking whether there simply are no tests yet (the
  `--passWithNoTests` flag suggests this), in which case these are pre-installed for tests that
  haven't been written, not dead weight.
