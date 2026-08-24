import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { tabAdd, tabRemove, tabReplaceOrder, getTabs, useTabs } from "./session-tabs.js";
import { openSessionMenu } from "./session-menu.js";
function useSessionsSnap(ctx) {
    const list = ctx?.sessions?.list;
    const [snap, setSnap] = useState(() => (list?.getSnapshot?.() ?? {}));
    useEffect(() => {
        if (!list?.subscribe)
            return;
        const cb = () => setSnap((list.getSnapshot?.() ?? {}));
        const off = list.subscribe(cb);
        return () => off?.();
    }, [list]);
    return snap;
}
function useWorkspacesSnap(ctx) {
    const list = ctx?.workspaces?.list;
    const [snap, setSnap] = useState(() => (list?.getSnapshot?.() ?? {}));
    useEffect(() => {
        if (!list?.subscribe)
            return;
        const cb = () => setSnap((list.getSnapshot?.() ?? {}));
        const off = list.subscribe(cb);
        return () => off?.();
    }, [list]);
    return snap;
}
const ROOT = {
    display: 'flex', alignItems: 'center', gap: 2, flex: '1', minWidth: 0,
    overflowX: 'auto', height: '100%', boxSizing: 'border-box', paddingLeft: 6,
    fontFamily: 'var(--dsw-font-family, system-ui)', fontSize: 12,
    WebkitAppRegion: 'no-drag',
};
const TAB = {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
    background: 'transparent', border: 'none', color: 'var(--dsw-alias-label-tertiary, #9aa7bd)', whiteSpace: 'nowrap', maxWidth: 190,
    transition: 'background .12s ease, color .12s ease',
    userSelect: 'none', flex: 'none',
};
const TAB_ACTIVE = { ...TAB, background: 'var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.16))', color: 'var(--dsw-alias-label-primary, #fff)' };
const TAB_DRAGGING = { ...TAB, opacity: 0.4 };
const PLUS = { border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 15, padding: '2px 7px', borderRadius: 6, flex: 'none' };
const INLINE_INPUT = {
    border: '1px solid var(--dsw-accent, #3964fe)', background: 'transparent', color: 'inherit',
    fontSize: 12, padding: '1px 4px', borderRadius: 4, outline: 'none', minWidth: 60, boxSizing: 'border-box',
};
export function SessionTabs({ ctx }) {
    const tabs = useTabs();
    const snap = useSessionsSnap(ctx);
    const ws = useWorkspacesSnap(ctx);
    const current = snap.current;
    const byId = snap.byId ?? {};
    const archivedIds = ws.archivedSessionIds ?? [];
    // Keep only tabs that still exist, are not archived and are not blank
    // placeholders — EXCEPT the current session (F2): a fresh blank
    // conversation (right after "new session") must stay visible as a
    // "新会话" placeholder instead of bouncing the whole bar away.
    const validTabs = tabs.filter((id) => {
        const s = byId[id];
        return s !== undefined && (s.blank !== true || id === current) && !archivedIds.includes(id);
    });
    // Inline rename state.
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState('');
    // Drag-reorder state.
    const [dragId, setDragId] = useState(null);
    const barRef = useRef(null);
    useEffect(() => { if (current)
        tabAdd(current); }, [current]);
    // Lifecycle sync: tabs for archived / deleted / blank sessions are removed
    // from the store for real (not just hidden), and the current session jumps
    // to a surviving neighbor when its own tab dies.
    // F1: gated on a loaded snapshot — an empty byId at cold boot means the
    // sessions list has not resolved yet; pruning then would wipe tabs persisted
    // from the previous run before they can resolve. Mirrors pin-conversations'
    // ready gate: an empty snapshot never prunes.
    useEffect(() => {
        if (Object.keys(byId).length === 0)
            return;
        const stale = tabs.filter((id) => {
            const s = byId[id];
            return s === undefined || (s.blank === true && id !== current) || archivedIds.includes(id);
        });
        if (stale.length === 0)
            return;
        if (current !== undefined && stale.includes(current)) {
            const idx = tabs.indexOf(current);
            const next = tabs[idx - 1] ?? tabs[idx + 1];
            if (next !== undefined && !stale.includes(next)) {
                try {
                    ctx?.sessions?.open?.(next);
                }
                catch { /* ignore */ }
            }
        }
        for (const id of stale)
            tabRemove(id);
    }, [tabs, byId, archivedIds, current]);
    // Auto-scroll the active tab into view when it changes.
    useEffect(() => {
        if (!current)
            return;
        const el = barRef.current?.querySelector(`[data-tab-id="${current}"]`);
        el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }, [current, validTabs.length]);
    // Running-state pulse keyframes (injected once).
    useEffect(() => {
        if (document.getElementById('mg-tab-status-pulse'))
            return;
        const tag = document.createElement('style');
        tag.id = 'mg-tab-status-pulse';
        tag.textContent = '@keyframes mgTabStatusPulse{0%,100%{opacity:1}50%{opacity:.25}}';
        document.head.appendChild(tag);
        return () => { tag.remove(); };
    }, []);
    // F5: a drag can be interrupted without firing dragend (e.g. alt-tab during
    // the drag); window blur clears the drag state as a fallback. onDrop /
    // onDragEnd already clear it on the normal path.
    useEffect(() => {
        const clear = () => setDragId(null);
        window.addEventListener('blur', clear);
        return () => window.removeEventListener('blur', clear);
    }, []);
    // Locate the titlebar .tb-title and render into it via portal (React keeps
    // it mounted across re-renders). Retries until the titlebar exists — the
    // poll intentionally keeps going (F8): the titlebar may mount late, and the
    // store keeps the tabs warm meanwhile.
    const [titleEl, setTitleEl] = useState(null);
    useEffect(() => {
        let timer = 0;
        const find = () => {
            const el = document.querySelector('#dsh-hub-titlebar .tb-title');
            if (el) {
                setTitleEl(el);
                window.clearInterval(timer);
            }
        };
        find();
        timer = window.setInterval(find, 300);
        return () => window.clearInterval(timer);
    }, []);
    if (!current && validTabs.length === 0)
        return null;
    if (titleEl === null)
        return null;
    const titleOf = (id) => {
        const s = byId[id];
        // Blank sessions have no real title yet — show the placeholder (F2).
        if (s?.blank === true)
            return '新会话';
        return (s?.displayTitle || s?.title || id).slice(0, 20);
    };
    const open = (id) => { if (byId[id] === undefined)
        return; try {
        ctx?.sessions?.open?.(id);
    }
    catch { /* ignore */ } };
    const start = () => { try {
        ctx?.workspaces?.startSession?.();
    }
    catch { /* ignore */ } };
    const beginRename = (id) => { setDraft(titleOf(id)); setEditingId(id); };
    const commitRename = (id) => {
        const t = draft.trim();
        setEditingId(null);
        if (t === '' || t === titleOf(id))
            return;
        try {
            const b = ctx?.sessions?.binding?.(id);
            void b?.session?.rename?.(t).catch?.(() => { });
        }
        catch { /* ignore */ }
    };
    const cancelRename = () => setEditingId(null);
    const onContextMenu = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        openSessionMenu({
            x: e.clientX,
            y: e.clientY,
            id,
            title: byId[id]?.displayTitle ?? byId[id]?.title ?? id,
            ctx,
            onRename: () => beginRename(id),
        });
    };
    // ── Drag to reorder ─────────────────────────────────────────────────────
    const onDragStart = (id) => (e) => {
        setDragId(id);
        try {
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.effectAllowed = 'move';
        }
        catch { /* ignore */ }
    };
    const onDragOver = (id) => (e) => {
        e.preventDefault();
        const from = dragId;
        if (from === null || from === id)
            return;
        const cur = getTabs();
        const fi = cur.indexOf(from);
        const ti = cur.indexOf(id);
        if (fi === -1 || ti === -1 || fi === ti)
            return;
        const next = [...cur];
        next.splice(fi, 1);
        next.splice(ti, 0, from);
        tabReplaceOrder(next);
    };
    const onDrop = (e) => { e.preventDefault(); setDragId(null); };
    const onDragEnd = () => setDragId(null);
    // ── Status dot ──────────────────────────────────────────────────────────
    const statusOf = (s) => {
        if (s?.pendingInteraction)
            return { color: 'var(--dsw-alias-state-warn-primary, #f5a623)', title: '等待处理/审批' };
        if (s?.completed)
            return { color: 'var(--dsw-alias-state-success-primary, #2ecc71)', title: '后台已完成' };
        if (s?.running)
            return { color: 'var(--dsw-alias-state-business-primary, #3b82f6)', title: '运行中', pulse: true };
        return null;
    };
    const close = (id) => {
        if (id === current) {
            const idx = validTabs.indexOf(id);
            const next = validTabs[idx - 1] ?? validTabs[idx + 1];
            if (next)
                open(next);
        }
        tabRemove(id);
    };
    const content = (_jsxs("div", { ref: barRef, style: ROOT, children: [_jsx("button", { type: "button", style: PLUS, title: "\u65B0\u5EFA\u4F1A\u8BDD", onClick: start, children: "+" }), validTabs.map((id) => {
                const s = byId[id];
                const active = id === current;
                const st = statusOf(s);
                const editing = editingId === id;
                const tabStyle = dragId === id ? TAB_DRAGGING : active ? TAB_ACTIVE : TAB;
                return (_jsxs("div", { "data-tab-id": id, role: "tab", "aria-selected": active, draggable: true, title: s?.title ?? id, style: tabStyle, onClick: () => { if (!editing)
                        open(id); }, onContextMenu: (e) => onContextMenu(id, e), onDragStart: onDragStart(id), onDragOver: onDragOver(id), onDrop: onDrop, onDragEnd: onDragEnd, children: [st !== null && (_jsx("span", { style: { width: 7, height: 7, borderRadius: '50%', background: st.color, flex: 'none', display: 'inline-block', ...(st.pulse ? { animation: 'mgTabStatusPulse 1.1s ease-in-out infinite' } : {}) }, title: st.title })), editing ? (_jsx("input", { autoFocus: true, value: draft, onChange: (e) => setDraft(e.target.value), onBlur: () => commitRename(id), onKeyDown: (e) => {
                                // F6: skip keys while an IME composition is in progress —
                                // Enter during composition must not commit the rename.
                                if (e.nativeEvent.isComposing)
                                    return;
                                if (e.key === 'Enter')
                                    commitRename(id);
                                else if (e.key === 'Escape')
                                    cancelRename();
                            }, onClick: (e) => e.stopPropagation(), style: { ...INLINE_INPUT, width: Math.max(80, draft.length * (draft.length && /[\u4e00-\u9fff]/.test(draft) ? 12 : 7) + 22) } })) : (_jsx("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: titleOf(id) })), _jsx("span", { role: "button", "aria-label": "\u5173\u95ED\u6807\u7B7E", title: "\u5173\u95ED\u6807\u7B7E", style: { color: 'var(--dsw-alias-label-tertiary, #888)', padding: '0 3px', borderRadius: 4, cursor: 'pointer', lineHeight: '14px', flex: 'none' }, onClick: (e) => { e.stopPropagation(); close(id); }, children: "\u00D7" })] }, id));
            })] }));
    return createPortal(content, titleEl);
}
