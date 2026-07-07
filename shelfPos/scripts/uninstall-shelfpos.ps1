<#
.SYNOPSIS
  Removes ShelfPOS sync service and the ShelfPOS desktop app on Windows.

.DESCRIPTION
  Double-click Uninstall-ShelfPOS.cmd (recommended), or run this script in PowerShell as Administrator.

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
  [switch]$SkipSync,
  [switch]$SkipData
)

$ErrorActionPreference = 'Stop'

$SyncServiceNames = @('shelfpossync.exe', 'ShelfPOSSync', 'ShelfPOS Sync')
$SyncInstallDir = Join-Path ${env:ProgramFiles} 'ShelfPOS\sync-service'
$ShelfPosProgramDir = Join-Path ${env:ProgramFiles} 'ShelfPOS'
$AppDataDir = Join-Path $env:APPDATA 'shelfpos'

function Test-IsAdministrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal $identity
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Invoke-ElevatedSyncRemoval {
  Write-Host ''
  Write-Host 'Administrator rights are required to remove the sync service.' -ForegroundColor Yellow
  Write-Host 'Requesting elevation (approve the UAC prompt)...' -ForegroundColor Yellow
  Write-Host ''

  $argList = @(
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    $PSCommandPath,
    '-SkipApp',
    '-SkipData'
  )

  $proc = Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $argList -PassThru -Wait
  if ($null -ne $proc.ExitCode) { return $proc.ExitCode }
  return 1
}

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
      $_.Name -eq 'shelfpossync.exe' -or
      $_.DisplayName -like '*ShelfPOS*Sync*' -or
      $_.DisplayName -eq 'ShelfPOS Sync'
    } |
    Select-Object -ExpandProperty Name -Unique
}

function Stop-AndRemove-Service([string]$Name) {
  $svc = Get-Service -Name $Name -ErrorAction SilentlyContinue
  if (-not $svc) {
    $svc = Get-Service -DisplayName $Name -ErrorAction SilentlyContinue
  }
  if (-not $svc) { return $false }

  $serviceName = $svc.Name
  Write-Step "Stopping service: $serviceName"
  if ($svc.Status -ne 'Stopped') {
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
  }

  Write-Step "Deleting service: $serviceName"
  sc.exe delete $serviceName 2>$null | Out-Null
  Start-Sleep -Seconds 1
  return $true
}

function Test-SyncRemovalNeeded {
  if (Test-Path $SyncInstallDir) { return $true }

  $serviceNames = @($SyncServiceNames + (Get-ShelfPosSyncServices)) | Select-Object -Unique
  foreach ($name in $serviceNames) {
    if (Get-Service -Name $name -ErrorAction SilentlyContinue) { return $true }
    if (Get-Service -DisplayName $name -ErrorAction SilentlyContinue) { return $true }
  }

  return $false
}

function Remove-ShelfPosWindowsService([string]$InstallDir) {
  $serviceNames = @($SyncServiceNames + (Get-ShelfPosSyncServices)) | Select-Object -Unique
  $hasService = $false
  foreach ($name in $serviceNames) {
    if (Get-Service -Name $name -ErrorAction SilentlyContinue) { $hasService = $true; break }
    if (Get-Service -DisplayName $name -ErrorAction SilentlyContinue) { $hasService = $true; break }
  }
  if (-not $hasService) {
    return $false
  }

  $uninstallJs = Join-Path $InstallDir 'scripts\uninstall-windows-service.cjs'
  $nodeExe = Join-Path $InstallDir 'node.exe'
  if (-not (Test-Path $uninstallJs) -or -not (Test-Path $nodeExe)) {
    return $false
  }
  if (-not (Test-Path (Join-Path $InstallDir 'node_modules\node-windows'))) {
    return $false
  }
  Write-Step 'Removing ShelfPOSSync via node-windows…'
  & $nodeExe $uninstallJs $InstallDir 2>&1 | Out-Host
  if ($LASTEXITCODE -ne 0) {
    Write-Skip '  node-windows uninstall did not complete; falling back to sc.exe service removal.'
    return $false
  }
  Start-Sleep -Seconds 2
  return $true
}

function Stop-ShelfPosAppProcesses {
  Get-Process -Name 'ShelfPOS' -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Step "Closing process: ShelfPOS (pid $($_.Id))"
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
  }

  Get-CimInstance Win32_Process -Filter "Name = 'electron.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.ExecutablePath -like '*ShelfPOS*' } |
    ForEach-Object {
      Write-Step "Closing process: electron (pid $($_.ProcessId))"
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }

  Start-Sleep -Seconds 2
}

function Get-ShelfPosUninstallSpec {
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
        if ($raw -match '^"(?<path>[^"]+)"(?<args>.*)$') {
          $exe = $Matches.path
          $args = $Matches.args.Trim()
        } elseif ($raw -match '^(?<path>\S+\.exe)(?<args>\s+.*)?$') {
          $exe = $Matches.path
          $args = if ($Matches.args) { $Matches.args.Trim() } else { '' }
        } else {
          continue
        }
        if (Test-Path $exe) {
          return [PSCustomObject]@{
            Exe = $exe
            Arguments = $args
          }
        }
      }
      if ($entry.InstallLocation) {
        $fromLocation = Join-Path $entry.InstallLocation.Trim('"') 'Uninstall ShelfPOS.exe'
        if (Test-Path $fromLocation) {
          return [PSCustomObject]@{
            Exe = $fromLocation
            Arguments = ''
          }
        }
      }
    }
  }

  $candidates = @(
    (Join-Path $env:LOCALAPPDATA 'Programs\ShelfPOS\Uninstall ShelfPOS.exe'),
    (Join-Path ${env:ProgramFiles} 'ShelfPOS\Uninstall ShelfPOS.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'ShelfPOS\Uninstall ShelfPOS.exe')
  )

  foreach ($path in $candidates) {
    if (Test-Path $path) {
      return [PSCustomObject]@{
        Exe = $path
        Arguments = ''
      }
    }
  }

  return $null
}

function Invoke-ShelfPosUninstaller {
  param(
    [Parameter(Mandatory = $true)][string]$Exe,
    [string]$ExtraArgs = '',
    [int]$TimeoutSec = 120
  )

  $argList = @('/S')
  if ($ExtraArgs) {
    $argList += ($ExtraArgs -split '\s+' | Where-Object { $_ -and $_ -ne '/S' })
  }

  Write-Step "Running uninstaller: $Exe $($argList -join ' ')"

  $proc = Start-Process -FilePath $Exe -ArgumentList $argList -PassThru
  $finished = $proc.WaitForExit($TimeoutSec * 1000)
  if (-not $finished) {
    try { $proc.Kill() } catch { }
    Write-Host "  Uninstaller timed out after ${TimeoutSec}s (ShelfPOS may still be open or waiting for input)." -ForegroundColor Red
    Write-Host '  Close ShelfPOS from the taskbar, then run Settings -> Apps -> ShelfPOS -> Uninstall.' -ForegroundColor Yellow
    return $false
  }

  if ($proc.ExitCode -eq 0) {
    Write-Ok '  ShelfPOS app uninstalled.'
    return $true
  }

  Write-Host "  Uninstaller exited with code $($proc.ExitCode). You may need to remove it from Settings -> Apps." -ForegroundColor Red
  return $false
}

Write-Host ''
Write-Host '=== ShelfPOS uninstaller ===' -ForegroundColor Cyan
Write-Host ''

try {
if (-not $SkipSync -and -not (Test-IsAdministrator) -and (Test-SyncRemovalNeeded)) {
  $exitCode = Invoke-ElevatedSyncRemoval
  if ($exitCode -ne 0) {
    throw "Elevated sync-service removal failed with exit code $exitCode."
  }
  $SkipSync = $true
}

if (-not $SkipSync) {
  Write-Host '[1/3] Sync service' -ForegroundColor Cyan
  $removedAnyService = $false
  if (Test-Path $SyncInstallDir) {
    if (Remove-ShelfPosWindowsService $SyncInstallDir) { $removedAnyService = $true }
  }
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
  Stop-ShelfPosAppProcesses
  $uninstallSpec = Get-ShelfPosUninstallSpec
  if ($uninstallSpec) {
    Invoke-ShelfPosUninstaller -Exe $uninstallSpec.Exe -ExtraArgs $uninstallSpec.Arguments | Out-Null
  } else {
    Write-Skip '  ShelfPOS uninstaller not found (app may already be removed).'
    Write-Skip '  Tip: Settings -> Apps -> Installed apps -> ShelfPOS -> Uninstall'
  }
} else {
  Write-Skip '[2/3] ShelfPOS app skipped (-SkipApp).'
}

Write-Host ''
Write-Host '[3/3] User data' -ForegroundColor Cyan
if ($SkipData) {
  Write-Skip '  User data skipped (-SkipData).'
} elseif ($RemoveData) {
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

} catch {
  Write-Host ''
  Write-Host "Uninstall failed: $($_.Exception.Message)" -ForegroundColor Red
  if ($Host.Name -eq 'ConsoleHost') { Read-Host 'Press Enter to close' }
  exit 1
}
