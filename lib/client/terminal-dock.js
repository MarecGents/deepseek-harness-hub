import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TerminalPage — bottom-docked, tabbed, real interactive PowerShell terminal
 * rendered with xterm.js. Each tab is a live node-pty session over SSE.
 */
import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { XTERM_CSS } from "./xterm-css.js";
import { setFontSize, toggleTheme, usePrefs } from "./terminal-prefs.js";
import { closeTab, createTab, ptyClosePanel, ptyResizeClient, ptySendRaw, ptySubscribeData, setActiveTab, usePty, } from "./pty-store.js";
// Inject xterm.css once per document.
if (typeof document !== 'undefined' && document.getElementById('dsh-xterm-style') === null) {
    const style = document.createElement('style');
    style.id = 'dsh-xterm-style';
    style.textContent = XTERM_CSS;
    document.head.appendChild(style);
}
const DOCK = {
    position: 'fixed', left: 'var(--dsh-sidebar-width, 0px)', right: 'var(--mg-sidebar-width, 0px)', bottom: 0, height: 320,
    zIndex: 1000, display: 'flex', flexDirection: 'column',
    background: 'var(--dsw-alias-bg-layer-2, #0b0b0d)', color: 'var(--dsw-alias-label-primary, #e6e6e6)',
    fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 13, lineHeight: 1.5,
    border: '1px solid var(--dsw-alias-border-l2, #26262a)', borderBottom: 'none', borderRadius: '12px 12px 0 0',
    boxShadow: '0 -10px 40px rgb(0 0 0 / 35%)', boxSizing: 'border-box', overflow: 'hidden',
};
const TABBAR = { display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', background: 'var(--dsw-alias-bg-layer-1, #151517)', borderBottom: '1px solid var(--dsw-alias-border-l1, #222226)', flexShrink: 0 };
const TABBASE = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', color: 'var(--dsw-alias-label-tertiary, #9aa0a6)', fontSize: 12, whiteSpace: 'nowrap', transition: 'background .12s ease' };
const TABACTIVE = { ...TABBASE, background: 'var(--dsw-alias-bg-elevated, #1e1e21)', color: 'var(--dsw-alias-label-primary, #fff)' };
const OUTER = { position: 'relative', flex: 1, minHeight: 0 };
const TABBODY = { position: 'absolute', inset: 0, padding: '8px 6px' };
const BTN = { border: '1px solid var(--dsw-alias-border-l2, #333)', background: 'transparent', color: 'var(--dsw-alias-label-secondary, #aaa)', borderRadius: 7, padding: '3px 10px', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' };
const STATUS = { display: 'flex', alignItems: 'center', gap: 12, padding: '3px 12px', flexShrink: 0, background: 'var(--dsw-alias-bg-layer-1, #0d0d10)', borderTop: '1px solid var(--dsw-alias-border-l1, #222226)', color: 'var(--dsw-alias-label-tertiary, #8a8a8a)', fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' };
const DARK = { background: '#0b0b0d', foreground: '#e6e6e6', cursor: '#22c55e', cursorAccent: '#0b0b0d' };
const LIGHT = { background: '#ffffff', foreground: '#1f1f1f', cursor: '#0b0b0d', cursorAccent: '#ffffff' };
const SETTINGS = { position: 'absolute', right: 8, top: 38, zIndex: 20, background: '#1a1a1e', border: '1px solid #2c2c31', borderRadius: 10, padding: '10px 12px', boxShadow: '0 8px 24px rgb(0 0 0 / 40%)', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 };
/** One xterm instance bound to a PTY tab. */
function TabTerminal({ tabId }) {
    const ref = useRef(null);
    const termRef = useRef(null);
    const prefs = usePrefs();
    useEffect(() => {
        const el = ref.current;
        if (el === null)
            return;
        const term = new Terminal({
            convertEol: true,
            fontSize: prefs.fontSize,
            fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
            scrollback: 5000,
            theme: prefs.dark ? DARK : LIGHT,
        });
        termRef.current = term;
        term.open(el);
        const off = ptySubscribeData(tabId, (chunk) => { try {
            term.write(chunk);
        }
        catch { /* disposed */ } });
        const disp = term.onData((data) => { void ptySendRaw(tabId, data); });
        const resizeDisp = term.onResize(({ cols, rows }) => { void ptyResizeClient(tabId, cols, rows); });
        const fit = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w <= 0 || h <= 0)
                return;
            const cols = Math.max(2, Math.floor(w / 9));
            const rows = Math.max(1, Math.floor(h / 19));
            term.resize(cols, rows);
            void ptyResizeClient(tabId, cols, rows);
        };
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        fit();
        return () => { ro.disconnect(); disp.dispose(); resizeDisp.dispose(); off(); term.dispose(); termRef.current = null; };
    }, [tabId]);
    // Apply preference changes (font size / theme) live.
    useEffect(() => {
        const t = termRef.current;
        if (t) {
            t.options.fontSize = prefs.fontSize;
            t.options.theme = prefs.dark ? DARK : LIGHT;
        }
    }, [prefs]);
    return _jsx("div", { ref: ref, style: { width: '100%', height: '100%' } });
}
export function TerminalPage() {
    const visible = usePty((s) => s.visible);
    const tabs = usePty((s) => s.tabs);
    const activeId = usePty((s) => s.activeId);
    const active = tabs.find((t) => t.id === activeId);
    const defaultCwd = active?.cwd || window.__mgGetCurrentWorkspace?.() || '';
    const prefs = usePrefs();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [maximized, setMaximized] = useState(false);
    // ZCode-style resizable panel: default 30%, min 140px, max 50%.
    const [height, setHeight] = useState(() => Math.max(140, Math.round(window.innerHeight * 0.3)));
    const resizeRef = useRef(null);
    const onHandleDown = (e) => {
        e.preventDefault();
        resizeRef.current = e.clientY;
        const move = (ev) => {
            if (resizeRef.current === null)
                return;
            const h = window.innerHeight - ev.clientY;
            const clamped = Math.max(140, Math.min(Math.round(window.innerHeight * 0.5), h));
            setHeight(clamped);
        };
        const up = () => { resizeRef.current = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    };
    // Center-column placement + true compression: the dock is pinned to the
    // conversation column's width (from the composer seat), and when open we
    // reserve bottom space in the conversation column so the chat compresses.
    const dockRef = useRef(null);
    const compressElRef = useRef(null);
    useEffect(() => {
        const dock = dockRef.current;
        if (!dock)
            return;
        const apply = () => {
            const seat = document.querySelector('[data-composer-seat]');
            if (seat !== null) {
                const rect = seat.getBoundingClientRect();
                if (rect.width > 0) {
                    dock.style.left = Math.max(0, rect.left) + 'px';
                    dock.style.right = Math.max(0, window.innerWidth - rect.right) + 'px';
                }
            }
            let el = seat === null ? null : seat.parentElement;
            let target = null;
            while (el) {
                const cs = getComputedStyle(el);
                if (cs.display === 'flex' && cs.flexDirection === 'column' && el.getBoundingClientRect().width > 200) {
                    target = el;
                    break;
                }
                el = el.parentElement;
            }
            if (compressElRef.current !== null && compressElRef.current !== target)
                compressElRef.current.style.paddingBottom = '';
            compressElRef.current = target;
            if (target !== null)
                target.style.paddingBottom = visible ? (height + 6) + 'px' : '';
        };
        apply();
        window.addEventListener('resize', apply);
        return () => {
            window.removeEventListener('resize', apply);
            if (compressElRef.current !== null) {
                compressElRef.current.style.paddingBottom = '';
                compressElRef.current = null;
            }
        };
    }, [visible, height]);
    if (!visible)
        return null;
    return (_jsxs("div", { ref: dockRef, style: { ...DOCK, height: maximized ? '100vh' : height + 'px', borderRadius: maximized ? 0 : '12px 12px 0 0' }, children: [_jsx("div", { onPointerDown: onHandleDown, title: "\u62D6\u62FD\u8C03\u6574\u9AD8\u5EA6", style: { height: 6, cursor: 'ns-resize', flexShrink: 0, background: 'transparent', position: 'relative', zIndex: 5 } }), _jsxs("div", { style: TABBAR, children: [tabs.map((t) => (_jsxs("button", { type: "button", style: t.id === activeId ? TABACTIVE : TABBASE, onClick: () => setActiveTab(t.id), title: t.cwd, children: [_jsx("span", { style: { color: '#22c55e', fontSize: 10 }, children: "\u25B8" }), " ", t.title, _jsx("span", { style: { color: 'var(--dsw-alias-label-tertiary,#777)', marginLeft: 2, padding: '0 2px', borderRadius: 4 }, onClick: (e) => { e.stopPropagation(); void closeTab(t.id); }, children: "\u00D7" })] }, t.id))), _jsx("button", { type: "button", style: TABBASE, onClick: () => void createTab(defaultCwd), title: "\u65B0\u5EFA\u7EC8\u7AEF", children: "+" }), _jsx("button", { type: "button", style: TABBASE, onClick: () => setSettingsOpen(!settingsOpen), title: "\u8BBE\u7F6E", children: "\u2699" }), _jsx("button", { type: "button", style: TABBASE, onClick: () => setMaximized(!maximized), title: maximized ? '还原' : '最大化', children: maximized ? '⤓' : '⤢' }), _jsx("span", { style: { flex: 1 } }), _jsx("button", { type: "button", style: BTN, onClick: () => { ptyClosePanel(); }, children: "\u5173\u95ED" })] }), _jsx("div", { style: OUTER, children: tabs.map((t) => (_jsx("div", { style: { ...TABBODY, display: t.id === activeId ? 'block' : 'none' }, children: _jsx(TabTerminal, { tabId: t.id }) }, t.id))) }), settingsOpen && (_jsxs("div", { style: SETTINGS, children: [_jsx("div", { style: { fontSize: 12, color: '#bbb' }, children: "\u7EC8\u7AEF\u8BBE\u7F6E" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 12, color: '#999' }, children: "\u5B57\u4F53\u5927\u5C0F" }), _jsx("button", { type: "button", style: BTN, onClick: () => setFontSize(prefs.fontSize - 1), children: "\u2212" }), _jsx("span", { style: { fontSize: 12, minWidth: 22, textAlign: 'center' }, children: prefs.fontSize }), _jsx("button", { type: "button", style: BTN, onClick: () => setFontSize(prefs.fontSize + 1), children: "+" })] }), _jsx("button", { type: "button", style: BTN, onClick: toggleTheme, children: prefs.dark ? '☀ 浅色主题' : '🌙 深色主题' })] })), _jsxs("div", { style: STATUS, children: [_jsx("span", { children: "PowerShell" }), _jsx("span", { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: active?.cwd || '未设置工作目录' }), _jsxs("span", { children: [tabs.length, " \u4F1A\u8BDD"] })] })] }));
}
