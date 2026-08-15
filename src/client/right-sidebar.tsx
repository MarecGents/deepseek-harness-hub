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

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import clsx from 'clsx'
import {
  IconBranchOutline16,
  IconCheckOutline16,
  IconCodeOutline16,
  IconDataOutline16,
  IconDownloadOutline16,
  IconEditOutline16,
  IconFolderClose16,
  IconFolderOpen16,
  IconPanelLeftOutline16,
  IconPlayOutline16,
  IconRightUpOutline16,
  IconSendOutline16,
  IconThinkOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { RIGHT_SIDEBAR_CSS_CLASSES as c } from './right-sidebar-style.ts'

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

/** One expandable directory/file row. */
function TreeNode({ entry, depth }: { entry: DirectoryRow; depth: number }): ReactNode {
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
          {children.map((child) => <TreeNode key={child.path} entry={child} depth={depth + 1} />)}
        </ul>
      )}
    </li>
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
                            {rootEntries.map((entry) => <TreeNode key={entry.path} entry={entry} depth={0} />)}
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
