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
import { RAIL_CSS_CLASSES as c, injectConversationRailStyle } from "./conversation-rail-style.js";
/**
 * Palette refresh hook set by the live rail installer. The settings card and
 * the boot restore call `refreshConversationRailPalette()` after switching
 * skins/backgrounds so the rail re-derives its adaptive colors; a no-op when
 * the rail is not mounted.
 */
let requestPaletteRefresh = null;
/** Ask the mounted conversation rail to re-derive its adaptive palette. */
export function refreshConversationRailPalette() {
    requestPaletteRefresh?.();
}
/**
 * Stable anchor for the conversation column.
 * The official slot wrapper `[data-slot="conversation"]` is rendered with
 * `display: contents` (dsh ui-renderer scoped-slots ANCHOR_STYLE) — it has NO
 * box, `getBoundingClientRect()` returns all-zero geometry, so the rail's
 * zero-size guard would keep it hidden forever (verified 0.1.1 shipped
 * client.js). Use the wrapper's child (`ConversationRoot`), the same pattern
 * backgrounds.ts already relies on. `[data-conversation-scroll]` (0.1.x scroll
 * container) is the fallback when the slot system is absent.
 */
const CONVERSATION_SLOT_SELECTOR = '[data-slot="conversation"] > div, [data-conversation-scroll]';
/** Install the conversation rail; returns the disposer. */
export function installConversationRail(ctx) {
    const runtime = ctx;
    let alive = true;
    // ── State ────────────────────────────────────────────────────────────────
    let currentSessionId;
    let segmentCount = 0;
    let previews = [];
    let tooltip = null;
    let rail = null;
    let scrollContainer = null;
    let slot = null;
    let unsubSessions = () => { };
    let unsubCurrentSession = () => { };
    function parseCssColor(value) {
        const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/.exec(value);
        if (m === null)
            return null;
        const alpha = m[4] === undefined ? 1 : Number(m[4]);
        if (!Number.isFinite(alpha) || alpha <= 0.001)
            return null;
        return { rgb: { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }, alpha };
    }
    function relLum(c) {
        const f = (v) => {
            const x = v / 255;
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    }
    function contrastRatio(a, b) {
        const l1 = relLum(a);
        const l2 = relLum(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }
    function rgbToHsl(c) {
        const r = c.r / 255, g = c.g / 255, b = c.b / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        if (max === min)
            return { h: 0, s: 0, l };
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let h;
        if (max === r)
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g)
            h = ((b - r) / d + 2) / 6;
        else
            h = ((r - g) / d + 4) / 6;
        return { h, s, l };
    }
    function hslToRgb(h, s, l) {
        const hue = (p, q, tIn) => {
            let t = tIn;
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        if (s === 0) {
            const v = Math.round(l * 255);
            return { r: v, g: v, b: v };
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return {
            r: Math.round(hue(p, q, h + 1 / 3) * 255),
            g: Math.round(hue(p, q, h) * 255),
            b: Math.round(hue(p, q, h - 1 / 3) * 255),
        };
    }
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('image load failed'));
            img.src = src;
        });
    }
    /**
     * Effective backdrop color under the rail: the conversation surface
     * (computed style resolves skin tokens and the color-mix translucency)
     * composited over the background-image strip under the rail, replicating
     * the CSS `cover` + center math used by backgrounds.ts (the image itself is
     * pre-tinted by a 25% black gradient layer there).
     */
    async function sampleBackdrop() {
        const root = rail;
        const slotEl = findSlot();
        if (root === null || slotEl === null)
            return null;
        const surface = parseCssColor(getComputedStyle(slotEl).backgroundColor);
        const frame = document.querySelector('#root div[style*="grid-template-columns"]');
        const bgCss = frame === null ? '' : getComputedStyle(frame).backgroundImage;
        const urlMatch = /url\("([^"]+)"\)/.exec(bgCss);
        if (surface === null && urlMatch === null)
            return null;
        if (urlMatch === null)
            return surface === null ? null : surface.rgb;
        try {
            const img = await loadImage(urlMatch[1]);
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const scale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
            const offX = (vw - img.naturalWidth * scale) / 2;
            const rect = root.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const sourceX = Math.min(Math.max((centerX - offX) / scale, 0), Math.max(img.naturalWidth - 1, 1));
            const sourceW = Math.max(24 / scale, 1);
            const canvas = document.createElement('canvas');
            canvas.width = 12;
            canvas.height = 48;
            const ctx2d = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx2d === null)
                return surface === null ? null : surface.rgb;
            ctx2d.drawImage(img, sourceX, 0, sourceW, img.naturalHeight, 0, 0, 12, 48);
            const data = ctx2d.getImageData(0, 0, 12, 48).data;
            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                n += 1;
            }
            const pixel = { r: r / n, g: g / n, b: b / n };
            const tinted = { r: pixel.r * 0.75, g: pixel.g * 0.75, b: pixel.b * 0.75 };
            const alpha = surface?.alpha ?? 1;
            const s = surface?.rgb ?? { r: 255, g: 255, b: 255 };
            const mix = (k, top, under) => k * top + (1 - k) * under;
            return {
                r: Math.round(mix(alpha, s.r, tinted.r)),
                g: Math.round(mix(alpha, s.g, tinted.g)),
                b: Math.round(mix(alpha, s.b, tinted.b)),
            };
        }
        catch {
            return surface === null ? null : surface.rgb;
        }
    }
    /** Derive and apply the adaptive palette onto the rail root element. */
    function applyPalette() {
        const root = rail;
        if (root === null || !alive)
            return;
        void sampleBackdrop().then((effective) => {
            if (!alive || root === null || effective === null)
                return;
            const { h, s } = rgbToHsl(effective);
            const deep = hslToRgb(h, Math.min(1, s * 0.6), 0.16);
            const light = hslToRgb(h, s * 0.3, 0.93);
            const useLight = contrastRatio(effective, light) > contrastRatio(effective, deep);
            const tone = useLight ? light : deep;
            const hover = hslToRgb(h, Math.min(1, s * 0.6 + 0.1), useLight ? 1 : 0.1);
            // Active accent: saturated tone of the same hue; pick whichever lightness
            // candidate contrasts more (mid-gray backdrops can't satisfy both sides).
            const sat = Math.max(0.62, s);
            const activeA = hslToRgb(h, sat, 0.36);
            const activeB = hslToRgb(h, sat, 0.68);
            const active = contrastRatio(effective, activeA) >= contrastRatio(effective, activeB) ? activeA : activeB;
            root.style.setProperty('--mg-rail-tick', `rgb(${tone.r} ${tone.g} ${tone.b})`);
            root.style.setProperty('--mg-rail-tick-hover', `rgb(${hover.r} ${hover.g} ${hover.b})`);
            root.style.setProperty('--mg-rail-tick-active', `rgb(${active.r} ${active.g} ${active.b})`);
            // Rim always uses the OPPOSITE tone so at least one edge contrasts.
            root.style.setProperty('--mg-rail-ring', useLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.35)');
        });
    }
    let paletteTimer = 0;
    function schedulePaletteRefresh(delay = 120) {
        window.clearTimeout(paletteTimer);
        paletteTimer = window.setTimeout(() => {
            if (alive)
                applyPalette();
        }, delay);
    }
    requestPaletteRefresh = schedulePaletteRefresh;
    // ── DOM helpers ──────────────────────────────────────────────────────────
    function findSlot() {
        return document.querySelector(CONVERSATION_SLOT_SELECTOR);
    }
    function findScrollContainer(from) {
        // 0.1.x: the conversation scroll viewport is `data-conversation-scroll`
        // (rendered by dsh-client-ui-conversation); prefer it over the generic walk.
        const explicit = from.querySelector('[data-conversation-scroll]');
        if (explicit !== null)
            return explicit;
        const candidates = [from, ...Array.from(from.querySelectorAll('*'))];
        for (const el of candidates) {
            if (el.scrollHeight > el.clientHeight + 1) {
                const overflowY = getComputedStyle(el).overflowY;
                if (overflowY === 'auto' || overflowY === 'scroll')
                    return el;
            }
        }
        return null;
    }
    function ensureRail() {
        if (rail !== null && rail.isConnected)
            return rail;
        if (!alive)
            return null;
        injectConversationRailStyle();
        rail = document.createElement('div');
        rail.id = 'dsh-hub-conversation-rail';
        rail.className = c.root;
        rail.setAttribute('data-dsh-hub-conversation-rail', '');
        rail.hidden = true;
        document.body.appendChild(rail);
        return rail;
    }
    // ── Rendering ────────────────────────────────────────────────────────────
    // Per-turn opening text (hover preview). Data source uses REAL node kinds —
    // the snapshot has no 'turn'/'text' kinds (and no 'turn-tail' node either:
    // legacy projection drops it). PR #40 scheme: extractNodeText (user/steering/
    // context/assistant/command/compaction) + extractTurnSummaries (aligns each
    // turn with turnTimings time windows [startTime, endTime) and node.turn).
    // Command turns (no user node) fall back to the assistant reply; empty slots
    // keep the tooltip on "第 N 段对话".
    function extractNodeText(node) {
        if (node === undefined)
            return '';
        if (node.kind === 'assistant') {
            return (node.blocks ?? [])
                .filter((b) => b.kind === 'text' && typeof b.text === 'string')
                .map((b) => b.text ?? '')
                .join(' ');
        }
        if (node.kind === 'user' || node.kind === 'steering' || node.kind === 'context') {
            return (node.content ?? [])
                .map((blk) => (typeof blk.text === 'string' ? blk.text : ''))
                .join(' ');
        }
        if (node.kind === 'command') {
            return `/${node.name ?? ''} ${node.args ?? ''}`.trim();
        }
        if (node.kind === 'compaction')
            return node.summary ?? '';
        return '';
    }
    function extractTurnSummaries(snapshot) {
        const count = deriveSegmentCount(snapshot);
        if (count <= 0)
            return [];
        const nodes = snapshot?.nodes ?? [];
        const entries = snapshot?.turnTimings ? Array.from(snapshot.turnTimings.entries()) : [];
        const out = [];
        for (let t = 0; t < count; t += 1) {
            const range = entries[t]?.[1];
            const lo = range?.startTime ?? -Infinity;
            const hi = range?.endTime ?? Infinity;
            let userText = '';
            let fallback = '';
            for (const node of nodes) {
                if (node === undefined)
                    continue;
                if (node.kind === 'assistant') {
                    if (node.turn === t)
                        fallback += extractNodeText(node) + ' ';
                    continue;
                }
                if (node.time === undefined)
                    continue;
                if (node.time >= lo && node.time < hi) {
                    const txt = extractNodeText(node);
                    if (node.kind === 'user' || node.kind === 'steering')
                        userText += txt + ' ';
                    else
                        fallback += txt + ' ';
                }
            }
            // Prefer the user's own message as the preview; fall back to the reply
            // only when this turn had no human message.
            out.push((userText || fallback).trim());
        }
        return out;
    }
    // Hover tooltip (body portal, token colors — no hardcoded hex).
    function ensureTooltip() {
        if (tooltip !== null && tooltip.isConnected)
            return tooltip;
        const tip = document.createElement('div');
        tip.id = 'dsh-hub-conversation-rail-tip';
        tip.style.cssText =
            'position:fixed;z-index:2147483000;display:none;pointer-events:none;max-width:260px;' +
                'padding:6px 10px;border-radius:6px;font-size:12px;line-height:1.5;' +
                'background:var(--dsw-alias-tooltip-bg, #1f1f23);' +
                'color:var(--dsw-alias-label-primary, #e8e8ea);' +
                'border:1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.25));' +
                'box-shadow:var(--dsw-shadow-lv2, 0 4px 12px rgba(0,0,0,.25))';
        document.body.appendChild(tip);
        tooltip = tip;
        return tip;
    }
    function showTooltip(i, anchor) {
        const tip = ensureTooltip();
        if (tip === null)
            return;
        tip.textContent = previews[i] ? `第 ${i + 1} 段 · ${previews[i]}` : `第 ${i + 1} 段对话`;
        const a = anchor.getBoundingClientRect();
        tip.style.display = 'block';
        tip.style.left = `${Math.max(4, a.right + 8)}px`;
        tip.style.top = `${Math.max(4, a.top - 6)}px`;
    }
    function hideTooltip() {
        if (tooltip !== null)
            tooltip.style.display = 'none';
    }
    function deriveSegmentCount(snapshot) {
        const turns = snapshot?.turnTimings?.size ?? 0;
        if (turns > 0)
            return turns;
        const userNodes = (snapshot?.nodes ?? []).filter((node) => node.kind === 'user').length;
        return userNodes;
    }
    function scrollToSegment(index) {
        if (scrollContainer === null || segmentCount <= 1) {
            scrollContainer?.scrollTo({ top: 0 });
            return;
        }
        const max = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const ratio = index / (segmentCount - 1);
        scrollContainer.scrollTop = ratio * max;
        updateActiveTick();
    }
    function renderTicks() {
        const root = ensureRail();
        if (root === null)
            return;
        if (segmentCount < 1) {
            root.hidden = true;
            return;
        }
        const existing = root.querySelectorAll(`[data-mg-cr-index]`);
        if (existing.length === segmentCount) {
            root.hidden = false;
            updateActiveTick();
            return;
        }
        root.replaceChildren();
        for (let i = 0; i < segmentCount; i += 1) {
            const tick = document.createElement('button');
            tick.type = 'button';
            tick.className = c.tick;
            tick.dataset.mgCrIndex = String(i);
            tick.setAttribute('aria-label', `跳转到第 ${i + 1} 段对话`);
            tick.addEventListener('click', () => scrollToSegment(i));
            // Hover preview (PR #35): show the turn's opening text in a body-portal
            // tooltip (native title removed to avoid double popups).
            tick.addEventListener('mouseenter', () => showTooltip(i, tick));
            tick.addEventListener('mouseleave', hideTooltip);
            root.appendChild(tick);
        }
        root.hidden = false;
        updateActiveTick();
    }
    function updateActiveTick() {
        const root = rail;
        if (root === null || root.hidden || segmentCount < 1 || scrollContainer === null)
            return;
        const max = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const ratio = max > 0 ? scrollContainer.scrollTop / max : 0;
        const activeIndex = Math.min(segmentCount - 1, Math.max(0, Math.round(ratio * (segmentCount - 1))));
        for (const el of Array.from(root.querySelectorAll(`[data-mg-cr-index]`))) {
            const index = Number(el.dataset.mgCrIndex);
            el.classList.toggle(c.tickActive, index === activeIndex);
        }
    }
    // ── Geometry ─────────────────────────────────────────────────────────────
    function syncGeometry() {
        const root = ensureRail();
        if (root === null || !alive)
            return;
        slot = findSlot();
        if (slot === null) {
            root.hidden = true;
            return;
        }
        const rect = slot.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            root.hidden = true;
            return;
        }
        root.style.left = `${Math.max(0, rect.left + 2)}px`;
        root.style.top = `${rect.top + 8}px`;
        root.style.height = `${Math.max(0, rect.height - 16)}px`;
        scrollContainer = findScrollContainer(slot);
        root.hidden = false;
        renderTicks();
        // Backdrop geometry changed (resize/boot) — re-derive the adaptive colors.
        schedulePaletteRefresh();
    }
    // ── Subscriptions ────────────────────────────────────────────────────────
    function refreshCurrentSession() {
        const snapshot = runtime.sessions?.list?.getSnapshot?.();
        const next = snapshot?.current;
        if (next === currentSessionId)
            return;
        currentSessionId = next;
        unsubCurrentSession();
        unsubCurrentSession = () => { };
        if (currentSessionId === undefined) {
            segmentCount = 0;
            renderTicks();
            return;
        }
        const session = runtime.sessions?.binding?.(currentSessionId)?.session;
        if (session === undefined)
            return;
        unsubCurrentSession = session.subscribe?.(() => {
            const snap = session.getSnapshot?.();
            segmentCount = deriveSegmentCount(snap);
            previews = extractTurnSummaries(snap);
            syncGeometry();
        }) ?? (() => { });
        const snap = session.getSnapshot?.();
        segmentCount = deriveSegmentCount(snap);
        previews = extractTurnSummaries(snap);
        syncGeometry();
    }
    function onScroll() {
        updateActiveTick();
    }
    // ── Boot ─────────────────────────────────────────────────────────────────
    injectConversationRailStyle();
    ensureRail();
    refreshCurrentSession();
    unsubSessions = runtime.sessions?.list?.subscribe?.(() => refreshCurrentSession()) ?? (() => { });
    // Watch for the conversation slot mounting after SPA boot; once it appears
    // the slot is persistent, so the body watcher can stop.
    const bootObserver = new MutationObserver(() => {
        if (findSlot() !== null) {
            syncGeometry();
            bootObserver.disconnect();
        }
    });
    bootObserver.observe(document.body, { childList: true, subtree: true });
    // Official theme flips (body class / data-ds-dark-theme / inline style)
    // change the surface color under the rail — re-derive the palette.
    const themeObserver = new MutationObserver(() => schedulePaletteRefresh(220));
    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-ds-dark-theme', 'style'],
    });
    window.addEventListener('resize', syncGeometry);
    document.addEventListener('scroll', onScroll, true);
    // Re-run geometry after the app has settled; the slot may still be sizing
    // (and the boot background/skin restore may still be applying).
    setTimeout(() => { if (alive)
        syncGeometry(); }, 500);
    // ── Disposer ─────────────────────────────────────────────────────────────
    return () => {
        alive = false;
        requestPaletteRefresh = null;
        window.clearTimeout(paletteTimer);
        unsubSessions();
        unsubCurrentSession();
        bootObserver.disconnect();
        themeObserver.disconnect();
        window.removeEventListener('resize', syncGeometry);
        document.removeEventListener('scroll', onScroll, true);
        rail?.remove();
        rail = null;
        tooltip?.remove();
        tooltip = null;
    };
}
