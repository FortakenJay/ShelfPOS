# shelfDocs — Documentation Consistency Audit (2026-07-06)

`shelfDocs` is pure markdown (42 files: `wiki/` ×26, `llm/` ×10, `decisions/` ×5, plus
`shelfpos_context.md` and this repo's own `README.md`) — no lint/typecheck/react-doctor applies.
Adapted the methodology to what's actually checkable for docs: broken internal links, and
consistency against the current repo-split reality.

## Headline result

Cross-referencing is genuinely solid — **0 broken standard markdown links** across all 42 files,
only **1 broken wiki-style `[[link]]`**. The documentation was clearly maintained with real
discipline. The issues here aren't sloppiness, they're **staleness from the repo split this
session did** — the docs describe a monorepo layout (`OFFLINE-ONLY-POS/`, `DASHBOARD/`,
`disect-Hacienda/`) that no longer matches the physical repo (`shelfPos/`, `shelfDashboard/`,
`disect-Hacienda` dropped entirely), plus one pre-existing version-number lag and one pre-existing
hardcoded personal path that predate the split.

## Priority backlog (see `02-findings.md` for full detail)

1. **91 occurrences of `OFFLINE-ONLY-POS` and 41 of `DASHBOARD/`** across 27 of 42 files — all
   stale relative to the actual folder names now (`shelfPos/`, `shelfDashboard/`). This is a
   mechanical, repo-wide find-and-replace, but it's large enough that it's worth deciding *whether*
   to do it at all first (see the framing note below) before blindly running a sed pass.
2. **Version number stale**: `shelfpos_context.md` and 5 wiki pages say POS is `1.6.4` /
   `sync-service` `1.6.4` — actual current version (per `shelfPos/package.json` and its
   `RELEASE_NOTES.md`) is **1.7.0**. Dashboard's `1.5.1` is correct.
3. **`disect-Hacienda/` is referenced 18 times across 5 wiki pages** as if it's sitting in a
   sibling folder ready to vendor from — it no longer exists anywhere in this local checkout
   (dropped during the repo split, per your earlier decision to consume it as a dependency later
   instead). The content itself (architecture plan, CABYS mapping, TODO phases) is still valid
   forward-looking design, it just needs a note that the toolkit isn't currently vendored in-repo.
4. **1 broken wiki-link**: `[[RELEASE_NOTES]]` in `wiki/23-Hacienda-Factura-Electronica-TODO.md`
   points to `OFFLINE-ONLY-POS/RELEASE_NOTES.md` (now `shelfPos/RELEASE_NOTES.md`), which was never
   inside this Obsidian vault to begin with — pre-existing broken link, not caused by the split.
5. **Hardcoded personal path**, already flagged in the original project-wide review:
   `llm/08-codebase-graph.md:7` links to `/Users/Jay/.cursor/projects/...` — dead for anyone else,
   pre-existing, unrelated to the split.
6. **Self-inflicted inconsistency**: the `shelfDocs/README.md` I wrote during the repo-split step
   says "Related repos: `shelfpos-pos`, `shelfpos-dashboard`" — that was the naming *before* you
   asked for camelCase. Should say `shelfPos` / `shelfDashboard`. Easy, low-risk fix, flagging
   rather than silently editing to stay consistent with the findings-only pattern from the other
   two audits.

## A framing note before acting on #1

`shelfDocs` documents the *system* (ShelfPOS as a product), not literally "the file layout of
this specific local checkout." The repo-split and rename you did this session is a local
reorganization for your own dev workflow — the docs' use of `OFFLINE-ONLY-POS/` and `DASHBOARD/`
as component names may be intentional (those are the actual folder names in whatever repo
structure ships/gets published, or were until this session). Worth deciding: are `shelfPos` /
`shelfDashboard` the **new permanent names** going forward, or a **temporary local arrangement**?
That answer determines whether #1 is "update 27 files" or "leave as-is, it's correct for the
published structure." I haven't assumed either way.

## What's in this directory

- `02-findings.md` — full findings list
- `raw/link-check-output.txt` + `raw/check_links.cjs` — the link-checker script and its output,
  so the "0 broken .md links" claim is independently reproducible

## Not done

- No fixes applied — findings-only, matching the `shelfPos`/`shelfDashboard` passes.
- This wraps up the planned per-package audit (shelfPos → shelfDashboard → shelfDocs), unless you
  want a deeper pass on any one of the three.
