# Tooling baseline

Ran from `shelfPos/` after a clean `npm install` (980 packages, 0 vulnerabilities).

## React Doctor (`npx react-doctor@latest --json --yes`, full scope)

- Scanned 245 source files (`src/**`, `sync-service/src/**` per `doctor.config.json`).
- Result: **score 100/100 ("Great")**, `errorCount: 0`, `warningCount: 0`, `totalDiagnosticCount: 0`.
- Raw output: `raw/react-doctor-full-scan.json`.
- Trust level: **high** — this is the same tool/config the project's own CI (`react-doctor.yml`)
  and `RELEASE_NOTES.md` cite. Confirms the "100/100" claim from the docs is currently accurate,
  not stale marketing.

## `npm run lint` (tsc --noEmit ×2 projects + eslint .)

- Exit code 0, no error output at all.
- Raw output: `raw/lint-typecheck-output.txt`.
- Trust level: **high** — standard compiler + linter, nothing unusual about the setup.

## knip (`npx knip --reporter json`, no `--fix`)

- Raw output: `raw/knip-full-scan.json` (196 file entries with at least one issue).
- Trust level: **mixed — verified case by case, see `02-findings.md`.** knip's static analysis
  can't see:
  - `sync-service`'s own entry points (`knip.json`'s `entry` array only lists 4 files, all under
    `src/`, none under `sync-service/`) — so knip treats the _entire_ `sync-service/src/` and
    `sync-service/scripts/` trees as one disconnected, unreachable subgraph. That alone explains
    ~13 of the 165 "unused files".
  - Router-driven page components and dynamic `import()` calls (e.g. `recharts` is lazy-loaded via
    `useRechartsModule.ts`'s `import('recharts')`, and most renderer `features/**` pages are reached
    through `@tanstack/react-router`'s route tree rather than static imports knip can trace easily).
    This accounts for the bulk of the remaining "unused files" — nearly every `features/**/*.tsx`
    page component is flagged, which is not plausible for a shipping, 100/100-scoring app.
  - **Action before trusting knip's file-level report again**: add `sync-service/src/index.ts` (and
    its `scripts/*.cjs`/`*.mjs` entry points used via `npm run <script>`) to `knip.json`'s `entry`
    array, and consider a TanStack Router plugin/config for knip so route-loaded pages aren't
    misflagged. Until then, treat "unused files" as noise except for the `scripts/` findings (which
    were independently verified against `package.json`, not just knip).
- **Unused exports/types** (91 total) are a different signal than "unused files" — these are named
  exports inside files that _are_ reachable, just not imported by any _other_ file. Spot-checked 3:
  - `getMachineId` (`src/main/license.ts:47`) — actually called 3× within the same file. False
    positive for "dead", but genuinely true that no _other_ file imports it — the `export` is
    unnecessary.
  - `SYNC_TABLES` (`src/main/db/repos/syncQueue.ts:13`) — only referenced within its own file (to
    derive the `SyncTableName` type). See finding #2 in `02-findings.md` — this one has a real
    architectural implication beyond "just remove export".
  - `isPrinterReady` (`src/main/services/printer.ts:116`) — not referenced anywhere at all,
    including its own file. Genuinely dead.
  - Conclusion: treat the unused-exports/types list as "candidates to narrow visibility or delete",
    verify each individually before acting — don't bulk-delete.
- **Unused dependencies**: `i18next`, `react-i18next`, `recharts` were flagged — all three verified
  as **false positives** (confirmed real usage via grep: `i18next` init in `src/renderer/src/i18n/index.ts`
  and consumed in multiple feature files; `recharts` dynamically imported in
  `useRechartsModule.ts`). knip's dependency-usage check doesn't follow dynamic `import()` specifiers.
- **Unused devDependencies**: `@types/pdf-parse`, `@types/ws`, `husky`, `lint-staged`, `ws`.
  - `ws` — verified **zero** usages anywhere in `src/` or `sync-service/`. Real finding.
  - `husky`/`lint-staged` — verified no `.husky/` directory, no `"prepare"` script, no
    `lint-staged` config block anywhere in `package.json`. Real finding (installed, never wired).
  - `@types/pdf-parse` — likely a false positive (the runtime `pdf-parse` dependency is genuinely
    used for supplier-invoice PDF import per `RELEASE_NOTES.md` 1.7.0); knip may not be associating
    the `@types/*` package with its runtime counterpart. Not independently re-verified beyond this
    reasoning — low priority either way since `@types` packages are inert at runtime.

## Not run this pass

- **jscpd** (duplicate-code detection) — the wiki (`18-Quality-And-Tooling.md`) cites a prior
  6.3% duplicate-token ratio, but no jscpd config/devDependency exists in this repo currently.
  Running it would require adding a new tool as a devDependency, which is a package.json change —
  flagging as a decision for you rather than doing it unasked.
- **npm audit** — install reported "found 0 vulnerabilities" as part of `npm install`, not re-run
  standalone.
