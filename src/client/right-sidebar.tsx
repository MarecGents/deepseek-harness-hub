/**
 * RightSidebar — the mg-dsh-desktop right sidebar occupying the official
 * `details` slot. It mirrors the left sidebar's collapse/rail behavior and
 * provides three tabs:
 *  - Overview: context-token usage rendered as a fan/donut chart.
 *  - Files: current workspace file/folder tree, strictly synced to the
 *    current session's workspace.
 *  - Git: whether the workspace is a git repo, branch, and working-tree changes.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconPanelLeftOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { RIGHT_SIDEBAR_CSS_CLASSES as c } from './right-sidebar-style.ts'

/** The details slot composes many framework props; this component only needs the injected callbacks. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- slot props are framework-composed; we only consume a subset.
type RightSidebarProps = any

/** Width below which the details column is considered collapsed (rail mode). */
const COLLAPSED_THRESHOLD = 10

type Tab = 'overview' | 'files' | 'git'

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
    const res = await fetch(`/api/mg-dsh-desktop/workspace/list?${new URLSearchParams({ path })}`)
    const body = (await res.json()) as { ok?: boolean; entries?: DirectoryRow[] }
    return body.ok === true ? (body.entries ?? []) : []
  } catch {
    return []
  }
}

async function fetchGit(path: string): Promise<GitInfo | null> {
  try {
    const res = await fetch(`/api/mg-dsh-desktop/workspace/git?${new URLSearchParams({ path })}`)
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
        <span className={c.treeIcon}>{expandable ? (open ? '▾' : '▸') : '·'}</span>
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

export function RightSidebar({ openDetails, closeDetails, useProjection, useSessions, useWorkspaces, useSession, sessionId }: RightSidebarProps): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  // Current session workspace path from the client runtime. The session
  // summary's cwd is the most direct source (same one dsh-better-sidebar
  // uses); the workspaces registry is a secondary source when the summary is
  // still hydrating.
  const sessions = useSessions((s: { current?: string; byId?: Record<string, { cwd?: string }> }) => s)
  const workspaces = useWorkspaces((s: { items?: Array<{ workspaceId?: string; path?: string; sessionIds?: string[] }>; recentWorkspaceId?: string }) => s)
  const currentSessionId = sessionId ?? sessions?.current
  const sessionCwd = currentSessionId === undefined ? undefined : sessions?.byId?.[currentSessionId]?.cwd
  const items = workspaces?.items ?? []
  const currentWorkspace = currentSessionId === undefined
    ? undefined
    : items.find((w: { workspaceId?: string; path?: string; sessionIds?: string[] }) => w.sessionIds?.includes(currentSessionId))
  const workspacePath = currentWorkspace?.path
    ?? (workspaces?.recentWorkspaceId !== undefined ? items.find((w: { workspaceId?: string; path?: string }) => w.workspaceId === workspaces.recentWorkspaceId)?.path : undefined)
    ?? ''

  // Fallback to the page-global current-workspace getter (some assemblies may
  // not expose useWorkspaces/useSessions to the details slot).
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

  // Context token projections (same source as the composer's context meter).
  const stats = useProjection('sessionStats') as
    | { turns?: number; steps?: number; llmMs?: number; toolMs?: number; ttftMs?: number; ttftSteps?: number; decodeMs?: number; decodeTokens?: number }
    | undefined
  const usage = useProjection('tokenUsage') as
    | { uncachedInputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number; outputTokens?: number }
    | undefined

  // Current turn detection from the conversation timeline: the last turn in
  // turnOrder is the newest turn. When it changes, the previous round is over
  // and the next round's token counter restarts.
  const turnOrder = useSession((s: { chat?: { timeline?: { turnOrder?: number[] } } }) => s?.chat?.timeline?.turnOrder ?? [])
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
    ? `conic-gradient(#3964fe 0deg ${(totalInputTokens! / totalTokens) * 360}deg, #16a34a ${(totalInputTokens! / totalTokens) * 360}deg 360deg)`
    : ''

  // Collapse detection.
  useEffect(() => {
    const el = rootRef.current
    if (el === null) return
    const update = (): void => {
      setCollapsed(el.getBoundingClientRect().width < COLLAPSED_THRESHOLD)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // While collapsed, the only visible affordance is a small top-right expand
  // button (mirrors dsh-better-sidebar). Tell the session header to yield its
  // right padding so the button never covers the header's own controls.
  useEffect(() => {
    if (collapsed) document.body.setAttribute('data-mg-details-collapsed', '')
    else document.body.removeAttribute('data-mg-details-collapsed')
    return () => { document.body.removeAttribute('data-mg-details-collapsed') }
  }, [collapsed])

  if (collapsed) {
    return (
      <div ref={rootRef} className={clsx(c.root, c.collapsed)}>
        <div className={c.rail}>
          <button type="button" className={c.toggle} aria-label="展开右侧栏" onClick={() => { openDetails() }}>
            <IconPanelLeftOutline16 className={c.toggleIcon} size={18} />
          </button>
          <div className={c.railItems}>
            <span className={c.railPlaceholder} aria-hidden />
            <span className={c.railPlaceholder} aria-hidden />
            <span className={c.railPlaceholder} aria-hidden />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className={c.root}>
      <div className={c.header}>
        <div className={c.headerTop}>
          <span className={c.title}>右侧栏</span>
          <button type="button" className={c.toggle} aria-label="收起右侧栏" onClick={() => { closeDetails() }}>
            <IconPanelLeftOutline16 className={c.toggleIcon} size={16} />
          </button>
        </div>
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
    </div>
  )
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
  const turnCacheHit = turnTokens === undefined ? undefined : cacheHitPercent(turnTokens)
  const turnTotal = turnTokens === undefined ? undefined : billedInputTokens(turnTokens) + turnTokens.outputTokens

  return (
    <div>
      <div className={c.section}>
        <div className={c.sectionTitle}>总上下文 TOKEN</div>
        {totalTokens === undefined
          ? <div className={c.empty}>暂无 Token 数据</div>
          : (
            <div className={c.chartWrap}>
              <div className={c.chart} style={chartGradient ? { background: chartGradient } : undefined}>
                <div className={c.chartCenter}>
                  <div>
                    <div>{formatTokens(totalTokens)}</div>
                    <div>Tokens</div>
                  </div>
                </div>
              </div>
              <div className={c.legend}>
                <div className={c.legendRow}><i className={c.legendDot} style={{ background: '#3964fe' }} />总输入 {formatTokens(totalInputTokens ?? 0)}</div>
                <div className={c.legendRow}><i className={c.legendDot} style={{ background: '#16a34a' }} />总输出 {formatTokens(totalOutputTokens ?? 0)}</div>
              </div>
            </div>
          )}
        <div className={c.statGrid}>
          <div className={c.stat}><div className={c.statLabel}>轮次 / 步数</div><div className={c.statValue}>{stats?.turns ?? '-'} 轮 · {stats?.steps ?? '-'} 步</div></div>
          <div className={c.stat}><div className={c.statLabel}>LLM 耗时</div><div className={c.statValue}>{stats?.llmMs !== undefined ? formatDuration(stats.llmMs) : '-'}</div></div>
          <div className={c.stat}><div className={c.statLabel}>工具调用</div><div className={c.statValue}>{stats?.toolMs !== undefined ? formatDuration(stats.toolMs) : '-'}</div></div>
          <div className={c.stat}><div className={c.statLabel}>首 token 平均</div><div className={c.statValue}>{ttftAvg !== undefined ? formatDuration(ttftAvg) : '-'}</div></div>
          <div className={c.stat}><div className={c.statLabel}>速度</div><div className={c.statValue}>{tps !== undefined ? `${formatTokensPerSecond(tps)} tok/s` : '-'}</div></div>
          <div className={c.stat}><div className={c.statLabel}>缓存命中</div><div className={c.statValue}>{cacheHit !== undefined && cacheHit !== null ? `${cacheHit}%` : '-'}</div></div>
          <div className={c.stat}><div className={c.statLabel}>输入 Tokens</div><div className={c.statValue}>{inputTokens !== undefined ? `${formatTokens(inputTokens)} tok` : '-'}</div></div>
          <div className={c.stat}><div className={c.statLabel}>输出 Tokens</div><div className={c.statValue}>{outputTokens !== undefined ? `${formatTokens(outputTokens)} tok` : '-'}</div></div>
        </div>
      </div>
      <div className={c.section}>
        <div className={c.sectionTitle}>本轮对话 Token</div>
        {turnTokens === undefined
          ? <div className={c.empty}>暂无本轮数据</div>
          : (
            <div className={c.statGrid}>
              <div className={c.stat}><div className={c.statLabel}>本轮输入</div><div className={c.statValue}>{formatTokens(billedInputTokens(turnTokens))} tok</div></div>
              <div className={c.stat}><div className={c.statLabel}>本轮输出</div><div className={c.statValue}>{formatTokens(turnTokens.outputTokens)} tok</div></div>
              <div className={c.stat}><div className={c.statLabel}>本轮缓存命中</div><div className={c.statValue}>{turnCacheHit !== undefined && turnCacheHit !== null ? `${turnCacheHit}%` : '-'}</div></div>
              <div className={c.stat}><div className={c.statLabel}>本轮总计</div><div className={c.statValue}>{turnTotal !== undefined ? `${formatTokens(turnTotal)} tok` : '-'}</div></div>
            </div>
          )}
      </div>
      <div className={c.section}>
        <div className={c.sectionTitle}>工作区</div>
        {loading ? <div className={c.empty}>加载中…</div> : (
          <div className={c.statGrid}>
            <div className={c.stat}><div className={c.statLabel}>文件</div><div className={c.statValue}>{fileCount}</div></div>
            <div className={c.stat}><div className={c.statLabel}>文件夹</div><div className={c.statValue}>{dirCount}</div></div>
            <div className={c.stat}><div className={c.statLabel}>Git</div><div className={c.statValue}>{git?.isGit ? (git.branch || '仓库') : '非 Git'}</div></div>
            <div className={c.stat}><div className={c.statLabel}>变更</div><div className={c.statValue}>{git?.changes.length ?? 0}</div></div>
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
        <div className={c.sectionTitle}>{label}（{items.length}）</div>
        <ul className={c.gitChanges}>
          {items.map((change, index) => (
            <li key={`${label}-${change.path}-${index}`} className={c.gitChange}>
              <span className={c.gitStatus}>{change.status || '??'}</span>
              <span className={c.treeName}>{change.path}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <div className={c.gitBranch}>分支：{git.branch || git.head || '未知'}</div>
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
