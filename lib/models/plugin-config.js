/**
 * Plugin config model — the Cordis plugin Config document for dsh-hub.
 *
 * This is the in-memory composition Config (schema defaults / patch layer),
 * distinct from the persisted `ShellConfig` in `src/models/shell-config.ts`.
 * The shell keeps its own document because third-party settings namespaces are
 * not exposed by dsh's RPC allowlist; the client settings card therefore talks
 * to the plugin-owned config API instead.
 *
 * @module dsh-hub/models/plugin-config
 * @category Model（纯类型/常量，无副作用）
 */
export {};
