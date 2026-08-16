/**
 * tsdown config — builds the browser client bundle that dsh's client-modules
 * serves as `/plugins/dsh-hub/client.js`. Mirrors the official
 * `packages/client/tsdown.client.ts` contract: a CJS closure that calls
 * `window.__ModuleLoader__.load({ id, factory })`, with the dsh platform
 * modules kept external (the frozen module table supplies them).
 */
import { defineConfig } from 'tsdown'

/** Plugin id stamped into the __ModuleLoader__.load handoff (== package name). */
const PLUGIN_ID = '@marecgents/dsh-hub'

/** Specifiers the dsh boot module table shares (must stay external). */
const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
]

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
