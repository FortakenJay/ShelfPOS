# Architecture Decision Records

ShelfPOS design decisions — read these to understand **why**, not only **what**.

| ADR | Title |
|-----|-------|
| [ADR-001](ADR-001-sqlite-source-of-truth.md) | SQLite as source of truth (offline-first) |
| [ADR-002](ADR-002-one-way-sync-queue.md) | One-way sync via queue + Windows service |
| [ADR-003](ADR-003-electron-ipc-boundary.md) | Electron IPC boundary (no DB in renderer) |
| [ADR-004](ADR-004-multi-tenant-rls.md) | Multi-tenant RLS + pairing codes |

## Template for new ADRs

```markdown
# ADR-NNN: Title
**Status:** Proposed | Accepted | Superseded
## Context
## Decision
## Alternatives considered
## Consequences
```

## Related

- [LLM context](../shelfpos_context.md)
- [Wiki: Architecture](../wiki/02-Architecture.md)
