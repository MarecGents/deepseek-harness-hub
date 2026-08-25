/**
 * Pipe I/O helper — the single wire-format writer for the host→shell stdout
 * up-link (`DSH_CMD <json>`, parsed by `src-tauri/src/managers/node.rs`
 * `dispatch_dsh_cmd`). Module category: Helper (stateless; stdout write only).
 *
 * Both up-link call sites delegate here so a frame-format / protocol change
 * touches exactly one place:
 *  - `src/controllers/shell-runtime.ts` `sendDshCmd` — the controller-layer
 *    up-link used by tray-pipe (MG_TRAY-originated dispatch events) and
 *    injected by `src/index.ts`.
 *  - `src/managers/tauri-shell.ts` `invoke` — the shell-facade internal
 *    up-link used by the Tauri shell handle (theme / size / icon / sound /
 *    notify / page-event).
 *
 * The two wrappers cannot be merged into one function because of the SPT
 * layering (a manager may not import a controller); sharing this writer keeps
 * the actual DSH_CMD write single-source.
 *
 * @module dsh-hub/helpers/pipe-io
 * @category Helper（无状态工具）
 */
/**
 * Write one DSH_CMD up-link frame to stdout.
 * @param payload - `{ cmd, ...args }` command frame.
 * @returns true when the write succeeded; false on any write error.
 */
export function writeDshCmd(payload) {
    try {
        process.stdout.write(`DSH_CMD ${JSON.stringify(payload)}\n`);
        return true;
    }
    catch (error) {
        console.warn('[dsh-hub] DSH_CMD write failed:', error);
        return false;
    }
}
