/**
 * SessionTabs — browser-style session tabs rendered INTO the shell titlebar
 * via createPortal (inside #dsh-hub-titlebar .tb-title). Each tab is an open
 * session; click to switch, + to start, x to remove. Portal keeps it mounted
 * across re-renders (manual DOM moving lost it on refresh).
 */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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

const ROOT: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4, flex: '1', minWidth: 0,
  overflowX: 'auto', height: '100%', boxSizing: 'border-box', paddingLeft: 8,
  fontFamily: 'var(--dsw-font-family, system-ui)', fontSize: 12,
  WebkitAppRegion: 'no-drag' as unknown as string,
}
const TAB: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
  background: 'transparent', border: 'none', color: 'var(--dsw-alias-label-tertiary, #9aa7bd)', whiteSpace: 'nowrap', maxWidth: 180,
  transition: 'background .12s ease, color .12s ease',
}
const TAB_ACTIVE: CSSProperties = { ...TAB, background: 'var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.16))', color: 'var(--dsw-alias-label-primary, #fff)' }
const PLUS: CSSProperties = { border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 15, padding: '2px 8px', borderRadius: 6 }

export function SessionTabs({ ctx }: SessionTabsProps): ReactNode {
  const tabs = useTabs();
  const snap = useSessionsSnap(ctx);
  const current = snap.current;
  const byId = snap.byId ?? {};
  const validTabs = tabs.filter((id) => byId[id] !== undefined);

  useEffect(() => { if (current) tabAdd(current) }, [current]);

  // Locate the titlebar .tb-title and render into it via portal (React keeps
  // it mounted across re-renders). Retries until the titlebar exists.
  const [titleEl, setTitleEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let timer = 0;
    const find = (): void => {
      const el = document.querySelector('#dsh-hub-titlebar .tb-title') as HTMLElement | null;
      if (el) { setTitleEl(el); window.clearInterval(timer); }
    };
    find();
    timer = window.setInterval(find, 300);
    return () => window.clearInterval(timer);
  }, []);

  if (!current && validTabs.length === 0) return null;
  if (titleEl === null) return null;

  const titleOf = (id: string): string => (byId[id]?.displayTitle || byId[id]?.title || id).slice(0, 20);
  const open = (id: string): void => { if (byId[id] === undefined) return; try { ctx?.sessions?.open?.(id) } catch { /* ignore */ } };
  const start = (): void => { try { ctx?.workspaces?.startSession?.() } catch { /* ignore */ } };

  const content = (
    <div style={ROOT}>
      <button type="button" style={PLUS} title="新建会话" onClick={start}>+</button>
      {validTabs.map((id) => (
        <button key={id} type="button" style={id === current ? TAB_ACTIVE : TAB} onClick={() => open(id)} title={byId[id]?.title ?? id}>
          <span>{titleOf(id)}</span>
          <span style={{ color: 'var(--dsw-alias-label-tertiary,#777)', padding: '0 2px', borderRadius: 4 }} onClick={(e) => { e.stopPropagation(); tabRemove(id) }}>×</span>
        </button>
      ))}
    </div>
  );

  return createPortal(content, titleEl);
}