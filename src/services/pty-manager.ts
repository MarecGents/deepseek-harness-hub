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
 *    listTabs / getTab / disposeAll
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
import { execFile } from 'node:child_process'

/** One terminal tab as exposed to the client. */
export interface PtyTab {
  id: string
  shell: 'PowerShell'
  cwd: string
  title: string
  createdAt: number
  alive: boolean
}

/** Internal per-session state (tab + live pty + output ring buffer). */
interface Session {
  tab: PtyTab
  pty: IPty
  buffer: string
  subscribers: Set<(chunk: string) => void>
}

/** All live sessions, keyed by tab id. */
const sessions = new Map<string, Session>()

/** Output ring-buffer ceiling (characters kept for new-subscriber replay). */
const MAX_BUFFER = 200_000

/** Shell launched for every tab (Windows-only host). */
const SHELL_EXE = 'powershell.exe'

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
  if (process.platform === 'win32') {
    execFile('taskkill', ['/PID', String(s.pty.pid), '/T', '/F'], { windowsHide: true }, () => {
      // Best-effort: taskkill reports an error when the process already
      // exited on its own — that is the expected case, not a failure.
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
 * Create a persistent PowerShell PTY tab rooted at `cwd`.
 *
 * The `Set-Location` command single-quotes the cwd with embedded quotes
 * doubled (`'` → `''`), so the path is passed literally and cannot be
 * re-parsed by PowerShell.
 *
 * @param cwd - absolute directory the shell starts in (caller validates).
 * @param cols - initial terminal columns (default 100).
 * @param rows - initial terminal rows (default 28).
 * @returns the new tab descriptor.
 * @throws when the PTY cannot be spawned (caller maps this to a 500).
 */
export function createPty(cwd: string, cols = 100, rows = 28): PtyTab {
  const id = 'pty-' + randomUUID().slice(0, 8)
  const tab: PtyTab = { id, shell: 'PowerShell', cwd, title: titleFor(cwd), createdAt: Date.now(), alive: true }
  const setLocation = "Set-Location -LiteralPath '" + cwd.replace(/'/g, "''") + "'"
  const pty = spawn(SHELL_EXE, ['-NoLogo', '-NoExit', '-Command', setLocation], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: { ...process.env, TERM: 'xterm-256color', DSH_TERMINAL: '1' },
  })
  const session: Session = { tab, pty, buffer: '', subscribers: new Set() }
  pty.onData((data) => {
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
 * PowerShell process tree outlives the plugin.
 */
export function disposeAll(): void {
  for (const id of Array.from(sessions.keys())) {
    ptyClose(id)
  }
}
