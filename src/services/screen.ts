/**
 * Screen detection — resolves the display the user is actually working on
 * (multi-monitor aware) so the shell can size its default window to a
 * proportion of that screen instead of a fixed 1280×720.
 *
 * koffi → user32: cursor position → MonitorFromPoint (nearest monitor) →
 * GetMonitorInfo (rcMonitor). Falls back to the primary screen, then to
 * undefined (the caller keeps its own default).
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** Cached koffi binding; undefined when the FFI module could not load. */
let screenApi:
  | { cursorScreen(): { width: number; height: number } | undefined; primaryScreen(): { width: number; height: number } | undefined }
  | undefined

/** Load the user32 screen binding once (struct types + function pointers). */
function loadScreenApi(): typeof screenApi {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi') as {
      load(name: string): {
        func(sig: string): (...args: unknown[]) => unknown
      }
      struct(name: string, fields: Record<string, unknown>): unknown
      pointer(type: unknown): unknown
      sizeof(type: unknown): number
      decode(buffer: Buffer, type: unknown): Record<string, unknown>
    }
    const user32 = koffi.load('user32.dll')
    const pointType = koffi.struct('MGPoint', { x: 'int32', y: 'int32' })
    const rectType = koffi.struct('MGRect', { left: 'int32', top: 'int32', right: 'int32', bottom: 'int32' })
    const monitorInfoType = koffi.struct('MGMonitorInfo', {
      cbSize: 'uint32',
      rcMonitor: rectType,
      rcWork: rectType,
      dwFlags: 'uint32',
    })
    const getCursorPos = user32.func('int GetCursorPos(_Out_ MGPoint *)') as (buf: Buffer) => number
    const monitorFromPoint = user32.func('void* MonitorFromPoint(MGPoint pt, uint32 dwFlags)') as (
      pt: { x: number; y: number },
      flags: number,
    ) => unknown
    const getMonitorInfo = user32.func('int GetMonitorInfoW(void* hMonitor, _Inout_ MGMonitorInfo *)') as (
      h: unknown,
      buf: Buffer,
    ) => number
    const getSystemMetrics = user32.func('int GetSystemMetrics(int nIndex)') as (index: number) => number

    const pointSize = koffi.sizeof(pointType)
    const monitorInfoSize = koffi.sizeof(monitorInfoType)

    const cursorScreen = (): { width: number; height: number } | undefined => {
      try {
        const pt = Buffer.alloc(pointSize)
        if (getCursorPos(pt) === 0) return undefined
        const pos = koffi.decode(pt, pointType) as { x: number; y: number }
        const monitor = monitorFromPoint(pos, 2) // MONITOR_DEFAULTTONEAREST
        if (monitor === null || monitor === undefined) return undefined
        const info = Buffer.alloc(monitorInfoSize)
        info.writeUInt32LE(monitorInfoSize, 0) // cbSize
        if (getMonitorInfo(monitor, info) === 0) return undefined
        const decoded = koffi.decode(info, monitorInfoType) as {
          rcMonitor: { left: number; top: number; right: number; bottom: number }
        }
        const width = decoded.rcMonitor.right - decoded.rcMonitor.left
        const height = decoded.rcMonitor.bottom - decoded.rcMonitor.top
        return width > 0 && height > 0 ? { width, height } : undefined
      } catch {
        return undefined
      }
    }

    const primaryScreen = (): { width: number; height: number } | undefined => {
      try {
        const width = getSystemMetrics(0) // SM_CXSCREEN
        const height = getSystemMetrics(1) // SM_CYSCREEN
        return width > 0 && height > 0 ? { width, height } : undefined
      } catch {
        return undefined
      }
    }

    return { cursorScreen, primaryScreen }
  } catch {
    return undefined
  }
}

/**
 * The screen the cursor is on (multi-monitor aware), falling back to the
 * primary screen; undefined when neither is resolvable.
 */
export function resolveLaunchScreen(): { width: number; height: number } | undefined {
  screenApi ??= loadScreenApi()
  if (screenApi === undefined) return undefined
  return screenApi.cursorScreen() ?? screenApi.primaryScreen()
}
