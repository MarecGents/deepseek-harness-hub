/**
 * Workspace API — host routes for the right sidebar:
 *  - list directory entries (files + folders) under the current workspace;
 *  - detect Git repository state, branch, and working-tree changes.
 *
 * These are plugin-owned HTTP routes (same pattern as the config API), so the
 * client right sidebar can stay in sync with the current session workspace.
 */

import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'

const API_PREFIX = '/api/mg-dsh-desktop/workspace'
const MAX_ENTRIES = 1000
const GIT_TIMEOUT_MS = 3000

interface DirectoryRow {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
  isSymbolicLink: boolean
  hidden: boolean
}

interface GitChange {
  path: string
  status: string
}

interface GitInfo {
  isGit: boolean
  branch: string
  head: string
  changes: GitChange[]
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function queryPath(req: IncomingMessage): string | null {
  try {
    const url = new URL(req.url ?? '', 'http://localhost')
    const raw = url.searchParams.get('path')
    if (raw === null || raw === '') return null
    const path = decodeURIComponent(raw)
    return isAbsolute(path) ? path : null
  } catch {
    return null
  }
}

/** List one directory level, directories first, then files. */
async function listDirectory(path: string): Promise<{ path: string; entries: DirectoryRow[]; truncated: boolean }> {
  const dirents = await readdir(path, { withFileTypes: true })
  const rows: DirectoryRow[] = dirents.slice(0, MAX_ENTRIES).map((entry) => ({
    name: entry.name,
    path: join(path, entry.name),
    isDirectory: entry.isDirectory(),
    isFile: entry.isFile(),
    isSymbolicLink: entry.isSymbolicLink(),
    hidden: entry.name.startsWith('.'),
  }))
  rows.sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name))
  return { path, entries: rows, truncated: dirents.length > MAX_ENTRIES }
}

/** Run one git command and return trimmed stdout (empty on failure/timeout). */
function gitOutput(path: string, args: string[]): Promise<string> {
  return new Promise((resolve) => {
    let child
    try {
      child = spawn('git', ['-C', path, ...args], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    } catch {
      resolve('')
      return
    }
    let out = ''
    child.stdout.on('data', (chunk: Buffer) => { out += chunk.toString() })
    const timer = setTimeout(() => { child.kill() }, GIT_TIMEOUT_MS)
    child.on('error', () => { clearTimeout(timer); resolve('') })
    child.on('close', () => { clearTimeout(timer); resolve(out.trim()) })
  })
}

/** Detect git repo state and working-tree changes. */
async function gitInfo(path: string): Promise<GitInfo> {
  const inWork = await gitOutput(path, ['rev-parse', '--is-inside-work-tree'])
  if (inWork !== 'true') return { isGit: false, branch: '', head: '', changes: [] }

  let branch = await gitOutput(path, ['branch', '--show-current'])
  if (branch === '') branch = await gitOutput(path, ['rev-parse', '--short', 'HEAD'])

  const raw = await gitOutput(path, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', '.'])
  const changes: GitChange[] = raw === ''
    ? []
    : raw.split('\0')
      .filter(Boolean)
      .map((segment) => {
        const status = segment.slice(0, 2).trim()
        const filePath = segment.slice(2).trim()
        return { path: filePath, status }
      })

  return { isGit: true, branch, head: branch, changes }
}

/** Build the workspace API routes (list + git). */
export function makeWorkspaceRoutes(): WebRoute[] {
  return [
    {
      kind: 'exact',
      path: `${API_PREFIX}/list`,
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (req.method !== 'GET') {
          json(res, 405, { ok: false, error: 'method-not-allowed' })
          return Promise.resolve()
        }
        const path = queryPath(req)
        if (path === null) {
          json(res, 400, { ok: false, error: 'missing or invalid path' })
          return Promise.resolve()
        }
        return listDirectory(path).then(
          (value) => json(res, 200, { ok: true, ...value }),
          (error) => json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) }),
        )
      },
    },
    {
      kind: 'exact',
      path: `${API_PREFIX}/git`,
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (req.method !== 'GET') {
          json(res, 405, { ok: false, error: 'method-not-allowed' })
          return Promise.resolve()
        }
        const path = queryPath(req)
        if (path === null) {
          json(res, 400, { ok: false, error: 'missing or invalid path' })
          return Promise.resolve()
        }
        return gitInfo(path).then(
          (value) => json(res, 200, { ok: true, ...value }),
          (error) => json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) }),
        )
      },
    },
  ]
}
