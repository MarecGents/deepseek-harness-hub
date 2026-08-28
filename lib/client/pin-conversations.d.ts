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
 *    `displayTitle` text appears inside it. Duplicate titles pick the most
 *    recently updated candidate (2026-08-29: several untitled sessions in one
 *    workspace share the cwd basename; skipping the whole group made the
 *    right-click / ⋯ menus vanish once a session started). Renamed sessions
 *    simply stop matching until the row re-renders with the new title — the
 *    pin itself survives (pins are keyed by session id);
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
 * Full-action context menu: right-clicking any session row (official tree rows
 * and pinned items alike) opens the hub session menu (session-menu.ts), and
 * the official ⋯ row-actions trigger is intercepted so it opens the same
 * menu. The pinned section's inline rename form (editingId state) is entered
 * through the menu's 重命名任务 item; while editing, the debounced sync is
 * paused so typing never flushes the draft, and a failed rename keeps the
 * editor open for retry.
 *
 * @module dsh-hub/client/pin-conversations
 */
/** Pinned-conversations controller; install() returns the disposer. */
export declare function installPinnedConversations(ctx: unknown): () => void;
