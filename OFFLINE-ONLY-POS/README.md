# ShelfPOS

Fully offline, single-device Windows desktop POS system for small retail shops in Costa Rica. Electron + React 19 + SQLite. Bilingual: Español (default) / 简体中文.

## Stack

- Electron (main + renderer), `electron-vite`, `electron-builder` (NSIS)
- React 19, TanStack Router (code-based), TanStack Query v5
- SQLite via `better-sqlite3` (main process only, WAL mode)
- Tailwind CSS v4, i18next
- `@node-escpos/core` + `@node-escpos/usb-adapter` for Epson TM-T20II receipt printing

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

## Data & backups

- Database: `%APPDATA%\shelfpos\shelf.db` (WAL mode, integrity-checked on startup)
- Automatic backups: `%APPDATA%\shelfpos\backups\shelf-YYYY-MM-DD.db` (daily on launch + on every cierre, last 7 kept)
- Pre-migration backups are written before any schema migration runs.

## Printer notes

- Epson TM-T20II via USB. On Windows the `usb` library may require the WinUSB driver for the printer interface (installable with Zadig).
- Spanish receipts print with code page PC850. Chinese printing requires a CJK-capable printer (GB18030); a capability test runs on first launch when 中文 is selected. If the printer is not CJK-capable, printing is skipped in Chinese mode (the sale still completes) and the job lands in the retryable print queue.

## First run

1. Language picker (Español / 中文)
2. CJK printer test (only if 中文 chosen)
3. Creation of the three fixed accounts (admin / cashier / inventory) + manager PIN (4-6 digits)
4. Login

Returns and cierre de caja are gated by the manager PIN. There is no user-management UI by design.
