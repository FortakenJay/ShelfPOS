# shelfPos — Code Quality Audit (2026-07-06)

Baseline audit of the `shelfPos` repo (Electron cashier/admin app + `sync-service`), run right after
the monorepo split. Goal: separate real issues from tool noise, and leave a concrete backlog.

## Headline result

The "vibe coded" label undersells the code's actual discipline. Objective tooling comes back clean:

| Check                                    | Result                     |
| ---------------------------------------- | -------------------------- |
| `npm run lint` (tsc + eslint, full repo) | **0 errors**               |
| React Doctor (full scan, 245 files)      | **100/100**, 0 diagnostics |
| `: any` / `as any` usage                 | **0 occurrences**          |
| TODO / FIXME / HACK / XXX comments       | **0 occurrences**          |

So there's no backlog of type-safety holes, lint suppressions, or abandoned TODOs. What's actually
here is more architectural/organizational — the kind of thing linters don't check.

## Priority backlog (see `02-findings.md` for detail)

1. **`sync-service` isn't in `knip.json`'s entry list**, so ~150 of knip's 165 "unused file" hits are
   false positives (whole `sync-service/` tree + router-driven renderer pages knip can't trace).
   Fix the config before trusting knip's file-level output. _(Low effort, high leverage — unblocks
   real dead-code detection going forward.)_
2. **`SYNC_TABLES` (main process) has no counterpart consumed by `sync-service`** — sync-service keeps
   its own hardcoded `LIVE_ROW_SQL` table list per the wiki. Two independent lists for which tables
   sync means a newly-synced table can be added in main and silently never picked up by the service.
   Worth either sharing one source of truth or adding a test that fails when they drift.
3. **Genuinely unused dependencies**: `ws` + `@types/ws` (zero usages found anywhere), and
   `husky` + `lint-staged` (installed but never wired — no `.husky/`, no `prepare` script, no
   `lint-staged` config block in `package.json`). Safe to remove or to actually wire up, contributor's call.
4. **9 standalone scripts in `scripts/`** (`e2e-full.mjs`, 3× `print-colon-*.mjs`, `print-smoke-test.mjs`,
   2× `print-test-*.ts`, `screenshot.mjs`, `test-supplier-pdf.ts`) aren't referenced by any `package.json`
   script, CI workflow, or doc — they're presumably run ad hoc from the CLI. Either document how/when
   to run them, or fold them into an `npm run` script so they don't look abandoned.
5. **`isPrinterReady` (`src/main/services/printer.ts:116`) is truly dead** — not called anywhere,
   including internally. Confirmed by grep, not just knip.
6. **~90 exports/types flagged by knip as unused are mostly "exported but only consumed within their
   own file"** (verified on 3 samples — see `02-findings.md`) — not necessarily dead code, but the
   `export` keyword is often unnecessary. Low-risk cleanup: narrow visibility file-by-file rather than
   deleting.
7. **A handful of oversized files** worth a closer look in a follow-up pass: `usePOSTerminal.ts` (820
   lines, a hook doing a lot), `CierrePage.tsx` (703), `SettingsSections.tsx` (521), `printTemplates.ts`
   (902), `reports.ts` (762), `dashboard.ts` (620). Not necessarily wrong, but candidates for splitting
   if any of them are hard to reason about in practice.
8. Six `console.log` calls in main-process startup/printer code — all deliberately tagged
   (`[startup]`, `[printer]`), not sloppy debug leftovers, but not going through a structured logger
   either. Minor.

## What's in this directory

- `01-tooling-baseline.md` — what each tool checked and why it was trusted or discounted
- `02-findings.md` — the full findings list, one per item, with verification notes
- `raw/` — unmodified tool output (react-doctor JSON, knip JSON, lint/typecheck log) for traceability

## Not done yet (next passes)

- `shelfDashboard` hasn't been audited yet (per the plan: one package at a time, starting here).
- No fixes have been applied — this is a findings-only pass, per your instruction. Nothing in
  `shelfPos/` itself has been touched.
- No jscpd/duplicate-code scan run this pass (no config present; would need adding a tool, which
  changes the package — flagging as a decision for you rather than doing it unasked).
