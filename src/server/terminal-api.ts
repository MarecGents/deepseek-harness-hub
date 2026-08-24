/**
 * Terminal + open API — host routes for the workspace right sidebar context
 * menu and the conversation terminal dock.
 *
 * Routes:
 *  - POST /api/dsh-hub/terminal/exec  { cwd, command } → run one shell command
 *    in cwd and return its output + exit code (bounded time + size).
 *  - POST /api/dsh-hub/workspace/open  { path } → open a file/folder with the
 *    OS default handler / Explorer (Windows start, macOS open, Linux xdg-open).
 *
 * Every route is Host-guarded (DNS-rebinding protection) and path-guarded:
 * cwd/path must be an existing ABSOLUTE filesystem path.
 */
import { spawn } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import { rejectIfBadHost } from './host-guard.ts'

const API_PREFIX = '/api/dsh-hub'
const MAX_COMMAND = 2000
const MAX_OUTPUT = 64 * 1024
const EXEC_TIMEOUT_MS = 30_000

interface ExecResult {
  ok: boolean
  cwd: string
  command: string
  code: number | null
  output: string
  timedOut: boolean
  error?: string
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 64 * 1024) { reject(new Error('body-too-large')); queueMicrotask(() => req.destroy()); return }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('invalid-json'))
      }
    })
    req.on('error', reject)
  })
}

function validPath(value: unknown, directoryOnly: boolean): string | null {
  if (typeof value !== 'string' || value === '') return null
  if (!isAbsolute(value)) return null
  try {
    if (!existsSync(value)) return null
    if (directoryOnly && !statSync(value).isDirectory()) return null
  } catch {
    return null
  }
  return value
}

function execCommand(cwd: string, command: string): Promise<ExecResult> {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32'
    const file = isWin ? 'cmd.exe' : '/bin/sh'
    const args = isWin ? ['/d', '/s', '/c', command] : ['-c', command]
    let child: ReturnType<typeof spawn>
    let timedOutFlag = false
    try {
      child = spawn(file, args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (error) {
      resolve({ ok: false, cwd, command, code: null, output: '', timedOut: false, error: String(error) })
      return
    }
    let out = ''
    const timer = setTimeout(() => { timedOutFlag = true; child.kill() }, EXEC_TIMEOUT_MS)
    const onData = (chunk: Buffer): void => {
      out += chunk.toString('utf8')
      if (out.length > MAX_OUTPUT) { out = out.slice(0, MAX_OUTPUT); child.kill() }
    }
    child.stdout?.on('data', onData)
    child.stderr?.on('data', onData)
    child.on('error', (error) => {
      clearTimeout(timer)
      resolve({ ok: false, code: null, output: out, timedOut: timedOutFlag, cwd, command, error: String(error) })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ ok: true, cwd, command, code, output: out, timedOut: timedOutFlag })
    })
  })
}

function openInOs(path: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    let child: ReturnType<typeof spawn>
    if (process.platform === 'win32') {
      // explorer.exe reliably opens a folder in Explorer (cmd start often fails detached).
      child = spawn('explorer.exe', [path], { detached: true, stdio: 'ignore' })
    } else {
      const opener = process.platform === 'darwin' ? 'open' : 'xdg-open'
      child = spawn(opener, [path], { detached: true, stdio: 'ignore' })
    }
    child.on('error', (error) => resolve({ ok: false, error: String(error) }))
    child.on('spawn', () => { child.unref(); resolve({ ok: true }) })
  })
}

export function makeTerminalRoutes(): WebRoute[] {
  return [
    {
      kind: 'exact',
      path: API_PREFIX + '/terminal/exec',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (req.method !== 'POST') {
          json(res, 405, { ok: false, error: 'method-not-allowed' })
          return Promise.resolve()
        }
        return readJsonBody(req).then(async (body) => {
          const record = (body ?? {}) as { cwd?: unknown; command?: unknown }
          const cwd = validPath(record.cwd, true)
          const command = typeof record.command === 'string' ? record.command.trim() : ''
          if (cwd === null) { json(res, 400, { ok: false, error: 'invalid cwd (must be an existing absolute directory)' }); return }
          if (command === '' || command.length > MAX_COMMAND) { json(res, 400, { ok: false, error: 'invalid command' }); return }
          const result = await execCommand(cwd, command)
          json(res, 200, result)
        }, (error) => json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }))
      },
    },
    {
      kind: 'exact',
      path: API_PREFIX + '/workspace/open',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (req.method !== 'POST') {
          json(res, 405, { ok: false, error: 'method-not-allowed' })
          return Promise.resolve()
        }
        return readJsonBody(req).then(async (body) => {
          const record = (body ?? {}) as { path?: unknown }
          let target = validPath(record.path ?? '', false)
          if (target === null) target = process.cwd()
          const result = await openInOs(target)
          json(res, result.ok ? 200 : 500, { ok: result.ok, error: result.error })
        }, (error) => json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }))
      },
    },
  ]
}
