# Quality & Tooling

Parent: [[Home]]

How to lint, scan React, and review changes before commit or release.

There is **no root monorepo script** — run commands inside each app folder.

---

## Lint

| Project | Command | What it runs |
|---------|---------|--------------|
| **POS** | `cd OFFLINE-ONLY-POS && npm run lint` | `tsc` (main + renderer) + ESLint |
| **Dashboard** | `cd DASHBOARD && npm run lint` | ESLint |
| **sync-service** | `cd OFFLINE-ONLY-POS/sync-service && npm run build` | TypeScript compile (no eslint script) |

POS and Dashboard must pass lint before shipping. Warnings do not fail the script unless ESLint is configured to error on them.

---

## React Doctor

Config: `doctor.config.json` in each app (`OFFLINE-ONLY-POS/`, `DASHBOARD/`).

| Scope | Command | When to use |
|-------|---------|-------------|
| **Changed** (default) | `npm run doctor` or `npx react-doctor@latest --verbose --scope changed` | After editing React/TS source — regression check |
| **Full** | `npx react-doctor@latest --verbose --scope full` | Baseline triage, `/doctor` cleanup pass |

**Docs-only or SQL-only commits:** `--scope changed` skips (no `.ts`/`.tsx` in the diff). Run **full** if you still want a score, or skip Doctor for that commit.

### Interpreting scores

- Treat findings as **hypotheses** — read the file before fixing or suppressing.
- Prefer fixing **errors** and high-confidence bugs over blanket suppressions.
- Full triage playbook: `curl https://www.react.doctor/prompts/react-doctor-agent.md` (see `.claude/skills/react-doctor/SKILL.md`).

### v1.6.5 (POS — quality pass)

| Check | Result |
|-------|--------|
| `npm run lint` | Clean |
| React Doctor `--scope full` | **100 / 100** (POS renderer + main TS) |
| jscpd | ~6.3% duplicate tokens (vendor copies + i18n; threshold 5%) |

`doctor.config.json` ignores generated `sync-service/src/vendor/**` and `sync-service/scripts/lib/**`.

### v1.6.4 (POS + Dashboard)

| Component | Version |
|-----------|---------|
| POS + installer | 1.6.4 |
| sync-service | 1.6.4 |
| Dashboard | 1.5.1 |

### v1.6.3 (POS)

| Component | Version |
|-----------|---------|
| POS + installer | 1.6.3 |
| sync-service | 1.6.3 |
| Dashboard | 1.5.0 |

### v1.6.1 (POS)

| Component | Version |
|-----------|---------|
| POS + installer | 1.6.1 |
| sync-service | 1.6.1 |
| Dashboard | 1.5.0 |

### v1.5.0 beta (producción)

| Componente | Versión |
|------------|---------|
| POS + installer | 1.5.0 |
| sync-service | 1.5.0 |
| Dashboard | 1.5.0 |

Run lint + React Doctor before `release:win` and dashboard deploy.

### v1.4.0 baseline (cart tabs)

| Check | Result |
|-------|--------|
| `npm run lint` | Clean |
| React Doctor `--scope changed` | **97 / 100** (1 acceptable `PinModal` perf warning; superseded by v1.6.5 full scan) |
| Bugbot | Tab/pay race, post-sale tab cleanup, discard reorder, audit+delete transaction — fixed |
| Cierre print/PDF | Discarded tabs section in `buildCierreLines` |

Release notes: `OFFLINE-ONLY-POS/RELEASE_NOTES.md`. **Supabase:** no `SUPA.sql` change for cart tabs.

### Known POS hotspots (full scan)

Label/batch printing in `products.ts` intentionally awaits sequentially (thermal printer); `doctor.config.json` disables `async-await-in-loop` for that file only.

Dashboard full scan is usually clean (100/100 on changed files). Remove unused exports when Doctor flags `unused-export` (e.g. dead helpers in `signup-invite.ts`).

---

## Knowledge graph (graphify)

AST-level codebase graph for AI assistants and cross-file navigation.

| Location | When to update |
|----------|----------------|
| `OFFLINE-ONLY-POS/graphify-out/` | After POS/sync/main/renderer changes |
| `graphify-out/` (repo root) | After wiki or multi-app changes |

```bash
# Requires: pip install graphifyy  (CLI command: graphify)
cd OFFLINE-ONLY-POS && graphify update .
cd .. && graphify update .          # whole monorepo
```

No API cost for code-only updates. Compare `GRAPH_REPORT.md` commit hash to `git rev-parse HEAD` to detect staleness.

POS Cursor rule: `.cursor/rules/graphify.mdc` — agents should `graphify query` before broad grep/read exploration.

---

## Code review (Bugbot)

For local branch review before PR:

- Cursor: `/review-bugs` or launch Bugbot on **branch changes**
- Focus: correctness, security, sync queue, printer/cash drawer, `SUPA.sql` idempotency

Bugbot complements lint/Doctor — it does not replace them.

---

## Pre-commit checklist

```bash
# 1. POS
cd OFFLINE-ONLY-POS
npm run lint
npm run doctor          # if you changed React/main TS

# 2. Dashboard
cd ../DASHBOARD
npm run lint
npm run doctor          # if you changed dashboard source

# 3. Sync (if sync-service changed)
cd ../OFFLINE-ONLY-POS/sync-service
npm run build

# 4. Supabase (if SUPA.sql changed)
# Apply DASHBOARD/SUPA.sql in SQL Editor (idempotent)
```

- [ ] Locale keys for new `AppError` paths (`es.json` + `zh-CN.json`)
- [ ] `LIVE_ROW_SQL` + `SUPA.sql` if schema/sync changed — [[06-Supabase-Schema]]
- [ ] Update relevant `docs/wiki/*.md` — [[17-Conventions-For-AI#Wiki maintenance]]

---

## Supabase SQL (`SUPA.sql`)

- **Idempotent** — safe to re-run; uses `IF NOT EXISTS`, `CREATE OR REPLACE`, migration `DO` blocks.
- **Fresh project:** no legacy `store_claim_codes` table; pairing uses `store_pairings` only.
- **Existing project:** legacy `store_claim_codes` rows migrate into `store_pairings` automatically.
- If apply fails mid-file, fix the error and re-run from the failed section or the whole file.

See [[06-Supabase-Schema]], [[15-Setup-And-Deployment]].

---

## Related

- [[17-Conventions-For-AI]]
- [[15-Setup-And-Deployment#Diagnostics]]
- [[16-Error-Handling]]
