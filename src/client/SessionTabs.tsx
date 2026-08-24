/**
 * SessionTabs — a browser-style tab strip at the top of the app. Each tab is
 * an open session; click to switch, + to start a new session, × to remove.
 * Mounted as a body portal from index.ts.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { tabAdd, tabRemove, useTabs } from './session-tabs.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- body-portal ctx is intentionally loose.
type SessionTabsProps = { ctx: any }

interface SessionsSnap { current?: string; byId?: Record<string, { title?: string; displayTitle?: string }> }

function useSessionsSnap(ctx: any): SessionsSnap {
  const list = ctx?.sessions?.list;
  const [snap, setSnap] = useState<SessionsSnap>(() => (list?.getSnapshot?.() ?? {}) as SessionsSnap);
  useEffect(() => {
    if (!list?.subscribe) return;
    const cb = (): void => setSnap((list.getSnapshot?.() ?? {}) as SessionsSnap);
    const off = list.subscribe(cb);
    return () => off?.();
  }, [list]);
  return snap;
}

const BAR: CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, height: 34, zIndex: 1500,
  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', overflowX: 'auto',
  background: 'var(--dsw-alias-bg-layer-1, #151517)', borderBottom: '1px solid var(--dsw-alias-border-l1, #222226)',
  fontFamily: 'var(--dsw-font-family, system-ui)', fontSize: 12, boxSizing: 'border-box',
}
const TAB: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 7, cursor: 'pointer',
  background: 'transparent', border: 'none', color: 'var(--dsw-alias-label-tertiary, #9aa0a6)', whiteSpace: 'nowrap', maxWidth: 180,
}
const TAB_ACTIVE: CSSProperties = { ...TAB, background: 'var(--dsw-alias-bg-elevated, #1e1e21)', color: 'var(--dsw-alias-label-primary, #fff)' }
const PLUS: CSSProperties = { border: 'none', background: 'transparent', color: '#9aa0a6', cursor: 'pointer', fontSize: 15, padding: '2px 8px', borderRadius: 6 }

export function SessionTabs({ ctx }: SessionTabsProps): ReactNode {
  const tabs = useTabs();
  const snap = useSessionsSnap(ctx);
  const current = snap.current;
  const byId = snap.byId ?? {};

  // Track the current session as a tab (browser-like).
  useEffect(() => { if (current) tabAdd(current) }, [current]);

  if (!current && tabs.length === 0) return null;

  const titleOf = (id: string): string => (byId[id]?.displayTitle || byId[id]?.title || id).slice(0, 24);
  const open = (id: string): void => { try { ctx?.sessions?.open?.(id) } catch { /* ignore */ } };
  const start = (): void => { try { ctx?.workspaces?.startSession?.() } catch { /* ignore */ } };

  return (
    <div style={BAR}>
      <button type="button" style={PLUS} title="新建会话" onClick={start}>+</button>
      {tabs.map((id) => (
        <button key={id} type="button" style={id === current ? TAB_ACTIVE : TAB} onClick={() => open(id)} title={byId[id]?.title ?? id}>
          <span>{titleOf(id)}</span>
          <span style={{ color: '#666', padding: '0 2px', borderRadius: 4 }} onClick={(e) => { e.stopPropagation(); tabRemove(id) }}>×</span>
        </button>
      ))}
    </div>
  );
}