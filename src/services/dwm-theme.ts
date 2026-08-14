/**
 * Title-bar light/dark switching — the one place that talks to Windows' DWM.
 *
 * webviewjs' `win.setTheme` is a no-op for the window chrome on Windows (the
 * docs' "unsupported platforms do nothing" clause), so the real switch is
 * `DwmSetWindowAttribute` with DWMWA_USE_IMMERSIVE_DARK_MODE (20) on the
 * window's HWND — the same call Electron's nativeTheme makes.
 *
 * Two carriers, fastest first:
 *  - koffi: direct FFI into dwmapi.dll, ~1ms. (A PowerShell spawn takes
 *    1.3s per call and a persistent stdin pipeline is just as slow, so any
 *    subprocess route is unusable for live theme-following.)
 *  - PowerShell fallback: keeps the feature alive if the native binding is
 *    unavailable; the shell logs and proceeds either way.
 */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** Cached koffi binding; undefined when the FFI module could not load. */
let koffiSet: ((hwnd: bigint, dark: boolean) => boolean) | undefined

/** Load the koffi binding for DwmSetWindowAttribute (once). */
function loadKoffi(): ((hwnd: bigint, dark: boolean) => boolean) | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi') as {
      load: (name: string) => { func: (sig: string) => (hwnd: bigint, attr: number, value: Buffer, size: number) => number }
    }
    const dwmapi = koffi.load('dwmapi.dll')
    const fn = dwmapi.func('int DwmSetWindowAttribute(int64 hwnd, int attr, void* value, int size)')
    return (hwnd, dark) => {
      const v = Buffer.alloc(4)
      v.writeInt32LE(dark ? 1 : 0, 0)
      return fn(hwnd, 20, v, 4) === 0
    }
  } catch {
    return undefined
  }
}

/**
 * Force the native title bar light/dark via koffi (fast path). Returns false
 * when the FFI binding is unavailable, so the caller can run the slow
 * PowerShell fallback.
 */
export function setTitleBarDark(hwnd: bigint, dark: boolean): boolean {
  koffiSet ??= loadKoffi()
  if (koffiSet === undefined) return false
  try {
    return koffiSet(hwnd, dark)
  } catch (error) {
    console.warn(`[mg-dsh-desktop] dwm koffi call failed: ${String(error)}`)
    return false
  }
}

/** PowerShell fallback (≈1.3s per call; only used when koffi is unavailable). */
export function setTitleBarDarkPowerShell(hwnd: bigint, dark: boolean): void {
  try {
    const script = [
      `Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;`,
      `public static class M{[DllImport("dwmapi.dll")]public static extern int DwmSetWindowAttribute(IntPtr h,int a,ref int v,int s);}';`,
      `$v=${dark ? 1 : 0};$r=[M]::DwmSetWindowAttribute([IntPtr]${hwnd},20,[ref]$v,4);`,
      `[Console]::WriteLine("result=" + $r)`,
    ].join(' ')
    // NOT -WindowStyle Hidden and NOT detached: on Windows both swallow the
    // child's stdout pipe (the call still runs, but the result can never be
    // logged). A short -Command invocation does not flash a visible console.
    const child = spawn('powershell.exe', ['-NoProfile', '-Command', script], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    child.stdout.on('data', (chunk: Buffer) => {
      console.log(`[mg-dsh-desktop] dwm ps(${hwnd}, ${dark ? 'dark' : 'light'}) -> ${chunk.toString().trim()}`)
    })
    child.stderr.on('data', (chunk: Buffer) => {
      console.warn(`[mg-dsh-desktop] dwm ps script error: ${chunk.toString().trim()}`)
    })
    child.on('error', (error) => {
      console.warn(`[mg-dsh-desktop] dwm ps spawn failed: ${error.message}`)
    })
  } catch {
    // Best-effort; win.setTheme still runs alongside.
  }
}
