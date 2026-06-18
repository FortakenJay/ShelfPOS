# Builds a customer-ready Windows bundle: POS NSIS installer + sync service + one-click install script.
# Usage (from OFFLINE-ONLY-POS): npm run release:win

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$Pkg = Get-Content (Join-Path $Root 'package.json') -Raw | ConvertFrom-Json
$Version = $Pkg.version
$BundleName = "ShelfPOS-$Version-win"
$OutDir = Join-Path $Root 'release'
$StageDir = Join-Path $OutDir $BundleName
$ZipPath = Join-Path $OutDir "$BundleName.zip"
$NodeCache = Join-Path $Root '.cache\node-win-x64'
$NodeVersion = '22.14.0'

Write-Host "=== ShelfPOS release build v$Version ===" -ForegroundColor Cyan

# --- Electron installer ---
Write-Host ''
Write-Host '[1/4] Building Electron app (npm run dist)...' -ForegroundColor Yellow
npm run dist
if ($LASTEXITCODE -ne 0) { throw 'electron dist failed' }

$NsisExe = Get-ChildItem (Join-Path $Root 'dist') -Filter 'ShelfPOS Setup*.exe' | Select-Object -First 1
if (-not $NsisExe) { throw 'ShelfPOS Setup*.exe not found in dist/' }

# --- Sync service ---
Write-Host ''
Write-Host '[2/4] Building sync-service...' -ForegroundColor Yellow
Push-Location (Join-Path $Root 'sync-service')
npm ci --omit=dev
if ($LASTEXITCODE -ne 0) { throw 'sync-service npm ci failed' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'sync-service build failed' }
Pop-Location

# --- Portable Node.js (bundled so customer machine does not need Node installed) ---
Write-Host ''
Write-Host '[3/4] Preparing portable Node.js...' -ForegroundColor Yellow
$NodeExe = Join-Path $NodeCache 'node.exe'
if (-not (Test-Path $NodeExe)) {
  New-Item -ItemType Directory -Path $NodeCache -Force | Out-Null
  $Zip = Join-Path $env:TEMP "node-v$NodeVersion-win-x64.zip"
  $Url = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
  Write-Host "  Downloading $Url"
  Invoke-WebRequest -Uri $Url -OutFile $Zip -UseBasicParsing
  Expand-Archive -Path $Zip -DestinationPath $NodeCache -Force
  $Extracted = Join-Path $NodeCache "node-v$NodeVersion-win-x64\node.exe"
  Copy-Item $Extracted $NodeExe
  Remove-Item $Zip -Force -ErrorAction SilentlyContinue
}

# --- Stage bundle ---
Write-Host ''
Write-Host '[4/4] Staging release bundle...' -ForegroundColor Yellow
if (Test-Path $StageDir) { Remove-Item -Recurse -Force $StageDir }
New-Item -ItemType Directory -Path $StageDir -Force | Out-Null

Copy-Item $NsisExe.FullName $StageDir
Copy-Item (Join-Path $Root 'scripts\install-shelfpos.ps1') $StageDir

$SyncStage = Join-Path $StageDir 'sync-service'
New-Item -ItemType Directory -Path $SyncStage -Force | Out-Null
Copy-Item -Recurse (Join-Path $Root 'sync-service\dist') (Join-Path $SyncStage 'dist')
Copy-Item -Recurse (Join-Path $Root 'sync-service\node_modules') (Join-Path $SyncStage 'node_modules')
Copy-Item (Join-Path $Root 'sync-service\package.json') $SyncStage
New-Item -ItemType Directory -Path (Join-Path $SyncStage 'scripts') -Force | Out-Null
Copy-Item (Join-Path $Root 'sync-service\scripts\set-store-id.cjs') (Join-Path $SyncStage 'scripts\set-store-id.cjs')
Copy-Item $NodeExe (Join-Path $SyncStage 'node.exe')

@'
ShelfPOS — instalación en Windows
=================================

1. Extraiga este ZIP en una carpeta (ej. Escritorio\ShelfPOS-install).
2. Clic derecho en Install-ShelfPOS.ps1 → "Ejecutar con PowerShell" (como Administrador).
3. Ingrese la URL de Supabase y la service role key cuando se le pida.
4. Indique store_a (tienda A) o store_b (tienda B).

El script instala:
  - ShelfPOS (aplicación de caja)
  - Servicio "ShelfPOS Sync" (sincronización en segundo plano)

Requisitos: Windows 10/11, conexión a Internet para Supabase.

Si el servicio no inicia, abra PowerShell como Admin y ejecute:
  sc.exe query ShelfPOSSync
  Get-Content "$env:ProgramFiles\ShelfPOS\sync-service\sync.env"

Para reinstalar solo el sync (POS ya instalado):
  .\Install-ShelfPOS.ps1 -SkipPosInstall
'@ | Set-Content (Join-Path $StageDir 'LEEME.txt') -Encoding UTF8

if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path $StageDir -DestinationPath $ZipPath -Force

Write-Host ''
Write-Host "Release ready:" -ForegroundColor Green
Write-Host "  Folder: $StageDir"
Write-Host "  Zip:    $ZipPath"
Write-Host ''
Write-Host 'Send the ZIP to the customer. They run Install-ShelfPOS.ps1 as Administrator.' -ForegroundColor Cyan
