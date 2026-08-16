/**
 * Pinned conversations (置顶会话) — the browser half of the conversation
 * pinning feature.
 *
 * The official session list (ui-workspace's WorkspaceBrowser inside the
 * `sidebar.workspaces` single slot) has no plugin seat for per-session
 * actions, so this module augments the rendered list directly:
 *
 *  - a pin toggle button is added to each session row's action area;
 *  - pinned sessions appear in a "置顶" section pinned to the top of the
 *    session tree (an extra first child of the `role="tree"` list — React
 *    tolerates foreign siblings, and a MutationObserver re-creates the
 *    section whenever the list is re-rendered);
 *  - the pinned set persists through the host pins API
 *    (`/api/dsh-hub/pins`, backed by pins.json), falling back to
 *    localStorage when the API is unreachable.
 *
 * Row → session-id mapping is title-based: the DOM rows carry no id, but each
 * row's title text equals the runtime's `displayTitle` (durable title →
 * project basename → session id), which is unique in practice. Rows whose
 * title is absent or ambiguous are silently skipped — the feature degrades
 * per-row instead of ever mislabeling.
 *
 * All writes are idempotent diffs (nothing is rewritten when already
 * present), so the MutationObserver converges after one pass.
 *
 * @module dsh-hub/client/pin-conversations
 */
import { PIN_CSS_CLASSES as c, injectPinStyle } from "./pin-conversations-style.js";
/** Route prefix of the host pins API (mirrors services/pins-api.ts). */
const PINS_API = '/api/dsh-hub/pins';
/** localStorage fallback key (used only when the host API is unreachable). */
const LS_KEY = 'dsh-hub:pins';
/**
 * Official DOM anchors. `data-slot` and `role="tree"` are framework-stable;
 * the `YDXeBa_*` names are ui-workspace CSS-module hashes (stable for the dsh
 * version this desktop app wraps). The structural fallback keeps the feature
 * working if a hash ever changes.
 */
const SLOT_SELECTOR = 'div[data-slot="sidebar.workspaces"]';
const TREE_SELECTOR = '[role="tree"]';
const ROW_PRIMARY = '.YDXeBa_sessionRow';
const TITLE_SELECTOR = '.YDXeBa_title';
const ACTIONS_SELECTOR = '.YDXeBa_rowActions';
const PROJECT_MARKERS = '.YDXeBa_projectText, .YDXeBa_chevron';
/** 14×14 pin glyph (filled variant; the outline variant strokes it). */
const PIN_PATH = 'M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z';
const PIN_FILLED_SVG = `<svg class="${c.pinSvg}" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${PIN_PATH}"/></svg>`;
const PIN_OUTLINE_SVG = `<svg class="${c.pinSvg}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${PIN_PATH}"/></svg>`;
/** Collapse whitespace + trim — the row text and displayTitle must agree. */
function normalizeTitle(value) {
    return value.replace(/\s+/g, ' ').trim();
}
/** Read a session row's displayed title. */
function rowTitle(row) {
    const title = row.querySelector(TITLE_SELECTOR);
    return title === null ? '' : normalizeTitle(title.innerText);
}
/** True when the element is a session row (not a project/workspace row). */
function isSessionRow(el) {
    if (el.matches(ROW_PRIMARY))
        return true;
    return el.matches('[role="treeitem"]')
        && el.querySelector(TITLE_SELECTOR) !== null
        && el.querySelector(PROJECT_MARKERS) === null;
}
/** Debounce helper. */
function debounce(fn, ms) {
    let timer;
    return () => {
        if (timer !== undefined)
            clearTimeout(timer);
        timer = setTimeout(fn, ms);
    };
}
/** Pinned-conversations controller; install() returns the disposer. */
export function installPinnedConversations(ctx) {
    const runtime = ctx;
    // ── State ────────────────────────────────────────────────────────────────
    let pinned = [];
    const pinnedSet = new Set();
    let alive = true;
    const debouncedSync = debounce(() => { if (alive)
        sync(); }, 250);
    // ── Persistence ─────────────────────────────────────────────────────────
    async function apiGetPins() {
        try {
            const res = await fetch(PINS_API);
            const body = (await res.json());
            if (body.ok === true && Array.isArray(body.ids)) {
                return body.ids.filter((id) => typeof id === 'string' && id !== '');
            }
            return null;
        }
        catch {
            return null;
        }
    }
    function apiPutPins(ids) {
        void fetch(PINS_API, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids }),
        }).catch(() => { });
    }
    function lsRead() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw === null)
                return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed)
                ? parsed.filter((id) => typeof id === 'string' && id !== '')
                : [];
        }
        catch {
            return [];
        }
    }
    function lsWrite(ids) {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(ids));
        }
        catch { /* private mode etc. */ }
    }
    function setPinned(ids) {
        pinned = ids;
        pinnedSet.clear();
        for (const id of ids)
            pinnedSet.add(id);
    }
    function persist(ids) {
        setPinned(ids);
        lsWrite(ids);
        apiPutPins(ids);
    }
    function togglePin(id) {
        const next = pinnedSet.has(id)
            ? pinned.filter((value) => value !== id)
            : [...pinned, id];
        persist(next);
        sync();
    }
    // ── Runtime data ─────────────────────────────────────────────────────────
    function sessionSnapshot() {
        return runtime.sessions?.list?.getSnapshot?.();
    }
    /** Map a session row to its session id by displayTitle (unique match only). */
    function mapRowToId(row) {
        const title = rowTitle(row);
        if (title === '')
            return undefined;
        const byId = sessionSnapshot()?.byId ?? {};
        let match;
        for (const summary of Object.values(byId)) {
            const candidate = summary?.displayTitle === undefined ? undefined : normalizeTitle(summary.displayTitle);
            if (candidate !== title)
                continue;
            // Blank sessions ("新会话") never get a pin affordance.
            if (summary?.blank === true)
                return undefined;
            if (match !== undefined)
                return undefined; // ambiguous → skip
            match = summary.id;
        }
        return match;
    }
    // ── DOM construction ─────────────────────────────────────────────────────
    /** The session tree (role="tree") inside the sidebar slot, or null. */
    function findTree() {
        const slot = document.querySelector(SLOT_SELECTOR);
        if (slot === null)
            return null;
        const tree = slot.querySelector(TREE_SELECTOR);
        return tree;
    }
    /** Ensure one pin-toggle button on a row; returns the button. */
    function ensurePinButton(row, id) {
        let button = row.querySelector(`[data-dsh-hub-pin="${id}"]`);
        if (button === null) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = c.pinBtn;
            button.dataset.mgPin = id;
            button.addEventListener('click', (event) => {
                // Never let the row's own click-through open the session.
                event.preventDefault();
                event.stopPropagation();
                togglePin(id);
            });
            const actions = row.querySelector(ACTIONS_SELECTOR);
            (actions ?? row).appendChild(button);
        }
        return button;
    }
    /** Apply the pinned state to one row (button icon, marker, aria). */
    function applyRowState(row, id) {
        const isPinned = pinnedSet.has(id);
        row.classList.toggle(c.rowPinned, isPinned);
        const marker = isPinned ? 'true' : '';
        if (row.dataset.mgPinned !== marker)
            row.dataset.mgPinned = marker;
        const button = ensurePinButton(row, id);
        button.classList.toggle(c.pinBtnOn, isPinned);
        const label = isPinned ? '取消置顶' : '置顶会话';
        if (button.getAttribute('aria-label') !== label)
            button.setAttribute('aria-label', label);
        if (button.title !== label)
            button.title = label;
        const svg = isPinned ? PIN_FILLED_SVG : PIN_OUTLINE_SVG;
        // innerHTML always rewrites the node — guard so a converged pass writes
        // nothing (the MutationObserver must settle, not loop).
        if (button.innerHTML !== svg)
            button.innerHTML = svg;
    }
    /** Remove a stale pin button whose session id no longer matches (title edits). */
    function pruneStaleButtons(row) {
        const id = mapRowToId(row);
        for (const button of Array.from(row.querySelectorAll('[data-dsh-hub-pin]'))) {
            const current = button.dataset.mgPin;
            if (current === undefined || current === id)
                continue;
            button.remove();
        }
        if (id === undefined) {
            // Row is unrecognized (or a blank session): drop any leftover marker.
            row.classList.remove(c.rowPinned);
            delete row.dataset.mgPinned;
        }
    }
    /** Rebuild the pinned section as the tree's first child. */
    function syncPinnedSection(tree) {
        const byId = sessionSnapshot()?.byId ?? {};
        // Keep pins that still name a real, non-blank session.
        const live = pinned.filter((id) => {
            const summary = byId[id];
            return summary !== undefined && summary.blank !== true;
        });
        if (live.length !== pinned.length)
            persist(live);
        let section = Array.from(tree.children).find((el) => el.classList.contains(c.section));
        if (section === undefined) {
            section = document.createElement('div');
            section.className = c.section;
            section.setAttribute('role', 'group');
            section.setAttribute('aria-label', '置顶会话');
            tree.insertBefore(section, tree.firstChild);
        }
        // Rebuild only when the content actually changed — replaceChildren always
        // mutates, which would keep the MutationObserver forever dirty.
        const sig = `${live.length === 0 ? ':empty' : ''}|${live.map((id) => byId[id]?.displayTitle ?? id).join('\u0001')}`;
        if (section.dataset.sig === sig)
            return;
        section.dataset.sig = sig;
        const header = document.createElement('div');
        header.className = c.head;
        const label = document.createElement('span');
        label.className = c.headLabel;
        label.textContent = '置顶';
        const count = document.createElement('span');
        count.className = c.headCount;
        count.textContent = String(live.length);
        header.append(label, count);
        const list = document.createElement('div');
        list.className = c.list;
        for (const id of live) {
            const summary = byId[id];
            const title = summary?.displayTitle !== undefined ? summary.displayTitle : id;
            const item = document.createElement('div');
            item.className = c.item;
            item.dataset.mgPinItem = id;
            item.tabIndex = 0;
            item.setAttribute('role', 'button');
            item.addEventListener('click', (event) => {
                if (event.target.closest(`[data-dsh-hub-pin-unpin]`) !== null) {
                    event.preventDefault();
                    event.stopPropagation();
                    togglePin(id);
                    return;
                }
                runtime.sessions?.open?.(id);
            });
            item.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ')
                    return;
                event.preventDefault();
                runtime.sessions?.open?.(id);
            });
            const icon = document.createElement('span');
            icon.className = c.itemIcon;
            icon.innerHTML = PIN_FILLED_SVG;
            const itemTitle = document.createElement('span');
            itemTitle.className = c.itemTitle;
            itemTitle.textContent = title;
            itemTitle.title = title;
            const unpin = document.createElement('button');
            unpin.type = 'button';
            unpin.className = c.itemUnpin;
            unpin.dataset.mgPinUnpin = id;
            unpin.setAttribute('aria-label', `取消置顶：${title}`);
            unpin.title = '取消置顶';
            unpin.innerHTML = PIN_FILLED_SVG;
            item.append(icon, itemTitle, unpin);
            list.appendChild(item);
        }
        section.replaceChildren(header, list);
        section.hidden = live.length === 0;
    }
    // ── Sync ────────────────────────────────────────────────────────────────
    /** Full idempotent pass over the current list DOM. */
    function sync() {
        if (!alive)
            return;
        const tree = findTree();
        if (tree === null)
            return;
        syncPinnedSection(tree);
        for (const el of Array.from(tree.querySelectorAll(`${ROW_PRIMARY}, [role="treeitem"]`))) {
            if (!isSessionRow(el))
                continue;
            pruneStaleButtons(el);
            const id = mapRowToId(el);
            if (id !== undefined)
                applyRowState(el, id);
        }
    }
    // ── Observers ───────────────────────────────────────────────────────────
    const bodyObserver = new MutationObserver(() => debouncedSync());
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    const unsubSessions = runtime.sessions?.list?.subscribe?.(() => {
        // Prune pins only once a real list has landed (phase 'ready').
        if (sessionSnapshot()?.phase === 'ready')
            debouncedSync();
    }) ?? (() => { });
    // ── Boot ────────────────────────────────────────────────────────────────
    injectPinStyle();
    void apiGetPins().then((ids) => {
        if (!alive)
            return;
        if (ids !== null) {
            setPinned(ids);
        }
        else {
            setPinned(lsRead());
        }
        sync();
    });
    sync();
    // ── Disposer ────────────────────────────────────────────────────────────
    return () => {
        alive = false;
        bodyObserver.disconnect();
        unsubSessions();
        // Leave injected DOM in place (the sidebar unmounts it with the page).
    };
}
