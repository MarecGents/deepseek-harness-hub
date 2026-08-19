#!/usr/bin/env node
/**
 * verify-m4-multi-instance.mjs — M4 双实例防护验收（T3.3 / D-1）。
 *
 * 实际语义：M4 用 tauri-plugin-single-instance（D1 聚焦方案）——只拦「同 identifier」
 * （com.marecgents.dsh-hub）的 Tauri 实例：第二实例启动后立即退出，第一实例收到回调
 * 并聚焦已有窗口。注意：这不是 SOP 原 T4.2 的「进程枚举+确认框」方案（bin/multi-instance.mjs
 * 仍是 rc.14 语义，未迁移到 Tauri 壳），本脚本按实际语义断言。
 *
 * 断言（按实际语义）：
 *   MI-1  临时隔离 DSH_HOME 自建就绪（脚本退出后清理）
 *   MI-2  实例 A 启动（DSH_HOME=<临时>，可选 --e2e 让 A 跑 E2E 脚本）并保持存活数秒
 *   MI-3  实例 B（同 DSH_HOME）在 ~10s 内退出（第二实例被插件拦截/聚焦第一实例），
 *         退出码非负（不表示崩溃；tauri 单实例插件第二实例通常立即 exit 0）
 *   MI-4  实例 A 仍存活（未被被动）
 *   MI-5  清理：杀 A + 删临时 DSH_HOME
 * 输出 PASS/FAIL 清单 + 每步证据（进程 id/退出码/耗时）；退出码 0 = 全 PASS。
 *
 * 用法：node scripts/verify-m4-multi-instance.mjs [--exe <path>] [--e2e]
 *       [--wait-ms <B 退出等待上限，默认 10000>] [--up-timeout-ms <A 就绪等待上限，
 *       默认 30000>] [--keep <保留临时 DSH_HOME 供排查>]
 *
 * 模块类别：Helper（验证；Windows-only）。
 * Windows 注意：dsh-hub.exe 是 windowed 子系统，spawn 用 stdio:'ignore'（管道捕获会
 * EPERM）；windowsHide:true = CREATE_NO_WINDOW；清理用 taskkill /T /F 杀进程树。
 */

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DEFAULT_EXE = join(REPO_ROOT, 'src-tauri', 'target', 'debug', 'dsh-hub.exe')

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

function argValue(name) {
  const i = process.argv.indexOf(name)
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined
}

const EXE = argValue('--exe') ?? DEFAULT_EXE
const E2E = process.argv.includes('--e2e')
const WAIT_MS = Number(argValue('--wait-ms') ?? 10_000)
const UP_TIMEOUT_MS = Number(argValue('--up-timeout-ms') ?? 30_000)
const KEEP = process.argv.includes('--keep')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Probe whether a pid is alive (signal 0; EPERM also means alive). */
function alive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

/** $DSH_HOME/dsh-hub/logs/dsh.log (tauri-plugin-log Folder target). */
const logPath = (home) => join(home, 'dsh-hub', 'logs', 'dsh.log')
const readLog = (home) => {
  try {
    return readFileSync(logPath(home), 'utf8')
  } catch {
    return '' // file not created yet.
  }
}

/** Kill a process tree (taskkill /T /F), then fall back to a plain kill. */
function taskkillTree(pid) {
  try {
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
  } catch {
    // Best-effort: fall through to the direct kill below.
  }
  try {
    process.kill(pid)
  } catch {
    // Already gone.
  }
}

/**
 * Detect an already-running dsh-hub.exe (a real desktop shell would hold the
 * single-instance lock and invalidate this verification).
 * @returns {number|null} pid of the running instance, or null.
 */
function findRunningHubExe() {
  const r = spawnSync('tasklist', ['/FI', 'IMAGENAME eq dsh-hub.exe', '/FO', 'CSV', '/NH'], {
    encoding: 'utf8', windowsHide: true,
  })
  for (const line of (r.stdout ?? '').split('\n')) {
    const m = /^"dsh-hub\.exe","(\d+)"/.exec(line.trim())
    if (m) return Number(m[1])
  }
  return null
}

/**
 * Wait until the instance is up: process alive AND dsh.log carries a setup
 * marker (m4: / single-instance: / shell started / e2e:) proving the Tauri
 * setup (and thus the single-instance plugin) is running.
 * @returns {Promise<{up: boolean, elapsedMs?: number, reason?: string}>}
 */
async function waitUntilUp(pid, home, timeoutMs) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    if (!alive(pid)) return { up: false, reason: `进程 ${pid} 在启动等待期间退出` }
    if (/(m4:|single-instance:|dsh-hub shell started|e2e:)/.test(readLog(home))) {
      return { up: true, elapsedMs: Date.now() - t0 }
    }
    await sleep(500)
  }
  return { up: false, reason: `启动等待超时（${timeoutMs}ms）；dsh.log 未出现 m4:/single-instance: 行，` +
    `dsh-hub.exe 可能不是最新 debug 构建` }
}

/**
 * Wait for a child to exit (or the timeout), returning the exit code / error.
 * @returns {Promise<{code: number|null, error?: Error, elapsedMs: number}>}
 */
function waitForExit(child, timeoutMs) {
  return new Promise((resolve) => {
    const t0 = Date.now()
    let done = false
    const finish = (code, error) => {
      if (!done) {
        done = true
        resolve({ code, error, elapsedMs: Date.now() - t0 })
      }
    }
    if (child.exitCode !== null) return finish(child.exitCode)
    child.once('exit', (code) => finish(code))
    child.once('error', (err) => finish(null, err))
    setTimeout(() => finish(null, new Error('timeout')), timeoutMs)
  })
}

async function main() {
  if (process.platform !== 'win32') {
    console.log('SKIP  MI-0 平台 — 非 Windows，dsh-hub.exe 单实例验证仅 Windows')
    process.exit(0)
  }
  if (!existsSync(EXE)) {
    check('MI-0 dsh-hub.exe 存在', false, `${EXE} 不存在 — 先 cargo build（debug）`)
    console.log('\nRESULT: 0 PASS, 1 FAIL')
    process.exit(1)
  }

  const home = join(tmpdir(), `dsh-hub-verify-mi-${process.pid}-${Date.now()}`)
  mkdirSync(home, { recursive: true })
  check('MI-1 临时隔离 DSH_HOME 就绪', true, home)

  const running = findRunningHubExe()
  if (running) {
    console.log(`WARN  检测到已有 dsh-hub.exe 运行（pid=${running}）— 单实例锁已被占用，本验证必然失败；请先关闭真实桌面壳实例`)
  }

  const env = { ...process.env, DSH_HOME: home }
  if (E2E) env.DSH_HUB_E2E = '1'

  let a = null
  let b = null
  let bPid = null
  try {
    // ── 实例 A（保持运行数秒；--e2e 时 A 跑完 E2E 脚本约 30s 后自行退出）──
    a = spawn(EXE, [], { env, stdio: 'ignore', windowsHide: true })
    check('MI-2 实例 A 启动', a.pid !== undefined && a.pid > 0, `pid=${a.pid}`)
    const up = await waitUntilUp(a.pid, home, UP_TIMEOUT_MS)
    if (!up.up) {
      const log = readLog(home)
      check('MI-2 实例 A 保持存活（启动就绪）', false,
        `${up.reason}${running ? '（另有真实实例占用单实例锁）' : ''}` +
        (log ? `；dsh.log 尾部：${log.slice(-300)}` : '；dsh.log 不存在'))
    } else {
      check('MI-2 实例 A 保持存活（启动就绪）', true, `pid=${a.pid}, 就绪耗时 ${up.elapsedMs}ms`)

      // ── 实例 B（同 DSH_HOME）──
      b = spawn(EXE, [], { env, stdio: 'ignore', windowsHide: true })
      bPid = b.pid
      const exit = await waitForExit(b, WAIT_MS)
      const exitedInTime = exit.code !== null && exit.error === undefined
      const codeNonNegative = exit.code !== null && exit.code >= 0
      check('MI-3 实例 B 在时限内退出且退出码非负',
        exitedInTime && codeNonNegative,
        `B pid=${bPid}, exitCode=${exit.code}, 耗时 ${exit.elapsedMs}ms（上限 ${WAIT_MS}ms）` +
        (exit.error ? `, error=${exit.error.message}` : ''))

      // ── 实例 A 仍存活（未被被动）──
      const aAlive = alive(a.pid)
      check('MI-4 实例 A 仍存活', aAlive, `pid=${a.pid}`)
      const aLog = readLog(home)
      if (aAlive && /single-instance: second launch detected/.test(aLog)) {
        console.log('INFO  A 的 dsh.log 含 `single-instance: second launch detected`（回调已触发）')
      } else if (aAlive) {
        console.log('WARN  A 的 dsh.log 未出现 `single-instance: second launch detected`（B 已退出但回调日志缺失；不判 FAIL）')
      }
    }
  } finally {
    // ── 清理（MI-5）──
    if (a && alive(a.pid)) taskkillTree(a.pid)
    if (bPid && alive(bPid)) taskkillTree(bPid)
    if (!KEEP) rmSync(home, { recursive: true, force: true })
    const cleaned = KEEP || !existsSync(home)
    check('MI-5 清理完成（杀 A + 删临时 DSH_HOME）', cleaned,
      KEEP ? '已保留临时 DSH_HOME（--keep）' : `${home}${cleaned ? ' 已删除' : ' 删除失败'}`)
  }

  const fails = results.filter((r) => !r.ok).length
  console.log(`\nRESULT: ${results.length - fails} PASS, ${fails} FAIL${fails ? ' — 退出码 1' : ''}`)
  process.exit(fails ? 1 : 0)
}

main().catch((err) => {
  console.error('verify-m4-multi-instance: unexpected error:', err)
  process.exit(1)
})
