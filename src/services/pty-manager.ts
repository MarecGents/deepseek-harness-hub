/**
 * PTY session manager — one live interactive PowerShell session per terminal
 * tab (the M4 terminal dock), backed by node-pty. Each session owns its cwd
 * (the workspace root the tab was created from), streams output to SSE
 * subscribers, and accepts input/resize/terminate.
 *
 * Module category: Services (pure domain business). The HTTP surface lives in
 * `../server/terminal-pty-api.ts`; this module owns the PTY lifecycle only and
 * never touches routes, windows, or the shell.
 *
 * External API:
 *  - createPty / ptyWrite / ptyResize / ptyClose / ptySubscribe /
 *    listTabs / getTab / disposeAll / PtyLimitReachedError / SESSION_LIMIT
 *
 * Resource guardrails:
 *  - SESSION_LIMIT (16) concurrent sessions; createPty throws
 *    PtyLimitReachedError when full, which the HTTP route maps to the fixed
 *    `pty-limit-reached` code.
 *  - Idle timeout: a session with no input or output for 30 minutes is
 *    closed and reclaimed by a lazy unref'd sweeper; explicit ptyClose
 *    semantics are unchanged. Disconnected SSE streams leave the session
 *    alive (tab semantics), but an abandoned tab idles out and is reaped.
 *
 * Security notes:
 *  - The cwd handed to PowerShell is single-quoted with embedded quotes
 *    doubled (`''`), so a path containing `$` or backticks cannot be
 *    re-interpreted by the PS parser (JSON.stringify-style double quotes
 *    would let `$` expand).
 *  - BLOCKED_CMDS is a UX guardrail ONLY — it refuses a handful of dangerous
 *    commands at the input boundary, but it is NOT a security boundary (a
 *    live PowerShell session can always run arbitrary code, e.g. via `iex`).
 *    The real gate is the token + host/origin guards on the HTTP routes.
 *  - On Windows, closing a session kills the whole process tree via
 *    `taskkill /PID <pid> /T /F` so detached grandchildren cannot outlive
 *    the tab.
 */
import { spawn } from 'node-pty'
import type { IPty } from 'node-pty'
import { randomUUID } from 'node:crypto'
import { execFile, execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** One terminal tab as exposed to the client. */
export interface PtyTab {
  id: string
  /** Display name of the running shell (e.g. "PowerShell 5.1", "Bash"). */
  shell: string
  /** Shell kind for client-side retarget commands (cd semantics differ). */
  shellId: ShellId
  cwd: string
  title: string
  createdAt: number
  alive: boolean
}

/** Shell choices for a PTY tab. Availability is PROBED, not assumed — the
 * client lists only shells that exist on this machine. */
export type ShellId = 'powershell' | 'pwsh' | 'cmd' | 'bash'

/** A detected shell candidate. */
export interface ShellInfo {
  id: ShellId
  name: string
  available: boolean
  path?: string
}

/** Internal per-session state (tab + live pty + output ring buffer). */
interface Session {
  tab: PtyTab
  pty: IPty
  buffer: string
  subscribers: Set<(chunk: string) => void>
  /** Last input/output activity timestamp — drives the idle-timeout reaper. */
  lastActivity: number
}

/** All live sessions, keyed by tab id. */
const sessions = new Map<string, Session>()

/** Output ring-buffer ceiling (characters kept for new-subscriber replay). */
const MAX_BUFFER = 200_000

/** System PowerShell 5.1 (always present on Windows). */
const POWERSHELL_5 = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
/** System cmd.exe (always present on Windows). */
const CMD_EXE = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'cmd.exe')

/**
 * Directories that can hold a shell executable: the current process PATH plus
 * the machine-wide PATH (read from the registry). The app may be launched with
 * a narrower PATH than the system — e.g. from Git Bash — while a shell such as
 * pwsh lives in a custom install directory known only to the machine PATH
 * (Bug: pwsh at D:\Tools\PowerShell\7 was installed but not detected).
 */
function pathDirs(): string[] {
  const dirs = new Set<string>()
  const sep = process.platform === 'win32' ? ';' : ':'
  for (const p of (process.env.PATH ?? '').split(sep)) {
    const t = p.trim()
    if (t !== '') dirs.add(t)
  }
  if (process.platform === 'win32') {
    try {
      const out = execFileSync('reg', ['query', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment', '/v', 'Path'], { encoding: 'utf8', windowsHide: true, timeout: 5000 })
      const m = /Path\s+REG_(?:EXPAND_)?SZ\s+(.+)/i.exec(out)
      if (m !== null) {
        for (const p of m[1].split(';')) {
          const t = p.trim().replace(/%SystemRoot%/i, process.env.SystemRoot ?? 'C:\\Windows')
          if (t !== '') dirs.add(t)
        }
      }
    } catch {
      // Registry read unavailable — the process PATH alone still works.
    }
  }
  return [...dirs]
}

/** Resolve an executable by name across the process + machine PATH dirs. */
function findOnPath(name: string): string | null {
  for (const dir of pathDirs()) {
    const candidate = join(dir, name)
    if (existsSync(candidate)) return candidate
  }
  return null
}

/** Shell candidates in display order, each with an availability probe. */
const SHELL_PROBES: Array<{ id: ShellId; name: string; probe: () => string | null }> = [
  { id: 'powershell', name: 'PowerShell 5.1', probe: () => (existsSync(POWERSHELL_5) ? POWERSHELL_5 : findOnPath('powershell.exe')) },
  { id: 'pwsh', name: 'PowerShell 7 (pwsh)', probe: () => findOnPath('pwsh.exe') },
  { id: 'cmd', name: '命令提示符 (cmd)', probe: () => (existsSync(CMD_EXE) ? CMD_EXE : findOnPath('cmd.exe')) },
  { id: 'bash', name: 'Bash (Git Bash / WSL)', probe: () => findOnPath('bash.exe') },
]

/** Availability probe result, cached per process (PATH does not change mid-run). */
let shellsCache: ShellInfo[] | null = null

/**
 * Detect the shells available on this machine (the client lists ONLY these —
 * absent shells are never offered). Probes are cheap (`where`/`which` + known
 * system paths) and cached.
 * @returns the four candidates in display order with their availability.
 */
export function detectShells(): ShellInfo[] {
  if (shellsCache !== null) return shellsCache
  shellsCache = SHELL_PROBES.map((s) => {
    let path: string | null = null
    try { path = s.probe() } catch { path = null }
    return { id: s.id, name: s.name, available: path !== null, path: path ?? undefined }
  })
  return shellsCache
}

/**
 * Resolve a shell id to a spawn spec (exe + argv for the given cwd). Throws
 * when the id is unknown or the shell was not detected as available — the
 * client may only request shells the probe reported.
 * @param id - the shell id from {@link detectShells}.
 * @param cwd - the working directory the shell starts in (already validated).
 */
function shellSpec(id: string, cwd: string): { exe: string; args: string[] } {
  const info = detectShells().find((s) => s.id === id)
  if (info === undefined || !info.available || info.path === undefined) {
    throw new Error(`shell unavailable: ${id}`)
  }
  switch (id) {
    case 'powershell':
    case 'pwsh':
      // Single-quoted with embedded quotes doubled — the path is passed
      // literally and cannot be re-parsed by the PS parser.
      return { exe: info.path, args: ['-NoLogo', '-NoExit', '-Command', "Set-Location -LiteralPath '" + cwd.replace(/'/g, "''") + "'"] }
    case 'cmd':
      // /K keeps the prompt open after cd; the path is quoted for spaces.
      return { exe: info.path, args: ['/K', 'cd /d "' + cwd.replace(/"/g, '""') + '"'] }
    case 'bash':
      // Git Bash / WSL bash inherit the PTY cwd (node-pty sets the process
      // working directory); no startup command needed for an interactive shell.
      return { exe: info.path, args: [] }
    default:
      throw new Error(`unknown shell: ${id}`)
  }
}

/**
 * Hard cap on concurrent PTY sessions. A token holder could otherwise spawn an
 * unbounded number of PowerShell processes (resource DoS); createPty throws
 * {@link PtyLimitReachedError} once the cap is hit and the HTTP route maps it
 * to the fixed `pty-limit-reached` code.
 */
export const SESSION_LIMIT = 16

/** Idle timeout: a session with no input or output for this long is closed
 * and reclaimed (explicit close semantics are unaffected). */
// 2026-09-01 audit P1-2: idle 回收从 30min 收紧到 10min——SESSION_LIMIT×node-pty
// （约 40-80MB/进程）在用户误点/长期闲置场景会累积到 ~1GB；10min 无人操作
// 即可回收，仍宽于短时切换会话的预期使用（切换时 lastActivity 会刷新）。
const IDLE_TIMEOUT_MS = 10 * 60 * 1000

/** How often the idle reaper sweeps the session map. */
const IDLE_SWEEP_MS = 60 * 1000

/** Module-level lazy idle reaper (unref'd so it never holds the process open). */
let idleSweeper: ReturnType<typeof setInterval> | null = null

/** Thrown by {@link createPty} when the session quota is full. */
export class PtyLimitReachedError extends Error {
  constructor() {
    super(`pty session limit reached (max ${SESSION_LIMIT})`)
    this.name = 'PtyLimitReachedError'
  }
}

/** Start the idle-timeout reaper once (lazy, idempotent). */
function ensureIdleSweeper(): void {
  if (idleSweeper !== null) return
  idleSweeper = setInterval(() => {
    const now = Date.now()
    for (const id of Array.from(sessions.keys())) {
      const s = sessions.get(id)
      if (s !== undefined && now - s.lastActivity >= IDLE_TIMEOUT_MS) {
        console.log(`[dsh-hub] pty idle timeout: closing ${id} (${Math.floor((now - s.lastActivity) / 1000)}s idle)`)
        ptyClose(id)
      }
    }
  }, IDLE_SWEEP_MS)
  idleSweeper.unref?.()
}

function baseName(p: string): string {
  const n = p.replace(/\\/g, '/').replace(/\/+$/, '').split('/').pop() || p
  return n === '' ? p : n
}

function titleFor(cwd: string): string {
  return baseName(cwd) || '终端'
}

/**
 * Trim the ring buffer to MAX_BUFFER, cutting at the NEXT line boundary so a
 * retained tail never starts mid-line (protects CSI escape sequences and
 * surrogate pairs from being sliced apart). Falls back to the raw cutoff when
 * the retained tail contains no newline at all.
 */
function trimBuffer(buf: string): string {
  if (buf.length <= MAX_BUFFER) return buf
  const cut = buf.length - MAX_BUFFER
  const nl = buf.indexOf('\n', cut)
  const start = nl === -1 ? cut : nl + 1
  return buf.slice(start)
}

/**
 * Best-effort kill of the PTY process tree.
 * Windows: `taskkill /PID <pid> /T /F` (async via execFile — never blocks the
 * request) kills the shell plus any detached grandchildren/conhost.
 * Non-Windows falls back to `pty.kill()`.
 */
function killPty(s: Session): void {
  const pid = s.pty.pid
  if (process.platform === 'win32' && pid > 0) {
    execFile('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, (err) => {
      // 2026-09-01 audit P1-3: err.message 判活对本地化系统脆弱（"not found"
      // 只在英文环境）——增加 code 判活（errno 128 = ERROR_WAIT_NO_CHILDREN /
      // 常见 taskkill 已退出态），并统一以 err.code 为准优先。
      const alreadyExited = err === null
        || err.code === 128
        || err.code === 'ENOENT'
        || /not found|cannot find|没有找到|无法找到|not running|未在运行/i.test(err.message ?? '')
      if (!alreadyExited) {
        // taskkill failed for a real reason (not the expected already-exited
        // case) — leave a trace so orphaned shells are diagnosable, then fall
        // back to node-pty's own kill (closes the conpty handle; best effort
        // for the shell when taskkill raced the connect).
        console.warn(`[dsh-hub] taskkill /T failed for pty ${pid}: ${err.message}`)
        try {
          s.pty.kill()
        } catch {
          // Already exited — kill() throws once the underlying fd is gone.
        }
      }
    })
  } else {
    try {
      s.pty.kill()
    } catch {
      // Already exited — kill() throws once the underlying fd is gone.
    }
  }
}

/**
 * Create a persistent PTY tab rooted at `cwd` running the requested shell.
 *
 * @param cwd - absolute directory the shell starts in (caller validates).
 * @param cols - initial terminal columns (default 100).
 * @param rows - initial terminal rows (default 28).
 * @param shell - shell id from {@link detectShells} (default 'powershell').
 * @returns the new tab descriptor.
 * @throws {@link PtyLimitReachedError} when the session quota is full.
 * @throws when the PTY cannot be spawned or the shell is unavailable
 *   (caller maps this to a 500 / shell-unavailable).
 */
export function createPty(cwd: string, cols = 100, rows = 28, shell: ShellId = 'powershell'): PtyTab {
  if (sessions.size >= SESSION_LIMIT) {
    console.warn(`[dsh-hub] pty create rejected: session limit ${SESSION_LIMIT} reached`)
    throw new PtyLimitReachedError()
  }
  const shellInfo = detectShells().find((s) => s.id === shell)
  const spec = shellSpec(shell, cwd)
  const id = 'pty-' + randomUUID().slice(0, 8)
  const tab: PtyTab = {
    id, shell: shellInfo?.name ?? shell, shellId: shell, cwd, title: titleFor(cwd), createdAt: Date.now(), alive: true,
  }
  const pty = spawn(spec.exe, spec.args, {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: { ...process.env, TERM: 'xterm-256color', DSH_TERMINAL: '1' },
  })
  const session: Session = { tab, pty, buffer: '', subscribers: new Set(), lastActivity: Date.now() }
  pty.onData((data) => {
    session.lastActivity = Date.now()
    session.buffer = trimBuffer(session.buffer + data)
    for (const cb of session.subscribers) cb(data)
  })
  pty.onExit(() => {
    // Already closed through ptyClose (taskkill path) — nothing to notify.
    if (!tab.alive) return
    tab.alive = false
    for (const cb of session.subscribers) cb('\r\n[进程已退出]\r\n')
    session.subscribers.clear()
    sessions.delete(id)
  })
  sessions.set(id, session)
  ensureIdleSweeper()
  console.log(`[dsh-hub] pty created: ${id} cwd=${cwd}`)
  return tab
}

/**
 * All live tabs (for the list route). The returned tab objects are live
 * references — the client should re-fetch after a close.
 * @returns the current tabs in creation order.
 */
export function listTabs(): PtyTab[] {
  return Array.from(sessions.values()).map((s) => s.tab)
}

/**
 * Look up one tab by id.
 * @returns the tab, or undefined when unknown or already closed.
 */
export function getTab(id: string): PtyTab | undefined {
  return sessions.get(id)?.tab
}

/**
 * Destructive / dangerous commands refused by the terminal permission gate.
 * UX guardrail only — NOT a security boundary (see the module header): this
 * list only catches the most common foot-guns typed at the prompt.
 */
const BLOCKED_CMDS: RegExp[] = [
  /^\s*rm\b/i,
  /^\s*Remove-Item/i,
  /^\s*del\s+\/s/i,
  /^\s*rd\s+\/s/i,
  /^\s*format/i,
  /^\s*Clear-Content/i,
  /^\s*Stop-Process\s+-Force/i,
  /^\s*shutdown/i,
  /^\s*Remove-Computer/i,
  /^\s*takeown/i,
  /^\s*icacls/i,
  /^\s*net\s+user/i,
  /^\s*Set-ExecutionPolicy/i,
]

/** The blocked command a non-empty, non-comment line starts with (or null). */
function blockedLine(line: string): string | null {
  const t = line.trim()
  if (t === '' || t.startsWith('#')) return null
  for (const re of BLOCKED_CMDS) {
    if (re.test(t)) return t
  }
  return null
}

/**
 * Write input to a session's PTY, refusing blocked commands (see
 * BLOCKED_CMDS). The input is scanned line by line (CRLF/CR/LF), matching
 * whole lines only, so a blocked command inside a longer line is not
 * rejected.
 *
 * @param id - the target session id.
 * @param data - raw terminal input to write.
 * @returns true when the input was accepted — or refused by the guardrail
 *   with a notice pushed to the stream; false when the session is
 *   unknown/dead or the write threw.
 */
export function ptyWrite(id: string, data: string): boolean {
  const s = sessions.get(id)
  if (!s || !s.tab.alive) return false
  let blocked: string | null = null
  for (const line of data.split(/\r\n|\r|\n/)) {
    const hit = blockedLine(line)
    if (hit !== null) {
      blocked = hit
      break
    }
  }
  if (blocked !== null) {
    const notice = '\r\n[权限拦截] 命令被拒绝（危险操作）：' + blocked + '\r\n'
    for (const cb of s.subscribers) cb(notice)
    return true
  }
  try {
    s.pty.write(data)
    s.lastActivity = Date.now()
    return true
  } catch {
    return false
  }
}

/**
 * Resize a session's PTY.
 * @param id - the target session id.
 * @param cols - new column count (caller clamps).
 * @param rows - new row count (caller clamps).
 * @returns false when the session is unknown/dead or resize threw.
 */
export function ptyResize(id: string, cols: number, rows: number): boolean {
  const s = sessions.get(id)
  if (!s || !s.tab.alive) return false
  try {
    s.pty.resize(cols, rows)
    s.lastActivity = Date.now()
    return true
  } catch {
    return false
  }
}

/**
 * Close a session: kill the process tree, notify subscribers, detach and
 * drop the session. Safe to call twice (the second call returns false).
 * @param id - the session to close.
 * @returns true when the session existed and was closed.
 */
export function ptyClose(id: string): boolean {
  const s = sessions.get(id)
  if (!s) return false
  s.tab.alive = false
  killPty(s)
  for (const cb of s.subscribers) cb('\r\n[会话已关闭]\r\n')
  s.subscribers.clear()
  sessions.delete(id)
  console.log(`[dsh-hub] pty closed: ${id}`)
  return true
}

/**
 * Subscribe to a session's output; the current ring buffer is replayed to the
 * new subscriber first (line-boundary trimmed, see MAX_BUFFER).
 * @returns an unsubscribe function (a no-op for unknown sessions).
 */
export function ptySubscribe(id: string, cb: (chunk: string) => void): () => void {
  const s = sessions.get(id)
  if (!s) return () => {}
  s.subscribers.add(cb)
  cb(s.buffer)
  return () => {
    s.subscribers.delete(cb)
  }
}

/**
 * Close every live session — used by hot reload / plugin teardown so no
 * PowerShell process tree outlives the plugin. Also stops the idle reaper.
 */
export function disposeAll(): void {
  for (const id of Array.from(sessions.keys())) {
    ptyClose(id)
  }
  if (idleSweeper !== null) {
    clearInterval(idleSweeper)
    idleSweeper = null
  }
}
