/**
 * git-hooks.mjs — 本地 git hooks 安装与门禁（2026-09-01 audit P1-16 补齐）。
 *
 * 用法：
 *   node scripts/git-hooks.mjs install     # 安装 pre-commit / pre-push（package.json prepare 自动调用）
 *   node scripts/git-hooks.mjs pre-commit  # hook 主体
 *   node scripts/git-hooks.mjs pre-push    # hook 主体
 *
 * 设计定位：本地「轻量提醒」，完整门禁由 CI（rust.yml + frontend.yml）负责。
 *   pre-commit：改 src/ plugins/ 而未同步提交 lib/ 产物 → 阻止（PUBLISH.md
 *               「lib 必须随提交」硬纪律本地化）；随后快跑 tsc --noEmit。
 *   pre-push  ：仅提示可选的 verify-release，不阻塞。
 *
 * 零依赖：只用 Node 内建模块；hook 本身是 sh 脚本调本项目脚本，
 * Windows Git Bash 与 Linux/macOS 通用。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** 执行 git 命令并返回 stdout 行数组。 */
function gitLines(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

/** 检查：有 src/ 或 plugins/ 变更时 lib/ 是否也包含在本次提交里。 */
function libDriftCheck() {
  const staged = gitLines(['diff', '--cached', '--name-only'])
  const srcChanged = staged.some((f) => f.startsWith('src/') || f.startsWith('plugins/') || f === 'tsconfig.json' || f === 'tsdown.config.ts')
  if (!srcChanged) return true
  const libChanged = staged.some((f) => f.startsWith('lib/'))
  if (libChanged) return true
  console.error(
    '\n[git-hooks] ✗ src/ 或 plugins/ 有改动，但 lib/ 产物未随提交（PUBLISH.md「lib 必须随提交」）。\n' +
      '            请先运行：npm run build && npm run build:client\n' +
      '            然后将 lib/ 一起提交（verify-release P3 会同样拦截）。\n'
  )
  return false
}

/** 快跑 tsc --noEmit（node_modules 存在时；不存在跳过）。 */
function tscCheck() {
  if (!existsSync(join(ROOT, 'node_modules', '.bin'))) return true
  try {
    // Windows 的 .bin/tsc 是 .cmd —— execFileSync 执行 cmd 必须 shell:true，
    // 否则在 Git Bash 的 sh hook 里 ENOENT（2026-09-01 提交时实测）。
    execFileSync(
      join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc'),
      ['--noEmit'],
      { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
    )
    return true
  } catch {
    console.error('\n[git-hooks] ✗ tsc --noEmit 失败 — 修好类型错误再提交。\n')
    return false
  }
}

const HOOKS = {
  'pre-commit': `#!/bin/sh
# Managed by scripts/git-hooks.mjs (auto-installed via package.json prepare).
node "$(git rev-parse --show-toplevel)/scripts/git-hooks.mjs" pre-commit || exit 1
`,
  'pre-push': `#!/bin/sh
# Managed by scripts/git-hooks.mjs (auto-installed via package.json prepare).
node "$(git rev-parse --show-toplevel)/scripts/git-hooks.mjs" pre-push || exit 1
`,
}

function install() {
  const hooksDir = join(ROOT, '.git', 'hooks')
  for (const [name, body] of Object.entries(HOOKS)) {
    const p = join(hooksDir, name)
    try {
      writeFileSync(p, body, { mode: 0o755 })
      console.log(`[git-hooks] installed ${name} → ${p}`)
    } catch (e) {
      console.warn(`[git-hooks] install ${name} failed: ${e.message}`)
    }
  }
}

const cmd = process.argv[2] ?? 'install'
if (cmd === 'install') {
  install()
} else if (cmd === 'pre-commit') {
  let ok = libDriftCheck()
  if (ok) ok = tscCheck()
  process.exit(ok ? 0 : 1)
} else if (cmd === 'pre-push') {
  console.log('[git-hooks] 提示：push 前建议本地跑一次 node scripts/verify-release.mjs（完整门禁由 CI 负责）。')
  process.exit(0)
} else {
  console.error(`unknown command: ${cmd}`)
  process.exit(2)
}
