# ShelfPOS release notes

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
