#!/usr/bin/env node
/**
 * build-installer.mjs — dsh-hub 桌面壳一键打包（NSIS 安装器）。
 *
 * 职责（模块类别：Helper — 打包脚本）：
 *   1. 动态检测工具链（Node / npm / cargo / rustup / MSVC vcvars64.bat / GNU gcc），
 *      只报告、不硬编码任何路径（clone 任何人机器都能跑，工具位置因人而异）；
 *   2. 前置检查与构建：node_modules 缺失时自动 npm install（提示可能慢），
 *      然后依次执行 npm run build（host tsc → lib/）与 npm run build:client（client bundle）；
 *   3. 打包：MSVC 模式在 vcvars64.bat 环境内执行 npm run tauri:build（= cargo tauri build，
 *      link.exe + LIB/INCLUDE 必需，踩坑 #49 首选 MSVC）；GNU 模式直接执行；
 *   4. 产物复制：NSIS exe → build/<version>/，SHA256 校验源/目标一致
 *      （不一致先删目标重试一次，仍不一致报错 —— 踩坑 #56 复制静默失败）；
 *   5. 输出总结（产物路径 / 大小 / SHA256 / 下一步真机验证）。
 *
 * 用法：
 *   npm run build:installer              # 完整流程
 *   npm run build:installer -- --dry-run # 只检测工具链并打印计划（不构建、不复制）
 *
 * 依赖：仅 Node 内置模块（child_process / crypto / fs / path / url），不引第三方包。
 * Windows 路径含空格一律用 spawnSync 参数数组（不拼 shell 字符串），
 * 唯一例外：vcvars64.bat 环境加载必须走 cmd /c call。
 */

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync,
} from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// 常量与基础工具
// ---------------------------------------------------------------------------

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const IS_WIN = process.platform === 'win32'
const COMSPEC = process.env.ComSpec || 'cmd.exe'
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-n')

const useColor = !!process.stdout.isTTY && !process.env.NO_COLOR
const C = {
  reset: useColor ? '\x1b[0m' : '',
  bold: useColor ? '\x1b[1m' : '',
  dim: useColor ? '\x1b[2m' : '',
  red: useColor ? '\x1b[31m' : '',
  green: useColor ? '\x1b[32m' : '',
  yellow: useColor ? '\x1b[33m' : '',
  cyan: useColor ? '\x1b[36m' : '',
  magenta: useColor ? '\x1b[35m' : '',
}

const log = {
  ok: (msg) => console.log(`${C.green}[ OK ]${C.reset} ${msg}`),
  warn: (msg) => console.log(`${C.yellow}[WARN]${C.reset} ${msg}`),
  fail: (msg) => console.log(`${C.red}[FAIL]${C.reset} ${msg}`),
  info: (msg) => console.log(`       ${msg}`),
  section: (title) => console.log(`\n${C.bold}==> ${title}${C.reset}`),
}

/** 步骤失败：打印明确错误 + 非 0 退出码（不静默）。 */
function fail(step, msg) {
  log.fail(`${step}：${msg}`)
  console.log(`${C.yellow}提示：可先运行 ${C.cyan}npm run build:installer -- --dry-run${C.reset}${C.yellow} 做工具链检测。${C.reset}`)
  process.exit(1)
}

/** 在项目根执行进程，stdio 默认 inherit（用户看进度）。 */
function run(command, args, opts = {}) {
  return spawnSync(command, args, { cwd: PACKAGE_ROOT, stdio: 'inherit', ...opts })
}

/** npm 命令（Windows 下经 cmd.exe 解析 npm.cmd；参数数组避免拼 shell 字符串）。 */
function npm(args, opts = {}) {
  if (IS_WIN) return run(COMSPEC, ['/d', '/s', '/c', 'npm', ...args], opts)
  return run('npm', args, opts)
}

/** 静默执行并返回 stdout（用于工具检测；失败返回 null）。 */
function capture(command, args, opts = {}) {
  const r = spawnSync(command, args, { encoding: 'utf8', windowsHide: true, ...opts })
  return r.status === 0 ? (r.stdout || '').trim() : null
}

const exe = (name) => (IS_WIN ? `${name}.exe` : name)

/** 在 PATH 上查找可执行文件（where/which 的首行）。 */
function findOnPath(name) {
  const out = capture(IS_WIN ? 'where' : 'which', [name])
  if (!out) return null
  return out.split(/\r?\n/)[0].trim() || null
}

// ---------------------------------------------------------------------------
// 工具链检测（只报告，不硬编码）
// ---------------------------------------------------------------------------

function findCargo() {
  // 1) CARGO_HOME/bin/cargo(.exe)
  if (process.env.CARGO_HOME) {
    const p = join(process.env.CARGO_HOME, 'bin', exe('cargo'))
    if (existsSync(p)) return p
  }
  // 2) rustup which cargo（解析当前工具链的 cargo）
  const rustup = findRustup()
  if (rustup) {
    const p = capture(rustup, ['which', 'cargo'])
    if (p) return p
  }
  // 3) where cargo / which cargo（PATH）
  return findOnPath('cargo')
}

function findRustup() {
  // rustup 本体装在 CARGO_HOME/bin（极少在 RUSTUP_HOME/bin），再退 PATH。
  if (process.env.CARGO_HOME) {
    const p = join(process.env.CARGO_HOME, 'bin', exe('rustup'))
    if (existsSync(p)) return p
  }
  if (process.env.RUSTUP_HOME) {
    const p = join(process.env.RUSTUP_HOME, 'bin', exe('rustup'))
    if (existsSync(p)) return p
  }
  return findOnPath('rustup')
}

function findVswhere() {
  const pf32 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
  const pf = process.env.ProgramFiles || 'C:\\Program Files'
  const candidates = [
    join(pf32, 'Microsoft Visual Studio', 'Installer', 'vswhere.exe'),
    join(pf, 'Microsoft Visual Studio', 'Installer', 'vswhere.exe'),
    'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe',
    'C:\\Program Files\\Microsoft Visual Studio\\Installer\\vswhere.exe',
  ]
  for (const p of [...new Set(candidates)]) {
    if (existsSync(p)) return p
  }
  return null
}

/** 检测 MSVC：vswhere → installationPath → VC\Auxiliary\Build\vcvars64.bat。 */
function detectMsvc() {
  const vswhere = findVswhere()
  if (!vswhere) return { vs: null, vcvars: null, note: '未找到 vswhere.exe（未安装 VS / VS Installer）' }
  const installationPath = capture(vswhere, [
    '-latest', '-products', '*',
    '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64',
    '-property', 'installationPath',
  ])
  if (!installationPath) {
    return { vs: null, vcvars: null, note: 'vswhere 存在，但未发现装有 C++ 工具链（VC.Tools.x86.x64 组件）的 VS 实例' }
  }
  const vs = installationPath.split(/\r?\n/)[0].trim()
  const vcvars = join(vs, 'VC', 'Auxiliary', 'Build', 'vcvars64.bat')
  if (!existsSync(vcvars)) {
    return { vs, vcvars: null, note: `VS 找到（${vs}）但 vcvars64.bat 不存在（C++ 工具链组件缺失？）` }
  }
  return { vs, vcvars }
}

function detectGcc() {
  const out = capture('gcc', ['--version'])
  return out ? out.split(/\r?\n/)[0] : null
}

function detectAll() {
  const cargo = findCargo()
  const rustup = findRustup()
  return {
    nodeVersion: process.versions.node,
    npmVersion: capture(IS_WIN ? COMSPEC : 'npm', IS_WIN ? ['/d', '/s', '/c', 'npm', '-v'] : ['-v']),
    npmPath: findOnPath(IS_WIN ? 'npm.cmd' : 'npm'),
    cargo,
    cargoVersion: cargo ? capture(cargo, ['--version']) : null,
    rustup,
    toolchain: rustup ? capture(rustup, ['show', 'active-toolchain']) : null,
    msvc: detectMsvc(),
    gcc: detectGcc(),
  }
}

// ---------------------------------------------------------------------------
// 检测结果报告（颜色表格）
// ---------------------------------------------------------------------------

function report(d) {
  log.section('工具链检测')
  const statusOf = (ok, kind) => (ok ? 'OK' : kind === 'warn' ? 'WARN' : 'MISS')
  const rows = [
    {
      name: 'Node', status: statusOf(!!d.nodeVersion, 'warn'),
      detail: d.nodeVersion ? `v${d.nodeVersion}` : '未找到（需 ≥ 24）',
      path: process.execPath,
    },
    {
      name: 'npm', status: statusOf(!!d.npmVersion, 'warn'),
      detail: d.npmVersion ? `v${d.npmVersion}` : '未找到',
      path: d.npmPath || '（随 Node 附带）',
    },
    {
      name: 'cargo', status: statusOf(!!d.cargo, 'warn'),
      detail: d.cargoVersion || '未找到',
      path: d.cargo || '—',
    },
    {
      name: 'rustup', status: statusOf(!!d.rustup, 'warn'),
      detail: d.toolchain ? `active: ${d.toolchain}` : '（可选；未找到）',
      path: d.rustup || '—',
    },
    {
      name: 'MSVC', status: statusOf(!!d.msvc.vcvars, 'warn'),
      detail: d.msvc.vcvars ? 'vcvars64.bat 就绪（推荐）' : (d.msvc.vs ? 'VS 找到，vcvars64.bat 缺失' : d.msvc.note),
      path: d.msvc.vcvars || '—',
    },
    {
      name: 'GNU gcc', status: statusOf(!!d.gcc, 'warn'),
      detail: d.gcc ? `${d.gcc}（MSVC 缺失时的备选）` : '未找到（MSVC 缺失时需要）',
      path: d.gcc ? '（PATH 上的 gcc）' : '—',
    },
  ]
  const w = Math.max(...rows.map((r) => r.name.length)) + 2
  console.log(`  ${'组件'.padEnd(w)}${'状态'.padEnd(8)}检测结果`)
  console.log(`  ${'-'.repeat(w + 2 + 8 + 90)}`)
  for (const r of rows) {
    const badge = r.status === 'OK' ? `${C.green}${r.status}${C.reset}`
      : r.status === 'WARN' ? `${C.yellow}${r.status}${C.reset}`
      : `${C.red}${r.status}${C.reset}`
    console.log(`  ${r.name.padEnd(w)}${badge.padEnd(8)}${r.detail}`)
    if (r.path && r.path !== '—') console.log(`  ${''.padEnd(w)}${''.padEnd(8)}${C.dim}${r.path}${C.reset}`)
  }

  const mode = d.msvc.vcvars ? 'MSVC' : (d.gcc ? 'GNU' : null)
  console.log('')
  if (mode === 'MSVC') {
    log.ok(`打包工具链：${C.bold}MSVC${C.reset}（vcvars64.bat 环境内执行 tauri build，WebView2Loader 静态链接，规避踩坑 #49）`)
  } else if (mode === 'GNU') {
    log.warn(`打包工具链：${C.bold}GNU${C.reset}（gcc 备选路径；需 rustup 默认工具链为 x86_64-pc-windows-gnu 且 gcc 在 PATH，src-tauri/.cargo/config.toml 已带 --exclude-all-symbols）`)
    if (d.msvc.vs && !d.msvc.vcvars) {
      log.warn('vswhere 找到 VS 但 vcvars64.bat 不存在 → 回退 GNU；若想用 MSVC 请安装 VS 的 C++ 工具链（VC.Tools.x86.x64 组件）')
    }
  } else {
    console.log(`${C.red}  缺少 C++ 工具链：MSVC（vswhere/VC.Tools.x86.x64）与 GNU（gcc）都未找到。${C.reset}`)
  }

  const tips = []
  if (!d.nodeVersion) tips.push('Node.js ≥ 24：https://nodejs.org（含 npm）')
  if (!d.cargo) tips.push('Rust：https://rustup.rs（默认 stable MSVC；本仓库 src-tauri/rust-toolchain.toml 固定工具链，rustup 自动装 target）')
  if (!d.msvc.vcvars && !d.gcc) {
    tips.push('C++ 工具链（二选一）：① VS Build Tools「使用 C++ 的桌面开发」工作负载（含 VC.Tools.x86.x64 组件，推荐）；② MinGW-w64 gcc 加入 PATH（如 https://winlibs.com）')
  }
  if (tips.length) {
    log.warn('缺失组件安装指引：')
    for (const t of tips) log.info(`- ${t}`)
  }
  return mode
}

// ---------------------------------------------------------------------------
// 产物查找 / 复制 / 校验
// ---------------------------------------------------------------------------

/** 在 src-tauri/target/release/bundle/nsis 下找安装器：精确名 → 同版本 → 最新任意 -setup.exe。 */
function findInstaller(nsisDir, productName, version) {
  if (!existsSync(nsisDir)) return null
  const primary = join(nsisDir, `${productName}_${version}_x64-setup.exe`)
  if (existsSync(primary)) return primary
  const all = readdirSync(nsisDir).filter((f) => f.endsWith('-setup.exe'))
  const pool = all.filter((f) => f.includes(`_${version}_`)).length ? all.filter((f) => f.includes(`_${version}_`)) : all
  if (!pool.length) return null
  pool.sort((a, b) => statSync(join(nsisDir, b)).mtimeMs - statSync(join(nsisDir, a)).mtimeMs)
  return join(nsisDir, pool[0])
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}

/** 复制并校验 SHA256；不一致先删目标重试一次（踩坑 #56），仍失败返回 false。 */
function copyWithSha256(src, dst) {
  const tryCopy = () => {
    try {
      copyFileSync(src, dst)
      return true
    } catch {
      return false
    }
  }
  if (!tryCopy()) {
    log.warn(`首次复制失败（目标可能被占用）→ 删除目标 ${dst} 后重试一次`)
    rmSync(dst, { force: true })
    if (!tryCopy()) return false
  }
  if (sha256(src) === sha256(dst)) return true
  log.warn('SHA256 不一致 → 删除目标后重试一次')
  rmSync(dst, { force: true })
  if (!tryCopy()) return false
  return sha256(src) === sha256(dst)
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

function main() {
  console.log(`${C.bold}${C.cyan}dsh-hub 一键打包（NSIS 安装器）${C.reset}`)
  console.log(`  仓库根: ${PACKAGE_ROOT}`)
  console.log(`  模式:   ${DRY_RUN ? `${C.yellow}--dry-run（仅检测工具链并打印计划）${C.reset}` : `${C.green}完整流程${C.reset}`}`)

  // 0) 工具链检测 + 报告
  const d = detectAll()
  const mode = report(d)

  // 版本一致性：NSIS 产物名与 build/<version>/ 都以 version 命名（package.json 为事实源）。
  const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
  const tauriConf = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'src-tauri', 'tauri.conf.json'), 'utf8'))
  const version = pkg.version
  if (tauriConf.version !== version) {
    fail('版本一致性',
      `package.json version=${version} ≠ src-tauri/tauri.conf.json version=${tauriConf.version}；两者必须一致（产物名与目录均用 version），请先同步`)
  }

  const nodeMajor = Number(process.versions.node.split('.')[0])
  if (nodeMajor < 24) {
    log.warn(`Node 版本 ${process.versions.node} < 24（package.json engines 要求 ≥24）；继续执行可能失败`)
  }

  if (!mode) fail('工具链', 'MSVC 与 GNU 均不可用，无法打包（见上方安装指引）')

  // --dry-run：只报告 + 打印计划
  if (DRY_RUN) {
    log.section('执行计划（--dry-run，未执行任何构建）')
    const hasModules = existsSync(join(PACKAGE_ROOT, 'node_modules'))
    console.log(`  1) 依赖安装    ${hasModules ? 'node_modules 已存在 → 跳过' : '缺失 → 自动 npm install（首次可能较慢；装完重跑 build:client，因 npm install 会清掉 SDK junction，踩坑 #19）'}`)
    console.log('  2) 前置构建    npm run build（host tsc → lib/）→ npm run build:client（client bundle → lib/client.js）')
    if (mode === 'MSVC') {
      console.log(`  3) Tauri 打包   MSVC：cmd /d /s /c call "${d.msvc.vcvars}" >nul 2>&1 && npm run tauri:build`)
    } else {
      console.log('  3) Tauri 打包   GNU：npm run tauri:build（直接执行；rustup 默认工具链须为 gnu + MinGW gcc 在 PATH）')
    }
    console.log(`  4) 产物复制    build/${version}/${tauriConf.productName}_${version}_x64-setup.exe + SHA256 校验（踩坑 #56）`)
    console.log('')
    log.ok('dry-run 完成：工具链就绪，可执行完整打包')
    process.exit(0)
  }

  // 1) 依赖安装（node_modules 缺失才自动装）
  log.section('前置构建')
  if (!existsSync(join(PACKAGE_ROOT, 'node_modules'))) {
    log.warn('node_modules 缺失 → 自动执行 npm install（首次可能较慢；npm install 会清掉 SDK junction，装完会重跑 build:client）')
    const r = npm(['install'])
    if (r.status !== 0) fail('npm install', '安装依赖失败（检查网络 / npm registry 镜像，见踩坑 #22）')
  } else {
    console.log('  node_modules 已存在，跳过 npm install')
  }

  // 2) 前置构建：host tsc + client bundle（都必须成功）
  let r = npm(['run', 'build'])
  if (r.status !== 0) fail('npm run build', 'host 编译（tsc → lib/）失败')
  r = npm(['run', 'build:client'])
  if (r.status !== 0) fail('npm run build:client', 'client bundle 构建失败（确认全局 @deepseek-ai/dsh CLI 已安装：build-client 依赖其 SDK 树做 junction）')

  // 3) Tauri 打包（release + NSIS）
  log.section('Tauri 打包（release + NSIS）')
  if (mode === 'MSVC') {
    console.log(`  模式：MSVC（vcvars64.bat 环境：${d.msvc.vcvars}）`)
    // windowsVerbatimArguments 必需：Node 默认会把参数内层引号转义成 \"，
    // cmd 不认 \" → call vcvars64.bat 静默失败（exit 1）。verbatim 原样传引号。
    r = run(COMSPEC, ['/d', '/s', '/c', `call "${d.msvc.vcvars}" >nul 2>&1 && npm run tauri:build`],
      { windowsVerbatimArguments: true })
  } else {
    console.log('  模式：GNU（直接执行 npm run tauri:build）')
    r = npm(['run', 'tauri:build'])
  }
  if (r.status !== 0) {
    fail('npm run tauri:build', `Tauri 打包失败（exit=${r.status ?? 'null'}${r.signal ? `, signal=${r.signal}` : ''}）；详见上方构建输出`)
  }

  // 4) 产物复制 + SHA256 校验
  log.section('产物复制与校验')
  const nsisDir = join(PACKAGE_ROOT, 'src-tauri', 'target', 'release', 'bundle', 'nsis')
  const installer = findInstaller(nsisDir, tauriConf.productName, version)
  if (!installer) {
    const listing = existsSync(nsisDir) ? readdirSync(nsisDir).join(', ') : '（目录不存在）'
    fail('产物查找', `tauri:build 成功但未在 ${nsisDir} 找到 NSIS 安装器；目录内容：${listing}（打包配置问题，见 BUILD.md §6）`)
  }
  const targetDir = join(PACKAGE_ROOT, 'build', version)
  mkdirSync(targetDir, { recursive: true })
  const targetFile = join(targetDir, basename(installer))
  if (!copyWithSha256(installer, targetFile)) {
    fail('产物复制', `SHA256 校验失败：${installer} → ${targetFile}（目标被占用/杀毒扫描？已删目标重试仍不一致）`)
  }

  // 5) 总结
  log.section('打包完成')
  const mb = (statSync(targetFile).size / 1024 / 1024).toFixed(1)
  console.log(`  产物:  ${C.cyan}${targetFile}${C.reset}`)
  console.log(`  大小:  ${mb} MB`)
  console.log(`  SHA256: ${sha256(targetFile)}`)
  console.log(`  下一步: 在真机安装 ${C.cyan}${basename(targetFile)}${C.reset} 并跑 BUILD.md §5 验证清单`)
  console.log(`         （安装目录布局 _up_/dsh-hub-win；首启"启动中"→ 自动进 dsh UI，不弹浏览器）`)
  process.exit(0)
}

main()
