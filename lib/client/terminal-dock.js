import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * TerminalPage — bottom-docked, tabbed, real interactive shell terminal
 * rendered with xterm.js. Each tab is a live host PTY session streamed over
 * SSE (pty-store.ts); the dock renders only the active tab's xterm instance
 * (lazy mount — switching tabs remounts and replays the store ring buffer).
 *
 * Client plugin module (UI component). Public API:
 *   TerminalPage — the dock; assemble it from index.ts (footer / Ctrl+J /
 *   right-click "在此打开终端" all funnel through pty-store's ptyOpen/createTab,
 *   so the dock itself only needs the panel store).
 *
 * Review fixes vs PR #40: lazy single-tab mounting, measured-cell fit (no
 * addon-fit dependency — probe span + 9x19 px fallback), single-fire resize
 * (onResize reports to the host; fit never POSTs twice), pointer-capture
 * drag (pointerup can no longer be lost), explicit compression target (the
 * composer column), token-sampled xterm theme (canvas-safe hex), official
 * Icon*Outline16 glyphs instead of emoji, idempotent style injection.
 *
 * The Ctrl+J shortcut guard ("do not intercept keys while the xterm textarea
 * is focused") lives in the index.ts assembly, not here.
 */
import { useEffect, useRef, useState } from 'react';
import { IconCloseOutline16, IconDarkOutline16, IconFullscreenOutline16, IconLightOutline16, IconPlusOutline16, IconSettingsOutline16, IconTriangleRightFill14, } from '@deepseek-ai/dsh-client-ui-primitives';
import { Terminal } from '@xterm/xterm';
import { XTERM_CSS } from "./xterm-css.js";
import { setFontSize, toggleTheme, usePrefs } from "./terminal-prefs.js";
import { closeTab, createTab, ptyClosePanel, ptyResizeClient, ptySendRaw, ptySubscribeData, setActiveTab, usePty, } from "./pty-store.js";
// Inject the xterm 6.0.0 stylesheet once per document (idempotent).
if (typeof document !== 'undefined' && document.getElementById('dsh-xterm-style') === null) {
    const style = document.createElement('style');
    style.id = 'dsh-xterm-style';
    style.textContent = XTERM_CSS;
    document.head.appendChild(style);
}
const DOCK_MIN_HEIGHT = 140;
const DOCK_MAX_RATIO = 0.5;
const DOCK = {
    position: 'fixed', left: 'var(--dsh-sidebar-width, 0px)', right: 'var(--mg-sidebar-width, 0px)', bottom: 0, height: 320,
    zIndex: 1000, display: 'flex', flexDirection: 'column',
    background: 'var(--dsw-alias-bg-layer-2, #0b0b0d)', color: 'var(--dsw-alias-label-primary, #e6e6e6)',
    fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: 13, lineHeight: 1.5,
    border: '1px solid var(--dsw-alias-border-l2, #26262a)', borderBottom: 'none', borderRadius: '12px 12px 0 0',
    boxShadow: '0 -10px 40px rgb(0 0 0 / 35%)', boxSizing: 'border-box', overflow: 'hidden',
};
const TABBAR = {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', flexShrink: 0,
    background: 'var(--dsw-alias-bg-layer-1, #151517)', borderBottom: '1px solid var(--dsw-alias-border-l1, #222226)',
};
const TABBASE = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'transparent',
    border: 'none', borderRadius: 7, cursor: 'pointer', color: 'var(--dsw-alias-label-tertiary, #9aa0a6)',
    fontSize: 12, whiteSpace: 'nowrap', transition: 'background .12s ease', maxWidth: 220, minWidth: 0,
};
const TABACTIVE = {
    ...TABBASE, background: 'var(--dsw-alias-bg-layer-3, #1e1e21)', color: 'var(--dsw-alias-label-primary, #fff)',
};
const OUTER = { position: 'relative', flex: 1, minHeight: 0 };
const TABBODY = { position: 'absolute', inset: 0, padding: '8px 6px' };
const BTN = {
    border: '1px solid var(--dsw-alias-border-l2, #333)', background: 'transparent',
    color: 'var(--dsw-alias-label-secondary, #aaa)', borderRadius: 7, padding: '3px 10px',
    cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
};
const STATUS = {
    display: 'flex', alignItems: 'center', gap: 12, padding: '3px 12px', flexShrink: 0,
    background: 'var(--dsw-alias-bg-layer-1, #0d0d10)', borderTop: '1px solid var(--dsw-alias-border-l1, #222226)',
    color: 'var(--dsw-alias-label-tertiary, #8a8a8a)', fontSize: 11, overflow: 'hidden',
    whiteSpace: 'nowrap', textOverflow: 'ellipsis',
};
const SETTINGS = {
    position: 'absolute', right: 8, top: 38, zIndex: 20,
    background: 'var(--dsw-alias-bg-layer-3, #1a1a1e)', border: '1px solid var(--dsw-alias-border-l2, #2c2c31)',
    borderRadius: 10, padding: '10px 12px', boxShadow: '0 8px 24px rgb(0 0 0 / 40%)',
    display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200,
};
/**
 * Convert a computed `rgb(r, g, b)` / `rgba(r, g, b, a)` color to #rrggbb.
 * @returns the hex string, or null when the input is not an rgb()/rgba() color.
 */
function cssColorToHex(cssColor) {
    const m = cssColor.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
    if (m === null)
        return null;
    const to2 = (v) => Math.max(0, Math.min(255, Math.round(Number(v)))).toString(16).padStart(2, '0');
    return '#' + to2(m[1]) + to2(m[2]) + to2(m[3]);
}
/**
 * Resolve a dsw design token to a concrete hex color. The xterm canvas
 * renderer cannot take var()/color-mix, so a hidden probe element resolves
 * the custom property (skins' color-mix included) into a computed color.
 * The literal hex is a fallback for missing tokens / unavailable DOM.
 */
function resolveTokenHex(token, fallback) {
    try {
        const probe = document.createElement('span');
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'position:absolute;visibility:hidden;left:-9999px;top:0;color:' + token + ';';
        document.body.appendChild(probe);
        const computed = getComputedStyle(probe).color;
        probe.remove();
        return cssColorToHex(computed) ?? fallback;
    }
    catch {
        // Probe unavailable (no DOM yet) — keep the literal fallback.
        return fallback;
    }
}
/**
 * Build the xterm theme from dsw tokens (sampled per call so skin/theme
 * switches apply), with the classic terminal palette as hex fallbacks.
 */
function resolveTerminalTheme(dark) {
    if (dark) {
        return {
            background: resolveTokenHex('var(--dsw-alias-bg-layer-2)', '#0b0b0d'),
            foreground: resolveTokenHex('var(--dsw-alias-label-primary)', '#e6e6e6'),
            // No dsw token models the shell caret; keep the classic green/black pair.
            cursor: resolveTokenHex('var(--dsw-alias-state-success-primary)', '#22c55e'),
            cursorAccent: resolveTokenHex('var(--dsw-alias-bg-layer-2)', '#0b0b0d'),
        };
    }
    return {
        background: resolveTokenHex('var(--dsw-alias-bg-layer-2)', '#ffffff'),
        foreground: resolveTokenHex('var(--dsw-alias-label-primary)', '#1f1f1f'),
        cursor: resolveTokenHex('var(--dsw-alias-label-primary)', '#0b0b0d'),
        cursorAccent: resolveTokenHex('var(--dsw-alias-bg-layer-2)', '#ffffff'),
    };
}
/**
 * Measure the real cell size for fit with a probe span using the terminal's
 * font settings (font family / size / line-height).
 */
function measureCell(el, term) {
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = [
        'position:absolute',
        'visibility:hidden',
        'left:-9999px',
        'top:0',
        'white-space:pre',
        'font-family:' + (term.options.fontFamily ?? 'ui-monospace, SFMono-Regular, Consolas, monospace'),
        'font-size:' + (term.options.fontSize ?? 13) + 'px',
        'line-height:' + (term.options.lineHeight ?? 1.2) + 'em',
        'pointer-events:none',
    ].join(';');
    probe.textContent = 'W'.repeat(9);
    el.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    el.removeChild(probe);
    return { cw: rect.width / 9, ch: rect.height };
}
/** One xterm instance bound to a PTY tab (mounted only while active). */
function TabTerminal({ tabId }) {
    const ref = useRef(null);
    const termRef = useRef(null);
    const fitRef = useRef(() => { });
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
            theme: resolveTerminalTheme(prefs.dark),
        });
        termRef.current = term;
        term.open(el);
        // Replays the ring buffer on mount, then streams live chunks.
        const off = ptySubscribeData(tabId, (chunk) => { try {
            term.write(chunk);
        }
        catch { /* terminal disposed */ } });
        // Keystrokes go to the per-tab write queue (batching + serial POSTs).
        const disp = term.onData((data) => { ptySendRaw(tabId, data); });
        // Single source of resize reporting: term.resize() → onResize → host.
        const resizeDisp = term.onResize(({ cols, rows }) => { void ptyResizeClient(tabId, cols, rows); });
        const fit = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w <= 0 || h <= 0)
                return;
            // @xterm/addon-fit is not installed (no network installs allowed), so
            // fit measures the real cell with a probe span; 9x19 px are the classic
            // xterm grid fallbacks when the measurement degenerates (hidden
            // ancestors, exotic fonts).
            const { cw, ch } = measureCell(el, term);
            const cols = Math.max(2, Math.floor(w / (cw > 0 ? cw : 9)));
            const rows = Math.max(1, Math.floor(h / (ch > 0 ? ch : 19)));
            // Single-fire resize: term.resize() triggers onResize, which reports
            // cols/rows to the host — never POST a second manual resize here.
            term.resize(cols, rows);
        };
        fitRef.current = fit;
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        fit();
        return () => {
            ro.disconnect();
            disp.dispose();
            resizeDisp.dispose();
            off();
            term.dispose();
            termRef.current = null;
        };
    }, [tabId]);
    // Apply preference changes (font size / theme) live, then re-fit.
    useEffect(() => {
        const t = termRef.current;
        if (t === null)
            return;
        t.options.fontSize = prefs.fontSize;
        t.options.theme = resolveTerminalTheme(prefs.dark);
        fitRef.current();
    }, [prefs]);
    return _jsx("div", { ref: ref, style: { width: '100%', height: '100%' } });
}
// Dock styles: hover affordance for tab close + the notice fade-in keyframe.
// Injected once (idempotent guard by id), `mg-term-*` prefix per AGENTS.
const TERMINAL_STYLE_TEXT = `
.mg-term-tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  padding: 0 2px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--dsw-alias-label-tertiary, #777);
}
.mg-term-tab-close:hover {
  color: var(--dsw-alias-label-primary, #e6e6e6);
  background: var(--dsw-alias-interactive-bg-hover, rgb(128 128 128 / 16%));
}
@keyframes mg-term-notice-in {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
/** Inject the dock stylesheet once (idempotent; no-op when already present). */
function injectTerminalStyle() {
    if (typeof document === 'undefined')
        return;
    const id = 'dsh-hub-terminal-style';
    if (document.getElementById(id) !== null)
        return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = TERMINAL_STYLE_TEXT;
    document.head.appendChild(style);
}
injectTerminalStyle();
export function TerminalPage() {
    const visible = usePty((s) => s.visible);
    const tabs = usePty((s) => s.tabs);
    const activeId = usePty((s) => s.activeId);
    const notice = usePty((s) => s.notice);
    const active = tabs.find((t) => t.id === activeId);
    const prefs = usePrefs();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [maximized, setMaximized] = useState(false);
    // Default 30% of the viewport, clamped 140px..50%.
    const [height, setHeight] = useState(() => Math.max(DOCK_MIN_HEIGHT, Math.round(window.innerHeight * 0.3)));
    // Pointer-capture drag: the handle keeps receiving pointermove/up even when
    // the cursor leaves it, so a pointerup outside can never leave it stuck.
    const onHandleDown = (e) => {
        e.preventDefault();
        const handle = e.currentTarget;
        handle.setPointerCapture(e.pointerId);
        const move = (ev) => {
            const h = window.innerHeight - ev.clientY;
            setHeight(Math.max(DOCK_MIN_HEIGHT, Math.min(Math.round(window.innerHeight * DOCK_MAX_RATIO), h)));
        };
        const stop = (ev) => {
            if (handle.hasPointerCapture(ev.pointerId))
                handle.releasePointerCapture(ev.pointerId);
            handle.removeEventListener('pointermove', move);
            handle.removeEventListener('pointerup', stop);
            handle.removeEventListener('pointercancel', stop);
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    };
    // Center-column placement + true compression: the dock is pinned to the
    // conversation column's width (from the composer seat), and while open it
    // reserves bottom space in the composer column so the chat compresses
    // instead of being hidden behind the dock.
    const dockRef = useRef(null);
    const compressElRef = useRef(null);
    useEffect(() => {
        const dock = dockRef.current;
        if (dock === null)
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
            // Explicit compression target: the composer column — the first
            // flex-column ancestor of the composer seat. Padding-bottom there lifts
            // the composer and the message list above the dock.
            let target = null;
            if (seat !== null) {
                let el = seat.parentElement;
                while (el !== null && el !== document.body) {
                    const cs = getComputedStyle(el);
                    if (cs.display === 'flex' && cs.flexDirection === 'column' && el.getBoundingClientRect().width > 200) {
                        target = el;
                        break;
                    }
                    el = el.parentElement;
                }
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
    return (_jsxs("div", { ref: dockRef, style: { ...DOCK, height: maximized ? '100vh' : height + 'px', borderRadius: maximized ? 0 : '12px 12px 0 0' }, children: [_jsx("div", { onPointerDown: onHandleDown, title: "\u62D6\u62FD\u8C03\u6574\u9AD8\u5EA6", style: { height: 6, cursor: 'ns-resize', touchAction: 'none', flexShrink: 0, background: 'transparent', position: 'relative', zIndex: 5 } }), _jsxs("div", { style: TABBAR, children: [tabs.map((t) => (_jsxs("button", { type: "button", style: t.id === activeId ? TABACTIVE : TABBASE, onClick: () => setActiveTab(t.id), title: t.cwd, children: [_jsx("span", { style: { display: 'inline-flex', flex: 'none', color: 'var(--dsw-alias-state-success-primary, #22c55e)' }, children: _jsx(IconTriangleRightFill14, { size: 10 }) }), _jsx("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }, children: t.title }), _jsx("span", { className: "mg-term-tab-close", role: "button", "aria-label": "\u5173\u95ED\u7EC8\u7AEF", tabIndex: 0, onClick: (e) => { e.stopPropagation(); void closeTab(t.id); }, onKeyDown: (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        void closeTab(t.id);
                                    }
                                }, children: _jsx(IconCloseOutline16, { size: 12 }) })] }, t.id))), _jsx("button", { type: "button", style: TABBASE, onClick: () => void createTab(), title: "\u65B0\u5EFA\u7EC8\u7AEF", children: _jsx(IconPlusOutline16, { size: 14 }) }), _jsx("button", { type: "button", style: TABBASE, onClick: () => setSettingsOpen(!settingsOpen), title: "\u8BBE\u7F6E", children: _jsx(IconSettingsOutline16, { size: 14 }) }), _jsx("button", { type: "button", style: TABBASE, onClick: () => setMaximized(!maximized), title: maximized ? '还原' : '最大化', children: _jsx(IconFullscreenOutline16, { size: 14 }) }), _jsx("span", { style: { flex: 1 } }), _jsx("button", { type: "button", style: BTN, onClick: () => { ptyClosePanel(); }, children: "\u5173\u95ED" })] }), _jsx("div", { style: OUTER, children: active !== undefined ? (_jsx("div", { style: TABBODY, children: _jsx(TabTerminal, { tabId: active.id }) }, active.id)) : null }), settingsOpen && (_jsxs("div", { style: SETTINGS, children: [_jsx("div", { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary, #bbb)' }, children: "\u7EC8\u7AEF\u8BBE\u7F6E" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #999)' }, children: "\u5B57\u4F53\u5927\u5C0F" }), _jsx("button", { type: "button", style: BTN, onClick: () => setFontSize(prefs.fontSize - 1), children: "\u2212" }), _jsx("span", { style: { fontSize: 12, minWidth: 22, textAlign: 'center' }, children: prefs.fontSize }), _jsx("button", { type: "button", style: BTN, onClick: () => setFontSize(prefs.fontSize + 1), children: "+" })] }), _jsx("button", { type: "button", style: BTN, onClick: toggleTheme, children: _jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: 6 }, children: [prefs.dark ? _jsx(IconLightOutline16, { size: 14 }) : _jsx(IconDarkOutline16, { size: 14 }), prefs.dark ? '浅色主题' : '深色主题'] }) })] })), _jsxs("div", { style: STATUS, children: [_jsx("span", { children: "PowerShell" }), _jsx("span", { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: active?.cwd || '未设置工作目录' }), notice !== null ? (_jsx("span", { role: "status", style: { color: 'var(--dsw-alias-state-error-primary, #dc2626)', animation: 'mg-term-notice-in .18s ease' }, children: notice })) : null, _jsxs("span", { children: [tabs.length, " \u4F1A\u8BDD"] })] })] }));
}
