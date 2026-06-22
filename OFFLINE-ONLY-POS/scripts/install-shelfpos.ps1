<#
.SYNOPSIS
  Installs the ShelfPOS Supabase sync service on Windows.

.DESCRIPTION
  Run AFTER installing ShelfPOS via "ShelfPOS Setup*.exe" (double-click the setup yourself).
  Double-click Install-ShelfPOS.cmd (recommended), or run this script in PowerShell as Administrator.

  1. Copies sync-service to Program Files
  2. Writes sync.env with Supabase credentials
  3. Registers and starts the "ShelfPOS Sync" Windows service

.PARAMETER SupabaseUrl
  e.g. https://xxxx.supabase.co

.PARAMETER SupabaseServiceKey
  Service role key (Project Settings -> API). NOT the anon key.

.PARAMETER StoreName
  Human-readable store/register name (e.g. "Leo Bazaar Register 1").
  Installer converts it to a stable store_id (store_leo_bazaar_register_1).

.PARAMETER StoreId
  Optional explicit store_id override (store_xxx). If omitted, StoreName is used.

.PARAMETER StoreClaimCode
  8-character linking code from the owner dashboard (shown when no stores are linked).
  If omitted, the installer prompts for it (Enter to skip).
#>
param(
  [string]$SupabaseUrl,
  [string]$SupabaseServiceKey,
  [string]$StoreName,
  [string]$StoreId,
  [string]$StoreClaimCode
)

$ErrorActionPreference = 'Stop'
$BundleRoot = $PSScriptRoot
$ServiceName = 'ShelfPOSSync'
$InstallDir = Join-Path ${env:ProgramFiles} 'ShelfPOS\sync-service'
$SqlitePath = Join-Path $env:APPDATA 'shelfpos\shelf.db'

function Test-IsAdministrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal $identity
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-Administrator {
  if (Test-IsAdministrator) { return }

  Write-Host ''
  Write-Host 'Administrator rights are required to install the sync service.' -ForegroundColor Yellow
  Write-Host 'Requesting elevation (approve the UAC prompt)...' -ForegroundColor Yellow
  Write-Host ''

  $argList = @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $PSCommandPath
  )
  if ($SupabaseUrl) { $argList += '-SupabaseUrl'; $argList += $SupabaseUrl }
  if ($SupabaseServiceKey) { $argList += '-SupabaseServiceKey'; $argList += $SupabaseServiceKey }
  if ($StoreName) { $argList += '-StoreName'; $argList += $StoreName }
  if ($StoreId) { $argList += '-StoreId'; $argList += $StoreId }
  if ($StoreClaimCode) { $argList += '-StoreClaimCode'; $argList += $StoreClaimCode }

  $proc = Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $argList -PassThru -Wait
  exit $(if ($null -ne $proc.ExitCode) { $proc.ExitCode } else { 1 })
}

function Pause-OnFailure([int]$ExitCode) {
  if ($ExitCode -ne 0 -and $Host.Name -eq 'ConsoleHost') {
    Write-Host ''
    Read-Host 'Press Enter to close'
  }
  exit $ExitCode
}

function Prompt-Required([string]$Label, [switch]$Secret) {
  if ($Secret) {
    $secure = Read-Host $Label -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
      [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
  }
  return Read-Host $Label
}

function ConvertTo-StoreId([string]$Name) {
  $raw = ''
  if ($null -ne $Name) { $raw = $Name.Trim().ToLowerInvariant() }
  if (-not $raw) { throw 'Store name is required.' }

  # Keep only a-z, 0-9 and underscore to match SQLite/Supabase-friendly IDs.
  $slug = $raw -replace '[^a-z0-9]+', '_'
  $slug = $slug.Trim('_')
  if (-not $slug) {
    throw "Store name '$Name' cannot be converted to a valid store_id. Use letters/numbers."
  }
  return "store_$slug"
}

function Get-ExistingStoreIdByName(
  [string]$SupabaseUrl,
  [string]$SupabaseServiceKey,
  [string]$DisplayName
) {
  if (-not $DisplayName) { return $null }

  $escapedName = [Uri]::EscapeDataString($DisplayName)
  $uri = "$SupabaseUrl/rest/v1/stores?select=store_id,display_name&display_name=eq.$escapedName&limit=1"
  $headers = @{
    apikey        = $SupabaseServiceKey
    Authorization = "Bearer $SupabaseServiceKey"
  }

  try {
    $rows = Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -TimeoutSec 10
    if ($null -eq $rows) { return $null }
    if ($rows -is [System.Array]) {
      if ($rows.Count -gt 0) { return $rows[0].store_id }
      return $null
    }
    if ($rows.PSObject.Properties['store_id']) {
      return $rows.store_id
    }
  } catch {
    Write-Host "Could not validate existing stores for '$DisplayName' (continuing with derived store_id)." -ForegroundColor DarkYellow
    return $null
  }
  return $null
}

Ensure-Administrator

Write-Host ''
Write-Host '=== ShelfPOS sync service installer ===' -ForegroundColor Cyan
Write-Host '    (Install ShelfPOS app separately via ShelfPOS Setup*.exe first.)' -ForegroundColor DarkGray
Write-Host ''

try {
if (-not $SupabaseUrl) {
  $SupabaseUrl = Prompt-Required 'Supabase URL (https://xxx.supabase.co)'
}
if (-not $SupabaseServiceKey) {
  $SupabaseServiceKey = Prompt-Required 'Supabase service role key' -Secret
}

$StoreId = if ($null -ne $StoreId) { $StoreId.Trim() } else { '' }
$StoreName = if ($null -ne $StoreName) { $StoreName.Trim() } else { '' }
$StoreIdProvided = $false

if (-not $StoreId -or $StoreId -eq '-StoreId' -or $StoreId -match '^-') {
  $StoreId = ''
} else {
  $StoreIdProvided = $true
}

if (-not $StoreId) {
  if (-not $StoreName -or $StoreName -eq '-StoreName' -or $StoreName -match '^-') {
    $StoreName = Prompt-Required "What's the store name? (e.g. Leo Bazaar Register 1)"
  }
  $StoreId = ConvertTo-StoreId $StoreName
  Write-Host "Store name '$StoreName' mapped to store_id '$StoreId'." -ForegroundColor DarkGray
} elseif ($StoreName) {
  Write-Host "StoreId provided ($StoreId). StoreName '$StoreName' will be ignored." -ForegroundColor DarkGray
}

if (-not $StoreIdProvided -and $StoreName) {
  $existingStoreId = Get-ExistingStoreIdByName -SupabaseUrl $SupabaseUrl -SupabaseServiceKey $SupabaseServiceKey -DisplayName $StoreName
  if ($existingStoreId -and $existingStoreId -ne $StoreId) {
    Write-Host "Found existing store entry '$existingStoreId' with same display name '$StoreName'." -ForegroundColor Yellow
    Write-Host "Keeping derived store_id '$StoreId' to avoid merging separate registers." -ForegroundColor DarkGray
  }
}

if ($StoreId -notmatch '^store_[a-z0-9_]+$') {
  throw @"
Invalid StoreId: '$StoreId'
Expected format: store_<letters_numbers_underscores>

Example (single line, PowerShell as Administrator):
  .\install-shelfpos.ps1 -SupabaseUrl "https://YOUR.supabase.co" -SupabaseServiceKey "YOUR_SERVICE_ROLE_KEY" -StoreName "Store A Register 1" -StoreClaimCode "AB12CD34"
"@
}

$StoreClaimCode = if ($null -ne $StoreClaimCode) { $StoreClaimCode.Trim().ToUpperInvariant() } else { '' }
if (-not $StoreClaimCode) {
  Write-Host ''
  Write-Host 'Dashboard linking code (8 characters — shown in the owner panel).' -ForegroundColor Cyan
  Write-Host 'Paste the code from the dashboard. Press Enter to skip and link later.' -ForegroundColor DarkGray
  $StoreClaimCode = (Read-Host 'Linking code (optional)').Trim().ToUpperInvariant()
}
if ($StoreClaimCode -and $StoreClaimCode -notmatch '^[A-Z0-9]{8}$') {
  throw "Invalid linking code '$StoreClaimCode'. Expected 8 letters or numbers (e.g. AB12CD34)."
}

function Test-SyncBundleDir([string]$Dir) {
  $resolved = $Dir | Resolve-Path -ErrorAction SilentlyContinue
  if (-not $resolved) { return $false }
  $required = @(
    'dist\index.js',
    'node.exe',
    'package.json',
    'node_modules'
  )
  foreach ($rel in $required) {
    if (-not (Test-Path (Join-Path $resolved.Path $rel))) { return $false }
  }
  return $true
}

function Get-SyncSourceCandidates([string]$Root) {
  $list = [System.Collections.Generic.List[string]]::new()
  $list.Add((Join-Path $Root 'sync-service')) | Out-Null

  $parent = Split-Path $Root -Parent
  $list.Add((Join-Path $parent 'sync-service')) | Out-Null

  # scripts\ or repo root — prefer the staged release bundle (has bundled node.exe)
  $projectRoot = if ((Split-Path $Root -Leaf) -eq 'scripts') { $parent } else { $null }
  if ($projectRoot) {
    $releaseDir = Join-Path $projectRoot 'release'
    if (Test-Path $releaseDir) {
      Get-ChildItem $releaseDir -Directory -Filter 'ShelfPOS-*-win' |
        Sort-Object Name -Descending |
        ForEach-Object { $list.Add((Join-Path $_.FullName 'sync-service')) | Out-Null }
    }
  }

  return $list | Select-Object -Unique
}

function Resolve-SyncSource([string]$Root) {
  foreach ($dir in (Get-SyncSourceCandidates $Root)) {
    if (Test-SyncBundleDir $dir) {
      return (Resolve-Path $dir).Path
    }
  }
  throw @"
Complete sync-service bundle not found (needs dist\, node.exe, node_modules\, scripts\).

Run from the extracted release ZIP folder (Install-ShelfPOS.cmd next to sync-service\),
or from OFFLINE-ONLY-POS after: npm run release:win
"@
}

$SyncSource = Resolve-SyncSource $BundleRoot
Write-Host "Using sync bundle: $SyncSource" -ForegroundColor DarkGray

function Resolve-SyncScript([string]$Name) {
  $inBundle = Join-Path $SyncSource "scripts\$Name"
  if (Test-Path $inBundle) { return $inBundle }

  $walk = $BundleRoot
  for ($i = 0; $i -lt 4; $i++) {
    $fallback = Join-Path $walk "sync-service\scripts\$Name"
    if (Test-Path $fallback) {
      Write-Host "  Using script from: $fallback" -ForegroundColor DarkGray
      return $fallback
    }
    $parent = Split-Path $walk -Parent
    if (-not $parent -or $parent -eq $walk) { break }
    $walk = $parent
  }

  throw "Missing scripts\$Name in sync bundle. Re-run: npm run release:win"
}

Write-Host "Installing sync service to $InstallDir" -ForegroundColor Yellow
if (Test-Path $InstallDir) {
  Stop-Service -Name $ServiceName -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
  Remove-Item -Recurse -Force $InstallDir
}
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

Copy-Item -Recurse -Force (Join-Path $SyncSource 'dist') (Join-Path $InstallDir 'dist')
Copy-Item -Recurse -Force (Join-Path $SyncSource 'node_modules') (Join-Path $InstallDir 'node_modules')
Copy-Item -Force (Join-Path $SyncSource 'package.json') $InstallDir
Copy-Item -Force (Join-Path $SyncSource 'node.exe') $InstallDir

$nodeWindowsMod = Join-Path $InstallDir 'node_modules\node-windows'
if (-not (Test-Path $nodeWindowsMod)) {
  $walk = $BundleRoot
  $patched = $false
  for ($i = 0; $i -lt 5; $i++) {
    $devMod = Join-Path $walk 'sync-service\node_modules\node-windows'
    if (Test-Path $devMod) {
      Write-Host '  Release bundle missing node-windows — copying from dev sync-service…' -ForegroundColor DarkYellow
      Copy-Item -Recurse -Force $devMod $nodeWindowsMod
      foreach ($dep in @('xml', 'yargs', 'cliui', 'escalade', 'get-caller-file', 'require-directory', 'string-width', 'y18n', 'yargs-parser', 'wrap-ansi', 'ansi-regex', 'ansi-styles', 'color-convert', 'color-name', 'emoji-regex', 'is-fullwidth-code-point', 'strip-ansi')) {
        $src = Join-Path (Split-Path $devMod -Parent) $dep
        if (Test-Path $src) {
          Copy-Item -Recurse -Force $src (Join-Path $InstallDir "node_modules\$dep") -ErrorAction SilentlyContinue
        }
      }
      $patched = $true
      break
    }
    $parent = Split-Path $walk -Parent
    if (-not $parent -or $parent -eq $walk) { break }
    $walk = $parent
  }
  if (-not $patched -or -not (Test-Path $nodeWindowsMod)) {
    throw @"
Release sync bundle is missing node-windows (Windows service installer).

Re-run from OFFLINE-ONLY-POS: npm run release:win
Then use the fresh release\ShelfPOS-*-win folder.
"@
  }
}

$installScriptsDir = Join-Path $InstallDir 'scripts'
New-Item -ItemType Directory -Path $installScriptsDir -Force | Out-Null
foreach ($scriptName in @('set-store-id.cjs', 'write-sync-env.cjs', 'install-windows-service.cjs', 'uninstall-windows-service.cjs')) {
  Copy-Item -Force (Resolve-SyncScript $scriptName) (Join-Path $installScriptsDir $scriptName)
}

$NodeExe = Join-Path $InstallDir 'node.exe'

$WriteEnvJs = Join-Path $InstallDir 'scripts\write-sync-env.cjs'
$pairingArg = if ($StoreClaimCode) { $StoreClaimCode } else { '' }
$configPath = & $NodeExe $WriteEnvJs $SupabaseUrl $SupabaseServiceKey $SqlitePath $pairingArg
Write-Host "Sync config written (encrypted service key): $configPath" -ForegroundColor Green

$dbDir = Split-Path $SqlitePath -Parent
if (-not (Test-Path $dbDir)) {
  New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
}
if (Test-Path $SqlitePath) {
  Write-Host "Setting sync_store_id=$StoreId in SQLite" -ForegroundColor Yellow
  & (Join-Path $InstallDir 'node.exe') `
    (Join-Path $InstallDir 'scripts\set-store-id.cjs') `
    $SqlitePath $StoreId
} else {
  Write-Host "SQLite not found yet ($SqlitePath)." -ForegroundColor DarkYellow
  Write-Host "Open ShelfPOS once, then re-run this script to set store ID." -ForegroundColor DarkYellow
}

$ScriptJs = Join-Path $InstallDir 'dist\index.js'
$InstallServiceJs = Join-Path $InstallDir 'scripts\install-windows-service.cjs'

if (-not (Test-Path $InstallServiceJs)) {
  throw "Missing $InstallServiceJs — re-run npm run release:win and use a fresh ZIP."
}

Write-Host 'Registering Windows service (WinSW wrapper via node-windows)...' -ForegroundColor Yellow
Write-Host "  Service name: $ServiceName  (use: sc.exe query $ServiceName)" -ForegroundColor DarkGray

# Remove legacy broken sc.exe-only registration if present
sc.exe stop $ServiceName 2>$null | Out-Null
sc.exe delete $ServiceName 2>$null | Out-Null
Start-Sleep -Seconds 1

Push-Location $InstallDir
try {
  & $NodeExe $InstallServiceJs $InstallDir
} finally {
  Pop-Location
}
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Service registration failed. Run in foreground to see the error:' -ForegroundColor Red
  Write-Host "  & `"$NodeExe`" `"$ScriptJs`""
  Pause-OnFailure 1
}

Start-Sleep -Seconds 2
$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if (-not $svc) {
  Write-Host ''
  Write-Host "Windows service '$ServiceName' was not created." -ForegroundColor Red
  Write-Host 'Re-run this script in PowerShell as Administrator (not double-click).' -ForegroundColor Yellow
  Write-Host "  sc.exe query $ServiceName"
  Pause-OnFailure 1
}

if ($svc.Status -eq 'Running') {
  Write-Host ''
  Write-Host 'Done! Sync service is installed and running.' -ForegroundColor Green
  Write-Host "  POS database: $SqlitePath"
  Write-Host "  Sync config:  $configPath"
  Write-Host "  Store ID:     $StoreId"
  if ($StoreClaimCode) {
    Write-Host '  Linking:      claim code saved — sync will bind this register to the dashboard owner.' -ForegroundColor Green
  } else {
    Write-Host '  Linking:      no code — owner must add STORE_CLAIM_CODE later or re-run installer.' -ForegroundColor DarkYellow
  }
} else {
  Write-Host ''
  Write-Host 'Install finished but sync service is not running. Check Event Viewer or run:' -ForegroundColor Red
  Write-Host "  sc.exe query $ServiceName"
  Write-Host "  & `"$NodeExe`" `"$ScriptJs`"   # run in foreground to see errors"
  Pause-OnFailure 1
}

} catch {
  Write-Host ''
  Write-Host "Install failed: $($_.Exception.Message)" -ForegroundColor Red
  Pause-OnFailure 1
}
