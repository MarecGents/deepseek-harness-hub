#!/usr/bin/env node
/**
 * lock.mjs — shared single-instance lock for the desktop shell launchers.
 *
 * The desktop shell uses a random web port, so a netstat check on 3080 can
 * no longer detect a running desktop instance. A PID lock under $DSH_HOME is
 * the reliable guard: both the hidden shortcut launcher and the `dsh-hub`
 * terminal command share the same file, so only one desktop instance can run
 * at a time. Stale locks (dead PID) are taken over automatically.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

/** Resolve the dsh home directory (shared by every store-backed feature). */
export function dshHome() {
  const env = process.env.DSH_HOME
  return env && env.trim() !== '' ? env : join(homedir(), '.dsh')
}

/** Path of the single-instance lock file. */
export function lockFile() {
  return join(dshHome(), 'dsh-hub', 'launcher.lock')
}

/** True when a PID belongs to a live process on this machine. */
export function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    // EPERM means the process exists but belongs to another user/session;
    // treat it as alive so we never start a second instance over it.
    return error.code === 'EPERM'
  }
}

/**
 * Try to own the single-instance lock.
 * @param log optional logger for diagnostics.
 * @returns true when the caller may start; false when another launcher is alive.
 */
export function acquireLock(log = () => {}) {
  const file = lockFile()
  try {
    mkdirSync(dirname(file), { recursive: true })
    let existing = null
    try {
      existing = Number.parseInt(readFileSync(file, 'utf8').trim(), 10)
    } catch {
      // No lock or unreadable — both mean we can take it over.
    }
    if (existing !== null && processAlive(existing)) {
      log(`another instance is running (pid ${existing}); refusing to start`)
      return false
    }
    writeFileSync(file, `${process.pid}\n`, 'utf8')
    log(`acquired single-instance lock (pid ${process.pid})`)
    return true
  } catch (error) {
    // Locking must never be a hard failure: fall back to launching anyway.
    log(`single-instance lock unavailable (${error.message}); continuing without it`)
    return true
  }
}

/** Release the lock only if this process still owns it. */
export function releaseLock() {
  try {
    const file = lockFile()
    const current = Number.parseInt(readFileSync(file, 'utf8').trim(), 10)
    if (current === process.pid) rmSync(file, { force: true })
  } catch {
    // Best-effort cleanup.
  }
}
