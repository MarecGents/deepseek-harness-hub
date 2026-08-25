// check-tauri-conf.mjs — M1 字段核对断言（SOP §2.6：10/10 通过）
//
// 职责：断言 tauri.conf.json 关键字段 + 窗口参数（位于 managers/window.rs，
// 2026-08-25 修正：原断言指向 lib.rs 字面量，窗口构建早已迁 window.rs）符合 M1 验收；任一 FAIL exit 1。
// 模块类别：Helper（M1 验收脚本）

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const conf = JSON.parse(readFileSync(join(root, 'src-tauri', 'tauri.conf.json'), 'utf8'))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const libSrc = readFileSync(join(root, 'src-tauri', 'src', 'lib.rs'), 'utf8')
const windowSrc = readFileSync(join(root, 'src-tauri', 'src', 'managers', 'window.rs'), 'utf8')

const checks = [
  ['identifier = com.marecgents.dsh-hub', conf.identifier === 'com.marecgents.dsh-hub'],
  ['productName = DeepSeek Harness Hub', conf.productName === 'DeepSeek Harness Hub'],
  ['tauri.conf.json version == package.json version', conf.version === pkg.version],
  ['package.json version 为事实源（非空）', typeof pkg.version === 'string' && pkg.version.length > 0],
  ['window.rs decorations(false)', windowSrc.includes('.decorations(false)')],
  ['window.rs transparent(false)', windowSrc.includes('.transparent(false)')],
  ['window.rs min_inner_size(MIN_WIDTH=480.0, MIN_HEIGHT=360.0)', /const MIN_WIDTH: f64 = 480\.0;/.test(windowSrc) && /const MIN_HEIGHT: f64 = 360\.0;/.test(windowSrc) && windowSrc.includes('.min_inner_size(MIN_WIDTH, MIN_HEIGHT)')],
  ['externalBin 预留位存在（M4 填入 binaries/node）', Array.isArray(conf.bundle.externalBin)],
  ['webviewInstallMode = embedBootstrapper', conf.bundle.windows?.webviewInstallMode?.type === 'embedBootstrapper'],
  ['frontendDist 指向 dev/index.html', conf.build.frontendDist === '../dev/index.html'],
  ['devUrl 指向 17891 伺服', conf.build.devUrl === 'http://127.0.0.1:17891'],
]

let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failed++
}

console.log(`\n[check-tauri-conf] ${failed === 0 ? '10/10 ALL PASS' : `${failed} FAILED`}`)
process.exit(failed === 0 ? 0 : 1)
