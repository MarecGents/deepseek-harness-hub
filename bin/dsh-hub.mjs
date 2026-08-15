#!/usr/bin/env node
/**
 * dsh-hub — the dsh-hub launcher command. Boots `dsh web` with the
 * desktop-shell marker set, so the plugin opens the native window and injects
 * the plugin config page. Anything after `dsh-hub` is forwarded to `dsh web`.
 *
 * Usage:
 *   dsh-hub                 # boot dsh web with the desktop shell
 *   dsh-hub --port 4000     # forward extra args to dsh web
 */

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { acquireLock, releaseLock } from './lock.mjs'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const LOG_FILE = join(PACKAGE_ROOT, 'dsh.log')

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`
  try { appendFileSync(LOG_FILE, line, 'utf8') } catch { /* never break the app */ }
}

/** Convert POSIX-style drive paths (`/d/foo`) to native (`D:\foo`) on win32. */
function nativePath(p) {
  if (process.platform !== 'win32') return p
  const m = /^\/([a-zA-Z])\/(.*)$/.exec(p)
  if (m) return `${m[1].toUpperCase()}:\\${m[2].replaceAll('/', '\\')}`
  return p.replaceAll('/', '\\')
}

/** Resolve the dsh command from DSH_CMD, PATH, or the npm global prefix. */
function findDsh() {
  const explicit = process.env.DSH_CMD
  if (explicit && existsSync(explicit)) return explicit
  const candidates = []
  for (const dir of (process.env.PATH ?? '').split(';')) {
    if (dir === '') continue
    for (const name of ['dsh.cmd', 'dsh.exe', 'dsh']) {
      candidates.push(nativePath(join(dir, name)))
    }
  }
  try {
    const npmPrefix = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm prefix -g'], { encoding: 'utf8', windowsHide: true })
    if (npmPrefix.status === 0) {
      const prefix = nativePath(npmPrefix.stdout.trim())
      for (const dir of process.platform === 'win32' ? [prefix] : [join(prefix, 'bin')]) {
        for (const name of ['dsh.cmd', 'dsh.exe', 'dsh']) {
          candidates.push(join(dir, name))
        }
      }
    }
  } catch { /* PATH search only */ }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

function main() {
  // Same single-instance lock as the desktop shortcut launcher: the shell now
  // uses a random port, so only a PID lock can reliably prevent two desktop
  // instances from fighting over the same dsh profile.
  if (!acquireLock(log)) {
    console.error('dsh-hub: DeepSeek Harness Desktop is already running.')
    process.exit(0)
  }
  process.on('exit', releaseLock)

  const dshCmd = findDsh()
  if (dshCmd === null) {
    console.error('dsh-hub: dsh CLI not found. Install it with: npm install -g @deepseek-ai/dsh')
    process.exit(1)
  }
  log(`dsh-hub: using dsh ${dshCmd}, extra args: ${process.argv.slice(2).join(' ')}`)

  // Random web port by default (`--port 0` = the OS picks a free one), so a
  // busy 3080 can never collide with the desktop shell. An explicit `--port`
  // from the user wins.
  const extra = process.argv.slice(2)
  const args = extra.some((arg) => arg === '--port')
    ? extra
    : [...extra, '--port', '0']

  // Inherit stdout/stderr so the user sees dsh output in this terminal.
  const child = spawn(process.env.ComSpec, ['/d', '/s', '/c', `"${dshCmd}" web ${args.join(' ')}`], {
    cwd: PACKAGE_ROOT,
    windowsHide: false,
    windowsVerbatimArguments: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      DSH_HUB_LAUNCHED: '1',
    },
  })
  child.on('error', (error) => {
    log(`dsh-hub: dsh failed to start: ${error.message}`)
    process.exit(1)
  })
  child.on('exit', (code) => {
    log(`dsh-hub: dsh exited with code ${code ?? 'null'}`)
    process.exit(code ?? 0)
  })
}

main()
