import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SessionTabs — a browser-style tab strip spanning the CENTER conversation
 * column (so it never covers the left DSH icon or the right sidebar). Each
 * tab is an open session; click to switch, + to start, × to remove.
 */
import { useEffect, useRef, useState } from 'react';
import { tabAdd, tabRemove, useTabs } from "./session-tabs.js";
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
const BAR = {
    // 钉在壳自绘标题栏（42px）之下，避免被 z-index 99999 的 #dsh-hub-titlebar 盖住。
    position: 'fixed', top: 42, height: 36, zIndex: 1500,
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', overflowX: 'auto',
    background: 'var(--dsw-alias-bg-layer-1, #1a1a1e)', borderBottom: '1px solid var(--dsw-alias-border-l1, #2a2a30)',
    boxShadow: '0 1px 0 rgb(0 0 0 / 20%)',
    fontFamily: 'var(--dsw-font-family, system-ui)', fontSize: 12, boxSizing: 'border-box',
};
const LABEL = { color: 'var(--dsw-alias-label-tertiary, #8a8a8a)', fontSize: 11, marginRight: 2, whiteSpace: 'nowrap', userSelect: 'none' };
const TAB = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7, cursor: 'pointer',
    background: 'transparent', border: 'none', color: 'var(--dsw-alias-label-tertiary, #9aa0a6)', whiteSpace: 'nowrap', maxWidth: 200,
    transition: 'background .12s ease, color .12s ease',
};
const TAB_ACTIVE = { ...TAB, background: 'var(--dsw-alias-bg-elevated, #26262b)', color: 'var(--dsw-alias-label-primary, #fff)', boxShadow: 'inset 0 -2px 0 var(--dsw-accent, #3964fe)' };
const PLUS = { border: 'none', background: 'transparent', color: '#9aa0a6', cursor: 'pointer', fontSize: 16, padding: '2px 8px', borderRadius: 6 };
export function SessionTabs({ ctx }) {
    const tabs = useTabs();
    const snap = useSessionsSnap(ctx);
    const current = snap.current;
    const byId = snap.byId ?? {};
    const barRef = useRef(null);
    // Only tabs for sessions that actually exist (prune stale ids).
    const validTabs = tabs.filter((id) => byId[id] !== undefined);
    // Track the current session as a tab (browser-like).
    useEffect(() => { if (current)
        tabAdd(current); }, [current]);
    // 让位给固定标签条：可见时给会话列顶部让出 36px（body 标记 + 布局样式），
    // 避免盖住会话标题头/消息区；标签条隐藏时移除。
    const visible = !!(current || validTabs.length > 0);
    useEffect(() => {
        const body = document.body;
        if (visible)
            body.setAttribute('data-dsh-hub-session-tabs', 'on');
        else
            body.removeAttribute('data-dsh-hub-session-tabs');
        return () => body.removeAttribute('data-dsh-hub-session-tabs');
    }, [visible]);
    useEffect(() => {
        const st = document.getElementById('dsh-hub-session-tabs-layout');
        if (!st) {
            const tag = document.createElement('style');
            tag.id = 'dsh-hub-session-tabs-layout';
            tag.textContent =
                'body[data-dsh-hub-session-tabs] [data-slot="conversation"] > div{padding-top:36px!important;}';
            document.head.appendChild(tag);
            return () => { tag.remove(); };
        }
        return undefined;
    }, []);
    // Pin the strip to the CENTER conversation column: left = the left sidebar
    // (frame's first child), right = the marec right sidebar. Avoids the DSH icon.
    useEffect(() => {
        const bar = barRef.current;
        if (!bar)
            return;
        const apply = () => {
            const frame = document.querySelector('[data-sidebar-collapsed]');
            const sidebar = frame?.firstElementChild;
            const left = sidebar ? sidebar.getBoundingClientRect().width : 280;
            const rightEl = document.getElementById('dsh-hub-right-sidebar-root');
            const right = rightEl ? rightEl.getBoundingClientRect().width : 360;
            bar.style.left = Math.max(0, left) + 'px';
            bar.style.right = Math.max(0, right) + 'px';
        };
        apply();
        window.addEventListener('resize', apply);
        return () => window.removeEventListener('resize', apply);
    }, []);
    if (!current && validTabs.length === 0)
        return null;
    const titleOf = (id) => (byId[id]?.displayTitle || byId[id]?.title || id).slice(0, 24);
    const open = (id) => { if (byId[id] === undefined)
        return; try {
        ctx?.sessions?.open?.(id);
    }
    catch { /* ignore */ } };
    const start = () => { try {
        ctx?.workspaces?.startSession?.();
    }
    catch { /* ignore */ } };
    // Closing the active tab switches to a neighbour (browser/Cherry-like); closing
    // a background tab just drops it.
    const close = (id) => {
        if (id === current) {
            const idx = validTabs.indexOf(id);
            const next = validTabs[idx - 1] ?? validTabs[idx + 1];
            if (next)
                open(next);
        }
        tabRemove(id);
    };
    return (_jsxs("div", { ref: barRef, style: BAR, children: [_jsx("span", { style: LABEL, children: "\u4F1A\u8BDD" }), _jsx("button", { type: "button", style: PLUS, title: "\u65B0\u5EFA\u4F1A\u8BDD", onClick: start, children: "+" }), validTabs.map((id) => (_jsxs("button", { type: "button", style: id === current ? TAB_ACTIVE : TAB, onClick: () => open(id), title: byId[id]?.title ?? id, children: [_jsx("span", { children: titleOf(id) }), _jsx("span", { role: "button", "aria-label": "\u5173\u95ED\u6807\u7B7E", title: "\u5173\u95ED\u6807\u7B7E", style: { color: '#888', padding: '0 3px', borderRadius: 4, cursor: 'pointer', lineHeight: '14px' }, onClick: (e) => { e.stopPropagation(); close(id); }, children: "\u00D7" })] }, id)))] }));
}
