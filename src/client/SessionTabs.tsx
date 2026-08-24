/**
 * SessionTabs — browser-style session tabs rendered INTO the shell titlebar
 * via createPortal (inside #dsh-hub-titlebar .tb-title). Each tab is an open
 * session; click to switch, + to start, x to remove.
 *
 * Functional surface (Cherry Studio-style):
 *  - live status dot: amber = waiting (pendingInteraction), green = done in
 *    background, blue = running;
 *  - right-click context menu (reuses session-menu: fork / archive / copy /
 *    open-in-explorer) plus inline rename;
 *  - drag to reorder (persisted in the tab store);
 *  - auto-scroll the active tab into view when it changes.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type MouseEvent as ReactMouseEvent, type DragEvent as ReactDragEvent } from 'react'
import { createPortal } from 'react-dom'
import { tabAdd, tabRemove, tabReplaceOrder, getTabs, useTabs } from './session-tabs.ts'
import { openSessionMenu } from './session-menu.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- body-portal ctx is intentionally loose.
type SessionTabsProps = { ctx: any }

interface PendingInteractionLike { kind?: string; status?: string }
interface SessionSummaryLike {
  title?: string
  displayTitle?: string
  blank?: boolean
  running?: boolean
  pendingInteraction?: PendingInteractionLike
  completed?: boolean
}
interface SessionsSnap { current?: string; byId?: Record<string, SessionSummaryLike> }
interface WorkspacesSnap { archivedSessionIds?: string[] }

function useSessionsSnap(ctx: any): SessionsSnap {
  const list = ctx?.sessions?.list
  const [snap, setSnap] = useState<SessionsSnap>(() => (list?.getSnapshot?.() ?? {}) as SessionsSnap)
  useEffect(() => {
    if (!list?.subscribe) return
    const cb = (): void => setSnap((list.getSnapshot?.() ?? {}) as SessionsSnap)
    const off = list.subscribe(cb)
    return () => off?.()
  }, [list])
  return snap
}

function useWorkspacesSnap(ctx: any): WorkspacesSnap {
  const list = ctx?.workspaces?.list
  const [snap, setSnap] = useState<WorkspacesSnap>(() => (list?.getSnapshot?.() ?? {}) as WorkspacesSnap)
  useEffect(() => {
    if (!list?.subscribe) return
    const cb = (): void => setSnap((list.getSnapshot?.() ?? {}) as WorkspacesSnap)
    const off = list.subscribe(cb)
    return () => off?.()
  }, [list])
  return snap
}

const ROOT = {
  display: 'flex', alignItems: 'center', gap: 2, flex: '1', minWidth: 0,
  overflowX: 'auto', height: '100%', boxSizing: 'border-box', paddingLeft: 6,
  fontFamily: 'var(--dsw-font-family, system-ui)', fontSize: 12,
  WebkitAppRegion: 'no-drag',
} as CSSProperties
const TAB: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
  background: 'transparent', border: 'none', color: 'var(--dsw-alias-label-tertiary, #9aa7bd)', whiteSpace: 'nowrap', maxWidth: 190,
  transition: 'background .12s ease, color .12s ease',
  userSelect: 'none', flex: 'none',
}
const TAB_ACTIVE: CSSProperties = { ...TAB, background: 'var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.16))', color: 'var(--dsw-alias-label-primary, #fff)' }
const TAB_DRAGGING: CSSProperties = { ...TAB, opacity: 0.4 }
const PLUS: CSSProperties = { border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 15, padding: '2px 7px', borderRadius: 6, flex: 'none' }
const INLINE_INPUT: CSSProperties = {
  border: '1px solid var(--dsw-accent, #3964fe)', background: 'transparent', color: 'inherit',
  fontSize: 12, padding: '1px 4px', borderRadius: 4, outline: 'none', minWidth: 60, boxSizing: 'border-box',
}

export function SessionTabs({ ctx }: SessionTabsProps): ReactNode {
  const tabs = useTabs()
  const snap = useSessionsSnap(ctx)
  const ws = useWorkspacesSnap(ctx)
  const current = snap.current
  const byId = snap.byId ?? {}
  const archivedIds = ws.archivedSessionIds ?? []
  // 只保留真正存在、未归档、非空白占位会话的标签；归档/删除/空白 → 不在栏里。
  const validTabs = tabs.filter((id) => {
    const s = byId[id]
    return s !== undefined && s.blank !== true && !archivedIds.includes(id)
  })

  // Inline rename state.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  // Drag-reorder state.
  const [dragId, setDragId] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { if (current) tabAdd(current) }, [current])

  // 会话生命周期同步：归档 / 删除 / 空白会话的标签要从 store 真删掉（不只隐藏），
  // 并同步当前会话的显示。
  useEffect(() => {
    const stale = tabs.filter((id) => {
      const s = byId[id]
      return s === undefined || s.blank === true || archivedIds.includes(id)
    })
    if (stale.length === 0) return
    if (current !== undefined && stale.includes(current)) {
      const idx = tabs.indexOf(current)
      const next = tabs[idx - 1] ?? tabs[idx + 1]
      if (next !== undefined && !stale.includes(next)) {
        try { ctx?.sessions?.open?.(next) } catch { /* ignore */ }
      }
    }
    for (const id of stale) tabRemove(id)
  }, [tabs, byId, archivedIds, current])

  // Auto-scroll the active tab into view when it changes.
  useEffect(() => {
    if (!current) return
    const el = barRef.current?.querySelector<HTMLElement>(`[data-tab-id="${current}"]`)
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [current, validTabs.length])

  // Running-state pulse keyframes (injected once).
  useEffect(() => {
    if (document.getElementById('mg-tab-status-pulse')) return
    const tag = document.createElement('style')
    tag.id = 'mg-tab-status-pulse'
    tag.textContent = '@keyframes mgTabStatusPulse{0%,100%{opacity:1}50%{opacity:.25}}'
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, [])

  // Locate the titlebar .tb-title and render into it via portal (React keeps
  // it mounted across re-renders). Retries until the titlebar exists.
  const [titleEl, setTitleEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    let timer = 0
    const find = (): void => {
      const el = document.querySelector('#dsh-hub-titlebar .tb-title') as HTMLElement | null
      if (el) { setTitleEl(el); window.clearInterval(timer) }
    }
    find()
    timer = window.setInterval(find, 300)
    return () => window.clearInterval(timer)
  }, [])

  if (!current && validTabs.length === 0) return null
  if (titleEl === null) return null

  const titleOf = (id: string): string => (byId[id]?.displayTitle || byId[id]?.title || id).slice(0, 20)
  const open = (id: string): void => { if (byId[id] === undefined) return; try { ctx?.sessions?.open?.(id) } catch { /* ignore */ } }
  const start = (): void => { try { ctx?.workspaces?.startSession?.() } catch { /* ignore */ } }

  const beginRename = (id: string): void => { setDraft(titleOf(id)); setEditingId(id) }
  const commitRename = (id: string): void => {
    const t = draft.trim()
    setEditingId(null)
    if (t === '' || t === titleOf(id)) return
    try {
      const b = ctx?.sessions?.binding?.(id)
      void b?.session?.rename?.(t).catch?.(() => {})
    } catch { /* ignore */ }
  }
  const cancelRename = (): void => setEditingId(null)

  const onContextMenu = (id: string, e: ReactMouseEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    openSessionMenu({
      x: e.clientX,
      y: e.clientY,
      id,
      title: byId[id]?.displayTitle ?? byId[id]?.title ?? id,
      ctx,
      onRename: () => beginRename(id),
    })
  }

  // ── Drag to reorder ─────────────────────────────────────────────────────
  const onDragStart = (id: string) => (e: ReactDragEvent<HTMLDivElement>): void => {
    setDragId(id)
    try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move' } catch { /* ignore */ }
  }
  const onDragOver = (id: string) => (e: ReactDragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    const from = dragId
    if (from === null || from === id) return
    const cur = getTabs()
    const fi = cur.indexOf(from)
    const ti = cur.indexOf(id)
    if (fi === -1 || ti === -1 || fi === ti) return
    const next = [...cur]
    next.splice(fi, 1)
    next.splice(ti, 0, from)
    tabReplaceOrder(next)
  }
  const onDrop = (e: ReactDragEvent<HTMLDivElement>): void => { e.preventDefault(); setDragId(null) }
  const onDragEnd = (): void => setDragId(null)

  // ── Status dot ──────────────────────────────────────────────────────────
  const statusOf = (s: SessionSummaryLike | undefined): { color: string; title: string; pulse?: boolean } | null => {
    if (s?.pendingInteraction) return { color: '#f5a623', title: '等待处理/审批' }
    if (s?.completed) return { color: '#2ecc71', title: '后台已完成' }
    if (s?.running) return { color: '#3b82f6', title: '运行中', pulse: true }
    return null
  }

  const close = (id: string): void => {
    if (id === current) {
      const idx = validTabs.indexOf(id)
      const next = validTabs[idx - 1] ?? validTabs[idx + 1]
      if (next) open(next)
    }
    tabRemove(id)
  }

  const content = (
    <div ref={barRef} style={ROOT}>
      <button type="button" style={PLUS} title="新建会话" onClick={start}>+</button>
      {validTabs.map((id) => {
        const s = byId[id]
        const active = id === current
        const st = statusOf(s)
        const editing = editingId === id
        const tabStyle = dragId === id ? TAB_DRAGGING : active ? TAB_ACTIVE : TAB
        return (
          <div
            key={id}
            data-tab-id={id}
            role="tab"
            aria-selected={active}
            draggable
            title={s?.title ?? id}
            style={tabStyle}
            onClick={() => { if (!editing) open(id) }}
            onContextMenu={(e) => onContextMenu(id, e)}
            onDragStart={onDragStart(id)}
            onDragOver={onDragOver(id)}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
          >
            {st !== null && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.color, flex: 'none', display: 'inline-block', ...(st.pulse ? { animation: 'mgTabStatusPulse 1.1s ease-in-out infinite' } : {}) }} title={st.title} />
            )}
            {editing ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitRename(id)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitRename(id); else if (e.key === 'Escape') cancelRename() }}
                onClick={(e) => e.stopPropagation()}
                style={{ ...INLINE_INPUT, width: Math.max(80, draft.length * 7 + 22) }}
              />
            ) : (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{titleOf(id)}</span>
            )}
            <span
              role="button"
              aria-label="关闭标签"
              title="关闭标签"
              style={{ color: '#888', padding: '0 3px', borderRadius: 4, cursor: 'pointer', lineHeight: '14px', flex: 'none' }}
              onClick={(e) => { e.stopPropagation(); close(id) }}
            >×</span>
          </div>
        )
      })}
    </div>
  )

  return createPortal(content, titleEl)
}
