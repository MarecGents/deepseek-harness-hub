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
/** Pinned-conversations controller; install() returns the disposer. */
export declare function installPinnedConversations(ctx: unknown): () => void;
