<#
.SYNOPSIS
  Lists Epson receipt printers on this PC (TM-T81III, TM-T20, etc.).

.DESCRIPTION
  Run on the customer PC over TeamViewer before testing print.

    powershell -NoProfile -ExecutionPolicy Bypass -File .\1-diagnose-epson-printer.ps1

  IMPORTANT: Installing the Epson APD *driver* is not enough — Windows must also
  have a *printer queue* (visible in Settings → Printers). This script checks both.
#>
$ErrorActionPreference = 'Continue'

function Wait-ForKey {
  if ($Host.Name -ne 'ConsoleHost') { return }
  Write-Host ''
  Write-Host 'Press any key to close...' -ForegroundColor DarkGray
  $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

function Get-ReceiptPrinterScore($p) {
  $score = 0
  $name = [string]$p.Name
  if ($name -match 'Receipt|Recibo') { $score += 100 }
  if ([string]$p.Datatype -eq 'RAW') { $score += 80 }
  if ($name -match 'T81III|81III') { $score += 60 }
  elseif ($name -match 'TM-T81') { $score += 40 }
  elseif ($name -match 'T20III') { $score += 50 }
  elseif ($name -match 'T20II|T20') { $score += 30 }
  return $score
}

function Show-FixSteps {
  Write-Host ''
  Write-Host '=== WHAT TO DO ===' -ForegroundColor Cyan
  Write-Host '  1. Printer ON, USB cable connected directly (not through hub if possible)'
  Write-Host '  2. Settings > Bluetooth y dispositivos > Impresoras y escaneres'
  Write-Host '     > Agregar dispositivo > debe aparecer EPSON TM-T81III'
  Write-Host '  3. If only the driver is installed, run Epson APD setup again and choose'
  Write-Host '     Install printer / Instalar impresora (not driver-only)'
  Write-Host '  4. After a queue appears, re-run this script, then 2-test-epson-raw-print.ps1'
  Write-Host ''
}

Write-Host ''
Write-Host '=== ShelfPOS - Epson printer diagnostic ===' -ForegroundColor Cyan
Write-Host ''

# --- Print Spooler ---
$spooler = Get-Service -Name Spooler -ErrorAction SilentlyContinue
Write-Host '--- Print Spooler service ---' -ForegroundColor Yellow
if ($spooler) {
  $color = if ($spooler.Status -eq 'Running') { 'Green' } else { 'Red' }
  Write-Host "  Spooler: $($spooler.Status)" -ForegroundColor $color
  if ($spooler.Status -ne 'Running') {
    Write-Host '  FIX: services.msc > Print Spooler > Start' -ForegroundColor Red
  }
} else {
  Write-Host '  Could not read Spooler service.' -ForegroundColor Red
}
Write-Host ''

# --- Epson drivers (installed in Windows, may exist WITHOUT a queue) ---
Write-Host '--- Epson printer drivers (driver only - not the same as a queue) ---' -ForegroundColor Yellow
$drivers = @(Get-PrinterDriver -ErrorAction SilentlyContinue | Where-Object {
  $_.Name -match 'EPSON|Epson|TM-T|T81|81III|T20'
})
if ($drivers.Count -eq 0) {
  Write-Host '  No Epson drivers found in Windows.' -ForegroundColor Red
  Write-Host '  -> Install APD_612_T81III_WM from Epson, then add the printer in Settings.'
} else {
  $drivers | Sort-Object Name | Format-Table Name, MajorVersion, PrinterEnvironment -AutoSize
  Write-Host ('  (' + $drivers.Count + ' Epson driver(s) installed - good, but ShelfPOS needs a queue too)') -ForegroundColor DarkYellow
}
Write-Host ''

# --- USB / PnP (is the device visible to Windows?) ---
Write-Host '--- USB devices (Epson / TM) ---' -ForegroundColor Yellow
$usb = @(Get-PnpDevice -ErrorAction SilentlyContinue | Where-Object {
  $_.FriendlyName -match 'EPSON|Epson|TM-T|T81|81III' -and $_.Status -ne 'Unknown'
})
if ($usb.Count -eq 0) {
  Write-Host '  No Epson USB device detected.' -ForegroundColor Red
  Write-Host '  -> Check power, USB cable, try another USB port, reinstall driver.'
} else {
  $usb | Format-Table Status, Class, FriendlyName -AutoSize
}
Write-Host ''

# --- All printer queues ---
$all = @(Get-Printer -ErrorAction SilentlyContinue)
Write-Host '--- All printer queues in Windows ---' -ForegroundColor Yellow
if ($all.Count -eq 0) {
  Write-Host '  NO printer queues at all.' -ForegroundColor Red
  Write-Host ''
  Write-Host '  This is the usual problem when APD is installed but nothing prints:' -ForegroundColor Red
  Write-Host '  Windows has the driver files but no impresora/cola was created.' -ForegroundColor Red
  Show-FixSteps
  Wait-ForKey
  exit 1
}

$all | Sort-Object Name | Format-Table Name, DriverName, Datatype, PortName, PrinterStatus -AutoSize

$epson = @($all | Where-Object {
  $_.Name -match 'EPSON|Epson|TM-T|T81|T20|81III' -or
  $_.DriverName -match 'EPSON|Epson|TM-T|T81|81III|T20'
})

if ($epson.Count -eq 0) {
  Write-Host '--- Epson queues ---' -ForegroundColor Yellow
  Write-Host '  Printers exist, but NONE are Epson / TM-T81III / TM-T20.' -ForegroundColor Red
  Write-Host '  Driver may be installed - add the Epson queue in Settings > Printers.' -ForegroundColor Red
  Show-FixSteps
  Wait-ForKey
  exit 1
}

Write-Host '--- Epson / TM candidates (ShelfPOS uses these) ---' -ForegroundColor Yellow
$epson | Sort-Object { Get-ReceiptPrinterScore $_ } -Descending |
  Format-Table @{ L = 'Score'; E = { Get-ReceiptPrinterScore $_ } }, Name, DriverName, Datatype, PortName, PrinterStatus -AutoSize

$best = $epson | Sort-Object { Get-ReceiptPrinterScore $_ } -Descending | Select-Object -First 1
Write-Host '--- BEST MATCH ---' -ForegroundColor Green
Write-Host "  Name:     $($best.Name)"
Write-Host "  Driver:   $($best.DriverName)"
Write-Host "  Datatype: $($best.Datatype)"
Write-Host "  Port:     $($best.PortName)"
Write-Host "  Status:   $($best.PrinterStatus)"
Write-Host ''

$known = @(
  'EPSON TM-T81III Receipt',
  'EPSON TM-T81III ReceiptE',
  'EPSON TM-T81III Recibo',
  'TM-T81III Receipt',
  'TM-T81III Recibo',
  'EPSON TM-T81III',
  'TM-T81III',
  'EPSON TM-T20III Receipt',
  'EPSON TM-T20II Receipt',
  'EPSON TM-T20 Receipt'
)
Write-Host '--- Known-name probe (ShelfPOS order) ---' -ForegroundColor Yellow
$foundKnown = $false
foreach ($n in $known) {
  $p = Get-Printer -Name $n -ErrorAction SilentlyContinue
  if ($p) {
    Write-Host "  FOUND: $n" -ForegroundColor Green
    $foundKnown = $true
    break
  }
}
if (-not $foundKnown) {
  Write-Host '  No exact known name - using BEST MATCH above.' -ForegroundColor DarkYellow
}

Write-Host ''
Write-Host '--- Printer ports ---' -ForegroundColor Yellow
Get-PrinterPort -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match 'USB|TM|ESD|Epson|EPSON' -or $_.Description -match 'Epson|TM-T|T81' } |
  Format-Table Name, Description, MonitorName -AutoSize

Write-Host ''
Write-Host 'ShelfPOS override (if needed, then restart app):' -ForegroundColor Cyan
Write-Host ('  setx SHELFPOS_PRINTER_NAME ' + $best.Name) -ForegroundColor White
Write-Host ''
Write-Host 'Next: run 2-test-epson-raw-print.ps1' -ForegroundColor Cyan
Write-Host ''
Wait-ForKey
