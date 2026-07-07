# shelfDashboard — Code Quality Audit (2026-07-06)

Same methodology as `improvements/shelfPos/`: install, run tooling, verify the noisy signals
before trusting them.

## Headline result — different from shelfPos

Unlike `shelfPos`, this package has a **real, previously-invisible problem**: `package.json`'s
`"lint"` script only runs `eslint .` — it never runs `tsc`. There is no `typecheck` script at all.
Running `npx tsc --noEmit` directly (not part of any existing script) surfaces:

| Check | Result |
|---|---|
| `npm run lint` (eslint only) | 0 errors — **but this never checks types** |
| `npx tsc --noEmit` (not wired to any script) | **30 real type errors, exit code 2** |
| React Doctor (full scan) | **91/100** — 0 errors, 4 warnings (all dead-code/unused-export) |
| `npm audit` | **2 moderate vulnerabilities** (transitive, via `exceljs`) |
| TODO / FIXME / HACK / `any` / `console.log` in `src/` | 0 occurrences (clean) |

So the type-safety net that `shelfPos` has (typecheck as part of `lint`) simply doesn't exist here.
The 30 tsc errors aren't hypothetical — they're errors in the actual committed code, sitting
unnoticed because nothing in the dev workflow or CI runs `tsc`.

## Priority backlog (see `02-findings.md` for full detail)

1. **No typecheck step anywhere in this package.** Add `"typecheck": "tsc --noEmit"` to
   `package.json` and wire it into `lint` (`"lint": "npm run typecheck && eslint ."`, matching
   `shelfPos`'s pattern) and into `.github/workflows/` CI. This is the single highest-leverage fix
   here — everything below was only findable because I ran `tsc` manually.
2. **`tsconfig.json`'s `lib` is `["ES2022", ...]` but the code uses `Array.prototype.toSorted`**
   (ES2023) in 3 files (`queries/audit.ts`, `queries/dashboard.ts` ×2 call sites) — 15 of the 30 tsc
   errors cascade from this one config gap. One-line fix: add `"ES2023"` to `lib`.
3. **A real type-narrowing bug in `queries/reports.ts`** (`downloadFullReport`-style function,
   lines ~663–698): after checking `type !== 'inventory'` and returning early, the code assumes
   `first.data` is narrowed to `InventoryReport`, but `runReport()`'s return type is a union keyed
   by a runtime `type` parameter that TypeScript can't correlate through the function-call
   boundary — so `.rows`/`.total` genuinely don't type-check on the union. Logically probably
   correct at runtime, but the type system can't prove it; needs an overload signature or an
   explicit assertion with a comment explaining why it's safe.
4. **4 navigation call sites broken by a route search-schema change**: `/dashboard`'s
   `validateSearch` makes `tab` a required search param, but `NotFoundPage.tsx`, `admin.tsx`,
   `link-pos.tsx`, `create-account.tsx`, and `routes/index.tsx` all navigate to `/dashboard`
   without supplying it. Looks like the `tab` param was added for a tabbed-dashboard feature and
   these call sites were never updated — invisible today because nothing runs `tsc`.
5. **Real-looking type mismatch in `OperatorStoresTable.tsx`** (lines 75, 99): `draft.billingInterval`
   is typed as `BillingInterval | string | null` and passed straight through to a function expecting
   `BillingInterval | null`, without using the `isBillingInterval()` type guard that already exists
   in `src/lib/billing.ts`. Likely UI-constrained in practice (probably a `<select>`), but the type
   hole means nothing stops an invalid string from reaching the update API if that ever changes.
6. **Dead file confirmed by both React Doctor and knip**: `src/lib/reports/print-lines-to-xlsx.ts`
   — zero imports anywhere, looks superseded by `report-grid-to-xlsx.ts`. Safe to delete.
7. **2 moderate `npm audit` vulnerabilities**, both from `exceljs` pulling in vulnerable
   `uuid@8.3.2` (buffer bounds check issue, fixed in 11.1.1+). **`shelfPos` already has an
   `"overrides": {"uuid": "^11.1.0"}` entry for this exact issue — `shelfDashboard` doesn't.**
   Same fix, just needs applying here too.
8. Smaller items: an unused reducer parameter in `auth.tsx` (worth confirming intent, not just
   silencing), a `GenerateLinkProperties.expires_at` property access that doesn't exist on the
   Supabase SDK's own type (worth checking against the actual API response — may indicate the
   field name changed upstream), 4 unused exports (`react-doctor` + knip agree on these).

## What's in this directory

- `01-tooling-baseline.md` — what each tool checked, trust level, and root-cause notes
- `02-findings.md` — full findings list, one per item
- `raw/` — unmodified tool output (react-doctor JSON, knip JSON, tsc/eslint logs, npm audit JSON)

## Not done yet

- No fixes applied — findings-only pass, same as `shelfPos`. Nothing in `shelfDashboard/` itself
  has been touched.
- `shelfDocs` (pure markdown) hasn't been audited — there's no code to lint there; let me know if
  you want a docs-consistency pass instead (broken links, stale version numbers, etc.) or if this
  wraps up the code-quality audit.
