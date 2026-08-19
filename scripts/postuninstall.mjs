#!/usr/bin/env node
/**
 * postuninstall.mjs — no-op for the WebView2-era desktop shortcut.
 *
 * The npm package no longer owns any desktop shortcut (the Tauri shell's
 * installer does); the legacy "DeepSeek Harness.lnk" that used to point at
 * the deleted `bin/launcher.vbs` wrapper is cleaned up by the migration in
 * postinstall (see scripts/postinstall.mjs) / the NSIS uninstaller.
 */

if (process.platform !== 'win32') process.exit(0)

// Best-effort: remove a stale WebView2-era desktop shortcut if it still
// points at the deleted launcher wrapper — never touch installer-owned
// shortcuts (same name, different target).
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { existsSync } from 'node:fs'

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
    const probe = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `$ws = New-Object -ComObject WScript.Shell; $lnk = $ws.CreateShortcut('${shortcutPath}'); Write-Output $lnk.TargetPath`],
    { encoding: 'utf8', timeout: 30000, windowsHide: true })
    // Only remove when the target is the deleted wscript+launcher.vbs wrapper.
    if (probe.status === 0 && probe.stdout.includes('wscript.exe')) {
      const rm = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `Remove-Item -LiteralPath '${shortcutPath}' -Force`], {
        encoding: 'utf8', timeout: 30000, windowsHide: true,
      })
      if (rm.status === 0) console.log(`[dsh-hub] removed stale desktop shortcut: ${shortcutPath}`)
    }
  }
} catch {
  // Uninstall cleanup is best-effort.
}

void homedir
