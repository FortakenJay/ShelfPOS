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
- Prefer fixing **errors** and high-confidence bugs; many POS warnings are pre-existing (React Compiler, `useProductManager` invalidation patterns).
- Full triage playbook: `curl https://www.react.doctor/prompts/react-doctor-agent.md` (see `.claude/skills/react-doctor/SKILL.md`).

### Known POS hotspots (full scan)

Remaining full-scan items are mostly main-process (`await` in print loops, `settings.ts`) — not React. Renderer fixes: printer status via `useQuery`, ref sync in effects, `openPayRef` for pay shortcuts.

Label/batch printing in `products.ts` intentionally awaits sequentially (thermal printer); `doctor.config.json` disables `async-await-in-loop` for that file only.

Dashboard full scan is usually clean (100/100 on changed files).

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
