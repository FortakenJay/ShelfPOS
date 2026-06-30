# ShelfPOS

Fully offline, single-device Windows desktop POS system for small retail shops in Costa Rica. Electron + React 19 + SQLite. Bilingual: Español (default) / 简体中文.

## Stack

- Electron (main + renderer), `electron-vite`, `electron-builder` (NSIS)
- React 19, TanStack Router (code-based), TanStack Query v5
- SQLite via `better-sqlite3` (main process only, WAL mode)
- Tailwind CSS v4, i18next
- `@node-escpos/core` + `@node-escpos/usb-adapter` (legacy; production printing uses Windows RAW ESC/POS)

## Development

```bash
npm install        # also rebuilds native modules for Electron (postinstall)
npm run dev        # dev mode with HMR
npm run typecheck  # typecheck main+preload and renderer
```

## Packaging

```bash
npm run dist       # NSIS installer in dist/
npm run dist:dir   # unpacked build (faster, for smoke testing)
```

The installer never touches `%APPDATA%\shelfpos` — user data survives updates and uninstall.

Release notes: [`RELEASE_NOTES.md`](RELEASE_NOTES.md) (current: **1.6.4**).

## Data & backups

- Database: `%APPDATA%\shelfpos\shelf.db` (WAL mode, integrity-checked on startup)
- Automatic backups: `%APPDATA%\shelfpos\backups\shelf-YYYY-MM-DD.db` (daily on launch + on every cierre, last 7 kept)
- Pre-migration backups are written before any schema migration runs.

## Printer notes

- Epson **TM-T81III** and **TM-T20** series via USB on Windows, using the Epson Advanced Printer Driver (APD) and RAW ESC/POS.
- Install the APD package (e.g. `APD_612_T81III_WM` for TM-T81III). ShelfPOS auto-detects the Windows print queue on startup.
- Prefer the **Receipt** queue (e.g. `EPSON TM-T81III Receipt`). If only a generic `EPSON TM-T81III` queue exists, ShelfPOS writes ESC/POS directly to the USB port.
- Override detection with env var `SHELFPOS_PRINTER_NAME` if the queue has a custom name.
- Spanish receipts and labels print amounts as **CRC** + digits on thermal output (e.g. `CRC 3200`). On-screen UI still shows **₡**.
- Product labels: shelf etiquetas and barcode stickers from **Productos**; batch modals support up to 99 copies per product. CSV export streams the full catalog (see `docs/wiki/07-POS-Main-Process.md#product-csv-export-catalog-backup`). See `docs/wiki/08-POS-Renderer.md`.

## First run

1. Language picker (Español / 中文)
2. CJK printer test (only if 中文 chosen)
3. Creation of the three fixed accounts (admin / cashier / inventory) + manager PIN (4-6 digits)
4. Login

Returns and cierre de caja are gated by the manager PIN. There is no user-management UI by design.

## Cloud sync (optional)

Sales and inventory mirror to **Supabase** for the owner dashboard via a separate **Windows Service** (`ShelfPOSSync`):

- POS writes `sync_queue` rows in the same transaction as business data
- Service polls every 5s, upserts rows to Supabase (one-way mirror)
- Install: `Install-ShelfPOS.ps1` after the POS setup; config in `%APPDATA%\shelfpos\sync.env`

Full architecture: `docs/wiki/10-Sync-Service.md`
