# Findings — shelfDocs

---

### 1. Stale folder-name references: `OFFLINE-ONLY-POS` (91×) / `DASHBOARD/` (41×) — [verified]

**Scope:** 27 of 42 files (full list below).
**Problem:** every reference assumes the physical layout `OFFLINE-ONLY-POS/`, `DASHBOARD/` — the
names in place before this session's repo split renamed them to `shelfPos/`, `shelfDashboard/`.
**See the framing note in `00-summary.md`** before treating this as a simple find-and-replace —
it depends on whether the new names are permanent.
**Files with `OFFLINE-ONLY-POS`:** `wiki/Home.md`, `wiki/26-CABYS.md`, `wiki/24-Tax-Compliance.md`,
`wiki/22-Hacienda-Factura-Electronica-Architecture.md`, `wiki/20-Multi-Store-Hub-Architecture.md`,
`wiki/19-Edge-Cases-And-Runbooks.md`, `wiki/18-Quality-And-Tooling.md`,
`wiki/17-Conventions-For-AI.md`, `wiki/16-Error-Handling.md`, `wiki/15-Setup-And-Deployment.md`,
`wiki/14-Environment-Variables.md`, `wiki/10-Sync-Service.md`, `wiki/09-IPC-Reference.md`,
`wiki/08-POS-Renderer.md`, `wiki/07-POS-Main-Process.md`, `wiki/06-Supabase-Schema.md`,
`wiki/05-SQLite-Schema.md`, `wiki/03-Data-Flow.md`, `wiki/01-Repository-Overview.md`,
`shelfpos_context.md`, `llm/09-uml-diagrams.md`, `llm/08-codebase-graph.md`,
`llm/07-code-index.md`, `llm/06-features.md`, `llm/04-database.md`, `llm/01-overview.md`.
**Files with `DASHBOARD/`:** `decisions/ADR-004-multi-tenant-rls.md`, `llm/01-overview.md`,
`llm/04-database.md`, `llm/06-features.md`, `llm/07-code-index.md`, `llm/08-codebase-graph.md`,
`shelfpos_context.md`, `wiki/01-Repository-Overview.md`, `wiki/03-Data-Flow.md`,
`wiki/04-Multi-Tenant-Security.md`, `wiki/06-Supabase-Schema.md`, `wiki/11-Dashboard.md`,
`wiki/12-Reports-And-Exports.md`, `wiki/14-Environment-Variables.md`,
`wiki/15-Setup-And-Deployment.md`, `wiki/17-Conventions-For-AI.md`,
`wiki/18-Quality-And-Tooling.md`, `wiki/19-Edge-Cases-And-Runbooks.md`, `wiki/Home.md`.
**Heaviest-impact file:** `llm/07-code-index.md`, whose entire "file path lookup table" is
built on `OFFLINE-ONLY-POS/...` paths (e.g. `OFFLINE-ONLY-POS/src/main/db/migrations.ts`) — if the
names are indeed changing permanently, this file is the highest-value one to fix first since it's
explicitly a path-lookup reference.

---

### 2. Version number stale: docs say POS `1.6.4`, actual is `1.7.0` — [verified]

**Files:** `shelfpos_context.md:13` ("Version: 1.6.4 (POS + sync); Dashboard 1.5.1"),
`wiki/Home.md:23-24` (`v1.6.4` ×2), `wiki/15-Setup-And-Deployment.md:238`, and the version-history
section of `wiki/18-Quality-And-Tooling.md` (correctly historical, not a bug — it documents past
releases, so `1.6.4`/`1.6.3`/etc. entries there are accurate as history, just missing a `1.7.0`
entry for the latest release).
**Verified against:** `shelfPos/package.json` (`"version": "1.7.0"`) and
`shelfPos/RELEASE_NOTES.md`'s top entry.
**Fix:** update the "current version" fields in `shelfpos_context.md` and `wiki/Home.md`; add a
`### v1.7.0` entry to `wiki/18-Quality-And-Tooling.md`'s version-history table to match the pattern
of prior entries (supplier-invoice PDF import, shared-code dedup, per the actual
`RELEASE_NOTES.md` — see the improvements/shelfPos audit's tooling notes for what changed).
Dashboard's `1.5.1` is currently accurate — no change needed there.

---

### 3. `disect-Hacienda/` referenced as present, but it's been dropped from this checkout — [verified]

**Files:** `wiki/22-Hacienda-Factura-Electronica-Architecture.md` (8 mentions),
`wiki/23-Hacienda-Factura-Electronica-TODO.md` (3 mentions), `wiki/24-Tax-Compliance.md` (3),
`wiki/26-CABYS.md` (6), `wiki/Home.md` (1).
**Problem:** phrasing throughout assumes `disect-Hacienda/` is a sibling folder available to vendor
from right now (e.g. "Vendor `disect-Hacienda/packages/sdk` + `shared` into POS main process,"
`22-Hacienda-Factura-Electronica-Architecture.md:108`). Per this session's earlier decision, it
was intentionally dropped from the local repo — when integration work actually starts, it'll be
added back as a published npm dependency or a git submodule, not a vendored copy sitting in the
tree already.
**Fix:** not urgent (this is forward-looking design documentation for unstarted work, "Backlog"
phase 0 of 10 per the docs themselves) — but worth a one-line addition to
`wiki/22-Hacienda-Factura-Electronica-Architecture.md`'s intro noting "not currently vendored in
this repo; add via npm/submodule when integration begins" so a future reader isn't confused
looking for a folder that isn't there.

---

### 4. Broken wiki-link: `[[RELEASE_NOTES]]` — [verified]

**File:** `wiki/23-Hacienda-Factura-Electronica-TODO.md:110`
**Problem:** `` `disect-Hacienda` `e2e-pipeline.spec.ts` as reference `` — wait, the actual broken
link is elsewhere in the same file: `[[RELEASE_NOTES]]` doesn't match any file in the `shelfDocs`
Obsidian vault. `RELEASE_NOTES.md` lives in `shelfPos/` (the app repo), not in `shelfDocs/` (the
docs repo) — this link was never resolvable from inside the docs vault alone, even before the
split (it would only have worked if opened from a single combined-monorepo Obsidian vault root).
**Fix:** change to a plain-text reference (`` `shelfPos/RELEASE_NOTES.md` ``, not a `[[wikilink]]`)
since it points outside this vault, or drop the link styling entirely.

---

### 5. Hardcoded personal path (pre-existing, not caused by the split) — [verified]

**File:** `llm/08-codebase-graph.md:7`
```
**Interactive canvas (Cursor):** [shelfpos-codebase-graph.canvas.tsx](/Users/Jay/.cursor/projects/c-Users-Jay-Desktop-ShelfPOS/canvases/shelfpos-codebase-graph.canvas.tsx)
```
**Problem:** absolute path into a specific developer's Mac home directory. Dead link for anyone
else, including on this Windows machine. Already flagged in the original project-wide doc review
at the start of this session — repeating here since this is the dedicated docs-audit pass.
**Fix:** either remove the line, or replace with a note like "interactive canvas — regenerate
locally with `graphify` / Cursor canvas tooling; no shared path" so it doesn't imply a real shared
resource.

---

### 6. `shelfDocs/README.md` uses pre-camelCase repo names — [verified, self-inflicted]

**File:** `README.md:12-13` (this file's own root README, written during the repo-split step
earlier this session)
**Problem:**
```
Related repos: `shelfpos-pos` (Electron cashier/admin app + bundled sync service),
`shelfpos-dashboard` (owner web panel).
```
These were the working names before you asked for the camelCase rename
(`shelfPos`/`shelfDashboard`/`shelfDocs`). Never updated after the rename.
**Fix:** `shelfpos-pos` → `shelfPos`, `shelfpos-dashboard` → `shelfDashboard`.
