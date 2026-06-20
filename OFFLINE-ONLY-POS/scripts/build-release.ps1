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
$ElectronDistDir = Join-Path $Root ".release-dist-$((Get-Date -Format 'yyyyMMdd-HHmmss'))"

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

function Invoke-Npm([Parameter(Mandatory = $true)][string[]]$NpmArgs) {
  Write-Host "  > npm $($NpmArgs -join ' ')" -ForegroundColor DarkGray
  & npm @NpmArgs
  if ($LASTEXITCODE -ne 0) {
    throw "npm $($NpmArgs -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Stop-BuildLockingProcesses() {
  foreach ($name in @('ShelfPOS', 'electron')) {
    Get-Process -Name $name -ErrorAction SilentlyContinue | ForEach-Object {
      Write-Host "  Stopping $($_.ProcessName) (PID $($_.Id))..." -ForegroundColor DarkYellow
      Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
  }
  Start-Sleep -Seconds 1
}

function Try-RemovePath([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  try {
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
  } catch {
    Write-Host "  Could not remove $Path (continuing — output goes to a fresh folder)" -ForegroundColor DarkYellow
  }
}

function Remove-PathWithRetry([string]$Path, [int]$MaxAttempts = 5) {
  if (-not (Test-Path $Path)) { return }

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    try {
      Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
      return
    } catch {
      if ($attempt -eq $MaxAttempts) {
        throw @"
Could not remove '$Path' after $MaxAttempts attempts.
It is likely locked by another process (for example Explorer, ShelfPOS, or sync-service node.exe).
Close File Explorer windows opened inside the release folder, then retry.
"@
      }
      Write-Host "  '$Path' is locked (attempt $attempt/$MaxAttempts). Retrying in 2s..." -ForegroundColor DarkYellow
      Stop-BuildLockingProcesses
      Start-Sleep -Seconds 2
    }
  }
}

function Remove-BuildOutputs([string]$Root) {
  Stop-BuildLockingProcesses
  Write-Host '  Clearing out/ (best effort)' -ForegroundColor DarkGray
  Try-RemovePath (Join-Path $Root 'out')
}

function Ensure-WindowsIcon([string]$Root) {
  $ico = Join-Path $Root 'build\icon.ico'
  if (Test-Path $ico) { return }

  $buildDir = Join-Path $Root 'build'
  $png = Join-Path $Root 'public\ShelfPOS.png'
  if (-not (Test-Path $png)) { throw "Missing app icon PNG: $png" }

  New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
  Write-Host '  Generating build/icon.ico (skips Node 24 icon-tool crash)...' -ForegroundColor DarkGray
  cmd /c "npx --yes png-to-ico `"$png`" > `"$ico`""
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $ico)) { throw 'Failed to generate build/icon.ico' }
}

function Invoke-ElectronDist([string]$Root, [string]$DistDir) {
  Ensure-WindowsIcon $Root
  Invoke-Npm @('run', 'build')
  $relativeDist = Split-Path $DistDir -Leaf
  Write-Host "  > npx electron-builder --win (output $relativeDist)" -ForegroundColor DarkGray
  $env:NODE_OPTIONS = '--max-old-space-size=8192'
  Push-Location $Root
  try {
    & npx electron-builder --win "--config.directories.output=$relativeDist"
    if ($LASTEXITCODE -ne 0) {
      throw "electron-builder failed with exit code $LASTEXITCODE"
    }
  } finally {
    Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
    Pop-Location
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
Write-Host "[2/5] Building Electron app (output: $(Split-Path $ElectronDistDir -Leaf))..." -ForegroundColor Yellow
Remove-BuildOutputs $Root
Invoke-ElectronDist $Root $ElectronDistDir

$NsisExe = Get-ChildItem $ElectronDistDir -Filter 'ShelfPOS Setup*.exe' |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
if (-not $NsisExe) { throw "ShelfPOS Setup*.exe not found in $ElectronDistDir" }
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
  $syncModules = Join-Path $SyncDir 'node_modules'
  foreach ($pkg in @('node-windows', 'better-sqlite3')) {
    if (-not (Test-Path (Join-Path $syncModules $pkg))) {
      throw "sync-service missing required dependency '$pkg' after npm ci. Check sync-service/package.json and package-lock.json."
    }
  }
  Pop-Location
} finally {
  $env:PATH = $PreviousPath
}
Start-Sleep -Seconds 2

# --- Stage bundle ---
Write-Host ''
Write-Host '[4/5] Staging release bundle...' -ForegroundColor Yellow
if (Test-Path $StageDir) { Remove-PathWithRetry $StageDir }
New-Item -ItemType Directory -Path $StageDir -Force | Out-Null

Copy-Item $NsisExe.FullName $StageDir
Copy-Item (Join-Path $Root 'scripts\install-shelfpos.ps1') (Join-Path $StageDir 'Install-ShelfPOS.ps1')
Copy-Item (Join-Path $Root 'scripts\uninstall-shelfpos.ps1') (Join-Path $StageDir 'Uninstall-ShelfPOS.ps1')
Copy-Item (Join-Path $Root 'scripts\Install-ShelfPOS.cmd') $StageDir
Copy-Item (Join-Path $Root 'scripts\Uninstall-ShelfPOS.cmd') $StageDir

$SyncStage = Join-Path $StageDir 'sync-service'
New-Item -ItemType Directory -Path $SyncStage -Force | Out-Null
Copy-Item -Recurse (Join-Path $SyncDir 'dist') (Join-Path $SyncStage 'dist')
Copy-Item -Recurse (Join-Path $SyncDir 'node_modules') (Join-Path $SyncStage 'node_modules')
Copy-Item (Join-Path $SyncDir 'package.json') $SyncStage
New-Item -ItemType Directory -Path (Join-Path $SyncStage 'scripts') -Force | Out-Null
Copy-Item (Join-Path $SyncDir 'scripts\set-store-id.cjs') (Join-Path $SyncStage 'scripts\set-store-id.cjs')
Copy-Item (Join-Path $SyncDir 'scripts\install-windows-service.cjs') (Join-Path $SyncStage 'scripts\install-windows-service.cjs')
Copy-Item (Join-Path $SyncDir 'scripts\uninstall-windows-service.cjs') (Join-Path $SyncStage 'scripts\uninstall-windows-service.cjs')
Copy-Item $NodeExe (Join-Path $SyncStage 'node.exe')
Remove-NodeModulesJunk (Join-Path $SyncStage 'node_modules')
foreach ($pkg in @('node-windows', 'better-sqlite3')) {
  if (-not (Test-Path (Join-Path $SyncStage "node_modules\$pkg"))) {
    throw "Release bundle missing sync dependency '$pkg'. sync-service npm ci may have failed."
  }
}

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
3. Doble clic en Install-ShelfPOS.cmd (pide permisos de Administrador automáticamente).
4. Ingrese la URL de Supabase, la service role key y el nombre de la tienda/caja.

Ejemplo (PowerShell como Administrador, UNA sola línea):
  .\Install-ShelfPOS.ps1 -SupabaseUrl "https://xxx.supabase.co" -SupabaseServiceKey "eyJ..." -StoreName "Store A Register 1"

Install-ShelfPOS.cmd / Install-ShelfPOS.ps1 SOLO instalan el servicio "ShelfPOS Sync" (sincronización en segundo plano).
La app POS se instala por separado con el Setup.exe (paso 2).

Desinstalar: doble clic en Uninstall-ShelfPOS.cmd (Administrador), o en PowerShell:
  .\Uninstall-ShelfPOS.ps1
  .\Uninstall-ShelfPOS.ps1 -RemoveData   # también borra %APPDATA%\shelfpos (base de datos, licencia)

Requisitos: Windows 10/11, conexión a Internet para Supabase.

Si el servicio no inicia, abra PowerShell como Admin y ejecute:
  sc.exe query shelfpossync.exe
  Get-Service shelfpossync.exe
  Get-Content "$env:ProgramFiles\ShelfPOS\sync-service\sync.env"

Nombre interno del servicio: shelfpossync.exe (use: sc.exe query shelfpossync.exe)
'@ | Set-Content (Join-Path $StageDir 'LEEME.txt') -Encoding UTF8

$requiredBundleFiles = @(
  (Join-Path $StageDir 'Install-ShelfPOS.cmd'),
  (Join-Path $StageDir 'Install-ShelfPOS.ps1'),
  (Join-Path $StageDir 'Uninstall-ShelfPOS.cmd'),
  (Join-Path $StageDir 'Uninstall-ShelfPOS.ps1'),
  (Join-Path $SyncStage 'node.exe'),
  (Join-Path $SyncStage 'node_modules\node-windows'),
  (Join-Path $SyncStage 'scripts\install-windows-service.cjs'),
  (Join-Path $SyncStage 'scripts\uninstall-windows-service.cjs')
)
foreach ($path in $requiredBundleFiles) {
  if (-not (Test-Path $path)) {
    throw "Release bundle incomplete — missing $path"
  }
}
$setupExe = Get-ChildItem $StageDir -Filter 'ShelfPOS Setup*.exe' | Select-Object -First 1
if (-not $setupExe) { throw "Release bundle incomplete — missing ShelfPOS Setup*.exe in $StageDir" }

Write-Host ''
Write-Host '[5/5] Creating ZIP...' -ForegroundColor Yellow
New-ReleaseZip -SourceDir $StageDir -Destination $ZipPath

Write-Host ''
Write-Host "Release ready:" -ForegroundColor Green
Write-Host "  Folder: $StageDir"
Write-Host "  Zip:    $ZipPath"
Write-Host "  Sync Node: $BundledNodeVersion (matches bundled node.exe)"
Write-Host ''
Write-Host 'Send the ZIP to the customer. They install Setup.exe, then double-click Install-ShelfPOS.cmd.' -ForegroundColor Cyan
