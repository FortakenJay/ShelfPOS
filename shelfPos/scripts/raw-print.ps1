param(
  [Parameter(Mandatory=$true)][string]$Printer,
  [Parameter(Mandatory=$true)][string]$Path
)
$ErrorActionPreference = 'Stop'
$src = @'
using System;
using System.IO;
using System.Runtime.InteropServices;
namespace ShelfPos {
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
        di.pDocName = "ShelfPOS Receipt";
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
    public static void SendToPort(string portName, string file) {
      if (string.IsNullOrWhiteSpace(portName)) throw new Exception("Missing printer port");
      string path = @"\\\\.\\" + portName.Trim();
      byte[] bytes = File.ReadAllBytes(file);
      using (var fs = new FileStream(path, FileMode.Open, FileAccess.Write, FileShare.ReadWrite)) {
        fs.Write(bytes, 0, bytes.Length);
      }
    }
  }
}
'@
if (-not ('ShelfPos.RawPrinter' -as [type])) {
  Add-Type -TypeDefinition $src -Language CSharp
}
$info = Get-Printer -Name $Printer
$errors = [System.Collections.Generic.List[string]]::new()
try {
  [ShelfPos.RawPrinter]::Send($Printer, $Path)
  exit 0
} catch {
  $errors.Add('spooler: ' + $_.Exception.Message)
}
if ($info -and [string]$info.PortName) {
  try {
    [ShelfPos.RawPrinter]::SendToPort([string]$info.PortName, $Path)
    exit 0
  } catch {
    $errors.Add('port ' + $info.PortName + ': ' + $_.Exception.Message)
  }
}
throw [System.Exception]::new(($errors -join ' | '))
