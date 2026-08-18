/**
 * Explorer integration — opens a workspace folder in Windows Explorer and then
 * force-activates the new folder window so it appears on top of other windows.
 *
 * Activation is best-effort and non-blocking. The primary path uses koffi +
 * user32 EnumWindows to find the Explorer window by class + title and brings it
 * to the foreground as soon as it appears (no PowerShell cold start). A
 * PowerShell fallback is kept for environments where the FFI binding fails.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { basename } from 'node:path'

const require = createRequire(import.meta.url)

/** How long to wait after Explorer launches before the focus poller starts. */
const FOCUS_DELAY_MS = 200
/** How often to poll for the Explorer window. */
const FOCUS_POLL_MS = 200
/** Give up after this long if the window never appears. */
const FOCUS_TIMEOUT_MS = 8_000

/**
 * PowerShell fallback script. Kept only for machines where koffi cannot load
 * user32; the koffi path is faster and avoids a ~1s PowerShell cold start.
 */
const FOCUS_SCRIPT = `
$title = $env:DSH_HUB_EXPLORER_TITLE
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
}
`

/** koffi-based focus API; undefined when user32 cannot be loaded. */
interface ExplorerFocusApi {
  /** Bring the Explorer window whose title contains `title` to the foreground. */
  tryFocus(title: string): boolean
}

let focusApi: ExplorerFocusApi | undefined
let shellOpenApi: ((path: string) => boolean) | undefined

/**
 * Load shell32 ShellExecuteW. This is the same fast path as PowerShell's
 * Invoke-Item / cmd's `start`, but without a console process and without
 * inheriting a hidden-show flag that would hide the Explorer window.
 */
function loadShellOpenApi(): ((path: string) => boolean) | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi') as {
      load(name: string): {
        func(sig: string): (...args: unknown[]) => unknown
      }
    }
    const shell32 = koffi.load('shell32.dll')
    const shellExecuteW = shell32.func(
      'intptr_t ShellExecuteW(void* hwnd, str16 operation, str16 file, str16 parameters, str16 directory, int show)',
    ) as (
      hwnd: unknown,
      operation: string | null,
      file: string,
      parameters: string | null,
      directory: string | null,
      show: number,
    ) => bigint
    return (path: string) => {
      // SW_SHOWNORMAL = 1
      const result = shellExecuteW(null, 'open', path, null, null, 1)
      return result > 32n
    }
  } catch {
    return undefined
  }
}

function loadFocusApi(): ExplorerFocusApi | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi') as {
      load(name: string): {
        func(sig: string): (...args: unknown[]) => unknown
      }
      pointer(name: string, type: unknown): unknown
      opaque(): unknown
      alias(name: string, type: unknown): unknown
      proto(sig: string): unknown
    }
    const user32 = koffi.load('user32.dll')
    const HANDLE = koffi.pointer('HANDLE', koffi.opaque())
    const HWND = koffi.alias('HWND', HANDLE)
    const EnumWindowsProc = koffi.proto('bool __stdcall EnumWindowsProc (HWND hwnd, long lParam)')

    const enumWindows = user32.func('bool EnumWindows(EnumWindowsProc *cb, long lParam)') as (
      cb: (hwnd: bigint | null, lParam: number) => boolean,
      lParam: number,
    ) => number
    const isWindowVisible = user32.func('bool IsWindowVisible(HWND hwnd)') as (hwnd: bigint) => number
    const getWindowTextLengthW = user32.func('int GetWindowTextLengthW(HWND hwnd)') as (hwnd: bigint) => number
    const getWindowTextW = user32.func('int GetWindowTextW(HWND hwnd, _Out_ char16_t *buf, int max)') as (
      hwnd: bigint,
      buf: Buffer,
      max: number,
    ) => number
    const getClassNameW = user32.func('int GetClassNameW(HWND hwnd, _Out_ char16_t *buf, int max)') as (
      hwnd: bigint,
      buf: Buffer,
      max: number,
    ) => number
    const setForegroundWindow = user32.func('bool SetForegroundWindow(HWND hwnd)') as (hwnd: bigint) => number
    const bringWindowToTop = user32.func('bool BringWindowToTop(HWND hwnd)') as (hwnd: bigint) => number

    const tryFocus = (title: string): boolean => {
      let found: bigint | null = null
      enumWindows((hwnd: bigint | null) => {
        if (found !== null) return false
        if (hwnd === null) return true
        try {
          if (!isWindowVisible(hwnd)) return true
          const length = getWindowTextLengthW(hwnd)
          if (length <= 0) return true
          const titleBuf = Buffer.alloc((length + 1) * 2)
          const titleLength = getWindowTextW(hwnd, titleBuf, length + 1)
          if (titleLength <= 0) return true
          const windowTitle = titleBuf.toString('utf16le', 0, titleLength * 2)
          if (!windowTitle.includes(title)) return true

          const classBuf = Buffer.alloc(512)
          const classLength = getClassNameW(hwnd, classBuf, 256)
          const className = classLength > 0 ? classBuf.toString('utf16le', 0, classLength * 2) : ''
          if (className !== 'CabinetWClass') return true

          found = hwnd
          return false
        } catch {
          return true
        }
      }, 0)
      if (found === null) return false
      setForegroundWindow(found)
      bringWindowToTop(found)
      return true
    }

    return { tryFocus }
  } catch {
    return undefined
  }
}

/** PowerShell fallback: activate the Explorer window by title. */
function runPowerShellFocus(folderPath: string): void {
  try {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', FOCUS_SCRIPT], {
      env: {
        ...process.env,
        DSH_HUB_EXPLORER_TITLE: basename(folderPath),
      },
      windowsHide: true,
      stdio: 'ignore',
      detached: true,
    })
    child.unref()
  } catch (error) {
    console.warn(`[dsh-hub] explorer focus (powershell) failed: ${String(error)}`)
  }
}

/** Open a folder with the platform's file manager and focus it on Windows. */
export function openFolderInExplorer(folderPath: string): void {
  if (process.platform !== 'win32') {
    spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [folderPath], {
      detached: true,
      stdio: 'ignore',
    }).unref()
    return
  }

  // Prefer ShellExecuteW (same fast path as Invoke-Item / cmd start) without
  // a console process and without a hidden-show flag. Fall back to spawning
  // explorer.exe directly (never with windowsHide, which hides the folder).
  const open = shellOpenApi ??= loadShellOpenApi()
  if (open !== undefined && open(folderPath)) {
    setTimeout(() => focusExplorerWindow(folderPath), FOCUS_DELAY_MS)
    return
  }
  spawn('explorer.exe', [folderPath], { detached: true, stdio: 'ignore' }).unref()
  setTimeout(() => focusExplorerWindow(folderPath), FOCUS_DELAY_MS)
}

/** Best-effort: activate the Explorer window showing `folderPath`. */
function focusExplorerWindow(folderPath: string): void {
  const title = basename(folderPath)
  const startedAt = Date.now()
  const api = focusApi ??= loadFocusApi()
  if (api === undefined) {
    runPowerShellFocus(folderPath)
    return
  }

  const attempt = (): void => {
    try {
      if (api.tryFocus(title)) {
        console.log(`[dsh-hub] explorer focused in ${Date.now() - startedAt}ms (${title})`)
        return
      }
    } catch (error) {
      console.warn(`[dsh-hub] explorer focus failed: ${String(error)}`)
      return
    }
    if (Date.now() - startedAt < FOCUS_TIMEOUT_MS) {
      setTimeout(attempt, FOCUS_POLL_MS)
    } else {
      console.warn(`[dsh-hub] explorer focus timeout after ${Date.now() - startedAt}ms (${title})`)
    }
  }
  setTimeout(attempt, FOCUS_POLL_MS)
}
