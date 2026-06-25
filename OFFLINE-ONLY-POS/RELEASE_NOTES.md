# ShelfPOS release notes

## 1.6.1

### Nuevo — impresión en lote (Productos)

- **Etiquetas en lote** y **Códigos de barras en lote**: cola con búsqueda/escaneo estilo caja, copias por producto (1–99), dos modos en la barra de Productos.
- Etiqueta de exhibición: nombre grande en negrita, precio enorme; sticker CODE128 con dígitos bajo las barras (HRI).
- Sin código imprimible: se usa y guarda el **ID numérico** del producto para escaneo en caja.
- Tras crear producto: modal para imprimir etiqueta o código de barras.
- Térmica: montos con **¢** (CP850); pantalla sigue con **₡**. Pie de recibo con aclaración.

### Corrección

- Esquema IPC: restaurado import de `zod` (rompía typecheck).
- Búsqueda numérica en lote ya no oculta coincidencias por nombre/código; toast de búsqueda ambigua restaurado.

### Calidad

| Check | Resultado |
|-------|-----------|
| `npm run lint` | Pasa |
| React Doctor (`--scope changed`) | **97 / 100** |
| Bugbot (rama local) | Sin hallazgos tras correcciones |

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.6.1 | `npm run release:win` → `ShelfPOS-1.6.1-win.zip` |
| Sync service | 1.6.1 | Incluido en ZIP; sin cambios de protocolo |
| Dashboard | 1.5.0 | Sin cambios en esta release |

---

## 1.5.0 — Beta (producción)

Primera versión beta en tiendas reales (cliente piloto + tienda de mamá). Alpha interna cerrada.

### Correcciones de edge cases (antes del ship)

- Sync verifica `store_access` al arrancar; limpia `sync_owner_claimed` obsoleto tras wipe en Supabase.
- Cola de sync procesada en serie (evita races sale_items / sales).
- Instalador: perfil del cajero vía `UserAppData` (UAC); `pending_sync_store_id` si aún no hay `shelf.db`.
- Re-instalación conserva `STORE_PAIRING_CODE` en `sync.env`.
- Advertencia si la clave de Supabase parece anon/publishable.

### POS (Electron)

- Carritos con pestañas (heredado de 1.4.0).
- Cierre de cajero: resumen de caja en cajón; sin totales de ventas duplicados arriba.
- Vincular panel (`/sync-setup`): código de emparejamiento; estado `linked` requiere servicio activo.

### Sync (`@shelfpos/sync-service` 1.5.0)

- Misma versión que POS para releases empaquetados.
- Backfill (`npm run backfill`) lee `%APPDATA%\shelfpos\sync.env` con DPAPI.
- Documentación de operación: [[19-Edge-Cases-And-Runbooks]].

### Dashboard (1.5.0)

- Reporte resumen: desglose diario en rangos multi-día + total del período.
- Movimientos de caja: paginación real (sin tope de 500 filas).
- Vincular POS: UI unificada (nombre de caja + código en una fila).
- Invitación por correo: flujo `/accept-invite` corregido.
- Portal operador: facturación, recordatorios Discord, gestión de tiendas.

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.5.0 | `npm run release:win` → `ShelfPOS-1.5.0-win.zip` |
| Sync service | 1.5.0 | Incluido en ZIP; `Install-ShelfPOS` |
| Dashboard | 1.5.0 | Deploy Vercel (`DASHBOARD/`) |

---

## 1.4.0

### Carritos con pestañas (cart tabs)

- Varios carritos activos en caja, estilo pestañas del navegador.
- Cada pestaña guarda el carrito completo: artículos, descuentos, precios modificados, líneas misc (`3000*`), cliente/factura.
- Las pestañas persisten al reiniciar la app (SQLite `cart_tabs`, solo local — no se sincronizan).
- Atajos: **Ctrl+T** nuevo carrito; **Ctrl+1** … **Ctrl+8** cambiar de pestaña.
- Cerrar pestaña vacía: sin PIN. Cerrar con artículos: PIN de caja o gerente → bitácora + sección **Carritos descartados** en cierre (pantalla, tiquete impreso y PDF).
- Cobrar cierra la pestaña activa y pasa a la siguiente.

### Calidad (1.4.0)

| Check | Resultado |
|-------|-----------|
| `npm run lint` | Pasa (typecheck + ESLint) |
| React Doctor (`--scope changed`) | **97 / 100** |
| Bugbot (rama local) | Hallazgos de carreras tab/pago y cierre corregidos |

Correcciones de robustez incluidas: bloqueo al cobrar durante guardado de pestaña, `complete` de pestaña tras venta con reintento, descarte auditado en transacción SQLite, cierre de cajero muestra carritos descartados del turno, bitácora con acciones traducidas.

### Esquema

- SQLite **v19**: tabla `cart_tabs`.

### Sin cambios de sync

- `cart_tabs` no entra en `sync_queue` ni en Supabase — **no hace falta actualizar `SUPA.sql`**.
- Las filas de `audit_log` del descarte (`cart_tab_discarded_*`) sí se sincronizan como siempre; el Dashboard solo necesita las claves i18n de acción (ya en `DASHBOARD/src/locales/`).

---

## Versiones anteriores

Ver historial de git / tags del repositorio.
