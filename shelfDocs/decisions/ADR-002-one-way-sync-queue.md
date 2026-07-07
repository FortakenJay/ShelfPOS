# ADR-002: One-Way Sync via Queue + Windows Service

**Status:** Accepted

## Context

Owners need cloud visibility without giving the dashboard write access to live sales data. Multiple registers per store must push independently.

## Decision

1. POS main process enqueues rows in `sync_queue` inside the **same SQLite transaction** as the business write.
2. A separate **ShelfPOSSync** Windows Service polls the queue and upserts to Supabase via REST with a **secret API key**.
3. Dashboard users read via **anon key + JWT + RLS** — writes to mirror tables are denied.

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Renderer pushes to Supabase | Breaks offline-first; exposes keys |
| Electron main pushes directly | Blocks UI; couples app lifecycle to network |
| Supabase Realtime pull | Wrong direction; still needs local authority |
| Full-table nightly sync | Too slow; loses near-real-time dashboard |

## Consequences

- Sync can lag seconds to minutes; queue retries heal transient failures.
- Secret key on each PC is a trust boundary — mitigated by per-store `store_id` and RLS.
- Claim flow (`store_pairings`) required before owner sees data.

## Related

- `sync-service/src/sync.ts`
- `docs/wiki/10-Sync-Service.md`
