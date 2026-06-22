# POS Renderer

Parent: [[Home]]

**Entry:** `OFFLINE-ONLY-POS/src/renderer/src/main.tsx`  
**Routes:** `router.tsx` (code-based TanStack Router)

## API boundary

All main-process calls go through:

`features/*` → `lib/api.ts` → `window.api.invoke(channel, payload)`

**Never** import `better-sqlite3`, Electron, or Supabase in renderer.

## Feature folders

`src/renderer/src/features/`

| Feature | Routes / screens |
|---------|------------------|
| `auth/` | Login, first-run wizard, language |
| `shell/` | Sidebar, collapse, language switcher |
| `pos/` | Terminal, payment, cart, cash drawer, reprints |
| `products/` | Catalog CRUD, CSV/eFactura import, labels |
| `admin/` | Reports, cierre, audit, users, settings, export |
| `admin/dashboard/` | **Local** SQLite dashboard (offline KPIs) |

## Hooks pattern

Each feature exposes hooks (e.g. `usePOSTerminal`, `useProductManager`) containing TanStack Query/mutation logic. Components are render-only.

## Locales

`src/shared/locales/es.json`, `zh-CN.json` — shared with main for error keys.

`LanguageSwitcher` in `components/LanguageSwitcher.tsx` — segmented ES / 中文.

## Roles (POS)

| Role | Typical access |
|------|----------------|
| `sales` | POS terminal, reprints |
| `product_manager` | Products, stock |
| `admin` | All admin screens, settings, users |

IPC enforces roles again in main process.

## Related

- [[09-IPC-Reference]]
- [[07-POS-Main-Process]]
- [[17-Conventions-For-AI]]
