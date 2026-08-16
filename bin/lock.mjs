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

/** Atomically claim the lock file with the caller's PID ('wx' = create only).
 * @returns the pid on success, null when the file already exists (EEXIST).
 * @throws on any other failure (the caller's fallback handles it). */
function claimLock(file) {
  try {
    // Options must be ONE object — a 4th positional arg would be silently
    // dropped and 'wx' would never apply (verified on Node 24/Windows).
    writeFileSync(file, `${process.pid}\n`, { encoding: 'utf8', flag: 'wx' })
    return process.pid
  } catch (error) {
    if (error.code === 'EEXIST') return null
    throw error
  }
}

/** Read the lock owner PID; null for missing, empty, or unparseable content. */
function readLockPid(file) {
  try {
    const raw = readFileSync(file, 'utf8').trim()
    if (raw === '') return null
    const pid = Number.parseInt(raw, 10)
    return Number.isInteger(pid) && pid > 0 ? pid : null
  } catch {
    return null
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
    // Atomic claim ('wx'): creation + content are one syscall, so two
    // launchers cannot both pass a check-then-write (TOCTOU). On EEXIST the
    // owner's PID decides: alive → refuse; dead/empty → remove and retake.
    let pid = claimLock(file)
    if (pid === null) {
      pid = readLockPid(file)
      if (pid !== null && processAlive(pid)) {
        log(`another instance is running (pid ${pid}); refusing to start`)
        return false
      }
      // Dead owner, or an empty file left by a concurrent writer mid-write —
      // remove and retake; if another launcher won the retake, re-check it.
      rmSync(file, { force: true })
      pid = claimLock(file)
      if (pid === null) {
        const other = readLockPid(file)
        if (other !== null && processAlive(other)) {
          log(`another instance is running (pid ${other}); refusing to start`)
          return false
        }
        throw new Error('lock contention not resolved')
      }
    }
    // Post-claim verification: another launcher may have unlinked and
    // reclaimed the file between our claim and this read; if it no longer
    // names this process, we cannot prove ownership — refuse rather than
    // double-launch alongside the winner.
    if (readLockPid(file) !== process.pid) {
      log('lock contested after claim; refusing to start')
      return false
    }
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
