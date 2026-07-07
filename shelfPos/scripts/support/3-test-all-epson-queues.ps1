<#
.SYNOPSIS
  Tries a test print on EVERY Epson/TM queue on this PC (for TeamViewer troubleshooting).

.DESCRIPTION
  Use when you are not sure which Windows queue is the real receipt printer.

    powershell -NoProfile -ExecutionPolicy Bypass -File .\3-test-all-epson-queues.ps1
#>
$ErrorActionPreference = 'Continue'

function Send-RawSpooler([string]$Printer, [byte[]]$Bytes) {
  $dir = Join-Path $env:TEMP 'shelfpos-print-test'
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  $bin = Join-Path $dir "test-$([Guid]::NewGuid().ToString('N')).bin"
  [System.IO.File]::WriteAllBytes($bin, $Bytes)

  $src = @'
using System;
using System.IO;
using System.Runtime.InteropServices;
namespace ShelfPosTestAll {
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
        throw new Exception("OpenPrinter " + Marshal.GetLastWin32Error());
      try {
        DOCINFO di = new DOCINFO();
        di.pDocName = "ShelfPOS Test";
        di.pDataType = "RAW";
        if (!StartDocPrinter(h, 1, di)) throw new Exception("StartDoc " + Marshal.GetLastWin32Error());
        try {
          if (!StartPagePrinter(h)) throw new Exception("StartPage failed");
          IntPtr p = Marshal.AllocHGlobal(bytes.Length);
          try {
            Marshal.Copy(bytes, 0, p, bytes.Length);
            int written;
            if (!WritePrinter(h, p, bytes.Length, out written)) throw new Exception("Write " + Marshal.GetLastWin32Error());
          } finally { Marshal.FreeHGlobal(p); }
          EndPagePrinter(h);
        } finally { EndDocPrinter(h); }
      } finally { ClosePrinter(h); }
    }
  }
}
'@
  if (-not ('ShelfPosTestAll.RawPrinter' -as [type])) {
    Add-Type -TypeDefinition $src -Language CSharp
  }
  [ShelfPosTestAll.RawPrinter]::Send($Printer, $bin)
  Remove-Item $bin -Force -ErrorAction SilentlyContinue
}

$label = [System.Text.Encoding]::ASCII.GetBytes('QUEUE TEST')
$init = [byte[]](0x1b, 0x40, 0x1b, 0x74, 0x02, 0x1b, 0x61, 0x01, 0x1b, 0x45, 0x01) + $label + [byte[]](0x1b, 0x45, 0x00, 0x0a, 0x0a, 0x1b, 0x64, 0x03, 0x1d, 0x56, 0x42, 0x00)

$queues = @(Get-Printer | Where-Object { $_.Name -match 'EPSON|Epson|TM-T|T81|81III|T20' } | Sort-Object Name)
if ($queues.Count -eq 0) {
  Write-Host 'No Epson queues found.' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host "=== Trying $($queues.Count) queue(s) — watch the printer after each ===" -ForegroundColor Cyan
Write-Host 'Press Enter after each attempt to continue...' -ForegroundColor DarkGray
Write-Host ''

$i = 0
foreach ($q in $queues) {
  $i++
  Write-Host "[$i/$($queues.Count)] $($q.Name)  (datatype=$($q.Datatype), port=$($q.PortName))" -ForegroundColor Yellow
  try {
    Send-RawSpooler -Printer $q.Name -Bytes $init
    Write-Host '  -> Spooler accepted job (check if paper printed)' -ForegroundColor Green
  } catch {
    Write-Host "  -> ERROR: $($_.Exception.Message)" -ForegroundColor Red
  }
  if ($i -lt $queues.Count) { Read-Host '  Enter for next queue' }
}

Write-Host ''
Write-Host 'Done. Use the queue name that actually printed:' -ForegroundColor Cyan
Write-Host '  setx SHELFPOS_PRINTER_NAME "EXACT NAME HERE"' -ForegroundColor White
Write-Host ''
