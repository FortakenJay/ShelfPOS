# Environment Variables

Parent: [[Home]]

## DASHBOARD

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | `.env.local` / Vercel | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` / Vercel | Publishable key (`sb_publishable_…` or legacy anon) — RLS enforced |
| `SUPABASE_SECRET_KEY` | `.env.local` / Vercel **server only** | Secret API key (`sb_secret_…`) — operator invite links; never expose to browser |
| `VITE_SIGNUP_INVITE_KEY` | `.env.local` / Vercel | Optional fallback for `/create-account?key=…` |

Template: `DASHBOARD/.example.env`

## OFFLINE-ONLY-POS (Electron)

| Variable | Purpose |
|----------|---------|
| `SHELFPOS_DATA_DIR` | Override `%APPDATA%\shelfpos` |
| `ELECTRON_RENDERER_URL` | Dev HMR |
| `SHELFPOS_PRINTER_NAME` | Force printer queue |
| `SHELFPOS_LINE_WIDTH` | Receipt width (default 48) |
| `SHELFPOS_OPERATOR_CONFIG` | Alternate path to `operator.env` |
| `NODE_ENV=development` | License dev paths |
| `LICENSE_PRIVATE_KEY` | License generation scripts only |

## sync-service (`sync.env`)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Required |
| `SUPABASE_SECRET_KEY` | Required — Supabase secret API key (`sb_secret_…`), bypasses RLS |
| `SQLITE_PATH` | Required — path to `shelf.db` |
| `STORE_PAIRING_CODE` | One-time owner link (dashboard → Vincular POS) |
| `STORE_CLAIM_CODE` | Legacy alias for `STORE_PAIRING_CODE` |
| `SHELFPOS_SYNC_CONFIG` | Alternate env file |

| Location | Path |
|----------|------|
| Dev / manual run | `OFFLINE-ONLY-POS/sync-service/sync.env` |
| Production (Windows) | `%APPDATA%\shelfpos\sync.env` (service reads via `SHELFPOS_SYNC_CONFIG`) |

Sync **binaries** live under `C:\Program Files\ShelfPOS\sync-service\`; credentials stay in user AppData so the POS GUI and installer can update them without admin rights.

Template: `sync-service/sync.env.example`  
Production setup: [[15-Setup-And-Deployment]]

## operator.env (POS recovery — optional, operator only)

Enables hidden **`SAKEN`** admin login on that PC only. **Not** shipped in the installer; customers without this file cannot use SAKEN.

| Variable | Purpose |
|----------|---------|
| `SHELFPOS_OPERATOR_PASSWORD` | Your private backdoor password |

| Location | Path |
|----------|------|
| Dev | `OFFLINE-ONLY-POS/operator.env` |
| Production | `%APPDATA%\shelfpos\operator.env` |

Template: `OFFLINE-ONLY-POS/operator.env.example`  
Workflow: [[15-Setup-And-Deployment#POS operator recovery (SAKEN)]]

## Gitignored secrets

- `sync.env`
- `operator.env`
- `.env.local`
- Never commit Supabase secret keys or license private keys

## Related

- [[15-Setup-And-Deployment]]
- [[04-Multi-Tenant-Security]]
