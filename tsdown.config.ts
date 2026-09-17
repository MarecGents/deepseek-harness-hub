/**
 * tsdown config — builds the browser client bundle that dsh's client-modules
 * serves as `/plugins/dsh-hub/client.js`. Mirrors the official
 * `packages/client/tsdown.client.ts` contract: a CJS closure that calls
 * `window.__ModuleLoader__.load({ id, factory })`, with the dsh platform
 * modules kept external (the frozen module table supplies them).
 */
import { defineConfig } from 'tsdown'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** Plugin id stamped into the __ModuleLoader__.load handoff (== package name). */
const PLUGIN_ID = '@marecgents/dsh-hub'

/**
 * Specifiers the dsh boot module table shares (must stay external).
 *
 * Read from a committed snapshot rather than the locally installed dsh: the
 * table differs between dsh releases, so probing the machine would make `lib/`
 * differ between machines carrying different dsh versions — exactly the drift
 * verify-release P3 rejects. The snapshot is refreshed deliberately:
 *   node scripts/dsh-platform-modules.mjs --write-snapshot
 * and reconciled against the installed dsh by verify-platform-modules.mjs.
 */
const PLATFORM_MODULES: string[] = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('./scripts/dsh-platform-modules.json', import.meta.url)),
    'utf8'
  )
).modules

/** A specifier the frozen module table answers. */
function isPlatformModule(id: string): boolean {
  return PLATFORM_MODULES.includes(id)
}

export default defineConfig({
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  sourcemap: true,
  dts: false,
  clean: false,
  deps: {
    neverBundle: (id) => isPlatformModule(id),
    alwaysBundle: (id) => !isPlatformModule(id),
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
