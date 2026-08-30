/**
 * export-skin-colors.mjs — 生成 src-tauri/src/skin-colors.json（启动 Splash 配色表）。
 *
 * 用途：壳在窗口创建前就要上 Splash 配色（Rust 注入 __MG_BOOT_THEME），
 * 此时 client/皮肤模块尚未运行——Rust 需要一份「skin id → 浅/深 {bg,fg}」
 * 的静态表。本脚本用 Node 24 的 type-stripping 直接 import skins.ts 导出。
 *
 * 运行：`node scripts/export-skin-colors.mjs`（皮肤增改后重跑一次）。
 */
import { writeFileSync } from 'node:fs'

const { SKINS } = await import('../src/client/skins.ts')

const out = {}
for (const s of SKINS) {
  if (s.id === 'default') continue // default = 清空皮肤覆盖 → Rust 用内置深/浅回退
  out[s.id] = {
    light: { bg: s.light['bg-base'], fg: s.light['label-primary'] },
    dark: { bg: s.dark['bg-base'], fg: s.dark['label-primary'] },
  }
}

const dest = new URL('../src-tauri/src/skin-colors.json', import.meta.url)
writeFileSync(dest, JSON.stringify(out, null, 1) + '\n')
console.log(`skin-colors.json written: ${Object.keys(out).length} skins`)
