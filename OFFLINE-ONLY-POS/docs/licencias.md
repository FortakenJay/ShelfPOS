# ShelfPOS — Licencias (JWT)

Guía detallada para configurar el sistema de licencias, generar claves JWT para clientes, activarlas y resolver problemas.

**Tiempo estimado**

| Tarea | Primera vez | Siguientes clientes |
|-------|-------------|---------------------|
| Configurar par de llaves RSA | 5 min | — (solo una vez) |
| Generar JWT para un cliente | 2 min | 1–2 min |
| Activar en el PC del cliente | 2 min | 2 min |

> Para instalar la app en el cliente (USB o TeamViewer), usa también:
> - [instalacion-usb.md](./instalacion-usb.md)
> - [instalacion-remota.md](./instalacion-remota.md)

---

## Índice

1. [Cómo funciona](#cómo-funciona)
2. [Requisitos](#requisitos)
3. [Configuración inicial (una sola vez)](#configuración-inicial-una-sola-vez)
4. [Obtener el ID de equipo](#obtener-el-id-de-equipo)
5. [Generar el JWT (clave de licencia)](#generar-el-jwt-clave-de-licencia)
6. [Entregar y activar la licencia](#entregar-y-activar-la-licencia)
7. [Modo desarrollo vs producción](#modo-desarrollo-vs-producción)
8. [Renovar, vencer o cambiar de PC](#renovar-vencer-o-cambiar-de-pc)
9. [Actualizar la app sin reactivar](#actualizar-la-app-sin-reactivar)
10. [Solución de problemas](#solución-de-problemas)
11. [Seguridad](#seguridad)
12. [Registro interno (plantilla)](#registro-interno-plantilla)
13. [Comandos de referencia](#comandos-de-referencia)

---

## Cómo funciona

ShelfPOS usa licencias **offline** firmadas con RSA:

```mermaid
flowchart TB
  subgraph tu_pc [Tu PC — soporte]
    A[license.private.pem] --> B[npm run license:generate]
    B --> C[JWT firmado RS256]
  end
  subgraph cliente [PC del cliente]
    D[Pantalla activación → ID de equipo]
    E[Pegar JWT → Activar]
    F[license.enc cifrado en %APPDATA%]
    G[license.pub.pem embebida en la app]
  end
  C --> E
  D --> B
  E --> F
  G --> E
```

| Pieza | Qué es | Dónde vive |
|-------|--------|------------|
| **Llave privada** | Firma los JWT. Solo tú la tienes. | `%USERPROFILE%\.shelfpos\license.private.pem` (por defecto) |
| **Llave pública** | Verifica la firma en la app instalada | `src/main/license.pub.pem` (se empaqueta al compilar) |
| **ID de equipo** | Huella del hardware (`machine_id`) | Lo muestra la pantalla de activación |
| **JWT** | Clave de licencia (una línea larga) | La generas tú y se la das al cliente |
| **license.enc** | JWT cifrado guardado en el PC del cliente | `%APPDATA%\shelfpos\license.enc` |

### Contenido del JWT

Al generar una licencia, el token incluye:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `machine_id` | Sí | Debe coincidir exactamente con el ID del PC del cliente |
| `client_name` | Sí | Nombre del negocio (visible internamente) |
| `issued_at` | Sí | Fecha de emisión (Unix timestamp) |
| `expires_at` | No | Vencimiento (Unix timestamp). Si omites `--expires`, la licencia no vence |

Algoritmo de firma: **RS256** (RSA 2048 bits).

---

## Requisitos

### En tu PC (desarrollo / soporte)

| Requisito | Notas |
|-----------|--------|
| Node.js + npm | Para ejecutar los scripts de licencia |
| Repo `OFFLINE-ONLY-POS` | Carpeta del proyecto |
| Llave privada RSA | Se crea con `npm run license:keypair` (ver abajo) |
| Copia de seguridad de la llave privada | USB cifrado, gestor de secretos, etc. |

### En el PC del cliente

| Requisito | Notas |
|-----------|--------|
| ShelfPOS instalado | Instalador compilado con `npm run dist` |
| Windows 10/11 (64-bit) | Mismo equipo donde correrá el POS |
| Pantalla de activación | Aparece al abrir la app si no hay licencia válida |

---

## Configuración inicial (una sola vez)

Solo necesitas hacer esto **la primera vez** que emitas licencias (o si rotas las llaves).

### Paso 1 — Ir al proyecto

```powershell
cd C:\Users\Jay\Desktop\ShelfPOS\OFFLINE-ONLY-POS
npm install
```

### Paso 2 — Generar el par de llaves RSA

```powershell
npm run license:keypair
```

Salida esperada:

```text
Private key written to C:\Users\<TuUsuario>\.shelfpos\license.private.pem
Public key written to src/main/license.pub.pem
Set LICENSE_PRIVATE_KEY_PATH if you store the private key elsewhere.
```

**Qué crea cada archivo:**

| Archivo | Ubicación | Uso |
|---------|-----------|-----|
| `license.private.pem` | `%USERPROFILE%\.shelfpos\` | Firmar JWT — **nunca** compartir |
| `license.pub.pem` | `src/main/license.pub.pem` | Va dentro del instalador al compilar |

### Paso 3 — Respaldo de la llave privada

1. Copia `C:\Users\<TuUsuario>\.shelfpos\license.private.pem` a un lugar seguro.
2. **No** subas la llave privada a Git (la carpeta `private/` ya está en `.gitignore` si prefieres guardarla ahí).
3. Si pierdes la llave privada, **no podrás firmar licencias** compatibles con instaladores ya desplegados (tendrías que regenerar par y recompilar todas las apps).

### Paso 4 — (Opcional) Ubicación personalizada de la llave privada

Si quieres guardar la privada en otra ruta (por ejemplo `private\license.private.pem`):

```powershell
$env:LICENSE_PRIVATE_KEY_PATH = "C:\ruta\segura\license.private.pem"
npm run license:keypair
```

O define la variable de forma permanente en Windows (variables de entorno de usuario).

También puedes pasar el contenido PEM sin archivo:

```powershell
$env:LICENSE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----`n...`n-----END PRIVATE KEY-----"
```

(Útil en CI; en local es más cómodo el archivo.)

### Paso 5 — Compilar el instalador con la llave pública correcta

Cada vez que generes un **nuevo** `license.pub.pem`, debes recompilar antes de instalar en clientes:

```powershell
npm run dist
```

El instalador queda en:

```text
OFFLINE-ONLY-POS\dist\ShelfPOS Setup 1.0.0.exe
```

> **Importante:** El JWT solo es válido si la app del cliente fue compilada con el mismo `license.pub.pem` que corresponde a tu llave privada.

---

## Obtener el ID de equipo

El `machine_id` identifica **un solo PC**. Sin él no puedes generar la licencia.

### En el PC del cliente (recomendado)

1. Instala y abre **ShelfPOS**.
2. Aparece la ventana **Activación de licencia**.
3. Copia el valor del campo **ID de equipo** (cadena hexadecimal larga).
4. Guárdalo en tu registro interno antes de generar el JWT.

### En tu PC de desarrollo (solo pruebas)

Para conocer el ID de **tu** máquina:

```powershell
cd C:\Users\Jay\Desktop\ShelfPOS\OFFLINE-ONLY-POS
npm run license:machine-id
```

Imprime una línea con el ID. Úsalo solo para probar activación en tu equipo.

> En instalaciones reales, **siempre** usa el ID que muestra la pantalla de activación en el PC del cliente, no el de tu laptop.

---

## Generar el JWT (clave de licencia)

Todos los comandos se ejecutan en **tu PC**, dentro de `OFFLINE-ONLY-POS`.

### Licencia sin vencimiento

```powershell
npm run license:generate -- --machine-id <ID_DEL_CLIENTE> --client "Nombre del negocio"
```

Ejemplo:

```powershell
npm run license:generate -- --machine-id a1b2c3d4e5f6... --client "Tienda La Esquina"
```

La terminal imprime **una sola línea** — ese es el JWT completo. Cópialo entero.

### Licencia con fecha de vencimiento

```powershell
npm run license:generate -- --machine-id <ID> --client "Nombre" --expires 2026-12-31
```

- Formato de fecha: `AAAA-MM-DD`
- La licencia vence al final de ese día (23:59:59 hora local del script).

### Guardar en archivo

```powershell
npm run license:generate -- --machine-id <ID> --client "Nombre" > licencia-cliente.txt
```

El archivo debe contener **exactamente una línea** (el JWT), sin espacios ni saltos extra al final.

### Parámetros del script

| Parámetro | Obligatorio | Descripción |
|-----------|-------------|-------------|
| `--machine-id` | Sí | ID copiado de la pantalla de activación del cliente |
| `--client` | Sí | Nombre del negocio (texto libre, entre comillas si tiene espacios) |
| `--expires` | No | Fecha `AAAA-MM-DD`; si se omite, no hay vencimiento |

### Errores al generar

| Error | Causa | Solución |
|-------|--------|----------|
| `Missing --machine-id` | Falta el ID | Añade `--machine-id <ID>` |
| `Missing --client` | Falta el nombre | Añade `--client "Nombre"` |
| `Private key not found` | No existe la llave privada | Ejecuta `npm run license:keypair` o configura `LICENSE_PRIVATE_KEY` / `LICENSE_PRIVATE_KEY_PATH` |
| `Invalid date` | Fecha mal escrita | Usa formato `2026-12-31` |

---

## Entregar y activar la licencia

### Cómo enviar el JWT al cliente

| Método | Cuándo usarlo |
|--------|----------------|
| WhatsApp / correo | Pegar la línea JWT (es seguro: solo vale en ese PC) |
| Archivo `licencia-cliente.txt` | USB, correo con adjunto, carpeta compartida |
| En sitio | Generas en tu laptop y pegas al momento |

**No envíes nunca** `license.private.pem`.

### Activación en el PC del cliente

1. Abre **ShelfPOS** (o la ventana de activación si ya está abierta).
2. Pega el JWT completo en **Clave de licencia**.
3. Clic en **Activar**.
4. Si es correcto: mensaje *Licencia activada correctamente* y continúa el asistente inicial.

### Después de activar

1. **Idioma** — Español o 中文.
2. **Asistente inicial** — Cuentas de administrador, cajero, inventario, PINs.
3. **Configuración** — Nombre de tienda, impresora, etc.

Checklist rápido:

- [ ] Activación exitosa
- [ ] Login cajero → venta de prueba
- [ ] Login admin → productos y cierre
- [ ] JWT guardado en tu registro interno

---

## Modo desarrollo vs producción

| Aspecto | Desarrollo (`npm run dev`) | Producción (instalador / `npm run start` tras build) |
|---------|----------------------------|--------------------------------------------------------|
| ¿Exige licencia? | **No** — se omite la verificación | **Sí** |
| Pantalla de activación | No aparece en dev normal | Aparece si falta o es inválida `license.enc` |
| Probar activación local | Usa `npm run build` + `npm run start` | Igual que el cliente |

Para probar el flujo completo de licencia en tu PC:

```powershell
npm run build
npm run start
```

---

## Renovar, vencer o cambiar de PC

### Renovar licencia vencida

Genera un JWT nuevo con fecha futura (o sin `--expires`):

```powershell
npm run license:generate -- --machine-id <MISMO_ID> --client "Nombre" --expires 2027-12-31
```

El cliente pega el nuevo JWT en activación (sustituye la licencia anterior).

### Cambiar de computadora

El `machine_id` es distinto en otro PC. Debes:

1. Instalar ShelfPOS en el equipo nuevo.
2. Copiar el **nuevo** ID de equipo.
3. Generar un JWT nuevo con ese ID.
4. Activar en el equipo nuevo.

La licencia del PC anterior deja de usarse en el nuevo (cada JWT está atado a un `machine_id`).

### Reinstalar Windows en el mismo PC

Depende de si el ID de hardware cambia. Si tras reinstalar el ID es **distinto**, genera licencia nueva. Si el ID es el **mismo** y `%APPDATA%\shelfpos\license.enc` sigue intacto, puede no hacer falta reactivar.

---

## Actualizar la app sin reactivar

1. En tu PC: `npm run dist` (misma `license.pub.pem` que antes).
2. En el cliente: ejecutar el nuevo instalador **encima** de la instalación anterior.
3. **No hace falta** nuevo JWT si `%APPDATA%\shelfpos\license.enc` no se borró.

Solo necesitas reactivar si:

- Borraron `%APPDATA%\shelfpos\`
- Cambiaste el par de llaves y recompilaste con nueva `license.pub.pem`
- La licencia venció o quieres cambiar términos

---

## Solución de problemas

### En la app del cliente

| Mensaje | Causa probable | Solución |
|---------|----------------|----------|
| Licencia para otro equipo | `machine_id` del JWT ≠ ID de este PC | Regenerar JWT con el ID **exacto** de este equipo |
| Licencia inválida o alterada | JWT cortado, espacios, firma no válida, o app compilada con otra llave pública | Pegar JWT completo; recompilar app con el `license.pub.pem` que corresponde a tu privada |
| Licencia vencida | `expires_at` en el pasado | Generar licencia nueva con `--expires` futuro o sin vencimiento |
| No hay licencia activa | Falta `license.enc` | Activar con un JWT válido |
| Ingrese una clave de licencia | Campo vacío | Pegar el JWT |

### Al ejecutar `license:keypair`

| Error | Solución |
|-------|----------|
| `existsSync is not a function` | Actualiza el repo (bug corregido en `scripts/generate-keypair.js`) |
| Permiso denegado al escribir | Ejecutar PowerShell como usuario con permisos en `%USERPROFILE%\.shelfpos\` |

### Al ejecutar `license:generate`

| Error | Solución |
|-------|----------|
| `Private key not found at ...` | Ejecutar `npm run license:keypair` primero |
| JWT muy corto al pegar | Copiar toda la línea; no partir el token en varios mensajes |

### Verificar manualmente (avanzado)

Rutas en el cliente:

```text
%APPDATA%\shelfpos\license.enc    ← licencia cifrada (no editar)
```

Si borras `license.enc`, la app pedirá activación de nuevo.

---

## Seguridad

| Hacer | No hacer |
|-------|----------|
| Guardar copia cifrada de `license.private.pem` | Subir la privada a Git, Discord, correo, USB del cliente |
| Enviar solo el JWT al cliente | Enviar la llave privada |
| Registrar cliente, ID, fecha y vencimiento | Reutilizar el mismo JWT en otro PC (no funcionará) |
| Rotar llaves solo con plan (nueva pub + reinstalar + reactivar todos) | Regenerar `license:keypair` sin aviso si ya hay clientes en producción |

El JWT **solo funciona** en el PC cuyo `machine_id` fue usado al generarlo. Compartirlo por WhatsApp es aceptable desde el punto de vista de “no abre otros equipos”.

---

## Registro interno (plantilla)

Copia esto por cada cliente:

```text
CLIENTE: _______________________
NEGOCIO (--client): _______________________
FECHA EMISIÓN: __________
VENCIMIENTO: __________  (o "sin vencimiento")
MACHINE ID: ________________________________________________
JWT (opcional, o referencia a licencia-cliente.txt): _______________
INSTALADOR VERSIÓN: ShelfPOS Setup _______
NOTAS: _______________________________________________________
```

---

## Comandos de referencia

```powershell
# Ir al proyecto
cd C:\Users\Jay\Desktop\ShelfPOS\OFFLINE-ONLY-POS

# 1. Una sola vez: crear par de llaves
npm run license:keypair

# 2. Compilar instalador (después de keypair o cambio de pub)
npm run dist

# 3. ID de equipo (solo pruebas en TU PC)
npm run license:machine-id

# 4. Generar licencia (sin vencimiento)
npm run license:generate -- --machine-id <ID> --client "Nombre del negocio"

# 5. Generar licencia (con vencimiento)
npm run license:generate -- --machine-id <ID> --client "Nombre" --expires 2026-12-31

# 6. Guardar JWT en archivo
npm run license:generate -- --machine-id <ID> --client "Nombre" > licencia-cliente.txt

# 7. Probar build de producción localmente
npm run build
npm run start
```

### Scripts npm (package.json)

| Comando | Script | Descripción |
|---------|--------|-------------|
| `npm run license:keypair` | `scripts/generate-keypair.js` | Crea llave privada + `src/main/license.pub.pem` |
| `npm run license:machine-id` | `scripts/get-machine-id.ts` | Imprime ID del equipo actual |
| `npm run license:generate` | `scripts/generate-license.ts` | Firma y emite el JWT |

### Variables de entorno (opcional)

| Variable | Uso |
|----------|-----|
| `LICENSE_PRIVATE_KEY_PATH` | Ruta al archivo `.pem` privado |
| `LICENSE_PRIVATE_KEY` | Contenido PEM inline (con `\n` escapados si hace falta) |

---

## Flujo completo resumido

```text
[Una vez]
  npm install
  npm run license:keypair          → privada en ~/.shelfpos/, pública en src/main/
  npm run dist                     → instalador con license.pub.pem

[Por cada cliente]
  Cliente instala ShelfPOS
  Cliente copia ID de equipo
  npm run license:generate -- --machine-id <ID> --client "Nombre"
  Cliente pega JWT → Activar
  Asistente inicial + prueba POS
```

Para el detalle de instalación por USB o TeamViewer, continúa en:

- [instalacion-usb.md](./instalacion-usb.md)
- [instalacion-remota.md](./instalacion-remota.md)
