# Multi-store hub — implementation TODO

Parent: [[20-Multi-Store-Hub-Architecture]]  
Status: **Backlog** — design only, no code yet.

Use this as the implementation checklist. Check items in Obsidian as completed.

---

## Phase 0 — Flagship proof (business)

- [ ] Confirm flagship store is **greenfield hub install** vs merging existing `store_*_register_N` Supabase rows
- [ ] Document hub PC spec (dedicated mini PC + UPS; not shared with inventory reboots)
- [ ] WiFi survey: router placement, DHCP reservation for hub, SSID/password handoff template
- [ ] Training script: cajero (POS), inventario (productos), manager (cierre + conflict queue)

---

## Phase 1 — Spec and ADRs

- [ ] Write ADR: store hub authority model (SQLite on hub, clients via LAN API)
- [ ] Write ADR: offline checkout outbox + replay conflict policy
- [ ] Define LAN API surface (OpenAPI or shared Zod): products read, sales create, stock adjust, settings read
- [ ] Define install profiles: `store_server` | `store_client_checkout` | `store_client_inventory`
- [ ] Define discovery: static IP + optional mDNS
- [ ] Map IPC channels that move to hub vs stay local (printer, license, cart tabs?)

---

## Phase 2 — Hub server MVP

- [ ] New hub mode in main process (or sidecar Node service on hub PC)
- [ ] HTTP API wrapping existing repos (`products`, `sales`, `stock`, `users` auth)
- [ ] Session / PIN auth over LAN (reuse existing user PIN validation on hub)
- [ ] Hub binds LAN only; TLS optional (v1: trusted store LAN)
- [ ] Health endpoint for clients (`/health`, schema version, hub `sync_store_id`)
- [ ] **Single writer** — all mutations serialize through hub SQLite transactions
- [ ] ShelfPOSSync unchanged but reads **hub** `%APPDATA%\shelfpos\shelf.db` only

---

## Phase 3 — Checkout client MVP

- [ ] Client config: hub URL, `terminal_code`, profile `checkout`
- [ ] Local **product cache** table (sync from hub on interval + on demand)
- [ ] POS sale flow calls hub API when reachable
- [ ] Local **sale outbox** SQLite (or JSON queue) when hub unreachable
- [ ] UI badge: online / modo local / pendiente sincronizar
- [ ] Receipt print uses hub-returned consecutivo (or provisional local number + reconcile?)
- [ ] Cart tabs remain **local per checkout client** (per existing cierre design)

---

## Phase 4 — Offline replay and conflicts

- [ ] Outbox replay worker on hub reconnect (FIFO per terminal)
- [ ] Stock check on replay — failures → `sale_replay_conflicts` table
- [ ] Admin UI: list conflicts, actions (void line, force, adjust stock)
- [ ] Audit events: `offline_sale_queued`, `offline_sale_replayed`, `sale_replay_conflict`
- [ ] Tests: two clients sell last unit offline → one conflict on replay

---

## Phase 5 — Multi-checkout scale (5 cajas)

- [ ] Unique `terminal_code` per client (installer step 1–5)
- [ ] Per-terminal consecutivo sequences on hub (`branch` + `terminal` + tipo doc)
- [ ] Per-terminal **cierre** scoped by `terminal_code`
- [ ] Per-terminal cash float / movements on hub
- [ ] Dashboard: verify mirrored sales include `terminal_code` (schema + sync payload if missing)

---

## Phase 6 — Inventory clients (3 PCs)

- [ ] Profile `inventory`: hide POS routes / `sales` role disabled at install
- [ ] All product CRUD + receive flows → hub API only
- [ ] Hub down → read-only product browse; block receive/adjust with clear toast
- [ ] Admin priority merge on concurrent product edits
- [ ] Supplier PDF / CSV / eFactura import runs on **hub** (move or proxy existing services)

---

## Phase 7 — Installer and ops

- [ ] `Install-ShelfPOS.ps1` branches: Store Server vs Client
- [ ] Client installer: pick hub, assign terminal number OR inventory workstation
- [ ] Hub installer: store display name → single `sync_store_id`; **stop** creating per-register store IDs
- [ ] Migrate doc for legacy `store_*_register_N` → merge into one store (Supabase script + manual QA)
- [ ] Runbook: hub down, outbox depth, conflict resolution, WiFi change IP
- [ ] Update [[15-Setup-And-Deployment]] and [[19-Edge-Cases-And-Runbooks]]

---

## Phase 8 — Quality and release

- [ ] Integration tests: hub + 2 clients on loopback
- [ ] Load smoke: 5 parallel sales on WiFi (lab)
- [ ] `graphify update` after code changes
- [ ] Release notes + version bump
- [ ] Pilot on importer flagship store before client tiendas

---

## Deferred (network / HQ — not hub v1)

- [ ] Importer HQ catalog golden record + push to stores
- [ ] Multi-store operator dashboard (importer sees all linked tiendas)
- [ ] Client tienda onboarding at scale (10–200 shops)
- [ ] Postgres hub if lane count exceeds ~40

---

## Open decisions

| # | Question | Default recommendation |
|---|----------|----------------------|
| 1 | Dedicated hub PC? | Yes — do not co-locate with inventory |
| 2 | Max offline outbox age | 24h then manager review |
| 3 | Provisional receipt number offline | Show “pendiente Hacienda/sync” footer |
| 4 | TLS on LAN | v2; v1 trusted store WiFi |
