# ADR-003: Electron IPC Boundary (No DB in Renderer)

**Status:** Accepted

## Context

Electron renderers are attack surfaces. SQL and secrets must stay in the main process.

## Decision

- Renderer calls `window.api.invoke(channel, payload)` only through `lib/api.ts`.
- Preload whitelists channels; Zod validates every payload in main.
- **No** `better-sqlite3`, **no** Supabase, **no** raw filesystem in renderer components.

Layering: `components` → `hooks` → `api.ts` → IPC → `repos`.

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Node integration in renderer | Security risk |
| Shared SQLite in renderer | Crash isolation; harder to enforce roles |
| tRPC over localhost | Extra complexity vs typed IPC |

## Consequences

- Every new capability needs: channel in `types.ts`, schema in `ipc.ts`, handler in `ipc/*.ts`, method in `api.ts`.
- Business rules enforced twice: renderer (UX toasts) + IPC (authoritative).

## Related

- `docs/wiki/09-IPC-Reference.md`
- `docs/wiki/17-Conventions-For-AI.md`
