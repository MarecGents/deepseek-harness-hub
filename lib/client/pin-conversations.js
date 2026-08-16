/**
 * Pinned conversations (置顶会话) — the browser half of the conversation
 * pinning feature, reimplemented on rc.10 (see docs/PR4-置顶会话重构方案).
 *
 * The official session list (ui-workspace's WorkspaceBrowser inside the
 * `sidebar.workspaces` single slot) has no plugin seat for per-session
 * actions, so this module augments the rendered list with **stable anchors
 * only** — no CSS-module hashes:
 *
 *  - anchors: `div[data-slot="sidebar.workspaces"]` (slot renderer seam),
 *    `role="tree"`, `div[role="treeitem"]` (session rows; project rows carry
 *    `aria-expanded`, search-result rows are `<button>` and are excluded);
 *  - row → session mapping is **content-based**: a row is the session whose
 *    `displayTitle` text appears inside it. Duplicate titles → the whole
 *    title group is skipped (never mislabeled). Renamed sessions simply stop
 *    matching until the row re-renders with the new title — the pin itself
 *    survives (pins are keyed by session id);
 *  - the pinned section is injected as a **sibling of `role="tree"`** inside
 *    the slot container (`role="group" aria-label="置顶会话"`), so the tree's
 *    aria structure is untouched; an independent scroll block (40vh);
 *  - persistence: host GET/PUT `/api/dsh-hub/pins` (`pins.json`), with a
 *    localStorage fallback when the API is unreachable.
 *
 * Correctness state machine (report §2.6): write paths are gated on a landed
 * `ready` baseline so an empty mid-boot session list can never wipe pins;
 * boot results merge with the user's in-flight delta (`dirtyDelta`), and
 * pruning only removes pins after two consecutive ready snapshots miss the id
 * (or an explicit unpin).
 *
 * @module dsh-hub/client/pin-conversations
 */
import { PIN_CSS_CLASSES as c, injectPinStyle } from "./pin-conversations-style.js";
/** Route prefix of the host pins API (mirrors services/pins-api.ts). */
const PINS_API = '/api/dsh-hub/pins';
/** localStorage fallback key (used only when the host API is unreachable). */
const LS_KEY = 'dsh-hub:pins';
/** Mirror of the host-side cap (services/pins-api.ts MAX_PINS). */
const MAX_PINS = 200;
/** Stable anchors (framework contracts, not CSS-module hashes). */
const SLOT_SELECTOR = 'div[data-slot="sidebar.workspaces"]';
const TREE_SELECTOR = '[role="tree"]';
/** Session rows only: div rows, excluding project rows (aria-expanded) and
 * search-result rows (`<button role="treeitem">`). */
const SESSION_ROW_SELECTOR = 'div[role="treeitem"]:not([aria-expanded])';
/** 24-viewBox pin glyph (Material push_pin grid), pre-expanded fill path. */
const PIN_PATH = 'M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z';
const PIN_FILLED_SVG = `<svg class="${c.pinSvg}" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${PIN_PATH}"/></svg>`;
const PIN_OUTLINE_SVG = `<svg class="${c.pinSvg}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${PIN_PATH}"/></svg>`;
/** Collapse whitespace + trim — row text and displayTitle must agree. */
function normalizeTitle(value) {
    return value.replace(/\s+/g, ' ').trim();
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
    /** In-flight user delta during boot (boot results merge, never overwrite). */
    const dirtyDelta = { added: new Set(), removed: new Set() };
    /** First phase==='ready' snapshot has landed (write-path gate). */
    let readyBaselineLanded = false;
    /** Consecutive ready snapshots missing each pinned id (prune counter). */
    const missingStreak = new Map();
    let alive = true;
    let inSearch = false;
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
            // API unreachable — caller falls back to localStorage.
            return null;
        }
    }
    /** Serialized PUTs: concurrent fetches can hit different connections and
     * arrive out of order (a slow old PUT would clobber a newer state), so the
     * write path is a promise chain — the last queued state wins. */
    let writeQueue = Promise.resolve();
    function apiPutPins(ids) {
        writeQueue = writeQueue
            .then(async () => {
            await fetch(PINS_API, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ ids }),
            });
        })
            .catch(() => {
            // Best-effort; localStorage keeps the fallback copy.
        });
    }
    /** Parse a stored pins JSON string into ids; null/corrupt → nothing. */
    function parseIds(raw) {
        if (raw === null)
            return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed)
                ? parsed.filter((id) => typeof id === 'string' && id !== '')
                : [];
        }
        catch {
            // Corrupt or unavailable storage — treat as nothing pinned.
            return [];
        }
    }
    function lsRead() {
        try {
            return parseIds(localStorage.getItem(LS_KEY));
        }
        catch {
            // Private mode etc. — persistence is best-effort.
            return [];
        }
    }
    function lsWrite(ids) {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(ids));
        }
        catch {
            // Private mode etc. — persistence is best-effort.
        }
    }
    function setPinned(ids) {
        pinned = ids.slice(0, MAX_PINS);
        pinnedSet.clear();
        for (const id of pinned)
            pinnedSet.add(id);
    }
    function persist(ids) {
        setPinned(ids);
        lsWrite(ids);
        apiPutPins(ids);
    }
    function togglePin(id) {
        if (!alive)
            return;
        const wasPinned = pinnedSet.has(id);
        // Record the delta so a late boot GET cannot undo this interaction.
        if (wasPinned)
            dirtyDelta.removed.add(id);
        else
            dirtyDelta.added.add(id);
        missingStreak.delete(id);
        const next = wasPinned
            ? pinned.filter((value) => value !== id)
            : [...pinned, id].slice(0, MAX_PINS);
        persist(next);
        sync();
    }
    // ── Runtime data ─────────────────────────────────────────────────────────
    function sessionSnapshot() {
        return runtime.sessions?.list?.getSnapshot?.();
    }
    function workspaceSnapshot() {
        return runtime.workspaces?.list?.getSnapshot?.();
    }
    /**
     * Content-based row → id mapping. A row is the session whose displayTitle
     * text appears inside it; duplicate titles make the whole title group
     * ambiguous and are skipped entirely (never mislabeled). Returns the title
     * element as well, so the pin button can be inserted right after it.
     */
    function mapRowByContent(row) {
        const byId = sessionSnapshot()?.byId ?? {};
        // titleText (normalized) → ids whose displayTitle matches it.
        const titleToIds = new Map();
        for (const summary of Object.values(byId)) {
            if (summary?.blank === true)
                continue;
            const title = summary.displayTitle;
            if (title === undefined)
                continue;
            const key = normalizeTitle(title);
            if (key === '')
                continue;
            const list = titleToIds.get(key);
            if (list === undefined)
                titleToIds.set(key, [summary.id ?? '']);
            else
                list.push(summary.id ?? '');
        }
        // Collect every descendant element whose text equals a unique title.
        // Candidates are filtered against false positives: absolutely-positioned
        // text (the official visuallyHidden status label) and small captions
        // (relative-time labels are 12px; the title is 14px) must never count.
        const leafTexts = [];
        const candidates = new Map();
        for (const el of Array.from(row.querySelectorAll('span, div'))) {
            const text = el.childElementCount === 0 ? el.textContent : undefined;
            if (text === undefined || text === '')
                continue;
            const raw = text.trim();
            if (raw !== '')
                leafTexts.push(normalizeTitle(raw));
            const style = getComputedStyle(el);
            if (style.position === 'absolute')
                continue;
            const fontSize = parseFloat(style.fontSize);
            if (Number.isFinite(fontSize) && fontSize < 13)
                continue;
            const key = normalizeTitle(text);
            if (key === '')
                continue;
            const ids = titleToIds.get(key);
            if (ids === undefined || ids.length !== 1)
                continue;
            // First matching element per id wins (title + hoverTitle duplicates
            // collapse to the same candidate; the earlier element is the title).
            if (!candidates.has(ids[0]))
                candidates.set(ids[0], { id: ids[0], el, title: key });
        }
        // Longest-match guard: if any leaf text strictly contains the candidate
        // TITLE, the candidate is a fragment of a longer label — skip it.
        const entries = [...candidates.values()];
        if (entries.length !== 1)
            return undefined; // ambiguous (or unknown) row
        const entry = entries[0];
        if (leafTexts.some((t) => t.length > entry.title.length && t.includes(entry.title)))
            return undefined;
        return entry === undefined ? undefined : { id: entry.id, titleEl: entry.el };
    }
    // ── DOM construction ─────────────────────────────────────────────────────
    /** The slot container, or null. */
    function findSlot() {
        return document.querySelector(SLOT_SELECTOR);
    }
    /** The main session tree inside the slot, or null. */
    function findTree() {
        const slot = findSlot();
        if (slot === null)
            return null;
        return slot.querySelector(TREE_SELECTOR);
    }
    /** True while the visible tree is the search tree. A non-empty search tree
     * has button rows only; an EMPTY search tree has zero rows but an active
     * search input with a query — the wide-mode input is always rendered
     * (opacity-hidden), so visibility must be judged by its value, never by
     * geometry. */
    function detectSearch(tree, slot) {
        const rows = tree.querySelectorAll('[role="treeitem"]');
        if (rows.length > 0)
            return Array.from(rows).every((row) => row.tagName === 'BUTTON');
        const input = slot.querySelector('input');
        return input !== null && input.value.trim() !== '';
    }
    /** Ensure one pin-toggle button on a row (after the matched title element). */
    function ensurePinButton(row, id, titleEl) {
        // Compare via dataset, never interpolate the id into a selector.
        let button = Array.from(row.querySelectorAll('[data-mg-pin]'))
            .find((el) => el.dataset.mgPin === id);
        if (button === undefined) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = c.pinBtn;
            button.dataset.mgPin = id;
            button.draggable = false; // never let the parent row's drag start here
            button.addEventListener('click', (event) => {
                // Never let the row's own click-through open the session.
                event.preventDefault();
                event.stopPropagation();
                togglePin(id);
            });
            row.insertBefore(button, titleEl.nextSibling);
        }
        return button;
    }
    /** Apply the pinned state to one row (button icon, marker, aria). */
    function applyRowState(row, id, titleEl) {
        const isPinned = pinnedSet.has(id);
        row.classList.toggle(c.rowPinned, isPinned);
        row.dataset.mgPinned = isPinned ? 'true' : '';
        const button = ensurePinButton(row, id, titleEl);
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
    /** Remove stale pin buttons whose id no longer matches the row. */
    function pruneStaleButtons(row, id) {
        for (const button of Array.from(row.querySelectorAll('[data-mg-pin]'))) {
            if (button.dataset.mgPin === id)
                continue;
            button.remove();
        }
        if (id === undefined) {
            row.classList.remove(c.rowPinned);
            delete row.dataset.mgPinned;
        }
    }
    /** Rebuild the pinned section as the tree's sibling (outside the scroll
     * container: the tree element IS the scroll container, and its parent —
     * the browser body — is where the section lives, so it stays visible
     * while the list scrolls). */
    function syncPinnedSection(tree) {
        const slot = findSlot();
        const treeParent = tree.parentNode;
        if (slot === null || treeParent === null)
            return;
        const byId = sessionSnapshot()?.byId ?? {};
        const archived = new Set(workspaceSnapshot()?.archivedSessionIds ?? []);
        // Render-time filter only: archived pins stay stored, archived entries are
        // hidden; pins missing from byId (transient gaps) are hidden, not pruned.
        const live = pinned.filter((id) => {
            const summary = byId[id];
            return summary !== undefined && summary.blank !== true && !archived.has(id);
        });
        let section = Array.from(treeParent.children).find((el) => el.classList.contains(c.section));
        if (section === undefined) {
            section = document.createElement('div');
            section.className = c.section;
            section.setAttribute('role', 'group');
            section.setAttribute('aria-label', '置顶会话');
        }
        // Re-parent idempotently: the section must stay a sibling right before
        // the tree inside the tree's own parent (the tree is the scroll
        // container, so the section sits OUTSIDE it and stays visible).
        if (section.parentNode !== treeParent || section.nextSibling !== tree) {
            treeParent.insertBefore(section, tree);
        }
        // Rebuild only when the content actually changed — replaceChildren always
        // mutates, which would keep the MutationObserver forever dirty.
        const sig = `${inSearch ? ':search' : ''}|${live.length === 0 ? ':empty' : ''}|${live.map((id) => byId[id]?.displayTitle ?? id).join('\u0001')}`;
        if (section.dataset.sig === sig) {
            section.hidden = inSearch || live.length === 0;
            return;
        }
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
            const open = document.createElement('button');
            open.type = 'button';
            open.className = c.itemOpen;
            open.addEventListener('click', () => {
                runtime.sessions?.open?.(id);
            });
            const icon = document.createElement('span');
            icon.className = c.itemIcon;
            icon.innerHTML = PIN_FILLED_SVG;
            const itemTitle = document.createElement('span');
            itemTitle.className = c.itemTitle;
            itemTitle.textContent = title;
            itemTitle.title = title;
            open.append(icon, itemTitle);
            const unpin = document.createElement('button');
            unpin.type = 'button';
            unpin.className = c.itemUnpin;
            unpin.dataset.mgPinUnpin = id;
            unpin.setAttribute('aria-label', `取消置顶：${title}`);
            unpin.title = '取消置顶';
            unpin.innerHTML = PIN_FILLED_SVG;
            unpin.addEventListener('click', () => {
                togglePin(id);
                // Move focus so the keyboard user is not stranded on a removed item.
                const next = item.nextElementSibling?.querySelector(`.${c.itemOpen}`)
                    ?? item.previousElementSibling?.querySelector(`.${c.itemOpen}`)
                    ?? tree.querySelector(`.${c.pinBtn}`);
                next?.focus({ preventScroll: true });
            });
            item.append(open, unpin);
            list.appendChild(item);
        }
        section.replaceChildren(header, list);
        section.hidden = inSearch || live.length === 0;
    }
    // ── Sync ────────────────────────────────────────────────────────────────
    /** Full idempotent pass over the current list DOM. */
    function sync() {
        if (!alive)
            return;
        const slot = findSlot();
        const tree = findTree();
        if (slot === null || tree === null)
            return;
        inSearch = detectSearch(tree, slot);
        try {
            syncPinnedSection(tree);
        }
        catch {
            // Section placement must never block row-button injection.
        }
        if (inSearch)
            return; // search rows are buttons; never inject there
        for (const el of Array.from(tree.querySelectorAll(SESSION_ROW_SELECTOR))) {
            const match = mapRowByContent(el);
            if (match !== undefined) {
                pruneStaleButtons(el, match.id);
                applyRowState(el, match.id, match.titleEl);
            }
            else {
                pruneStaleButtons(el, undefined);
            }
        }
    }
    // ── Pruning (write path, gated on a landed ready baseline) ─────────────
    /** Fold one ready snapshot: count consecutive misses, prune confirmed-gone.
     * Empty/blank snapshots never prune — an all-blank mid-boot (or
     * fully-deleted) list must never wipe pins; the baseline lands only on the
     * first NON-empty ready snapshot, so pre-data snapshots can't gate writes. */
    function foldReadySnapshot() {
        const snapshot = sessionSnapshot();
        const byId = snapshot?.byId ?? {};
        const isEmpty = snapshot === undefined
            || Object.values(byId).every((s) => s?.blank === true);
        if (isEmpty)
            return;
        if (!readyBaselineLanded) {
            readyBaselineLanded = true;
            return;
        }
        let changed = false;
        const next = pinned.filter((id) => {
            if (byId[id] !== undefined && byId[id]?.blank !== true) {
                missingStreak.delete(id);
                return true;
            }
            const streak = (missingStreak.get(id) ?? 0) + 1;
            missingStreak.set(id, streak);
            if (streak >= 2) {
                changed = true;
                return false;
            }
            return true;
        });
        if (changed)
            persist(next);
    }
    // ── Observers ───────────────────────────────────────────────────────────
    const slotObserver = new MutationObserver(() => debouncedSync());
    const unsubSessions = runtime.sessions?.list?.subscribe?.(() => {
        const snapshot = sessionSnapshot();
        if (snapshot?.phase !== 'ready')
            return;
        foldReadySnapshot();
        debouncedSync();
    }) ?? (() => { });
    const unsubWorkspaces = runtime.workspaces?.list?.subscribe?.(() => {
        debouncedSync();
    }) ?? (() => { });
    // Multi-tab sync: storage events fire only in OTHER tabs of this origin
    // (never the writer), so adopting the incoming list cannot echo back into
    // a loop. The tab that wins re-pushes the canonical list to the host.
    const onStorage = (event) => {
        if (event.key !== LS_KEY || !alive)
            return;
        const raw = event.newValue;
        if (raw === null)
            return; // key cleared externally — never treat as unpin-all
        const incoming = parseIds(raw);
        if (incoming.length === pinned.length && incoming.every((id, i) => id === pinned[i]))
            return;
        setPinned(incoming);
        sync();
        apiPutPins(incoming);
    };
    window.addEventListener('storage', onStorage);
    // ── Boot ────────────────────────────────────────────────────────────────
    injectPinStyle();
    // Render immediately from local state (render path is NOT phase-gated);
    // then fold in the persisted list without clobbering in-flight deltas.
    setPinned(lsRead());
    sync();
    void apiGetPins().then((ids) => {
        if (!alive || ids === null)
            return;
        const bootPinned = ids;
        const merged = [
            ...bootPinned.filter((id) => !dirtyDelta.removed.has(id)),
            ...Array.from(dirtyDelta.added).filter((id) => !dirtyDelta.removed.has(id)),
            ...pinned.filter((id) => !bootPinned.includes(id) && !dirtyDelta.removed.has(id)),
        ];
        // The delta has been folded in — clear it so later toggles start fresh.
        dirtyDelta.added.clear();
        dirtyDelta.removed.clear();
        // Dedupe + cap, preserving order (boot first, then user additions).
        const seen = new Set();
        const next = [];
        for (const id of merged) {
            if (id === '' || seen.has(id))
                continue;
            seen.add(id);
            next.push(id);
            if (next.length >= MAX_PINS)
                break;
        }
        setPinned(next);
        lsWrite(next);
        apiPutPins(next);
        sync();
    });
    // Register the observer AFTER the initial sync so the first pass is not
    // double-triggered; the slot may not exist yet (SPA boot) — retry via body.
    const installObserver = () => {
        const slot = findSlot();
        if (slot === null)
            return;
        slotObserver.observe(slot, { childList: true, subtree: true });
    };
    installObserver();
    // The slot mounts asynchronously; a body-level childList probe finds it,
    // then the per-slot observer takes over.
    const bootObserver = new MutationObserver(() => {
        if (findSlot() !== null && slotObserver.takeRecords().length === 0) {
            bootObserver.disconnect();
            installObserver();
            sync();
        }
    });
    bootObserver.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
        if (findSlot() === null && alive) {
            // Slot never appeared (different layout); give up quietly.
            bootObserver.disconnect();
        }
    }, 10000);
    // ── Disposer ────────────────────────────────────────────────────────────
    return () => {
        alive = false;
        slotObserver.disconnect();
        bootObserver.disconnect();
        unsubSessions();
        unsubWorkspaces();
        window.removeEventListener('storage', onStorage);
        // Remove every injected node so a re-install (HMR / include.refresh)
        // rebuilds from scratch instead of stacking stale closures.
        for (const el of Array.from(document.querySelectorAll(`[data-mg-pin], [data-mg-pin-item], .${c.section}`))) {
            el.remove();
        }
        for (const el of Array.from(document.querySelectorAll(`[data-mg-pinned]`))) {
            el.classList.remove(c.rowPinned);
            delete el.dataset.mgPinned;
        }
    };
}
