#!/usr/bin/env node
/**
 * postuninstall.mjs — removes the desktop shortcut created by postinstall
 * (Windows only). The generated launcher.vbs wrapper is left in place so a
 * dangling shortcut cannot appear after the package directory is deleted.
 */

import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { existsSync } from 'node:fs'

if (process.platform !== 'win32') process.exit(0)

const SHORTCUT_NAME = 'DeepSeek Harness.lnk'

try {
  const script = `[Environment]::GetFolderPath('Desktop')`
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8', timeout: 30000, windowsHide: true,
  })
  if (result.status !== 0) process.exit(0)
  const desktop = result.stdout.trim()
  const shortcutPath = join(desktop, SHORTCUT_NAME)
  if (existsSync(shortcutPath)) {
    const rm = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `Remove-Item -LiteralPath '${shortcutPath}' -Force`], {
      encoding: 'utf8', timeout: 30000, windowsHide: true,
    })
    if (rm.status === 0) console.log(`[dsh-hub] removed desktop shortcut: ${shortcutPath}`)
  }
} catch {
  // Uninstall cleanup is best-effort.
}
