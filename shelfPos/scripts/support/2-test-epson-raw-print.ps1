<#
.SYNOPSIS
  Sends a raw ESC/POS test receipt (same method as ShelfPOS).

.PARAMETER PrinterName
  Exact Windows queue name. If omitted, auto-detects TM-T81III / TM-T20.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\2-test-epson-raw-print.ps1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File .\2-test-epson-raw-print.ps1 -PrinterName "EPSON TM-T81III Receipt"
#>
param(
  [string]$PrinterName = ''
)

$ErrorActionPreference = 'Stop'

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

function Resolve-EpsonPrinter([string]$Override) {
  if ($Override) {
    $p = Get-Printer -Name $Override -ErrorAction SilentlyContinue
    if (-not $p) { throw "Printer not found: $Override" }
    return $p.Name
  }

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
  foreach ($n in $known) {
    if (Get-Printer -Name $n -ErrorAction SilentlyContinue) { return $n }
  }

  $candidates = @(Get-Printer | Where-Object { $_.Name -match '81III|T81III|TM-T81|TM-T20|T20III|T20II' })
  if ($candidates.Count -eq 0) {
    throw 'No Epson TM-T81III / TM-T20 printer found. Run 1-diagnose-epson-printer.ps1 first.'
  }
  $best = $candidates | Sort-Object { Get-ReceiptPrinterScore $_ } -Descending | Select-Object -First 1
  return [string]$best.Name
}

function New-TestReceiptBytes {
  $text = [System.Text.Encoding]::ASCII.GetBytes('ShelfPOS TEST')
  $line2 = [System.Text.Encoding]::ASCII.GetBytes('TM-T81III / TM-T20 raw OK')
  # ESC @ init, ESC t 2 (CP850), centered bold text, feed, partial cut
  $init = [byte[]](0x1b, 0x40, 0x1b, 0x74, 0x02)
  $alignCenter = [byte[]](0x1b, 0x61, 0x01)
  $boldOn = [byte[]](0x1b, 0x45, 0x01)
  $boldOff = [byte[]](0x1b, 0x45, 0x00)
  $alignLeft = [byte[]](0x1b, 0x61, 0x00)
  $lf = [byte[]](0x0a)
  $feed = [byte[]](0x1b, 0x64, 0x04)
  $cut = [byte[]](0x1d, 0x56, 0x42, 0x00)
  $bytes = [System.Collections.Generic.List[byte]]::new()
  $bytes.AddRange($init)
  $bytes.AddRange($alignCenter)
  $bytes.AddRange($boldOn)
  $bytes.AddRange($text)
  $bytes.AddRange($boldOff)
  $bytes.AddRange($lf)
  $bytes.AddRange($alignCenter)
  $bytes.AddRange($line2)
  $bytes.AddRange($lf)
  $bytes.AddRange($lf)
  $bytes.AddRange($alignLeft)
  $bytes.AddRange($feed)
  $bytes.AddRange($cut)
  return [byte[]]$bytes.ToArray()
}

function Send-RawSpooler([string]$Printer, [string]$FilePath) {
  $src = @'
using System;
using System.IO;
using System.Runtime.InteropServices;
namespace ShelfPosTest {
  public class RawPrinter {
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public class DOCINFO {
      [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
      [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
      [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
    }
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    public static extern bool OpenPrinter(string src, out IntPtr h, IntPtr d);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool ClosePrinter(IntPtr h);
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    public static extern bool StartDocPrinter(IntPtr h, int level, [In] DOCINFO di);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool EndDocPrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool StartPagePrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool EndPagePrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)]
    public static extern bool WritePrinter(IntPtr h, IntPtr buf, int count, out int written);
    public static void Send(string printer, string file) {
      byte[] bytes = File.ReadAllBytes(file);
      IntPtr h;
      if (!OpenPrinter(printer, out h, IntPtr.Zero))
        throw new Exception("OpenPrinter failed: " + Marshal.GetLastWin32Error());
      try {
        DOCINFO di = new DOCINFO();
        di.pDocName = "ShelfPOS Test";
        di.pDataType = "RAW";
        if (!StartDocPrinter(h, 1, di))
          throw new Exception("StartDocPrinter failed: " + Marshal.GetLastWin32Error());
        try {
          if (!StartPagePrinter(h)) throw new Exception("StartPagePrinter failed");
          IntPtr p = Marshal.AllocHGlobal(bytes.Length);
          try {
            Marshal.Copy(bytes, 0, p, bytes.Length);
            int written;
            if (!WritePrinter(h, p, bytes.Length, out written))
              throw new Exception("WritePrinter failed: " + Marshal.GetLastWin32Error());
          } finally { Marshal.FreeHGlobal(p); }
          EndPagePrinter(h);
        } finally { EndDocPrinter(h); }
      } finally { ClosePrinter(h); }
    }
  }
}
'@
  Add-Type -TypeDefinition $src -Language CSharp -ErrorAction Stop
  [ShelfPosTest.RawPrinter]::Send($Printer, $FilePath)
}

Write-Host ''
Write-Host '=== ShelfPOS — raw ESC/POS print test ===' -ForegroundColor Cyan
Write-Host ''

$printer = Resolve-EpsonPrinter $PrinterName
$info = Get-Printer -Name $printer
Write-Host "Printer:  $printer"
Write-Host "Driver:   $($info.DriverName)"
Write-Host "Datatype: $($info.Datatype)"
Write-Host "Port:     $($info.PortName)"
Write-Host "Status:   $($info.PrinterStatus)"
Write-Host ''

$dir = Join-Path $env:TEMP 'shelfpos-print-test'
New-Item -ItemType Directory -Path $dir -Force | Out-Null
$bin = Join-Path $dir 'test-receipt.bin'
[System.IO.File]::WriteAllBytes($bin, (New-TestReceiptBytes))
Write-Host "Wrote $($bin.Length) bytes -> $bin"
Write-Host ''
Write-Host 'Sending via Windows spooler (RAW)...' -ForegroundColor Yellow

try {
  Send-RawSpooler -Printer $printer -FilePath $bin
  Write-Host ''
  Write-Host 'SUCCESS — job sent to spooler.' -ForegroundColor Green
  Write-Host 'Check the printer for a ticket that says:' -ForegroundColor Green
  Write-Host '  ShelfPOS TEST' -ForegroundColor White
  Write-Host '  TM-T81III / TM-T20 raw OK' -ForegroundColor White
  Write-Host ''
  Write-Host 'If nothing printed but no error:' -ForegroundColor DarkYellow
  Write-Host '  1. Confirm queue name with 1-diagnose-epson-printer.ps1'
  Write-Host "  2. setx SHELFPOS_PRINTER_NAME `"$printer`""
  Write-Host '  3. Install Epson APD — prefer "EPSON TM-T81III Receipt" queue'
  Write-Host '  4. Re-run with explicit name:'
  Write-Host "     -PrinterName `"$printer`""
  exit 0
} catch {
  Write-Host ''
  Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host ''
  Write-Host 'Try another queue name from diagnose script, e.g.:' -ForegroundColor Yellow
  Write-Host '  -PrinterName "EPSON TM-T81III Receipt"'
  exit 1
}
