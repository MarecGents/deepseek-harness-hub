#!/usr/bin/env node
/**
 * multi-instance.mjs — shared multi-instance guard for every dsh-hub entry
 * point: the shortcut launcher (launcher.mjs) and the `dsh-hub` terminal
 * command (dsh-hub.mjs).
 *
 * A CLI `dsh web` (any port) and the desktop shell share the same $DSH_HOME
 * session storage; writing the same session from both ends can corrupt the
 * session log (seq clash), so coexistence is refused by default and only
 * allowed after an explicit opt-in (allowMultipleInstances) plus a Yes/No
 * confirmation. The desktop shell itself is additionally protected by the
 * single-instance PID lock (lock.mjs), because it binds a random port.
 *
 * @module dsh-hub/bin/multi-instance
 * @category Helper (Windows-only: netstat / CIM / MessageBox)
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { dshHome } from './lock.mjs'

/** Persisted shell config shared with the plugin's settings card. */
const shellConfigFile = () => join(dshHome(), 'dsh-hub', 'config.json')

/**
 * Read the persisted allowMultipleInstances flag. Missing/malformed config
 * falls back to strict defaults: multiple instances are NOT allowed, so an
 * already-running dsh blocks this launch.
 * @returns {boolean} true only when the user explicitly opted in.
 */
export function allowMultipleInstances() {
  try {
    const raw = JSON.parse(readFileSync(shellConfigFile(), 'utf8'))
    return raw?.allowMultipleInstances === true
  } catch {
    return false
  }
}

/**
 * Find every dsh web instance already running, grouped by process. A busy
 * 3080 is only one possibility — a CLI `dsh web --port N` binds any free
 * port, and one instance may listen on several (web + internal services).
 * The desktop shell itself uses `--port 0` (OS-assigned), so this runs
 * BEFORE boot and the shell's own future socket is never seen here.
 * Process names cover node.exe (CLI) and dsh-hub.exe / dsh-hub-guard.exe
 * (the patched desktop identities) — matching only node.exe would miss a
 * running desktop instance (C4).
 * @returns {Array<{ pid: number, ports: string[] }>}
 */
export function detectRunningDshInstances() {
  try {
    const result = spawnSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8', windowsHide: true })
    const stdout = result.stdout ?? ''
    // <proto> <local> <foreign> <state> <pid> — collect 127.0.0.1/0.0.0.0/[::]
    // listeners with their owning PID; empty PID means "system kernel".
    const rows = stdout.split('\n').map((line) => line.trim().split(/\s+/)).filter((cols) => cols.length >= 5)
    const listeners = new Map() // pid -> Set<port>
    for (const cols of rows) {
      if (cols[0] !== 'TCP' || !/(127\.0\.0\.1|0\.0\.0\.0|\[::\]):\d+/.test(cols[1])) continue
      if (cols[3] !== 'LISTENING') continue
      const port = cols[1].split(':').at(-1)
      const pid = cols[4]
      if (port === undefined || !/^\d+$/.test(pid)) continue
      if (!listeners.has(pid)) listeners.set(pid, new Set())
      listeners.get(pid).add(port)
    }
    // PIDs that belong to a dsh web process. Match on the process name — the
    // CLI runs as node.exe, the desktop shell as dsh-hub.exe (both boot
    // `@deepseek-ai/dsh/lib/bin.js web`); the guard never runs dsh itself.
    const dshPids = new Set()
    try {
      const ps = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
        "Get-CimInstance Win32_Process -Filter \"Name='node.exe' -or Name='dsh-hub.exe' -or Name='dsh-hub-guard.exe'\" | Where-Object { $_.CommandLine -match 'dsh.*web' } | Select-Object -ExpandProperty ProcessId"],
      { encoding: 'utf8', windowsHide: true })
      for (const pid of (ps.stdout ?? '').split('\n')) {
        const n = Number.parseInt(pid.trim(), 10)
        if (Number.isInteger(n) && n > 0) dshPids.add(n)
      }
    } catch {
      // CIM unavailable; no dsh processes matched below.
    }
    const instances = []
    for (const [pid, ports] of listeners) {
      if (dshPids.has(Number(pid))) {
        instances.push({ pid: Number(pid), ports: [...ports] })
      }
    }
    // One process may own several listeners; keep order stable by PID.
    instances.sort((a, b) => a.pid - b.pid)
    return instances
  } catch {
    return []
  }
}

/** Show a Windows message box (the launchers run hidden, so stderr is invisible). */
export function alert(message) {
  try {
    const ps = `[System.Windows.Forms.MessageBox]::Show('${message.replaceAll("'", "''")}', 'dsh-hub')`
    spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      'Add-Type -AssemblyName System.Windows.Forms; ' + ps], { windowsHide: true })
  } catch {
    // Best-effort.
  }
}

/**
 * Ask a Yes/No Windows question and resolve true only when the user picks Yes.
 * @param message - the question text (may contain newlines).
 * @returns true on Yes / OK, false on No / Cancel / any failure.
 */
export function confirm(message) {
  try {
    const ps = `[System.Windows.Forms.MessageBox]::Show('${message.replaceAll("'", "''")}', 'dsh-hub', 'YesNo', 'Warning')`
    const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      'Add-Type -AssemblyName System.Windows.Forms; ' + ps], { encoding: 'utf8', windowsHide: true })
    return result.stdout.trim() === 'Yes'
  } catch {
    // Fail safe: never auto-continue when the prompt machinery is unavailable.
    return false
  }
}

/**
 * Run the full multi-instance gate: detect running dsh web instances and
 * either block (default) or require an explicit Yes (opt-in) to coexist.
 * @param log(message) - diagnostic logger.
 * @returns true when launching may proceed; false when the caller must exit.
 */
export function enforceSingleInstance(log) {
  const runningInstances = detectRunningDshInstances()
  if (runningInstances.length === 0) return true
  // Report instance count and every port across all of them, so the user can
  // see how many dsh processes are already up (one may own several ports).
  const portList = runningInstances.flatMap((inst) => inst.ports).join(', ')
  const detailLines = runningInstances.map((inst) => `  · PID ${inst.pid} → 端口 ${inst.ports.join(', ')}`).join('\n')
  log(`detected ${runningInstances.length} running dsh instance(s); listening port(s): ${portList}`)
  if (!allowMultipleInstances()) {
    // Default: refuse to start a second instance at all. Only an OK button —
    // no "continue anyway" escape hatch — so a plain shortcut double-click
    // while another dsh is up cannot silently produce a corrupting pair.
    const message =
      `⚠ 检测到已有 ${runningInstances.length} 个 dsh 实例正在运行：\n${detailLines}\n\n` +
      '为保护会话数据，dsh-hub 默认禁止同时运行多个 dsh 实例。\n\n' +
      '多个实例会共享同一份会话数据（$DSH_HOME），若同时在同一个会话中操作，' +
      '会导致会话日志损坏（seq 冲突，已发生并需手工修复）。\n\n' +
      '请先关闭已运行的 dsh 窗口，再启动桌面壳。\n' +
      '（如确需共存，请到 设置 → DSH HUB 设置 中勾选「允许同时运行多个实例」，并阅读风险提示。）'
    log('blocked: multiple instances not allowed (allowMultipleInstances=false); exiting')
    alert(message)
    return false
  }
  // Opted in: still warn hard and require an explicit Yes before coexisting.
  const question =
    `⚠ 检测到已有 ${runningInstances.length} 个 dsh 实例正在运行：\n${detailLines}\n\n` +
    '多个 dsh 实例会共享同一份会话数据（$DSH_HOME），' +
    '若同时在同一个会话中操作，会导致会话日志损坏（seq 冲突），' +
    '可能丢失对话内容且需手工修复。\n\n' +
    '你已勾选「允许同时运行多个实例」。\n' +
    '确认仍要启动桌面壳（随机端口共存）吗？\n' +
    '选择「是」继续；选择「否」退出。'
  if (!confirm(question)) {
    log('user declined to launch alongside the running dsh; exiting')
    return false
  }
  log('user opted into coexistence and chose to continue; launching')
  return true
}
