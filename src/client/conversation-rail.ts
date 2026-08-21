/**
 * Conversation rail (对话定位条) — a fixed-position left gutter over the
 * conversation column. It renders one short horizontal bar per conversation
 * segment (turn) and lets the user click a bar to jump to that segment.
 *
 * This is intentionally a lightweight minimap: positions are approximated by
 * segment index over the scrollable range, not by exact DOM message anchors
 * (the official message DOM has no stable CSS-module contract we may depend
 * on). The data source is the official session ConversationSnapshot
 * (`turnTimings`), so the bar count tracks the real turn list. Read-only —
 * the rail never writes to the session.
 *
 * Body-portal overlay: the rail is appended to `document.body` (never inside
 * an official slot), anchored to the `data-slot="conversation"` column via
 * `getBoundingClientRect()`. The disposer removes it, so HMR /
 * include.refresh rebuild cleanly.
 *
 * @module dsh-hub/client/conversation-rail
 */

import { RAIL_CSS_CLASSES as c, injectConversationRailStyle } from './conversation-rail-style.ts'

/** Stable anchor for the dsh AppFrame conversation slot. */
const CONVERSATION_SLOT_SELECTOR = '[data-slot="conversation"]'

/** Loose runtime service views (mirrors the project's client style). */
interface SessionSummaryLike {
  id?: string
}
interface SessionsListLike {
  current?: string
  byId?: Record<string, SessionSummaryLike>
  phase?: string
}
interface ConversationNodeLike {
  kind?: string
}
interface ConversationSnapshotLike {
  nodes?: readonly ConversationNodeLike[]
  turnTimings?: { size?: number }
  blank?: boolean
}
interface ClientCtxLike {
  sessions?: {
    list?: {
      subscribe?: (cb: () => void) => () => void
      getSnapshot?: () => SessionsListLike | undefined
    }
    binding?: (id: string) => {
      session?: {
        subscribe?: (cb: () => void) => () => void
        getSnapshot?: () => ConversationSnapshotLike | undefined
      }
    } | undefined
  }
}

/** Install the conversation rail; returns the disposer. */
export function installConversationRail(ctx: unknown): () => void {
  const runtime = ctx as ClientCtxLike
  let alive = true

  // ── State ────────────────────────────────────────────────────────────────
  let currentSessionId: string | undefined
  let segmentCount = 0
  let rail: HTMLElement | null = null
  let scrollContainer: HTMLElement | null = null
  let slot: HTMLElement | null = null
  let unsubSessions: () => void = () => {}
  let unsubCurrentSession: () => void = () => {}

  // ── DOM helpers ──────────────────────────────────────────────────────────
  function findSlot(): HTMLElement | null {
    return document.querySelector<HTMLElement>(CONVERSATION_SLOT_SELECTOR)
  }

  function findScrollContainer(from: HTMLElement): HTMLElement | null {
    const candidates = [from, ...Array.from(from.querySelectorAll<HTMLElement>('*'))]
    for (const el of candidates) {
      if (el.scrollHeight > el.clientHeight + 1) {
        const overflowY = getComputedStyle(el).overflowY
        if (overflowY === 'auto' || overflowY === 'scroll') return el
      }
    }
    return null
  }

  function ensureRail(): HTMLElement | null {
    if (rail !== null && rail.isConnected) return rail
    if (!alive) return null
    injectConversationRailStyle()
    rail = document.createElement('div')
    rail.id = 'dsh-hub-conversation-rail'
    rail.className = c.root
    rail.setAttribute('data-dsh-hub-conversation-rail', '')
    rail.hidden = true
    document.body.appendChild(rail)
    return rail
  }

  // ── Rendering ────────────────────────────────────────────────────────────
  function deriveSegmentCount(snapshot: ConversationSnapshotLike | undefined): number {
    const turns = snapshot?.turnTimings?.size ?? 0
    if (turns > 0) return turns
    const userNodes = (snapshot?.nodes ?? []).filter((node) => node.kind === 'user').length
    return userNodes
  }

  function scrollToSegment(index: number): void {
    if (scrollContainer === null || segmentCount <= 1) {
      scrollContainer?.scrollTo({ top: 0 })
      return
    }
    const max = scrollContainer.scrollHeight - scrollContainer.clientHeight
    const ratio = index / (segmentCount - 1)
    scrollContainer.scrollTop = ratio * max
    updateActiveTick()
  }

  function renderTicks(): void {
    const root = ensureRail()
    if (root === null) return
    if (segmentCount < 1) {
      root.hidden = true
      return
    }
    const existing = root.querySelectorAll(`[data-mg-cr-index]`)
    if (existing.length === segmentCount) {
      root.hidden = false
      updateActiveTick()
      return
    }
    root.replaceChildren()
    for (let i = 0; i < segmentCount; i += 1) {
      const tick = document.createElement('button')
      tick.type = 'button'
      tick.className = c.tick
      tick.dataset.mgCrIndex = String(i)
      tick.setAttribute('aria-label', `跳转到第 ${i + 1} 段对话`)
      tick.title = `第 ${i + 1} 段对话`
      tick.addEventListener('click', () => scrollToSegment(i))
      root.appendChild(tick)
    }
    root.hidden = false
    updateActiveTick()
  }

  function updateActiveTick(): void {
    const root = rail
    if (root === null || root.hidden || segmentCount < 1 || scrollContainer === null) return
    const max = scrollContainer.scrollHeight - scrollContainer.clientHeight
    const ratio = max > 0 ? scrollContainer.scrollTop / max : 0
    const activeIndex = Math.min(segmentCount - 1, Math.max(0, Math.round(ratio * (segmentCount - 1))))
    for (const el of Array.from(root.querySelectorAll<HTMLElement>(`[data-mg-cr-index]`))) {
      const index = Number(el.dataset.mgCrIndex)
      el.classList.toggle(c.tickActive, index === activeIndex)
    }
  }

  // ── Geometry ─────────────────────────────────────────────────────────────
  function syncGeometry(): void {
    const root = ensureRail()
    if (root === null || !alive) return
    slot = findSlot()
    if (slot === null) {
      root.hidden = true
      return
    }
    const rect = slot.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      root.hidden = true
      return
    }
    root.style.left = `${Math.max(0, rect.left + 2)}px`
    root.style.top = `${rect.top + 8}px`
    root.style.height = `${Math.max(0, rect.height - 16)}px`
    scrollContainer = findScrollContainer(slot)
    root.hidden = false
    renderTicks()
  }

  // ── Subscriptions ────────────────────────────────────────────────────────
  function refreshCurrentSession(): void {
    const snapshot = runtime.sessions?.list?.getSnapshot?.()
    const next = snapshot?.current
    if (next === currentSessionId) return
    currentSessionId = next
    unsubCurrentSession()
    unsubCurrentSession = () => {}
    if (currentSessionId === undefined) {
      segmentCount = 0
      renderTicks()
      return
    }
    const session = runtime.sessions?.binding?.(currentSessionId)?.session
    if (session === undefined) return
    unsubCurrentSession = session.subscribe?.(() => {
      const snap = session.getSnapshot?.()
      segmentCount = deriveSegmentCount(snap)
      syncGeometry()
    }) ?? (() => {})
    const snap = session.getSnapshot?.()
    segmentCount = deriveSegmentCount(snap)
    syncGeometry()
  }

  function onScroll(): void {
    updateActiveTick()
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  injectConversationRailStyle()
  ensureRail()
  refreshCurrentSession()
  unsubSessions = runtime.sessions?.list?.subscribe?.(() => refreshCurrentSession()) ?? (() => {})

  // Watch for the conversation slot mounting after SPA boot; once it appears
  // the slot is persistent, so the body watcher can stop.
  const bootObserver = new MutationObserver(() => {
    if (findSlot() !== null) {
      syncGeometry()
      bootObserver.disconnect()
    }
  })
  bootObserver.observe(document.body, { childList: true, subtree: true })

  window.addEventListener('resize', syncGeometry)
  document.addEventListener('scroll', onScroll, true)

  // Re-run geometry after the app has settled; the slot may still be sizing.
  setTimeout(() => { if (alive) syncGeometry() }, 500)

  // ── Disposer ─────────────────────────────────────────────────────────────
  return () => {
    alive = false
    unsubSessions()
    unsubCurrentSession()
    bootObserver.disconnect()
    window.removeEventListener('resize', syncGeometry)
    document.removeEventListener('scroll', onScroll, true)
    rail?.remove()
    rail = null
  }
}
