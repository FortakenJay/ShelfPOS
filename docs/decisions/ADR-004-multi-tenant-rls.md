# ADR-004: Multi-Tenant RLS + Pairing Codes

**Status:** Accepted

## Context

One Supabase project serves many store owners (multi-tenant SaaS). Without isolation, any logged-in user could read all mirrored sales.

## Decision

- Every mirror row has `store_id`.
- `store_access` maps `auth.users.id` → stores with role `owner` | `viewer`.
- RLS policy `can_access_store(store_id)` on all mirror tables.
- POS links to owner via **single-use 24h pairing code** → `claim_store_sync` (service role only).
- Superadmin role in JWT `app_metadata.role` bypasses for support.

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Separate Supabase project per store | Ops cost; no central operator panel |
| Shared DB, no RLS | Unacceptable data leak |
| Owner enters store_id manually | Typo / hijack risk |

## Consequences

- Sync service holds secret key — physical access to POS PC is sensitive.
- Cloud wipe removes `store_access` — registers must re-pair.
- Composite PK `(id, store_id)` — never assume global id uniqueness.

## Related

- `DASHBOARD/SUPA.sql`
- `docs/wiki/04-Multi-Tenant-Security.md`
