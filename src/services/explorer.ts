/**
 * Explorer integration — opens a workspace folder in Windows Explorer and then
 * force-activates the new folder window so it appears on top of other windows.
 *
 * The activation is best-effort and non-blocking: Explorer is spawned first,
 * then a short delay gives the shell time to create the window before a
 * background PowerShell script finds it by title and brings it to the front
 * (a brief TOPMOST pulse, not a persistent always-on-top pin).
 */

import { spawn } from 'node:child_process'
import { basename } from 'node:path'

/** How long to wait after Explorer launches before the focus poller starts. */
const FOCUS_DELAY_MS = 500

/**
 * PowerShell script run after Explorer opens. It polls for the Explorer window
 * whose title contains the target folder name (up to 8s), activates it, and
 * gives it a short TOPMOST pulse so it lands above other windows without
 * staying pinned.
 */
const FOCUS_SCRIPT = `
$title = $env:MG_DSH_EXPLORER_TITLE
$deadline = (Get-Date).AddSeconds(8)
$p = $null
do {
  $p = Get-Process explorer | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle.Contains($title) } | Select-Object -First 1
  if ($null -ne $p) { break }
  Start-Sleep -Milliseconds 500
} while ((Get-Date) -lt $deadline)
if ($null -ne $p) {
  Add-Type -AssemblyName Microsoft.VisualBasic
  [Microsoft.VisualBasic.Interaction]::AppActivate($p.Id)
  Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class MgExplorerWin32 {
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
  public static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
  public const uint SWP_NOSIZE = 0x0001;
  public const uint SWP_NOMOVE = 0x0002;
  public const uint SWP_SHOWWINDOW = 0x0040;
}
"@
  [MgExplorerWin32]::SetWindowPos($p.MainWindowHandle, [MgExplorerWin32]::HWND_TOPMOST, 0, 0, 0, 0, [MgExplorerWin32]::SWP_NOSIZE -bor [MgExplorerWin32]::SWP_NOMOVE -bor [MgExplorerWin32]::SWP_SHOWWINDOW) | Out-Null
  Start-Sleep -Milliseconds 400
  [MgExplorerWin32]::SetWindowPos($p.MainWindowHandle, [MgExplorerWin32]::HWND_NOTOPMOST, 0, 0, 0, 0, [MgExplorerWin32]::SWP_NOSIZE -bor [MgExplorerWin32]::SWP_NOMOVE) | Out-Null
}
`

/** Open a folder with the platform's file manager and focus it on Windows. */
export function openFolderInExplorer(folderPath: string): void {
  if (process.platform !== 'win32') {
    spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [folderPath], {
      detached: true,
      stdio: 'ignore',
    }).unref()
    return
  }

  // NOTE: do NOT pass windowsHide:true here — it can cause Explorer to start
  // with its folder window hidden, making the tray command appear dead.
  spawn('explorer.exe', [folderPath], { detached: true, stdio: 'ignore' }).unref()
  setTimeout(() => focusExplorerWindow(folderPath), FOCUS_DELAY_MS)
}

/** Best-effort: activate the Explorer window showing `folderPath`. */
function focusExplorerWindow(folderPath: string): void {
  try {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', FOCUS_SCRIPT], {
      env: {
        ...process.env,
        MG_DSH_EXPLORER_TITLE: basename(folderPath),
      },
      windowsHide: true,
      stdio: 'ignore',
      detached: true,
    })
    child.unref()
  } catch (error) {
    console.warn(`[mg-dsh-desktop] explorer focus failed: ${String(error)}`)
  }
}
