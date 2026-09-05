/**
 * @dsh-external/dsh-model-efforts — host half (minimal mount shell)
 *
 * Module category: Controller (plugin entry)
 * Responsibility: satisfy the dsh bundle loader identity declared by
 * cordis.patch.yml (insert.id == insert.name == package.json name). All
 * feature logic lives in lib/client.js: the reasoning-effort editor writes
 * through the OFFICIAL llm-pi-ai settings namespace from the web side
 * (ctx.settingsScope → remote settings mutate), which is the same channel
 * the official Models settings page uses — schema validation, revision
 * fencing and hot reload are provided by dsh itself. No HTTP routes, no
 * Tauri commands, no ACL (nothing to guard on the host side).
 */
export const name = '@dsh-external/dsh-model-efforts'

/** No host services required — the shell only carries the bundle identity. */
export const inject = []

/** Host-side apply: intentionally empty (v1 scope, see README). */
export function apply(_ctx) {}
