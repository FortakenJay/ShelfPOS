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
$NodeVersion = '24.16.0'
$NodeDir = Join-Path $Root ".cache\node-v$NodeVersion-win-x64"
$NodeExe = Join-Path $NodeDir 'node.exe'

function Ensure-PortableNode {
  if (Test-Path $NodeExe) { return }

  New-Item -ItemType Directory -Path (Split-Path $NodeDir -Parent) -Force | Out-Null
  $Zip = Join-Path $env:TEMP "node-v$NodeVersion-win-x64.zip"
  $Url = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
  Write-Host "  Downloading Node.js v$NodeVersion..."
  Write-Host "  $Url"
  Invoke-WebRequest -Uri $Url -OutFile $Zip -UseBasicParsing
  $ExtractTemp = Join-Path $env:TEMP "node-v$NodeVersion-win-x64-extract"
  if (Test-Path $ExtractTemp) { Remove-Item -Recurse -Force $ExtractTemp }
  Expand-Archive -Path $Zip -DestinationPath $ExtractTemp -Force
  if (Test-Path $NodeDir) { Remove-Item -Recurse -Force $NodeDir }
  Move-Item (Join-Path $ExtractTemp "node-v$NodeVersion-win-x64") $NodeDir
  Remove-Item $Zip -Force -ErrorAction SilentlyContinue
  Remove-Item $ExtractTemp -Recurse -Force -ErrorAction SilentlyContinue
}

function Remove-NodeModulesJunk([string]$NodeModulesPath) {
  if (-not (Test-Path $NodeModulesPath)) { return }

  $junkDirNames = @('test', 'tests', '__tests__', 'docs', 'doc', 'example', 'examples', '.github')
  Get-ChildItem $NodeModulesPath -Recurse -Directory -ErrorAction SilentlyContinue |
    Where-Object { $junkDirNames -contains $_.Name } |
    Sort-Object { $_.FullName.Length } -Descending |
    ForEach-Object {
      Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function New-ReleaseZip([string]$SourceDir, [string]$Destination) {
  if (Test-Path $Destination) { Remove-Item $Destination -Force }

  $parent = Split-Path $SourceDir -Parent
  $name = Split-Path $SourceDir -Leaf
  Push-Location $parent
  try {
    for ($attempt = 1; $attempt -le 3; $attempt++) {
      & tar.exe -a -c -f $Destination $name
      if ($LASTEXITCODE -eq 0) { return }
      Write-Host "  ZIP attempt $attempt failed; retrying in 2s..." -ForegroundColor DarkYellow
      Start-Sleep -Seconds 2
    }
    throw "Failed to create ZIP at $Destination"
  } finally {
    Pop-Location
  }
}

function Invoke-Npm([string[]]$Args) {
  & npm @Args
  if ($LASTEXITCODE -ne 0) {
    throw "npm $($Args -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Remove-BuildOutputs([string]$Root) {
  $paths = @(
    (Join-Path $Root 'out'),
    (Join-Path $Root 'dist')
  )
  foreach ($path in $paths) {
    if (Test-Path $path) {
      Write-Host "  Removing $path" -ForegroundColor DarkGray
      Remove-Item -Recurse -Force $path
    }
  }
}

Write-Host "=== ShelfPOS release build v$Version ===" -ForegroundColor Cyan
$BuildStartedAt = Get-Date

# --- Portable Node.js (must match better-sqlite3 native ABI in sync bundle) ---
Write-Host ''
Write-Host '[1/5] Preparing portable Node.js...' -ForegroundColor Yellow
Ensure-PortableNode
$BundledNodeVersion = & $NodeExe -v
Write-Host "  Bundled Node: $BundledNodeVersion" -ForegroundColor DarkGray

# --- Electron installer (always clean + full rebuild) ---
Write-Host ''
Write-Host '[2/5] Building Electron app (clean out/ + dist/, then npm run dist)...' -ForegroundColor Yellow
Remove-BuildOutputs $Root
Invoke-Npm @('run', 'dist')

$NsisExe = Get-ChildItem (Join-Path $Root 'dist') -Filter 'ShelfPOS Setup*.exe' |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
if (-not $NsisExe) { throw 'ShelfPOS Setup*.exe not found in dist/' }
if ($NsisExe.LastWriteTime -lt $BuildStartedAt) {
  throw "NSIS installer is older than this release run ($($NsisExe.FullName)). dist build did not refresh."
}
Write-Host "  Installer: $($NsisExe.Name) ($($NsisExe.LastWriteTime))" -ForegroundColor DarkGray

# --- Sync service (install + compile native modules with bundled Node) ---
Write-Host ''
Write-Host "[3/5] Building sync-service (Node $NodeVersion)..." -ForegroundColor Yellow
$SyncDir = Join-Path $Root 'sync-service'
$PreviousPath = $env:PATH
$env:PATH = "$NodeDir;$PreviousPath"
try {
  Push-Location $SyncDir
  if (Test-Path 'node_modules') { Remove-Item -Recurse -Force 'node_modules' }
  if (Test-Path 'dist') { Remove-Item -Recurse -Force 'dist' }
  Invoke-Npm @('ci', '--omit=dev')
  Invoke-Npm @('run', 'build')
  Invoke-Npm @('rebuild', 'better-sqlite3')
  Pop-Location
} finally {
  $env:PATH = $PreviousPath
}
Start-Sleep -Seconds 2

# --- Stage bundle ---
Write-Host ''
Write-Host '[4/5] Staging release bundle...' -ForegroundColor Yellow
if (Test-Path $StageDir) { Remove-Item -Recurse -Force $StageDir }
New-Item -ItemType Directory -Path $StageDir -Force | Out-Null

Copy-Item $NsisExe.FullName $StageDir
Copy-Item (Join-Path $Root 'scripts\install-shelfpos.ps1') $StageDir
Copy-Item (Join-Path $Root 'scripts\uninstall-shelfpos.ps1') $StageDir

$SyncStage = Join-Path $StageDir 'sync-service'
New-Item -ItemType Directory -Path $SyncStage -Force | Out-Null
Copy-Item -Recurse (Join-Path $SyncDir 'dist') (Join-Path $SyncStage 'dist')
Copy-Item -Recurse (Join-Path $SyncDir 'node_modules') (Join-Path $SyncStage 'node_modules')
Copy-Item (Join-Path $SyncDir 'package.json') $SyncStage
New-Item -ItemType Directory -Path (Join-Path $SyncStage 'scripts') -Force | Out-Null
Copy-Item (Join-Path $SyncDir 'scripts\set-store-id.cjs') (Join-Path $SyncStage 'scripts\set-store-id.cjs')
Copy-Item $NodeExe (Join-Path $SyncStage 'node.exe')
Remove-NodeModulesJunk (Join-Path $SyncStage 'node_modules')

$GitSha = 'unknown'
try {
  $GitSha = (git -C $Root rev-parse --short HEAD 2>$null)
  if (-not $GitSha) { $GitSha = 'unknown' }
} catch {
  $GitSha = 'unknown'
}

@(
  "ShelfPOS release build",
  "Version: $Version",
  "Built: $(Get-Date -Format o)",
  "Git: $GitSha",
  "Installer: $($NsisExe.Name)",
  "Node (sync): $BundledNodeVersion"
) | Set-Content (Join-Path $StageDir 'BUILD_INFO.txt') -Encoding UTF8

@'
ShelfPOS — instalación en Windows
=================================

1. Extraiga este ZIP en una carpeta (ej. Escritorio\ShelfPOS-install).
2. Doble clic en "ShelfPOS Setup *.exe" e instale la aplicación de caja.
3. Clic derecho en Install-ShelfPOS.ps1 -> "Ejecutar con PowerShell" (como Administrador).
4. Ingrese la URL de Supabase, la service role key y store_a o store_b.

Install-ShelfPOS.ps1 SOLO instala el servicio "ShelfPOS Sync" (sincronización en segundo plano).
La app POS se instala por separado con el Setup.exe (paso 2).

Desinstalar (PowerShell como Administrador):
  .\Uninstall-ShelfPOS.ps1
  .\Uninstall-ShelfPOS.ps1 -RemoveData   # también borra %APPDATA%\shelfpos (base de datos, licencia)

Requisitos: Windows 10/11, conexión a Internet para Supabase.

Si el servicio no inicia, abra PowerShell como Admin y ejecute:
  sc.exe query ShelfPOSSync
  Get-Content "$env:ProgramFiles\ShelfPOS\sync-service\sync.env"
'@ | Set-Content (Join-Path $StageDir 'LEEME.txt') -Encoding UTF8

Write-Host ''
Write-Host '[5/5] Creating ZIP...' -ForegroundColor Yellow
New-ReleaseZip -SourceDir $StageDir -Destination $ZipPath

Write-Host ''
Write-Host "Release ready:" -ForegroundColor Green
Write-Host "  Folder: $StageDir"
Write-Host "  Zip:    $ZipPath"
Write-Host "  Sync Node: $BundledNodeVersion (matches bundled node.exe)"
Write-Host ''
Write-Host 'Send the ZIP to the customer. They install Setup.exe, then run Install-ShelfPOS.ps1 as Administrator.' -ForegroundColor Cyan
