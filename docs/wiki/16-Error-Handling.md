# Error Handling

Parent: [[Home]]

## POS (Electron)

### Main process

```typescript
throw new AppError('errors.outOfStock', { name: 'sales:create' })
```

- **Never** `throw new Error(...)` in IPC — becomes `errors.unknown`
- Map SQLite errors: `UNIQUE` → `errors.barcodeExists`, FK → `errors.productInUse`

### Locales

Every `AppError` key in **both**:

- `OFFLINE-ONLY-POS/src/shared/locales/es.json`
- `OFFLINE-ONLY-POS/src/shared/locales/zh-CN.json`

### Renderer

`toastApiError(toasts, err)` — interpolates `ApiError.vars`

### Stock

Race-safe: `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`

## Dashboard

- Query errors: route-level `isError` + i18n keys under `errors.*`
- No raw Supabase messages to users
- Auth errors from `signIn` / `signUp` return `error.message` (Supabase auth)

## Sync service

- Queue failures logged to `sync.txt` with `[RETRY]` / `[GAVE_UP]`
- Fatal startup errors → same log + `process.exit(1)`

## Related

- [[09-IPC-Reference]]
- [[10-Sync-Service]]
- [[17-Conventions-For-AI]]
- [[18-Quality-And-Tooling]]
