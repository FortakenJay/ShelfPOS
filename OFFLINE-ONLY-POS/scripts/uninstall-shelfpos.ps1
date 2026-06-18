#Requires -RunAsAdministrator
<#
.SYNOPSIS
  Removes ShelfPOS sync service and the ShelfPOS desktop app on Windows.

.DESCRIPTION
  Right-click this script -> Run with PowerShell as Administrator.

  1. Stops and deletes the "ShelfPOS Sync" Windows service
  2. Removes C:\Program Files\ShelfPOS\sync-service
  3. Runs the NSIS uninstaller for ShelfPOS (if installed)

  By default, user data in %APPDATA%\shelfpos is kept (database, license, backups).
  Pass -RemoveData to delete that folder too.

.PARAMETER RemoveData
  Delete %APPDATA%\shelfpos (shelf.db, license, backups). Cannot be undone.

.PARAMETER SkipApp
  Only remove sync service + Program Files; do not uninstall the POS app.

.PARAMETER SkipSync
  Only uninstall the POS app; do not touch the sync service.
#>
param(
  [switch]$RemoveData,
  [switch]$SkipApp,
  [switch]$SkipSync
)

$ErrorActionPreference = 'Stop'

$SyncServiceNames = @('ShelfPOSSync', 'ShelfPOS Sync')
$SyncInstallDir = Join-Path ${env:ProgramFiles} 'ShelfPOS\sync-service'
$ShelfPosProgramDir = Join-Path ${env:ProgramFiles} 'ShelfPOS'
$AppDataDir = Join-Path $env:APPDATA 'shelfpos'

function Write-Step([string]$Message) {
  Write-Host $Message -ForegroundColor Yellow
}

function Write-Ok([string]$Message) {
  Write-Host $Message -ForegroundColor Green
}

function Write-Skip([string]$Message) {
  Write-Host $Message -ForegroundColor DarkGray
}

function Get-ShelfPosSyncServices {
  Get-CimInstance Win32_Service -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -like '*ShelfPOS*' -or
      $_.DisplayName -like '*ShelfPOS*Sync*' -or
      $_.DisplayName -eq 'ShelfPOS Sync'
    } |
    Select-Object -ExpandProperty Name -Unique
}

function Stop-AndRemove-Service([string]$Name) {
  $svc = Get-Service -Name $Name -ErrorAction SilentlyContinue
  if (-not $svc) { return $false }

  Write-Step "Stopping service: $Name"
  if ($svc.Status -ne 'Stopped') {
    Stop-Service -Name $Name -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
  }

  Write-Step "Deleting service: $Name"
  sc.exe delete $Name 2>$null | Out-Null
  Start-Sleep -Seconds 1
  return $true
}

function Find-ShelfPosUninstaller {
  $candidates = @(
    (Join-Path $env:LOCALAPPDATA 'Programs\ShelfPOS\Uninstall ShelfPOS.exe'),
    (Join-Path ${env:ProgramFiles} 'ShelfPOS\Uninstall ShelfPOS.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'ShelfPOS\Uninstall ShelfPOS.exe')
  )

  foreach ($path in $candidates) {
    if (Test-Path $path) { return $path }
  }

  $registryRoots = @(
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
  )

  foreach ($root in $registryRoots) {
    $entries = Get-ItemProperty $root -ErrorAction SilentlyContinue |
      Where-Object {
        $_.DisplayName -like '*ShelfPOS*' -or
        $_.Publisher -like '*ShelfPOS*' -or
        $_.InstallLocation -like '*ShelfPOS*'
      }

    foreach ($entry in $entries) {
      if ($entry.UninstallString) {
        $raw = $entry.UninstallString.Trim()
        if ($raw -match '^"(?<path>[^"]+)"') {
          $exe = $Matches.path
        } elseif ($raw -match '^(?<path>\S+\.exe)') {
          $exe = $Matches.path
        } else {
          continue
        }
        if (Test-Path $exe) { return $exe }
      }
      if ($entry.InstallLocation) {
        $fromLocation = Join-Path $entry.InstallLocation.Trim('"') 'Uninstall ShelfPOS.exe'
        if (Test-Path $fromLocation) { return $fromLocation }
      }
    }
  }

  return $null
}

Write-Host ''
Write-Host '=== ShelfPOS uninstaller ===' -ForegroundColor Cyan
Write-Host ''

if (-not $SkipSync) {
  Write-Host '[1/3] Sync service' -ForegroundColor Cyan
  $removedAnyService = $false
  $serviceNames = @($SyncServiceNames + (Get-ShelfPosSyncServices)) | Select-Object -Unique
  foreach ($name in $serviceNames) {
    if (Stop-AndRemove-Service $name) { $removedAnyService = $true }
  }
  if (-not $removedAnyService) {
    Write-Skip '  No ShelfPOS sync Windows service found.'
  }

  if (Test-Path $SyncInstallDir) {
    Write-Step "Removing $SyncInstallDir"
    Remove-Item -Recurse -Force $SyncInstallDir
    Write-Ok '  Sync files removed.'
  } else {
    Write-Skip '  Sync install folder not found.'
  }

  if ((Test-Path $ShelfPosProgramDir) -and -not (Get-ChildItem $ShelfPosProgramDir -ErrorAction SilentlyContinue)) {
    Remove-Item -Force $ShelfPosProgramDir
  }
} else {
  Write-Skip '[1/3] Sync service skipped (-SkipSync).'
}

Write-Host ''
if (-not $SkipApp) {
  Write-Host '[2/3] ShelfPOS app' -ForegroundColor Cyan
  $uninstaller = Find-ShelfPosUninstaller
  if ($uninstaller) {
    Write-Step "Running uninstaller: $uninstaller"
    $proc = Start-Process -FilePath $uninstaller -ArgumentList '/S' -PassThru -Wait
    if ($proc.ExitCode -eq 0) {
      Write-Ok '  ShelfPOS app uninstalled.'
    } else {
      Write-Host "  Uninstaller exited with code $($proc.ExitCode). You may need to remove it from Settings -> Apps." -ForegroundColor Red
    }
  } else {
    Write-Skip '  ShelfPOS uninstaller not found (app may already be removed).'
    Write-Skip '  Tip: Settings -> Apps -> Installed apps -> ShelfPOS -> Uninstall'
  }
} else {
  Write-Skip '[2/3] ShelfPOS app skipped (-SkipApp).'
}

Write-Host ''
Write-Host '[3/3] User data' -ForegroundColor Cyan
if ($RemoveData) {
  if (Test-Path $AppDataDir) {
    Write-Step "Removing $AppDataDir"
    Remove-Item -Recurse -Force $AppDataDir
    Write-Ok '  User data removed (database, license, backups).'
  } else {
    Write-Skip '  No user data folder found.'
  }
} else {
  if (Test-Path $AppDataDir) {
    Write-Skip "  Keeping user data: $AppDataDir"
    Write-Skip '  Re-run with -RemoveData to delete shelf.db, license, and backups.'
  } else {
    Write-Skip '  No user data folder found.'
  }
}

Write-Host ''
Write-Ok 'Uninstall finished.'
