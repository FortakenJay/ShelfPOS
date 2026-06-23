# IPC Reference

Parent: [[Home]]

## Registration

- **Channels list:** `OFFLINE-ONLY-POS/src/shared/types.ts` → `IPC_CHANNELS`
- **Zod schemas:** `OFFLINE-ONLY-POS/src/shared/schemas/ipc.ts`
- **Handlers:** `OFFLINE-ONLY-POS/src/main/ipc/*.ts`
- **Hub:** `ipc/index.ts` → `registerIpcHandlers()`

## Pattern

```typescript
handle(channel, allowedRoles, inputSchema, async (input, ctx) => {
  // throw AppError('errors.key') on business failures
  return result // wrapped in ApiResult by helper
})
```

Preload whitelists channels — only listed channels can be invoked.

## Handler modules

| File | Domain |
|------|--------|
| `auth.ts` | Login, logout, session |
| `firstRun.ts` | Wizard, language |
| `settings.ts` | Store config, PINs, language |
| `products.ts` | CRUD, import, labels, stock |
| `sales.ts` | Checkout, reprint, factura PDF export |
| `returns.ts` | Returns + restock |
| `reports.ts` | Local report generation |
| `cierre.ts` | Shift close |
| `cash.ts` | Float, movements |
| `audit.ts` | Audit queries |
| `cart.ts`, `discount.ts`, `priceOverride.ts` | PIN-gated overrides |
| `cartTabs.ts` | Multi-cart tabs (list/create/save/discard/complete) |
| `dashboard.ts` | Local admin KPIs |
| `users.ts` | POS user CRUD |
| `printQueue.ts` | Failed print retry |
| `printer.ts` | Drawer kick, status, test print, colon test |
| `syncSetup.ts` | Cloud sync config, restart `ShelfPOSSync` |
| `backup.ts` | Backup / CSV export |

## Sales channels (examples)

Inspect `IPC_CHANNELS` for full list (~67 channels). Common:

- `sales:create` — checkout transaction + enqueue
- `sales:exportFacturaPdf` — A4 invoice PDF
- `cartTabs:*` — POS cart tabs (`list`, `create`, `save`, `remove`, `complete`, `discardAudited`, `reorder`)
- `cierre:confirm` — shift close + thermal print (`buildCierreLines`, includes discarded tabs from `audit_log`)
- `cierre:print`, `cierre:exportPdf` — re-print / PDF for a past cierre (same line template)

## Sync side effect

Mutations that change mirrored data call `enqueueSync(table, rowId, op, db)` inside the transaction.

Tables: see [[05-SQLite-Schema]] `SYNC_TABLES`.

## Related

- [[03-Data-Flow]]
- [[16-Error-Handling]]
- [[07-POS-Main-Process]]
