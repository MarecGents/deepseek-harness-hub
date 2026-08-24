/**
 * RightSidebar — the dsh-hub right sidebar mounted as a body portal
 * (like dsh-better-sidebar), independent of the official details column so it
 * also works in blank/new conversations where the details column is forced
 * to 0. It mirrors the left sidebar's collapse/rail behavior and provides
 * three tabs:
 *  - Overview: context-token usage rendered as a fan/donut chart.
 *  - Files: current workspace file/folder tree, strictly synced to the
 *    current session's workspace.
 *  - Git: whether the workspace is a git repo, branch, and working-tree changes.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconBranchOutline16,
  IconCheckOutline16,
  IconCodeOutline16,
  IconCopyOutline16,
  IconDataOutline16,
  IconDownloadOutline16,
  IconEditOutline16,
  IconFolderClose16,
  IconFolderOpen16,
  IconLinkOutline16,
  IconPanelLeftOutline16,
  IconPlayOutline16,
  IconRightUpOutline16,
  IconSendOutline16,
  IconThinkOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { RIGHT_SIDEBAR_CSS_CLASSES as c } from './right-sidebar-style.ts'
import { ptyOpen, ptyRetarget } from './pty-store.ts'

/** The body portal passes the client context directly; keep props loose for future additions. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- body-portal props are intentionally minimal.
type RightSidebarProps = any

type Tab = 'overview' | 'files' | 'git'

/** Subscribe to the current session's ConversationSnapshot from a body-portal context. */
function useSessionSnapshot(ctx: unknown, sessionId: string | undefined): unknown {
  const sessions = (ctx as { sessions?: { binding?: (id: string) => { session?: { subscribe?: (cb: () => void) => () => void; getSnapshot?: () => unknown } } | undefined } }).sessions
  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      if (sessionId === undefined) return () => {}
      return sessions?.binding?.(sessionId)?.session?.subscribe?.(onStoreChange) ?? (() => {})
    }, [sessions, sessionId]),
    useCallback(() => {
      if (sessionId === undefined) return undefined
      return sessions?.binding?.(sessionId)?.session?.getSnapshot?.()
    }, [sessions, sessionId]),
  )
}

/** Subscribe to one session projection value from a body-portal context. */
function useProjectionValue(ctx: unknown, sessionId: string | undefined, key: string): unknown {
  const sessions = (ctx as { sessions?: { binding?: (id: string) => { session?: { projections?: { faceOf?: (key: string) => { subscribe?: (cb: () => void) => () => void; getSnapshot?: () => unknown } } } } | undefined } }).sessions
  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      if (sessionId === undefined) return () => {}
      return sessions?.binding?.(sessionId)?.session?.projections?.faceOf?.(key)?.subscribe?.(onStoreChange) ?? (() => {})
    }, [sessions, sessionId, key]),
    useCallback(() => {
      if (sessionId === undefined) return undefined
      return sessions?.binding?.(sessionId)?.session?.projections?.faceOf?.(key)?.getSnapshot?.()
    }, [sessions, sessionId, key]),
  )
}

/** Subscribe to the sessions list from a body-portal (non-slot) context. */
function useSessionsValue(ctx: unknown): unknown {
  const sessions = (ctx as { sessions?: { list?: { subscribe?: (cb: () => void) => () => void; getSnapshot?: () => unknown } } }).sessions
  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => sessions?.list?.subscribe?.(onStoreChange) ?? (() => {}), [sessions]),
    useCallback(() => sessions?.list?.getSnapshot?.(), [sessions]),
  )
}

/** Subscribe to the workspaces list from a body-portal (non-slot) context. */
function useWorkspacesValue(ctx: unknown): unknown {
  const workspaces = (ctx as { workspaces?: { list?: { subscribe?: (cb: () => void) => () => void; getSnapshot?: () => unknown } } }).workspaces
  return useSyncExternalStore(
    useCallback((onStoreChange: () => void) => workspaces?.list?.subscribe?.(onStoreChange) ?? (() => {}), [workspaces]),
    useCallback(() => workspaces?.list?.getSnapshot?.(), [workspaces]),
  )
}

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

interface TokenBuckets {
  uncachedInputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
}

/** Compact token formatting: 517 / 12.2K / 517K / 1.2M. */
function formatTokens(n: number): string {
  if (n < 1_000) return String(n)
  if (n < 1_000_000) return `${Math.round(n / 1_000)}K`
  return `${Math.round(n / 1_000_000)}M`
}

/** Compact duration: 45.2s under a minute, 2m42s from there on. */
function formatDuration(ms: number): string {
  const s = ms / 1_000
  if (s < 60) return `${Math.round(s * 10) / 10}s`
  const whole = Math.round(s)
  return `${Math.floor(whole / 60)}m${whole % 60}s`
}

/** Decode-throughput figure: whole tokens from ten up, one decimal below. */
function formatTokensPerSecond(tps: number): string {
  const clamped = Math.max(0, tps)
  return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10)
}

/** Sum the three disjoint prompt-side billing buckets. */
function billedInputTokens(usage: { uncachedInputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number }): number {
  return (usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0)
}

/** Cache-hit share of prompt-side input over the whole durable log. */
function cacheHitPercent(usage: { cacheReadTokens?: number; uncachedInputTokens?: number; cacheWriteTokens?: number }): number | null {
  const denominator = billedInputTokens(usage)
  return denominator === 0 ? null : Math.round(((usage.cacheReadTokens ?? 0) / denominator) * 100)
}

async function fetchDir(path: string): Promise<DirectoryRow[]> {
  try {
    const res = await fetch(`/api/dsh-hub/workspace/list?${new URLSearchParams({ path })}`)
    const body = (await res.json()) as { ok?: boolean; entries?: DirectoryRow[] }
    return body.ok === true ? (body.entries ?? []) : []
  } catch {
    return []
  }
}

async function fetchGit(path: string): Promise<GitInfo | null> {
  try {
    const res = await fetch(`/api/dsh-hub/workspace/git?${new URLSearchParams({ path })}`)
    const body = (await res.json()) as GitInfo & { ok?: boolean }
    return body.ok === true ? body : null
  } catch {
    return null
  }
}

/** Posix-style relative path of `path` against workspace root `root`. */
function relativePath(path: string, root: string): string {
  const p = path.replace(/\\/g, '/')
  const r = root.replace(/\\/g, '/').replace(/\/+$/, '')
  if (r === '' || r === '.') return p
  if (p === r) return '.'
  if (p.startsWith(r + '/')) return p.slice(r.length + 1)
  return p
}

/** Parent directory of an absolute path. */
function parentDir(path: string): string {
  const norm = path.replace(/\\/g, '/').replace(/\/+$/, '')
  const idx = norm.lastIndexOf('/')
  return idx > 0 ? norm.slice(0, idx) : norm
}

/** Copy text to the clipboard (best-effort). */
function copyText(text: string): void {
  void navigator.clipboard.writeText(text).catch(() => {})
}

/** Open a path with the OS default handler via the host route. */
async function openInOs(path: string): Promise<void> {
  try {
    await fetch('/api/dsh-hub/workspace/open', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path }),
    })
  } catch { /* best-effort */ }
}

/**
 * 打开文件夹：优先弹 Tauri 原生目录选择器，选中的目录作为工作区打开/切换
 * （对应 ZCode openDirectory → open workspace）；无 Tauri 时回退在资源管理器
 * 打开当前工作区。
 */
async function openFolderAsWorkspace(ctx: unknown): Promise<void> {
  try {
    const internals = (window as unknown as {
      __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
    }).__TAURI_INTERNALS__
    if (internals?.invoke) {
      const picked = await internals.invoke('plugin:dialog|open', { options: { directory: true, multiple: false } })
      if (typeof picked === 'string' && picked !== '') {
        const workspaces = (ctx as { workspaces?: { create?: (i: { path: string }) => Promise<unknown> } }).workspaces
        if (workspaces?.create) { await workspaces.create({ path: picked }); return }
      }
    }
  } catch { /* fall through to Explorer fallback */ }
  const p = (window as unknown as { __mgGetCurrentWorkspace?: () => string | null }).__mgGetCurrentWorkspace?.() || ''
  void openInOs(p)
}

/** Insert a reference into the current session's composer draft. */
/** Insert a file/folder reference into the composer's draft. */
function insertReferenceIntoComposer(ctx: unknown, sessionId: string | undefined, text: string): void {
  // 1) Prefer the input service (append to the draft via setDraft).
  try {
    const input = (ctx as { conversation?: { input?: unknown } }).conversation?.input as
      | { shell?: (id: string) => { setDraft?: (t: string) => void; state?: { getSnapshot?: () => { draft?: string } } } | undefined }
      | undefined
    const shell = sessionId === undefined ? undefined : input?.shell?.(sessionId)
    if (shell?.setDraft !== undefined) {
      const cur = shell?.state?.getSnapshot?.()?.draft ?? ''
      shell.setDraft(cur.trim() === '' ? text : cur + ' ' + text)
      return
    }
  } catch { /* fall through to DOM fallback */ }

  // 2) DOM fallback: insert into the composer textarea and dispatch input.
  if (insertReferenceIntoComposerDom(text)) return

  // 3) Last resort: copy to clipboard.
  copyText(text)
}

function insertReferenceIntoComposerDom(text: string): boolean {
  try {
    const seat = document.querySelector('[data-composer-seat]')
    const ta = seat?.querySelector('textarea') || document.querySelector('textarea')
    if (ta === null) return false
    ta.focus()
    const cur = ta.value
    ta.value = cur.trim() === '' ? text : cur + ' ' + text
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  } catch {
    return false
  }
}

/** One expandable directory/file row. */
function TreeNode({ entry, depth, onContext }: {
  entry: DirectoryRow
  depth: number
  onContext: (entry: DirectoryRow, event: { preventDefault(): void; stopPropagation(): void; clientX: number; clientY: number }) => void
}): ReactNode {
  const [open, setOpen] = useState(false)
  const [children, setChildren] = useState<DirectoryRow[] | null>(null)

  useEffect(() => {
    if (!open || children !== null) return
    let alive = true
    void fetchDir(entry.path).then((rows) => { if (alive) setChildren(rows) })
    return () => { alive = false }
  }, [open, children, entry.path])

  const expandable = entry.isDirectory
  return (
    <li>
      <div
        className={c.treeRow}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => { if (expandable) setOpen(!open) }}
        onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); onContext(entry, event) }}
        data-row-path={entry.path}
        data-row-dir={expandable ? '1' : '0'}
      >
        <span className={c.treeIcon}>
          {expandable
            ? (open ? <IconFolderOpen16 size={16} /> : <IconFolderClose16 size={16} />)
            : <IconCodeOutline16 size={16} />}
        </span>
        <span className={c.treeName}>{entry.name}</span>
      </div>
      {open && children !== null && (
        <ul className={c.treeChildren}>
          {children.map((child) => <TreeNode key={child.path} entry={child} depth={depth + 1} onContext={onContext} />)}
        </ul>
      )}
    </li>
  )
}

/** Shared style for the top-row action buttons. */
const TOP_BTN: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  border: '1px solid var(--dsw-accent, #3b82f6)',
  background: 'transparent',
  color: 'var(--dsw-accent, #3b82f6)',
  borderRadius: 6,
  padding: '2px 10px',
  cursor: 'pointer',
  fontSize: 12,
  whiteSpace: 'nowrap',
}

/** Context menu for a tree node (右键菜单). */
function ContextMenu({ x, y, entry, ctx, sessionId, root, onClose }: {
  x: number
  y: number
  entry: DirectoryRow
  ctx: unknown
  sessionId: string | undefined
  root: string
  onClose: () => void
}): ReactNode {
  const items: Array<{ label: string; icon: ReactNode; run: () => void }> = []
  const rel = relativePath(entry.path, root)
  const reference = '[' + entry.name + '](' + rel + ')'
  const toggleDir = (): void => {
    try {
      const el = document.querySelector('[data-row-path="' + CSS.escape(entry.path) + '"]')
      el?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    } catch { /* best-effort */ }
  }
  if (entry.isDirectory) {
    items.push({ label: '打开（展开/折叠）', icon: <IconFolderOpen16 size={14} />, run: toggleDir })
    items.push({ label: '路径引用', icon: <IconLinkOutline16 size={14} />, run: () => { insertReferenceIntoComposer(ctx, sessionId, reference) } })
    items.push({ label: '复制目录', icon: <IconCopyOutline16 size={14} />, run: () => { copyText(entry.path) } })
    items.push({ label: '在此打开终端', icon: <IconCodeOutline16 size={14} />, run: () => { void ptyOpen(entry.path) } })
  } else {
    items.push({ label: '打开', icon: <IconPlayOutline16 size={14} />, run: () => { void openInOs(entry.path) } })
    items.push({ label: '路径引用', icon: <IconLinkOutline16 size={14} />, run: () => { insertReferenceIntoComposer(ctx, sessionId, reference) } })
    items.push({ label: '复制文件夹目录', icon: <IconCopyOutline16 size={14} />, run: () => { copyText(parentDir(entry.path)) } })
    items.push({ label: '复制文件路径', icon: <IconCopyOutline16 size={14} />, run: () => { copyText(entry.path) } })
    items.push({ label: '在此打开终端', icon: <IconCodeOutline16 size={14} />, run: () => { void ptyOpen(parentDir(entry.path)) } })
  }
  const MENU_STYLE: CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    zIndex: 1000,
    minWidth: 180,
    padding: '4px',
    background: 'var(--dsw-alias-bg-layer-2, #ffffff)',
    border: '1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%))',
    borderRadius: 8,
    boxShadow: '0 6px 24px rgb(0 0 0 / 20%)',
    fontFamily: 'var(--dsw-font-family, system-ui)',
    fontSize: 13,
    color: 'var(--dsw-alias-label-primary, #0f1115)',
  }
  const ITEM_STYLE: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '6px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    fontSize: 13,
  }
  return (
    <div data-rs-menu style={MENU_STYLE}>
      {items.map((item) => (
        <button key={item.label} type="button" style={ITEM_STYLE} onClick={() => { item.run(); onClose() }}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export function RightSidebar({ ctx }: RightSidebarProps): ReactNode {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')

  // Reserve the sidebar's width in the official AppFrame layout: 360px while
  // open, 56px while collapsed. The #root margin-right rule consumes this
  // variable, so the center column gives up exactly the sidebar's width.
  useEffect(() => {
    document.documentElement.style.setProperty('--mg-sidebar-width', open ? '360px' : '56px')
    return () => { document.documentElement.style.removeProperty('--mg-sidebar-width') }
  }, [open])

  // Current session workspace path from the client runtime. The session
  // summary's cwd is the most direct source (same one dsh-better-sidebar
  // uses); the workspaces registry is a secondary source when the summary is
  // still hydrating.
  const sessions = useSessionsValue(ctx) as
    | { current?: string; byId?: Record<string, { cwd?: string }> }
    | undefined
  const workspaces = useWorkspacesValue(ctx) as
    | { items?: Array<{ workspaceId?: string; path?: string; sessionIds?: string[] }>; recentWorkspaceId?: string }
    | undefined
  const currentSessionId = sessions?.current
  const sessionCwd = currentSessionId === undefined ? undefined : sessions?.byId?.[currentSessionId]?.cwd
  const items = workspaces?.items ?? []
  const currentWorkspace = currentSessionId === undefined
    ? undefined
    : items.find((w: { workspaceId?: string; path?: string; sessionIds?: string[] }) => w.sessionIds?.includes(currentSessionId))
  const workspacePath = currentWorkspace?.path
    ?? (workspaces?.recentWorkspaceId !== undefined ? items.find((w: { workspaceId?: string; path?: string }) => w.workspaceId === workspaces.recentWorkspaceId)?.path : undefined)
    ?? ''

  // Fallback to the page-global current-workspace getter (some assemblies may
  // not expose useWorkspaces/useSessions to the overlay slot).
  const [fallbackPath, setFallbackPath] = useState('')
  useEffect(() => {
    const get = (window as unknown as { __mgGetCurrentWorkspace?: () => string | null }).__mgGetCurrentWorkspace
    const path = get?.()
    if (path !== null && path !== undefined && path !== '') setFallbackPath(path)
  }, [])
  const effectivePath = workspacePath || sessionCwd || fallbackPath

  // Workspace data.
  const [rootEntries, setRootEntries] = useState<DirectoryRow[]>([])
  const [git, setGit] = useState<GitInfo | null>(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)

  // Context menu (右键菜单) on tree nodes.
  const [menu, setMenu] = useState<{ x: number; y: number; entry: DirectoryRow } | null>(null)
  const closeMenu = (): void => setMenu(null)
  const onRowContext = (entry: DirectoryRow, event: { preventDefault(): void; stopPropagation(): void; clientX: number; clientY: number }): void => {
    event.preventDefault()
    event.stopPropagation()
    setMenu({ x: event.clientX, y: event.clientY, entry })
  }
  useEffect(() => {
    if (menu === null) return
    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target as HTMLElement | null
      if (target !== null && target.closest && target.closest('[data-rs-menu]') !== null) return
      setMenu(null)
    }
    const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') setMenu(null) }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onPointerDown); document.removeEventListener('keydown', onKey) }
  }, [menu])

  useEffect(() => {
    if (effectivePath === '') {
      setRootEntries([])
      setGit(null)
      return
    }
    let alive = true
    setWorkspaceLoading(true)
    void Promise.all([fetchDir(effectivePath), fetchGit(effectivePath)]).then(([rows, info]) => {
      if (!alive) return
      setRootEntries(rows)
      setGit(info)
      setWorkspaceLoading(false)
    })
    return () => { alive = false }
  }, [effectivePath])

  // When the workspace changes, keep an open terminal's cwd in sync.
  useEffect(() => {
    if (effectivePath !== '') void ptyRetarget(effectivePath)
  }, [effectivePath])

  const refreshWorkspace = (): void => {
    if (effectivePath === '') return
    setWorkspaceLoading(true)
    void Promise.all([fetchDir(effectivePath), fetchGit(effectivePath)]).then(([rows, info]) => {
      setRootEntries(rows)
      setGit(info)
      setWorkspaceLoading(false)
    })
  }

  // Session projections from ctx.sessions.binding (the body portal is outside
  // slot rendering, so the session-scoped useProjection/useSession props are
  // not provided here — we subscribe through the runtime service directly).
  const sessionSnapshot = useSessionSnapshot(ctx, currentSessionId) as
    | { chat?: { timeline?: { turnOrder?: number[] } } }
    | undefined
  const stats = useProjectionValue(ctx, currentSessionId, 'sessionStats') as
    | { turns?: number; steps?: number; llmMs?: number; toolMs?: number; ttftMs?: number; ttftSteps?: number; decodeMs?: number; decodeTokens?: number }
    | undefined
  const usage = useProjectionValue(ctx, currentSessionId, 'tokenUsage') as
    | { uncachedInputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number; outputTokens?: number }
    | undefined

  // Current turn detection from the conversation timeline: the last turn in
  // turnOrder is the newest turn. When it changes, the previous round is over
  // and the next round's token counter restarts.
  const turnOrder = sessionSnapshot?.chat?.timeline?.turnOrder ?? []
  const currentTurn = Array.isArray(turnOrder) && turnOrder.length > 0 ? turnOrder[turnOrder.length - 1] : undefined
  const [turnBaseline, setTurnBaseline] = useState<TokenBuckets | null>(null)
  const turnKeyRef = useRef<string | null>(null)
  const turnSessionRef = useRef<string | null>(null)
  const prevUsageRef = useRef<TokenBuckets | null>(null)
  useEffect(() => {
    const sessionChanged = turnSessionRef.current !== currentSessionId
    turnSessionRef.current = currentSessionId ?? null
    const key = `${currentSessionId ?? ''}:${currentTurn ?? ''}`
    if (!sessionChanged && turnKeyRef.current === key) return
    turnKeyRef.current = key
    // On a session switch use the new session's own totals as the baseline.
    // On a turn change use the previous render's totals (before the new turn
    // reported any usage), so batching cannot accidentally zero the new turn.
    const baseline = sessionChanged || prevUsageRef.current === null
      ? (usage === undefined
        ? { uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 }
        : {
          uncachedInputTokens: usage.uncachedInputTokens ?? 0,
          cacheReadTokens: usage.cacheReadTokens ?? 0,
          cacheWriteTokens: usage.cacheWriteTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
        })
      : prevUsageRef.current
    setTurnBaseline(baseline)
  }, [currentSessionId, currentTurn, usage])
  // Keep the previous usage totals for the next turn-change calculation.
  useEffect(() => {
    prevUsageRef.current = usage === undefined
      ? null
      : {
        uncachedInputTokens: usage.uncachedInputTokens ?? 0,
        cacheReadTokens: usage.cacheReadTokens ?? 0,
        cacheWriteTokens: usage.cacheWriteTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
      }
  }, [usage])

  const turnTokens: TokenBuckets | undefined = usage !== undefined && turnBaseline !== null
    ? {
      uncachedInputTokens: Math.max(0, (usage.uncachedInputTokens ?? 0) - turnBaseline.uncachedInputTokens),
      cacheReadTokens: Math.max(0, (usage.cacheReadTokens ?? 0) - turnBaseline.cacheReadTokens),
      cacheWriteTokens: Math.max(0, (usage.cacheWriteTokens ?? 0) - turnBaseline.cacheWriteTokens),
      outputTokens: Math.max(0, (usage.outputTokens ?? 0) - turnBaseline.outputTokens),
    }
    : undefined

  // Total-context chart: group provider usage into total input and total output.
  const totalInputTokens = usage === undefined ? undefined : billedInputTokens(usage)
  const totalOutputTokens = usage?.outputTokens
  const totalTokens = totalInputTokens !== undefined && totalOutputTokens !== undefined
    ? totalInputTokens + totalOutputTokens
    : undefined
  const chartGradient = totalTokens !== undefined && totalTokens > 0
    ? `conic-gradient(var(--dsw-alias-state-business-primary, #3964fe) 0deg ${(totalInputTokens! / totalTokens) * 360}deg, var(--dsw-alias-state-success-primary, #16a34a) ${(totalInputTokens! / totalTokens) * 360}deg 360deg)`
    : ''

  return (
    <div className={clsx(c.root, !open && c.collapsed)} style={{ width: open ? 360 : 56 }}>
      {open ? (
        <>
          <div style={{ display: 'flex', gap: 8, padding: '6px 10px', alignItems: 'center', borderBottom: '1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%))' }}>
            <button type="button" style={TOP_BTN} onClick={() => { void openFolderAsWorkspace(ctx) }}>
              <IconFolderOpen16 size={14} /> 打开工作区文件夹
            </button>
            <button type="button" style={TOP_BTN} onClick={() => { void ptyOpen(effectivePath || undefined) }}>
              <IconCodeOutline16 size={14} /> 终端
            </button>
          </div>
          <div className={c.header}>
            <div className={c.tabs} role="tablist" aria-label="右侧栏视图">
              {(['overview', 'files', 'git'] as Tab[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  className={clsx(c.tab, tab === key && c.tabActive)}
                  onClick={() => { setTab(key) }}
                >
                  {key === 'overview' ? '概览' : key === 'files' ? '文件' : 'Git'}
                </button>
              ))}
            </div>
            <button type="button" className={c.toggle} data-tip="收起侧边栏" aria-label="收起右侧栏" onClick={() => { setOpen(false) }}>
              <IconPanelLeftOutline16 className={c.toggleIcon} size={16} />
            </button>
          </div>
          <div className={c.body}>
            <div className={c.content}>
              {tab === 'overview' && (
                <Overview
                  totalInputTokens={totalInputTokens}
                  totalOutputTokens={totalOutputTokens}
                  totalTokens={totalTokens}
                  chartGradient={chartGradient}
                  stats={stats}
                  usage={usage}
                  turnTokens={turnTokens}
                  fileCount={rootEntries.filter((e) => e.isFile).length}
                  dirCount={rootEntries.filter((e) => e.isDirectory).length}
                  git={git}
                  loading={workspaceLoading}
                />
              )}
              {tab === 'files' && (
                <div className={c.section}>
                  <div className={c.sectionTitle}>
                    工作区文件
                    {effectivePath !== '' && (
                      <button type="button" className={c.refresh} onClick={() => { refreshWorkspace() }}>刷新</button>
                    )}
                  </div>
                  {effectivePath === ''
                    ? <div className={c.empty}>当前会话没有关联工作区</div>
                    : workspaceLoading && rootEntries.length === 0
                      ? <div className={c.empty}>加载中…</div>
                      : rootEntries.length === 0
                        ? <div className={c.empty}>工作区为空</div>
                        : (
                          <ul className={c.tree}>
                            {rootEntries.map((entry) => <TreeNode key={entry.path} entry={entry} depth={0} onContext={onRowContext} />)}
                          </ul>
                        )}
                </div>
              )}
              {tab === 'git' && (
                <GitTab git={git} loading={workspaceLoading} />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={c.rail}>
          <button type="button" className={c.toggle} data-tip="展开侧边栏" aria-label="展开右侧栏" onClick={() => { setOpen(true) }}>
            <IconPanelLeftOutline16 className={c.toggleIcon} size={18} />
          </button>
          <div className={c.railItems}>
            <button type="button" className={c.railItem} data-tip="概览" aria-label="概览" onClick={() => { setTab('overview'); setOpen(true) }}>
              <IconDataOutline16 size={18} />
            </button>
            <button type="button" className={c.railItem} data-tip="文件" aria-label="文件" onClick={() => { setTab('files'); setOpen(true) }}>
              <IconFolderOpen16 size={18} />
            </button>
            <button type="button" className={c.railItem} data-tip="Git" aria-label="Git" onClick={() => { setTab('git'); setOpen(true) }}>
              <IconBranchOutline16 size={18} />
            </button>
          </div>
        </div>
      )}
      {menu !== null && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          entry={menu.entry}
          ctx={ctx}
          sessionId={currentSessionId}
          root={effectivePath}
          onClose={closeMenu}
        />
      )}
    </div>
  )
}

/** One Reasonix-style stat card: small icon + caption label above a bold value. */
function StatCard({ icon: Icon, label, value }: { icon: (props: { size?: number; className?: string }) => ReactNode; label: string; value: string }): ReactNode {
  return (
    <div className={c.statCard}>
      <div className={c.statHead}>
        <Icon className={c.statIcon} size={14} />
        <span className={c.statLabel}>{label}</span>
      </div>
      <div className={c.statValue}>{value}</div>
    </div>
  )
}

/** Map a git porcelain status to a semantic badge kind (Reasonix-style). */
function gitStatusKind(status: string): 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked' {
  const s = status.trim()
  if (s === '??') return 'untracked'
  if (s.startsWith('A')) return 'added'
  if (s.startsWith('D')) return 'deleted'
  if (s.startsWith('R') || s.startsWith('C')) return 'renamed'
  return 'modified'
}

/** Short display text for a git porcelain status: ' M' → 'M', '??' → '?'. */
function gitStatusText(status: string): string {
  const s = status.trim()
  if (s === '??') return '?'
  return s[0] ?? '?'
}

function Overview(props: {
  totalInputTokens?: number
  totalOutputTokens?: number
  totalTokens?: number
  chartGradient: string
  stats?: { turns?: number; steps?: number; llmMs?: number; toolMs?: number; ttftMs?: number; ttftSteps?: number; decodeMs?: number; decodeTokens?: number }
  usage?: { uncachedInputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number; outputTokens?: number }
  turnTokens?: TokenBuckets
  fileCount: number
  dirCount: number
  git: GitInfo | null
  loading: boolean
}): ReactNode {
  const { totalInputTokens, totalOutputTokens, totalTokens, chartGradient, stats, usage, turnTokens, fileCount, dirCount, git, loading } = props

  const ttftAvg = stats?.ttftSteps !== undefined && stats.ttftSteps > 0 && stats.ttftMs !== undefined
    ? stats.ttftMs / stats.ttftSteps
    : undefined
  const tps = stats?.decodeMs !== undefined && stats.decodeMs > 0 && stats.decodeTokens !== undefined
    ? stats.decodeTokens / (stats.decodeMs / 1_000)
    : undefined
  const cacheHit = usage === undefined ? undefined : cacheHitPercent(usage)
  const inputTokens = usage === undefined ? undefined : billedInputTokens(usage)
  const outputTokens = usage?.outputTokens
  // New/blank conversations have no projection data yet; render zeros instead
  // of empty states so the sidebar always shows a complete overview.
  const zeroBuckets: TokenBuckets = { uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 }
  const chartTotal = totalTokens ?? 0
  const chartInput = totalInputTokens ?? 0
  const chartOutput = totalOutputTokens ?? 0
  const turn = turnTokens ?? zeroBuckets
  const turnCache = turnTokens === undefined ? 0 : (cacheHitPercent(turnTokens) ?? 0)
  const turnTotalValue = turnTokens === undefined ? 0 : billedInputTokens(turnTokens) + turnTokens.outputTokens

  return (
    <div>
      <div className={c.section}>
        <div className={c.sectionTitle}>总上下文 TOKEN</div>
        <div className={c.card}>
          <div className={c.chartWrap}>
            <div className={c.chart} style={chartGradient ? { background: chartGradient } : undefined}>
              <div className={c.chartCenter}>
                <div>
                  <div>{formatTokens(chartTotal)}</div>
                  <div>Tokens</div>
                </div>
              </div>
            </div>
            <div className={c.legend}>
              <div className={c.legendRow}><i className={c.legendDot} style={{ background: 'var(--dsw-alias-state-business-primary)' }} />总输入 {formatTokens(chartInput)}</div>
              <div className={c.legendRow}><i className={c.legendDot} style={{ background: 'var(--dsw-alias-state-success-primary)' }} />总输出 {formatTokens(chartOutput)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className={c.section}>
        <div className={c.sectionTitle}>会话统计</div>
        <div className={c.statGrid}>
          <StatCard icon={IconDataOutline16} label="轮次 / 步数" value={`${stats?.turns ?? 0} 轮 · ${stats?.steps ?? 0} 步`} />
          <StatCard icon={IconThinkOutline16} label="LLM 耗时" value={formatDuration(stats?.llmMs ?? 0)} />
          <StatCard icon={IconCodeOutline16} label="工具调用" value={formatDuration(stats?.toolMs ?? 0)} />
          <StatCard icon={IconPlayOutline16} label="首 token 平均" value={formatDuration(ttftAvg ?? 0)} />
          <StatCard icon={IconRightUpOutline16} label="速度" value={`${formatTokensPerSecond(tps ?? 0)} tok/s`} />
          <StatCard icon={IconCheckOutline16} label="缓存命中" value={`${cacheHit ?? 0}%`} />
          <StatCard icon={IconDownloadOutline16} label="输入 Tokens" value={`${formatTokens(inputTokens ?? 0)} tok`} />
          <StatCard icon={IconSendOutline16} label="输出 Tokens" value={`${formatTokens(outputTokens ?? 0)} tok`} />
        </div>
      </div>
      <div className={c.section}>
        <div className={c.sectionTitle}>本轮对话 Token</div>
        <div className={c.statGrid}>
          <StatCard icon={IconDownloadOutline16} label="本轮输入" value={`${formatTokens(billedInputTokens(turn))} tok`} />
          <StatCard icon={IconSendOutline16} label="本轮输出" value={`${formatTokens(turn.outputTokens)} tok`} />
          <StatCard icon={IconCheckOutline16} label="本轮缓存命中" value={`${turnCache}%`} />
          <StatCard icon={IconDataOutline16} label="本轮总计" value={`${formatTokens(turnTotalValue)} tok`} />
        </div>
      </div>
      <div className={c.section}>
        <div className={c.sectionTitle}>工作区</div>
        {loading ? <div className={c.empty}>加载中…</div> : (
          <div className={c.statGrid}>
            <StatCard icon={IconFolderOpen16} label="文件" value={String(fileCount)} />
            <StatCard icon={IconFolderClose16} label="文件夹" value={String(dirCount)} />
            <StatCard icon={IconBranchOutline16} label="Git" value={git?.isGit ? (git.branch || '仓库') : '非 Git'} />
            <StatCard icon={IconEditOutline16} label="变更" value={String(git?.changes.length ?? 0)} />
          </div>
        )}
      </div>
    </div>
  )
}

function GitTab({ git, loading }: { git: GitInfo | null; loading: boolean }): ReactNode {
  if (loading && git === null) return <div className={c.empty}>检测中…</div>
  if (git === null || !git.isGit) return <div className={c.empty}>当前工作区不是 Git 仓库</div>

  const staged = git.changes.filter((change) => change.status !== '??' && change.status[0] !== ' ')
  const unstaged = git.changes.filter((change) => change.status !== '??' && change.status[1] !== ' ')
  const untracked = git.changes.filter((change) => change.status === '??')

  const renderList = (items: GitChange[], label: string): ReactNode => {
    if (items.length === 0) return null
    return (
      <div className={c.section}>
        <div className={c.gitGroupHead}>{label}<span className={c.gitGroupBadge}>{items.length}</span></div>
        <ul className={c.gitChanges}>
          {items.map((change, index) => (
            <li key={`${label}-${change.path}-${index}`} className={c.gitChange}>
              <span className={`${c.gitStatus} ${c.gitStatus}-${gitStatusKind(change.status)}`}>{gitStatusText(change.status)}</span>
              <span className={c.treeName}>{change.path}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <div className={c.section}>
        <div className={c.gitBranchCard}>
          <IconBranchOutline16 className={c.gitBranchIcon} size={16} />
          <span className={c.gitBranchName}>{git.branch || 'HEAD'}</span>
          {git.head !== '' && <span className={c.gitBranchHead}>{git.head.slice(0, 7)}</span>}
        </div>
      </div>
      {git.changes.length === 0
        ? <div className={c.empty}>工作区无变更</div>
        : (
          <>
            {renderList(staged, '已暂存')}
            {renderList(unstaged, '未暂存')}
            {renderList(untracked, '未跟踪')}
          </>
        )}
    </div>
  )
}
