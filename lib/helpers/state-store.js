/**
 * dsh home resolution — the single place that maps the environment's
 * `DSH_HOME` (or `~/.dsh`) to an absolute path, shared by every
 * store-backed feature (config / pins / quit marker).
 *
 * Window-geometry persistence moved to the Rust shell (`src-tauri/src/helpers/state.rs`);
 * this module keeps only `dshHome()`.
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
/** Resolve the dsh home directory (shared by every store-backed feature). */
export function dshHome() {
    const env = process.env.DSH_HOME;
    return env && env.trim() !== '' ? env : join(homedir(), '.dsh');
}
