# Edge Cases And Runbooks

Parent: [[Home]]

Operational pitfalls for **installation**, **POS**, **sync service**, and **dashboard**. Several high-severity items were **fixed in code for v1.5.0** (see [Fixed in 1.5.0](#fixed-in-150) below).

---

## Fixed in 1.5.0

| Issue | Fix |
|-------|-----|
| Stale `sync_owner_claimed` after cloud wipe | Sync checks `store_access` on startup; clears local flag and retries claim when pairing code present |
| Install before first launch → `store_a` | Installer writes `pending_sync_store_id`; POS applies on first open |
| Elevated installer → wrong `%APPDATA%` | UAC elevation passes original user `UserAppData` through to elevated script |
| Re-install drops pairing code | `write-sync-env.cjs` preserves existing `STORE_PAIRING_CODE` when not re-entered |
| Queue parent/child ordering races | Sync processes batch **sequentially** instead of `Promise.all` |
| Anon key at install | Installer warns when key looks like anon/publishable |

Still manual / doc-only: multi-register same `store_id`, wrong Supabase project URL, wipe with service running, `sync.txt` under service account profile.

---

```text
Unique sync_store_id (SQLite settings)
  == store_id on every pushed mirror row
  == store_id passed to claim_store_sync
  == store_access.store_id for the owner

One register  →  one sync_store_id  →  one pairing code  →  one claim

Service running + correct SQLITE_PATH + decryptable secret key

Linking grants access only — it does NOT backfill history.
After cloud wipe: new pairing code + sync_owner_claimed=0 + stop service during wipe
```

---

## Installation (Windows)

### Install order: Setup vs Install-ShelfPOS vs first POS launch

| Order | Risk |
|-------|------|
| **Setup → Install-ShelfPOS → first POS launch** | Best case: `shelf.db` exists when `set-store-id.cjs` runs. |
| **Install-ShelfPOS before first POS launch** | Installer writes `pending_sync_store_id`; first POS launch applies it (v1.5.0+). Legacy: re-run installer after Setup. |
| **Install then change StoreId on re-run** | Overwrites `sync_store_id`; new queue rows use new id; old cloud partition may be orphaned. |

**Fix:** Run POS once (creates `shelf.db`), then re-run `Install-ShelfPOS` with correct `StoreId`, or use `scripts/set-store-id.cjs` manually.

### Elevated installer → wrong user profile

`Install-ShelfPOS.ps1` writes `sync.env` and `SQLITE_PATH` using **the current user’s** `%APPDATA%`. If you run the installer **as Administrator**, that is often the **admin** profile — not the cashier who runs ShelfPOS.

**Symptom:** Service points at a `shelf.db` the POS never writes to; queue empty on service side, sales only local.

**Fix (v1.5.0+):** Installer passes cashier `UserAppData` through UAC. Legacy: run installer as cashier or fix `SQLITE_PATH`.

### Re-run installer overwrites pairing

`write-sync-env.cjs` **fully rewrites** `sync.env`. Re-running `Install-ShelfPOS` **without** `-StoreClaimCode` drops an existing `STORE_PAIRING_CODE`.

**Fix (v1.5.0+):** Re-install preserves existing code automatically. Or save code before upgrade; pass `-StoreClaimCode`.

### Multi-register vs “per shop”

| Rule | Detail |
|------|--------|
| **One `sync_store_id` per register (caja)** | Two PCs with the same id → last-write-wins corruption in mirror. |
| **One pairing code per register** | First claim consumes the code; second register needs a new code. |
| **Same display name, different registers** | Installer deliberately does **not** reuse an existing cloud `store_id` when `StoreName` matches — avoids merging registers. |

Checklist item in [[15-Setup-And-Deployment]]: unique id **per register**, not only per shop.

### `SHELFPOS_DATA_DIR` override

POS can use a custom data directory. `sync.env` `SQLITE_PATH` is updated from POS when saving pairing (via `getDbPath()`). Installer always assumes default `%APPDATA%\shelfpos\shelf.db`.

**Symptom:** Custom data dir + default installer path → service reads wrong DB.

### Store name validation warning at install

`Could not validate existing stores for '…'` means the installer could not query Supabase `stores` (network, wrong URL/key, or RLS). Install **continues** with a derived `store_id` (e.g. `Testing1` → `store_testing1`).

Not fatal — verify `SUPABASE_URL` and secret key if unexpected.

### DPAPI secret key

`SUPABASE_SECRET_KEY` is stored as `dpapi:…` (Windows DPAPI **LocalMachine**). Encrypted blob is **machine-bound** — copying `sync.env` to another PC fails.

Plaintext keys work for dev. Corrupt/wrong-machine blob → service exits immediately on startup.

### `StartPending` right after Install-ShelfPOS (often a false alarm)

`install-windows-service.cjs` prints **`ShelfPOSSync service is running.`** when **node-windows** fires its `start` event. That is **not** the same as Windows SCM reporting `RUNNING`.

`Install-ShelfPOS.ps1` then waits only **2 seconds** and calls `Get-Service`. On a slow PC the service can still be **`StartPending`** even though registration succeeded.

| What you saw | Meaning |
|--------------|---------|
| `ShelfPOSSync service is running.` (from node-windows) | Wrapper accepted the start request — optimistic |
| `Install finished but ShelfPOSSync is not running (status: StartPending)` (red, from `.ps1`) | SCM not settled yet — **often OK** |
| `sc.exe query shelfpossync.exe` → `STATE: 4 RUNNING` after 15–30s | Install actually succeeded — ignore the red line |
| Stays `StartPending` > 60s or flips to `Stopped` | Real failure — see below |

**Verify (wait before panicking):**

```powershell
Start-Sleep -Seconds 20
sc.exe query shelfpossync.exe
Get-Service shelfpossync.exe
```

If `STATE: 4 RUNNING`, you are done. Optional: `Restart-Service shelfpossync.exe` once to confirm it survives a stop/start.

**If it stops or never reaches RUNNING:**

1. WinSW logs: `C:\Program Files\ShelfPOS\sync-service\logs\` (wrapper stdout/stderr)
2. Foreground (shows the real Node error):

```powershell
$env:SHELFPOS_SYNC_CONFIG = "$env:APPDATA\shelfpos\sync.env"
& "C:\Program Files\ShelfPOS\sync-service\node.exe" "C:\Program Files\ShelfPOS\sync-service\dist\index.js"
```

3. Common causes: missing `dist\index.js` (stale ZIP), missing `sync.env`, wrong `SQLITE_PATH`, DPAPI key from another machine, `sync.env` written under admin profile instead of cashier (see elevated installer above).

See also [[10-Sync-Service#winsw--node-windows-chain]].

---

## Sync service

### Service name vs display name

| What | Value |
|------|-------|
| Display name | `ShelfPOSSync` |
| Internal / `sc.exe` | `shelfpossync.exe` |
| POS restart helper | `shelfpossync.exe` |

```powershell
sc.exe query shelfpossync.exe
Restart-Service shelfpossync.exe
```

### Where logs live (two places)

| Log | Path |
|-----|------|
| WinSW service logs | `C:\Program Files\ShelfPOS\sync-service\logs\` |
| `sync.txt` (claim/retry errors) | **Service account** `%APPDATA%\shelfpos\error\` — often `C:\Windows\System32\config\systemprofile\AppData\Roaming\shelfpos\error\` when running as LocalSystem |

Do not assume `sync.txt` is under the cashier’s profile.

### Wrong API key shape

| Key in `sync.env` | Typical result |
|-------------------|----------------|
| **Secret** (`sb_secret_…` or legacy JWT service_role) | Upserts + claim work |
| **Anon / publishable** | `checkConnectivity` HEAD may succeed; upserts and `claim_store_sync` fail (401/403) |

No format validation at install — failure appears on first API call.

### `store_id` frozen until service restart

`readStoreId()` runs once at startup. Changing SQLite `sync_store_id` while the service runs has no effect until restart.

### Claim failure is non-fatal

`claimStoreIfNeeded` logs errors and continues syncing mirror rows. Owner may see **nothing** (RLS) until claim succeeds.

### Stale `sync_owner_claimed` after cloud wipe

After `wipe-supabase-mirror-data.sql`, `store_access` and `store_pairings` are gone, but local SQLite may still have `sync_owner_claimed = 1`.

**Symptom:** POS reports linked; dashboard empty; claim never retried.

**Fix (v1.5.0+):** Sync service verifies `store_access` on startup and clears stale flag. Stop service → new code on `/link-pos` → POS `/sync-setup` → restart.

### Queue gave up (`status = error`)

After **10** retries per row, queue entry stops syncing. Dashboard may show **partial** data (e.g. sales without line items).

**Fix:** `npm run queue:diagnose` in `sync-service/`; read `sync.txt`; fix root cause; reset row to `pending` or run backfill.

### Backfill

```powershell
cd OFFLINE-ONLY-POS\sync-service
npm run backfill
```

- Loads `%APPDATA%\shelfpos\sync.env` first (with DPAPI decrypt), then repo `sync.env`.
- Pushes live SQLite rows directly; **does not** create `store_access`.
- Prefer **service stopped**; running service causes harmless duplicate upserts.
- Local queue can show `synced` while cloud was wiped — backfill repopulates mirror; claim still required for dashboard visibility.

### Cloud wipe procedure

See `DASHBOARD/scripts/wipe-supabase-mirror-data.sql` (BEFORE/AFTER row counts, OK/FAIL check).

| Step | Why |
|------|-----|
| Confirm **production** Supabase project URL | Wrong project = data loss on wrong tenant |
| Apply latest `SUPA.sql` if schema drifted | Idempotent DDL + column patches |
| Close POS | Stops new queue rows |
| Stop ShelfPOSSync | Prevents immediate re-upsert |
| Run SQL as **postgres** role | `authenticated`/`anon` delete 0 rows (RLS) |
| Verify AFTER counts are 0 | Script prints per-table counts |
| Re-pair every register | Wipe truncates `store_access` + `store_pairings` |

**Keeps:** `auth.users` (dashboard logins), schema, indexes, RLS, RPCs. Optional commented block can remove non-superadmin auth users — superadmin is never deleted by default.

**Does not wipe:** local `shelf.db` on registers. Optional per-PC: delete `%APPDATA%\shelfpos\shelf.db` and re-run Setup on test machines only.

---

## Dashboard

### “Sync works, dashboard empty”

| Cause | Check |
|-------|-------|
| Claim never ran | `STORE_PAIRING_CODE` missing in `sync.env` |
| Wrong Supabase project | Dashboard `VITE_SUPABASE_URL` ≠ sync `SUPABASE_URL` |
| Wrong store selected | Multi-store owner; `localStorage` store id |
| Cloud wiped, stale local claim | See stale `sync_owner_claimed` above |
| RLS / schema | `SUPA.sql` not applied; user has no `store_access` |

### Home vs Reports date range

**Dashboard home** KPIs emphasize **today** (and recent activity). Historical days (e.g. last month) → **Reports** with date range. Summary report shows **per-day rows** for multi-day ranges plus period total.

### Store linking UI

| Route | Behavior |
|-------|----------|
| `/link-pos` | Owner generates codes; does not auto-create first code (user clicks add register) |
| `NoStoresPage` | Auto `ensure_store_pairing` when zero stores (not on `/link-pos`) |
| Superadmin | Redirected to `/admin` — cannot use link UI |

### Invite / password flows

| Path | Notes |
|------|-------|
| Operator invite → `/accept-invite` | Supabase `detectSessionInUrl`; do not sign out after code consumed |
| Legacy `/create-account?key=` | Requires `VITE_SIGNUP_INVITE_KEY`; lands on `/dashboard` (may hit no-stores) |
| Post-login | Superadmin → `/admin`; owner → `/dashboard` |

### Pagination limits (current code)

| Page | Limit |
|------|-------|
| **Cash movements** | Paginated 25/50/100 (default 50) — no 500-row cap |
| **Cierres** | Hard fetch cap **500**; shows `500+` warning if more |
| **Audit** | 25/50/100 paginated |
| **Reports inventory** | Max **200** per page; export fetches all pages |
| **Query `.in()` chunks** | 500 ids per batch in reports/dashboard |

### Superadmin vs owner

- Superadmin: `app_metadata.role = "superadmin"`; sees **all** stores; operator portal at `/admin`.
- Support browsing `/dashboard` with a store selected shows that tenant’s data — not “all shops at once.”

### Billing cron (operator)

- GitHub Action daily 14:00 UTC → `POST /api/billing-reminders` with `BILLING_CRON_SECRET`.
- Requires `DISCORD_BILLING_WEBHOOK_URL` + `SUPABASE_SECRET_KEY` on server.
- Reminders fire on **exact** UTC date match (7 days before due, on due date) — timezone edge cases for CR shops.

---

## POS (offline app)

### Cart tabs

Local-only `cart_tabs` table — **not synced**. Open carts survive tab switch; discarded tabs may audit via `audit_log` (synced).

### Barcode scanner (scans but item not added)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Barcode appears in search box, nothing added | Burst timing failed (`scanner_burst_ms` too low) or product missing from catalog | Raise threshold to **50–100 ms** (Admin → Settings); verify barcode in Products |
| “Producto no encontrado” toast | `byBarcode` miss — code not in DB or inactive/deleted | Fix catalog row |
| Stock toast, no line added | `addToCart` blocked | Restock or reduce qty |
| Nothing happens, search empty | Modal open (pay, PIN, customer) or cash float blocked | Close modal / open float |
| Works on second scan, not first | Pre-fix: stale React state on Enter; ensure app is current | Restart POS after update |

**Settings key:** `scanner_burst_ms` in SQLite `settings` (default 30). See [[08-POS-Renderer#Barcode scanner (USB HID)]].

### Batch label / barcode print

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Batch feels slow | Each batch IPC calls `probePrinter()`; labels print **sequentially** per product/copy (serialized `enqueuePrinterTask`) | Expected for thermal RAW; reduce queue size or copies |
| “Varios productos coinciden” | Enter on ambiguous search | Pick from dropdown (by design) |
| Numeric search misses name match | — | Fixed: `searchProducts` runs `LIKE` then merges exact id |
| Product without código won’t sticker | — | Batch barcode mode assigns **product id** as CODE128 on first print |
| Copies reset to 1 | Empty copies field on add | Blank while typing is OK; empty on add defaults to **1** |

See [[08-POS-Renderer#product-label-printing-thermal]].

### Misc items (`PRECIO*`)

No catalog row; `sale_items.product_id` is NULL. **Not returnable** by design. Sales with only misc lines omitted from return search.

### Cierre (cashier)

Cierre page shows **cash drawer summary** and count/confirm flow — not top-line sales totals (those live in reports/admin as needed).

### `linked` status in POS

`syncSetup:status` `linked` requires **both** `sync_owner_claimed = 1` **and** Windows service **running**. Service stopped → `linked: false` even if previously claimed.

### POS sync setup GUI (`/sync-setup`)

Updates **pairing code only** — cannot fix wrong `SUPABASE_URL` or secret key from UI. Misconfigured URL/key → re-run installer or hand-edit `sync.env`.

---

## Quick symptom → action

| Symptom | First actions |
|---------|----------------|
| Owner sees no stores | Verify claim log; check `store_access`; new pairing code + `/sync-setup` |
| Sales on POS, not on dashboard | Same `store_id`? Service running? `queue:diagnose`; backfill if cloud was wiped |
| `store_a` in production | Install before first launch; run `set-store-id.cjs` |
| Wipe “did nothing” | SQL Editor role = postgres; was sync stopped? |
| Partial dashboard data | Queue `error` rows; `sync.txt` `[GAVE_UP]` |
| Two registers overwrite each other | Unique `sync_store_id` per PC |
| Invite link “invalid” | Expired; use operator reset-password or new invite |
| Movements “missing” old rows | Paginate — no longer capped at 500 |
| Barcode in search, not in cart | [[19-Edge-Cases-And-Runbooks#Barcode scanner (scans but item not added)]] — raise `scanner_burst_ms`; check catalog/stock |
| `no such column: stock_provider` | POS on old schema — restart app so migration **v20** runs; apply `SUPA.sql` on Supabase |

---

## Related

- [[15-Setup-And-Deployment]]
- [[10-Sync-Service]]
- [[11-Dashboard]]
- [[04-Multi-Tenant-Security]]
- [[14-Environment-Variables]]
