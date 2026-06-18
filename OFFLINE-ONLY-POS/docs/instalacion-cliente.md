# ShelfPOS — Instalación en el PC del cliente

Guía paso a paso para **descargar, instalar y dejar funcionando** ShelfPOS en una tienda (Windows 10/11), incluyendo la sincronización con Supabase.

**Tiempo estimado:** 20–40 minutos (primera vez).

> Guías relacionadas:
> - [instalacion-remota.md](./instalacion-remota.md) — instalación por TeamViewer (soporte)
> - [instalacion-usb.md](./instalacion-usb.md) — instalación con memoria USB
> - [licencias.md](./licencias.md) — generación y activación de licencias

---

## Resumen

| Qué se instala | Dónde queda |
|----------------|-------------|
| App ShelfPOS (caja) | Menú Inicio → ShelfPOS |
| Base de datos local | `%APPDATA%\shelfpos\shelf.db` |
| Servicio de sync | `C:\Program Files\ShelfPOS\sync-service\` |
| Config de sync | `C:\Program Files\ShelfPOS\sync-service\sync.env` |
| Licencia | `%APPDATA%\shelfpos\license.enc` |

La caja funciona **sin Internet**. El servicio **ShelfPOS Sync** sube ventas y datos a Supabase cuando hay conexión, y **arranca solo** cada vez que enciende el PC.

---

## Parte 1 — Preparar el paquete (tú / soporte)

Ejecuta esto en tu PC de desarrollo, dentro de `OFFLINE-ONLY-POS`:

```powershell
cd C:\Users\Jay\Desktop\ShelfPOS\OFFLINE-ONLY-POS
npm install
npm run release:win
```

Al terminar tendrás un ZIP listo para enviar al cliente:

```text
OFFLINE-ONLY-POS\release\ShelfPOS-<versión>-win.zip
```

Ejemplo: `ShelfPOS-1.2.0-win.zip`

### Contenido del ZIP

```text
ShelfPOS-1.2.0-win/
  ShelfPOS Setup 1.2.0.exe    ← instalador de la app
  Install-ShelfPOS.ps1        ← script que instala app + sync
  sync-service/               ← servicio en segundo plano (no abrir manualmente)
  LEEME.txt                   ← instrucciones cortas en español
```

### Qué necesitas antes de instalar en el cliente

| Dato | Dónde lo obtienes |
|------|-------------------|
| **Supabase URL** | Supabase → Project Settings → API → Project URL |
| **Service role key** | Supabase → Project Settings → API → `service_role` (secreta) |
| **Store ID** | `store_a` para tienda A, `store_b` para tienda B |
| **Clave de licencia** | La generas tú con `npm run license:generate` (ver [licencias.md](./licencias.md)) |

> **Importante:** La service role key **no** es la anon key. Solo va en el servicio de sync del PC del cliente, nunca en la app de caja ni en el dashboard web.

### Cómo enviar el ZIP al cliente

Elige uno:

| Método | Pasos |
|--------|--------|
| **Correo / WhatsApp / Drive** | Sube el ZIP y comparte el enlace de descarga |
| **USB** | Copia el ZIP o la carpeta extraída a la memoria |
| **TeamViewer** | Transferencia de archivos al Escritorio del cliente |

---

## Parte 2 — Descargar en el PC del cliente

### Paso 1 — Descargar el archivo

1. Abre el enlace o copia el ZIP desde USB a una carpeta fácil, por ejemplo:
   ```text
   C:\Users\<Nombre>\Downloads\ShelfPOS-1.2.0-win.zip
   ```
2. Espera a que la descarga termine por completo.

### Paso 2 — Extraer el ZIP

1. Clic derecho en `ShelfPOS-1.2.0-win.zip` → **Extraer todo…**
2. Elige una carpeta, por ejemplo:
   ```text
   C:\Users\<Nombre>\Desktop\ShelfPOS-install
   ```
3. Confirma que dentro veas:
   - `ShelfPOS Setup *.exe`
   - `Install-ShelfPOS.ps1`
   - carpeta `sync-service`

> No ejecutes solo el `.exe` si quieres sync con Supabase. Usa siempre **`Install-ShelfPOS.ps1`**, que instala la app **y** el servicio de sincronización.

---

## Parte 3 — Instalar (Administrador)

### Paso 3 — Abrir PowerShell como Administrador

1. Presiona **Win**, escribe **PowerShell**.
2. Clic derecho en **Windows PowerShell** → **Ejecutar como administrador**.
3. Si Windows pregunta, elige **Sí**.

### Paso 4 — Ir a la carpeta extraída

```powershell
cd C:\Users\<Nombre>\Desktop\ShelfPOS-install
```

(Ajusta la ruta según donde extrajiste el ZIP.)

### Paso 5 — Ejecutar el instalador completo

```powershell
.\Install-ShelfPOS.ps1
```

Si Windows bloquea scripts, prueba:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\Install-ShelfPOS.ps1
```

### Paso 6 — Responder las preguntas

El script pedirá:

| Pregunta | Qué escribir |
|----------|--------------|
| **Supabase URL** | `https://xxxx.supabase.co` |
| **Supabase service role key** | La clave secreta `service_role` (no se muestra al escribir) |
| **Store ID** | `store_a` o `store_b` según la tienda |

Luego el script:

1. Instala **ShelfPOS** (asistente NSIS — Siguiente → Instalar).
2. Copia el **sync-service** a `C:\Program Files\ShelfPOS\sync-service\`.
3. Crea **`sync.env`** con las credenciales.
4. Registra el servicio Windows **ShelfPOSSync** (`inicio automático`).
5. Inicia el servicio.

### Paso 7 — Confirmar que terminó bien

Debes ver en verde:

```text
Done! ShelfPOS + sync service are installed and running.
```

Anota:

- **POS database:** `%APPDATA%\shelfpos\shelf.db`
- **Sync config:** `C:\Program Files\ShelfPOS\sync-service\sync.env`
- **Store ID:** `store_a` o `store_b`

---

## Parte 4 — Activar la licencia

La app de producción **requiere licencia** vinculada a ese PC.

### Paso 8 — Abrir ShelfPOS por primera vez

1. Menú Inicio → **ShelfPOS**.
2. Si aparece la pantalla de **activación**, copia el **ID de equipo** que muestra la app.

### Paso 9 — Obtener la clave de licencia (soporte)

En **tu PC** (no en la del cliente):

```powershell
cd C:\Users\Jay\Desktop\ShelfPOS\OFFLINE-ONLY-POS
npm run license:generate -- --machine-id <ID_DEL_CLIENTE> --client "Nombre del negocio"
```

Copia el JWT (texto largo, una sola línea) y envíalo al cliente de forma segura.

### Paso 10 — Pegar la licencia

1. En la pantalla de activación del cliente, pega la clave completa.
2. Clic en **Activar**.
3. La app debe continuar al asistente de primer uso.

Detalle completo: [licencias.md](./licencias.md)

---

## Parte 5 — Primer uso de la caja

### Paso 11 — Configuración inicial

Al abrir ShelfPOS por primera vez (después de la licencia):

1. Elegir idioma (**Español** / 中文).
2. Si eligió chino: prueba de impresora CJK.
3. Crear las cuentas fijas (admin / cajero / inventario) y PIN del encargado.
4. Iniciar sesión.

### Paso 12 — Impresora (opcional)

- Epson **TM-T81III** o **TM-T20** con driver APD de Epson instalado en Windows.
- ShelfPOS detecta la cola al iniciar.
- Si la cola tiene otro nombre, soporte puede usar la variable `SHELFPOS_PRINTER_NAME`.

---

## Parte 6 — Verificar que todo funciona

### Sync service (segundo plano)

Abre PowerShell **como Administrador**:

```powershell
sc.exe query ShelfPOSSync
Get-Service ShelfPOSSync
```

Debe decir **`RUNNING`**.

El servicio:

- Arranca **solo al encender el PC** (no hace falta abrir ShelfPOS).
- Reintenta si pierde Internet.
- Lee la base local y sube cambios a Supabase cada ~10 segundos cuando hay red.

### Prueba de venta → dashboard

1. En ShelfPOS, registra una venta de prueba.
2. Espera ~10–30 segundos con Internet.
3. Abre el **dashboard web** (Vercel) y confirma que la venta aparece en la tienda correcta (`store_a` / `store_b`).

### Si el SQLite no existía durante la instalación

Si el instalador avisó que no encontró la base de datos, abre ShelfPOS una vez (crea la DB) y vuelve a ejecutar:

```powershell
cd C:\Users\<Nombre>\Desktop\ShelfPOS-install
.\Install-ShelfPOS.ps1 -SkipPosInstall
```

`-SkipPosInstall` reinstala solo el sync y vuelve a aplicar el **Store ID** sin repetir el instalador de la app.

---

## Solución de problemas

### Windows SmartScreen bloquea el instalador

1. Clic en **Más información**.
2. **Ejecutar de todas formas** (solo si el archivo viene de tu soporte oficial).

### El script PowerShell no se ejecuta

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\Install-ShelfPOS.ps1
```

Siempre desde PowerShell **como Administrador**.

### Sync service no está en RUNNING

```powershell
sc.exe query ShelfPOSSync
Get-Content "$env:ProgramFiles\ShelfPOS\sync-service\sync.env"
```

Ejecuta el servicio a mano para ver el error:

```powershell
& "$env:ProgramFiles\ShelfPOS\sync-service\node.exe" `
  "$env:ProgramFiles\ShelfPOS\sync-service\dist\index.js"
```

Causas frecuentes:

- URL o service role key incorrectas en `sync.env`
- Sin Internet
- Ruta de SQLite incorrecta (debe ser `%APPDATA%\shelfpos\shelf.db`)

### Licencia inválida

- Pegar el JWT **completo**, sin espacios ni saltos de línea.
- La app debe estar compilada con el mismo `license.pub.pem` que usaste para firmar.
- Ver [licencias.md](./licencias.md).

### Actualizar ShelfPOS (nueva versión)

1. Envía al cliente un ZIP nuevo (`npm run release:win`).
2. Ejecute de nuevo `Install-ShelfPOS.ps1` (o `-SkipPosInstall` si solo cambió el sync).
3. **No hace falta** nueva licencia si `%APPDATA%\shelfpos\license.enc` sigue intacto.

---

## Checklist rápido

**Soporte (antes de enviar)**

- [ ] `npm run release:win` generó el ZIP
- [ ] Tienes Supabase URL + service role key
- [ ] Sabes si es `store_a` o `store_b`
- [ ] Tienes llave privada de licencias (`private/license.private.pem`)

**Cliente (en el PC)**

- [ ] Descargó y extrajo el ZIP
- [ ] Ejecutó `Install-ShelfPOS.ps1` como Administrador
- [ ] Mensaje verde: sync service running
- [ ] Activó licencia con JWT
- [ ] Completó primer uso (idioma, cuentas, PIN)
- [ ] Venta de prueba visible en dashboard web

---

## Comandos de referencia

```powershell
# Instalación completa (app + sync)
.\Install-ShelfPOS.ps1

# Solo reinstalar sync (POS ya instalado)
.\Install-ShelfPOS.ps1 -SkipPosInstall

# Con parámetros (sin preguntas interactivas)
.\Install-ShelfPOS.ps1 `
  -SupabaseUrl "https://xxxx.supabase.co" `
  -SupabaseServiceKey "eyJ..." `
  -StoreId "store_a"

# Estado del servicio
sc.exe query ShelfPOSSync
Get-Service ShelfPOSSync
```
