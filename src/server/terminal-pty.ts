/**
 * PTY session manager — real interactive PowerShell sessions (one per
 * terminal tab), backed by node-pty. Each session owns its cwd (defaults
 * to the current workspace root), streams output to SSE subscribers, and
 * accepts input/resize/terminate.
 */
import { spawn as ptySpawn, type IPty } from 'node-pty'
import { randomUUID } from 'node:crypto'

export interface PtyTab {
  id: string
  shell: 'PowerShell'
  cwd: string
  title: string
  createdAt: number
  alive: boolean
}

interface Session {
  tab: PtyTab
  pty: IPty
  buffer: string
  subscribers: Set<(chunk: string) => void>
}

const sessions = new Map<string, Session>()

const MAX_BUFFER = 200_000

function baseName(p: string): string {
  const n = p.replace(/\\/g, '/').replace(/\/+$/, '').split('/').pop() || p
  return n === '' ? p : n
}

function titleFor(cwd: string): string {
  try { return baseName(cwd) || '终端' } catch { return '终端' }
}

/** Create a persistent PowerShell PTY tab rooted at `cwd`. */
export function createPty(cwd: string, cols = 100, rows = 28): PtyTab {
  const id = 'pty-' + randomUUID().slice(0, 8)
  const shell = 'PowerShell'
  const tab: PtyTab = { id, shell, cwd, title: titleFor(cwd), createdAt: Date.now(), alive: true }
  const pty = ptySpawn('powershell.exe', ['-NoLogo', '-NoExit', '-Command', 'Set-Location -LiteralPath ' + JSON.stringify(cwd)], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd,
    env: { ...process.env, TERM: 'xterm-256color', DSH_TERMINAL: '1' },
  })
  const session: Session = { tab, pty, buffer: '', subscribers: new Set() }
  pty.onData((data) => {
    session.buffer += data;
    if (session.buffer.length > MAX_BUFFER) session.buffer = session.buffer.slice(-MAX_BUFFER);
    for (const cb of session.subscribers) cb(data);
  });
  pty.onExit(() => { tab.alive = false; for (const cb of session.subscribers) cb('\r\n[进程已退出]\r\n'); session.subscribers.clear(); });
  sessions.set(id, session);
  return tab;
}

export function listTabs(): PtyTab[] {
  return Array.from(sessions.values()).map((s) => s.tab);
}

export function getTab(id: string): PtyTab | undefined {
  return sessions.get(id)?.tab;
}

/** Destructive / dangerous commands refused by the terminal permission gate. */
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
];

function lineBlocked(line: string): string | null {
  const t = line.trim();
  if (t === '' || t.startsWith('#')) return null;
  for (const re of BLOCKED_CMDS) {
    if (re.test(t)) return t;
  }
  return null;
}

export function ptyWrite(id: string, data: string): boolean {
  const s = sessions.get(id);
  if (!s || !s.tab.alive) return false;
  const lines = data.split('\r');
  let blocked: string | null = null;
  for (const ln of lines) {
    const hit = lineBlocked(ln);
    if (hit) { blocked = hit; break }
  }
  if (blocked !== null) {
    const notice = '\r\n[权限拦截] 命令被拒绝（危险操作）：' + blocked + '\r\n';
    for (const cb of s.subscribers) cb(notice);
    return true;
  }
  try { s.pty.write(data); return true } catch { return false }
}

export function ptyResize(id: string, cols: number, rows: number): boolean {
  const s = sessions.get(id);
  if (!s || !s.tab.alive) return false;
  try { s.pty.resize(cols, rows); return true } catch { return false }
}

export function ptyClose(id: string): boolean {
  const s = sessions.get(id);
  if (!s) return false;
  try { s.pty.kill() } catch { }
  s.subscribers.clear();
  s.tab.alive = false;
  sessions.delete(id);
  return true;
}

export function ptySubscribe(id: string, cb: (chunk: string) => void): () => void {
  const s = sessions.get(id);
  if (!s) return () => {};
  s.subscribers.add(cb);
  cb(s.buffer);
  return () => s.subscribers.delete(cb);
}