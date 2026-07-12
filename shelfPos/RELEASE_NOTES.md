# ShelfPOS release notes

## Unreleased

### Nueva función — Precios 2 y 3 por producto

- Productos acepta **Precio 2** y **Precio 3** opcionales, separados del precio por mayor automático.
- Caja muestra los precios almacenados disponibles al cambiar el precio de una línea.
- Elegir Precio 2 o Precio 3 no pide PIN; cualquier otro precio personalizado conserva la autorización por PIN.
- Inventario muestra y permite editar ambos precios alternativos.
- Importación/exportación CSV incluye las columnas opcionales `price2` y `price3`; archivos anteriores siguen funcionando.
- SQLite v26–v27 y el mirror de Supabase agregan `products.price2` / `products.price3`. Ejecutar el `SUPA.sql` actualizado al desplegar.
- `SUPA.sql` sigue siendo idempotente (no borra ventas/productos). Al final limpia triggers viejos de auto-RLS (`ensure_rls`); el RLS de las tablas se mantiene explícito en la sección 5.

### Limpieza — auditoría DRY

- Unifica validación de productos, clasificación Precio 1/2/3, totales de carrito, parsers de dinero por fuente, errores de import, métodos de pago y claves TanStack Query.
- Import CSV/eFactura: un solo análisis preview/apply; rechaza confirmación si el archivo cambió (`errors.productImportSourceChanged`).
- Sync: manifiesto compartido live + backfill (incluye clientes / crédito). Reinstalar sync service después del deploy.
- Stock sale/ajuste/devolución permanece separado a propósito (DRY-09). Estado PIN modal diferido (DRY-15).
- Detalle: `docs/DRY_AUDIT.md`.

### QA — Vitest + Playwright Electron

- Unit tests + 8 smokes E2E (login, venta, Precio 2, bulk+Precio 1, crédito, devolución bloqueada, CRUD producto, idioma).
- Scripts: `npm run test`, `test:e2e`, `test:qa`. CI: `.github/workflows/qa.yml`.
- Guía: `docs/QA.md`.

---

## 1.8.0

### Nueva función — cuentas de crédito

- Clientes persistentes con nombre, teléfono, estado y saldo pendiente.
- Caja acepta **Crédito** como método completo o combinado con efectivo, tarjeta y SINPE.
- Toda venta a crédito exige seleccionar un cliente activo; el saldo se actualiza dentro de la misma transacción.
- **Cobrar deuda** permite pagos parciales por efectivo, tarjeta o SINPE, con referencia y nota.
- Caja puede crear un cliente desde el selector de crédito usando únicamente nombre y teléfono.
- Los montos en colones se redondean al múltiplo de ₡10 más cercano.
- Administración incluye alta, edición, desactivación y estado de cuenta del cliente.

### Nueva función — compras del cliente en Caja

- La barra de navegación existente agrega la pestaña **Deudas pendientes**, que abre la pantalla de ventas a crédito por cliente.
- Cada cliente muestra cantidad de carritos pendientes y saldo total.
- Al entrar, cada carrito muestra fecha, saldo y una vista previa de hasta cuatro artículos.
- Al abrir un carrito se ve el contenido completo. **Cobrar ahora** registra un pago dirigido a ese saldo, sin volver a vender artículos ni descontar inventario por segunda vez.
- Las devoluciones de una venta a crédito se bloquean mientras esa venta tenga deuda pendiente.

### Datos y sincronización

- SQLite **v24–v25**: cuentas de crédito, más `credit_payments.sale_id` para cobrar un carrito específico.
- Supabase agrega mirrors `customers` y `credit_payments`, más las columnas de ventas/cierres.
- El sync service prioriza clientes antes de ventas y enlaza pagos de deuda con cierres.
- Antes de desplegar el POS, ejecutar el `SUPA.sql` actualizado. Como cambió el sync service, reinstalarlo desde el ZIP de release.

### Versionado (`X.Y.Z`)

- **X — versión mayor:** cambio grande o incompatible. Ejemplo: `1.8.0` → `2.0.0`.
- **Y — función:** nueva capacidad compatible. Esta release sube `1.7.4` → `1.8.0`.
- **Z — corrección:** arreglo compatible sin función principal nueva. Ejemplo: `1.8.0` → `1.8.1`.

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.8.0 | `npm run release:win` → `ShelfPOS-1.8.0-win.zip` |
| Sync service | 1.8.0 | Incluido en ZIP; reinstalar con `Install-ShelfPOS` |
| Dashboard | 1.5.3 | Sin cambio de app; ejecutar el `SUPA.sql` actualizado |

---

## 1.7.1

### Corrección — código de barras bloqueado en producto eliminado

- **Síntoma:** búsqueda/escaneo → “producto no encontrado”; al crear o importar el mismo código → “Ya existe un producto con ese código de barras”.
- **Causa:** productos con **soft-delete** (`deleted_at`) no aparecen en catálogo, pero SQLite mantiene `barcode UNIQUE` en todas las filas.
- **Fix (SQLite v21):** al eliminar, el código se renombra a `@deleted:{id}:{barcode}` para liberar el código real; migración v21 aplica lo mismo a filas ya eliminadas.
- **Helpers:** `releaseBarcodeForReuse`, `tombstoneBarcodeValue` en `db/repos/products.ts`; llamados en `insertProductRow`, `updateProductCatalogFields`, `softDeleteProduct`, `assignProductBarcode`.
- **Supabase:** sin cambios — el mirror no tiene UNIQUE global en `barcode`; el dashboard ya filtra `deleted_at IS NULL`.

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.7.1 | `npm run release:win` → `ShelfPOS-1.7.1-win.zip` |
| Sync service | 1.7.1 | Incluido en ZIP; sin cambios de protocolo |
| Dashboard | 1.5.1 | Sin cambios en esta release |

---

## 1.7.0

### Mejora — importar factura de proveedor (PDF)

- **Recibir mercadería** → **Factura PDF**: elige un PDF de factura de proveedor; el main extrae líneas con `pdf-parse` (`productSupplierInvoicePdf.ts`).
- Vista previa en `SupplierInvoicePreviewModal`: emparejar por código de barras, crear productos nuevos o actualizar costo/stock existentes.
- IPC: `products:importSupplierInvoicePreview` / `products:importSupplierInvoiceConfirm`.
- Stock aplicado con motivo `received_shipment`; auditoría en la misma transacción.

### Mejora — recibir mercadería (UI)

- El modal **Recibir mercadería** ofrece solo **PDF**, **CSV** y **eFactura** — ya no duplica **Nuevo producto** del toolbar.
- Creación manual de un producto: botón **Nuevo producto** en la barra de herramientas.

### Refactor — código compartido y deduplicación

- Módulos compartidos: `src/shared/node/parseEnv.ts`, `dpapi-win.ts`, `pendingStoreId.ts` (main + sync-service vía `sync-service/scripts/sync-vendor.mjs`).
- Repos de productos: `insertProductRow`, `updateProductCatalogFields`, `updateProductCostPrice` — usados por CSV, eFactura y factura PDF.
- IPC: helpers `runBatchPrint`, `openImportFilePath`, `confirmProductImport`; `authorizeWithDiscountPin` en `authorize.ts`.
- Renderer: `usePinAuthorize`, `useSaleReceiptActions`, `notifyPrintFailure`, consolidación de pestañas en `usePOSTerminal`.

### Calidad

- React Doctor (POS): **100 / 100** en escaneo completo (`npx react-doctor@latest --verbose --scope full`).
- `doctor.config.json` ignora copias generadas en `sync-service/src/vendor/**`.
- Grafo de código actualizado (`graphify update .` en `OFFLINE-ONLY-POS/` y raíz del monorepo).

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.7.0 | `npm run release:win` → `ShelfPOS-1.7.0-win.zip` |
| Sync service | 1.7.0 | Incluido en ZIP; sin cambios de protocolo |
| Dashboard | 1.5.1 | Deploy Vercel (`DASHBOARD/`) |

---

## 1.6.4

### Corrección — carritos abiertos tras cierre de turno (POS)

- Al confirmar **cierre**, los carritos con productos en caja se vacían automáticamente (`resetCartTabsForNewShift`).
- Cada carrito no vacío se audita como `cart_tab_discarded_cierre` y aparece en el ticket/PDF del cierre.
- La pantalla de cierre avisa con **Carritos abiertos en caja** antes de confirmar (`heldCartTabs` en `cierre:preview`).
- La cajera en POS recibe un carrito vacío nuevo sin tener que borrar/crear manualmente (`usePOSTerminal` sincroniza al invalidar `cartTabs`).

### Corrección — cierre de sesión en Dashboard

- Tras **cerrar sesión**, `StoreProvider` redirige a `/login` en lugar de mostrar la pantalla de “sin tiendas”.

### Mejora — exportación CSV de productos (inventario grande)

- **Exportar productos CSV** incluye todo el catálogo activo, no solo la página visible en la tabla.
- Exportación por streaming (`productCsvExport.ts`): lotes por `id`, memoria estable para inventarios de 100k+ productos.
- **Código de barras** se exporta como texto (`="…"`) para que Excel/Sheets no conviertan códigos largos a notación científica.
- Escritura atómica (`*.tmp` → renombrar): si falla la exportación, el archivo anterior no queda truncado.
- Re-importación acepta el formato de texto de hoja de cálculo.

### Mejora — versión visible en inicio de sesión (POS)

- La pantalla de **login** muestra `vX.Y.Z` en la esquina inferior izquierda (solo ahí).
- La versión sale de `package.json` en build (`VITE_APP_VERSION` en `electron.vite.config.ts`) — útil para soporte remoto (“¿qué versión tiene instalada?”).

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.6.4 | `npm run release:win` → `ShelfPOS-1.6.4-win.zip` |
| Sync service | 1.6.4 | Incluido en ZIP; sin cambios de protocolo |
| Dashboard | 1.5.1 | Deploy Vercel (`DASHBOARD/`) |

---

## 1.6.3

### Corrección — Productos / inventario (pantallas pequeñas)

- **Acciones por fila** (Ajustar stock, Imprimir etiqueta, Imprimir código de barras, Editar, Eliminar): ya no se recortan con etiquetas largas en español; la tabla usa scroll horizontal y los botones hacen wrap.
- **Barra de herramientas**: título y botones se apilan en pantallas estrechas para que importación, lote y **Nuevo producto** sigan visibles.

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.6.3 | `npm run release:win` → `ShelfPOS-1.6.3-win.zip` |
| Sync service | 1.6.3 | Incluido en ZIP; sin cambios de protocolo |
| Dashboard | 1.5.0 | Sin cambios en esta release |

---

## 1.6.2

### Corrección — TM-T81III (etiquetas y recibos)

- **¢** en CP850 (`0xBD`, fila b × col d): ya no imprime **E** por `ESC E` (bold) a 2×/3×.
- Etiquetas: cent y monto en comandos separados; cent a escala menor que el precio en T81III.
- Recibos: negrita vía double-strike (`ESC G`) en lugar de emphasis (`ESC E`).
- Refactor ESC/POS en `escPosRender.ts`; aviso si etiqueta excede 20 mm.

### Despliegue

| Componente | Versión | Acción |
|------------|---------|--------|
| POS Windows | 1.6.2 | `npm run release:win` → `ShelfPOS-1.6.2-win.zip` |
| Sync service | 1.6.2 | Incluido en ZIP; sin cambios de protocolo |
| Dashboard | 1.5.0 | Sin cambios en esta release |

---

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
