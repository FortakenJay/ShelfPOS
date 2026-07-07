# ADR-001: SQLite as Source of Truth (Offline-First)

**Status:** Accepted  
**Date:** 2025 (ShelfPOS v1.x)

## Context

Retail POS must keep selling when internet fails. Costa Rica shops often have unreliable connectivity.

## Decision

All sales, inventory mutations, and cash operations write to **local SQLite** (`shelf.db`) on the cashier PC. The POS Electron app never requires network for checkout.

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Cloud-only POS (Supabase direct) | Checkout stops when offline |
| PWA + IndexedDB | Weaker transaction guarantees; printing/licensing on Windows |
| Firebase Realtime DB | Vendor lock-in; harder multi-tenant SQL reports |

## Consequences

- Dashboard data is eventually consistent via background sync.
- Each register needs backup/recovery for local DB.
- Schema migrations run on app startup in main process.

## Related

- [ADR-002](ADR-002-one-way-sync-queue.md)
- `docs/wiki/02-Architecture.md`
