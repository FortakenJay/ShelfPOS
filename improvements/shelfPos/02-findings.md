# Findings — shelfPos

Each finding has a confidence level: **verified** (independently confirmed beyond the tool that
flagged it), or **tool-flagged** (not independently re-checked — verify before acting).

---

### 1. `knip.json` entry list is incomplete — [verified]

**File:** `knip.json`
**Problem:** `entry` only lists `src/main/index.ts`, `src/renderer/src/main.tsx`,
`src/renderer/activation/main.ts`, `electron.vite.config.ts`. `sync-service` (a separate
package with its own `package.json`, own `tsc` build) has no entry point listed, so knip can't
trace anything under `sync-service/` as reachable.
**Fix:** add `sync-service/src/index.ts` and the CLI scripts under `sync-service/scripts/*.cjs`
(they're invoked via `npm run backfill` / `queue:diagnose` / etc., not imported) to a knip config
scoped to `sync-service`, or run knip separately per-package with its own config. Consider also
whether TanStack Router's route tree needs a knip plugin/manual entry so page components aren't
misflagged.
**Impact:** without this, knip's "unused files" report is ~90% noise and can't be trusted for
future dead-code sweeps.

---

### 2. `SYNC_TABLES` has no shared consumer in `sync-service` — [verified, needs a decision]

**File:** `src/main/db/repos/syncQueue.ts:13`
**Problem:** `SYNC_TABLES` (the authoritative list of which tables sync to Supabase) is exported
but only referenced within its own file to derive a type. Per the wiki
(`10-Sync-Service.md`, `04-database.md`), `sync-service` maintains its _own_ hardcoded
`LIVE_ROW_SQL` map of synced tables, independently. These are two separate lists describing the
same fact (which tables are synced).
**Risk:** the schema-change checklist documented across three wiki pages already requires a human
to remember to update both lists by hand whenever a table's sync status changes. If they drift,
the failure mode is silent — a newly-synced table's queue rows enqueue fine in main but
`sync-service` never picks them up (or vice versa), and nothing errors, it just silently
under/over-syncs.
**Suggested fix (not applied):** either (a) have `sync-service` import `SYNC_TABLES` from a
shared location — currently awkward since sync-service only vendors 3 files from
`src/shared/node` via `sync-vendor.mjs`, so this would mean adding a 4th vendored file — or
(b) add a lightweight consistency test that fails CI if the two lists diverge, without full
unification. (a) is architecturally cleaner given the existing vendoring pattern; (b) is lower
effort. Your call.

---

### 3. Genuinely unused dependency: `ws` — [verified]

**File:** `package.json` (dependency), `@types/ws` (devDependency)
**Problem:** zero usages of `from 'ws'` / `require('ws')` anywhere in `src/` or `sync-service/`.
**Fix:** `npm uninstall ws @types/ws` (or find out why they were added — worth a quick git-blame
if you want the "why" before removing, since the original history wasn't preserved in this split).

---

### 4. `husky` + `lint-staged` installed but never wired — [verified]

**File:** `package.json` (devDependencies)
**Problem:** no `.husky/` directory, no `"prepare"` script, no `lint-staged` config block anywhere
in `package.json`. These packages do nothing in the current repo.
**Fix — two valid directions, pick one:**

- Remove both (`npm uninstall husky lint-staged`) if pre-commit hooks were never actually adopted.
- Or actually wire them up (`npx husky init`, add a `lint-staged` config running `eslint --fix` /
  `prettier` on staged files, add `"prepare": "husky"`) if the intent was always to have
  pre-commit linting and it just never got finished — plausible given `disect-Hacienda` (the
  dropped subproject) _did_ have husky fully wired with a `"prepare": "husky"` script, suggesting
  this may be a half-finished pattern carried over from that project.

---

### 5. Dead scripts in `scripts/` not wired to `package.json` — [verified against package.json]

**Files:**

- `scripts/e2e-full.mjs`
- `scripts/print-colon-preprod.mjs`
- `scripts/print-colon-sp-32-32-port.mjs`
- `scripts/print-colon-sp-32-32.mjs`
- `scripts/print-smoke-test.mjs`
- `scripts/print-test-big-receipt.ts`
- `scripts/print-test-crc.ts`
- `scripts/screenshot.mjs`
- `scripts/test-supplier-pdf.ts`

**Problem:** none of these appear in any `package.json` script, CI workflow, or doc reference —
only the license scripts (`get-machine-id.ts`, `generate-license.ts`, `generate-keypair.js`) and
`build-release.ps1` are wired up. These 9 look like manual printer/e2e debugging tools run ad hoc
during development (names strongly suggest thermal-printer format testing — "print-colon",
"sp-32-32" likely a printer model/width code).
**Fix (pick one, not urgent):**

- If still useful for manual printer debugging: add them as `npm run` scripts so they're
  discoverable, with a one-line comment on when to use each.
- If obsolete (superseded by the current printer test coverage): delete them.
  Either way, their current state — present, undocumented, unwired — is the "vibe coded" smell
  worth resolving one way or the other.

---

### 6. `isPrinterReady` is genuinely dead code — [verified]

**File:** `src/main/services/printer.ts:116`
**Problem:** not called anywhere, including within its own file. Confirmed by direct grep, not
just knip.
**Fix:** delete the function (and check `printLines` / `printTestLabel` from the same file,
flagged alongside it by knip but not yet independently verified — likely same situation, worth a
quick look before deleting all three together).

---

### 7. ~90 knip-flagged "unused exports/types" — mostly export-visibility cleanup, not dead code — [tool-flagged, partially verified]

**Full list:** see `raw/knip-full-scan.json`, or re-run:

```
npx knip --reporter json
```

**Pattern observed on 3 samples** (`getMachineId`, `SYNC_TABLES`, `isPrinterReady` — see above):
knip's "unused export" check flags anything not imported by a file _other than_ the one that
defines it — it doesn't distinguish "used internally, exported unnecessarily" from "truly dead".
Two of three samples were internally-used-but-over-exported; one was truly dead.
**Recommendation:** before touching any of the ~90, grep each name for internal usage first. If
used internally → just remove the `export` keyword (safe, mechanical, no behavior change). If
unused even internally → candidate for deletion, but check for IPC-channel-name-string or
dynamic-dispatch usage first (this codebase's IPC layer registers handlers by string channel name
per ADR-003, which static analysis can't always trace).
**Notable entries worth a first look** (larger/more central files, higher chance of real signal):
`src/shared/types.ts` (14 unused type exports — a large shared-types barrel, worth checking if
these are types from a removed feature), `src/main/services/labelLayout.ts` (8 unused exports —
entire file might be superseded), `src/shared/money.ts` (8 unused exports — core money-formatting
utility, worth checking if a newer formatting module replaced it).

---

### 8. Oversized files worth a closer look — [not yet root-caused, flagged for follow-up]

| File                                                   | Lines | Note                                                                                                                                                  |
| ------------------------------------------------------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/types.ts`                                  | 1191  | Central types barrel — size alone isn't necessarily a problem for a types-only file                                                                   |
| `src/main/services/printTemplates.ts`                  | 902   | Receipt/label print templates — likely legitimately large (many templates), but worth confirming no copy-pasted near-duplicates                       |
| `src/renderer/src/features/pos/usePOSTerminal.ts`      | 820   | **A single hook, 820 lines** — the highest-risk entry here; large hooks are a common "does everything" smell and usually the best splitting candidate |
| `src/main/db/repos/reports.ts`                         | 762   | Report-query repo — likely one function per report type, may be fine as-is                                                                            |
| `src/renderer/src/features/admin/CierrePage.tsx`       | 703   | Large page component                                                                                                                                  |
| `src/main/db/repos/dashboard.ts`                       | 620   |                                                                                                                                                       |
| `src/main/ipc/sales.ts`                                | 550   | Core checkout IPC handler — worth a closer look given it's the highest-traffic code path in the app                                                   |
| `src/renderer/src/features/admin/SettingsSections.tsx` | 521   |                                                                                                                                                       |

**Not a finding yet, an action item:** this pass didn't read these files in full (would need a
follow-up pass per file to say anything concrete about _why_ they're large — legitimate
complexity vs. copy-paste vs. mixed concerns). `usePOSTerminal.ts` and `sales.ts` are the two
highest-value candidates for that follow-up given they're both on the checkout hot path.

---

### 9. Six untagged-but-present `console.log` calls — [verified, low severity]

**Files:** `src/main/index.ts:187,200`, `src/main/services/pendingStoreId.ts:27`,
`src/main/services/printer.ts:153,158,177`
**Note:** all six are deliberately bracket-tagged (`[startup]`, `[printer]`) and read as
intentional startup/diagnostic logging, not forgotten debug prints — this is _not_ the same
category as random leftover `console.log('here')` calls. Only worth touching if the project
adopts a structured logger; not urgent.
