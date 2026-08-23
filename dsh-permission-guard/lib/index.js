/**
 * @dsh-external/dsh-permission-guard — 逐命令 allowlist + 四级能力拦截
 *
 * 对标 Zcode 的 reasonix.toml [permissions].allow + AGENTS.md 四级能力边界：
 *   auto         可自动执行（放行）
 *   give-command 只给命令不代跑（拒绝执行，提示用户手动跑）
 *   confirm      先讲清等确认（拒绝执行，提示需确认）
 *   never        红线，绝不（拒绝执行，硬禁止）
 *
 * 机制：注册一个全局 tools.guard()，在每次工具执行前检查「能力键」并匹配白名单。
 * 能力键：bash=<command> / pwsh=<command> / <toolname>（非 shell 工具按工具名）。
 * 配置：~/.dsh/permission-guard.json（默认自动创建），支持 * 通配。
 * 零外部运行时依赖（只 node 内建模块）。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export const name = '@dsh-external/dsh-permission-guard'
export const inject = ['tools', 'systemPrompt']

const CONFIG_NAME = 'permission-guard.json'
const DEFAULT_CONFIG = {
  defaultTier: 'auto',
  tiers: {
    auto: [
      'bash=ls*', 'bash=cat*', 'bash=echo*', 'bash=pwd*', 'bash=cd*',
      'bash=find*', 'bash=grep*', 'bash=sed -n*', 'bash=node --check*',
      'read', 'glob', 'grep', 'memory_read', 'permission_status'
    ],
    'give-command': [
      'bash=rm*', 'bash=reg*', 'bash=shutdown*', 'bash=format*',
      'bash=del /f*', 'bash=rd /s*', 'bash=taskkill*'
    ],
    confirm: [
      'bash=git push*', 'bash=git reset*', 'bash=curl*', 'bash=wget*',
      'bash=chmod*', 'bash=chown*', 'bash=scp*', 'bash=rsync*'
    ],
    never: [
      'bash=format c:*', 'bash=del /f /s /q c:*', 'bash=rd /s /q c:*'
    ]
  }
}

// ── 本地 defineTool（零依赖）───────────────────────
function toJsonSchema(spec) {
  const properties = {}; const required = []
  for (const [k, v] of Object.entries(spec || {})) {
    const p = { type: v.type || 'string' }
    if (v.description) p.description = v.description
    properties[k] = p
    if (v.required) required.push(k)
  }
  const schema = { type: 'object', properties }
  if (required.length) schema.required = required
  return schema
}
function defineTool(options) {
  const tool = { name: options.name, description: options.description, parameters: toJsonSchema(options.parameters), output: options.output, execute: options.execute }
  if (options.presentCall) tool.presentCall = options.presentCall
  return tool
}

// ── 配置读写 ────────────────────────────────────────
function configPath() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, CONFIG_NAME)
}
function loadConfig() {
  const p = configPath()
  try {
    if (!existsSync(p)) {
      mkdirSync(join(p, '..'), { recursive: true })
      writeFileSync(p, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf8')
    }
    const raw = JSON.parse(readFileSync(p, 'utf8'))
    return { ...DEFAULT_CONFIG, ...raw, tiers: { ...DEFAULT_CONFIG.tiers, ...(raw.tiers || {}) } }
  } catch {
    return DEFAULT_CONFIG
  }
}

// ── 通配匹配（* 匹配任意序列）───────────────────────
function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^\${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp('^' + escaped + '$')
}
function matchAny(key, patterns) {
  for (const p of patterns || []) {
    try { if (wildcardToRegExp(p).test(key)) return true } catch {}
  }
  return false
}

// ── 能力键 ──────────────────────────────────────────
function capabilityKey(exec) {
  const name = exec?.name
  const args = exec?.arguments || {}
  if (name === 'bash' || name === 'pwsh') {
    const cmd = String(args.command || args.script || '')
    return name + '=' + cmd.trim()
  }
  return String(name || '')
}

// ── 决策 ────────────────────────────────────────────
function decide(config, key) {
  const tiers = config.tiers || {}
  for (const tier of ['never', 'confirm', 'give-command', 'auto']) {
    if (matchAny(key, tiers[tier])) return tier
  }
  return config.defaultTier || 'confirm'
}
function denialFor(tier, key) {
  switch (tier) {
    case 'auto': return undefined
    case 'give-command': return '权限拦截（give-command 层）：此操作需你手动执行，我不代跑 → ' + key
    case 'confirm': return '权限拦截（confirm 层）：此操作需先确认 → ' + key
    case 'never': return '权限拦截（never 层）：此操作被禁止 → ' + key
    default: return '权限拦截（' + tier + ' 层）：' + key
  }
}

const GUIDANCE = '## 权限分级（dsh-permission-guard）\n\n当前会话启用逐命令权限白名单（~/.dsh/permission-guard.json），四级能力边界：\n- auto         可自动执行（放行）\n- give-command 只给命令不代跑：被拦截时把命令原样给用户，让用户自己执行\n- confirm      先讲清等确认：被拦截时说明改什么/为什么/影响，等用户确认\n- never        红线：绝不执行\n\n被拦截时不要绕过；按层级提示用户。可用 permission_status 查看白名单，permission_reload 重载配置。'

const OBJ = { type: 'object', additionalProperties: false, properties: { ok: { type: 'boolean' }, config: { type: 'object' }, error: { type: 'string' } } }

export function apply(ctx) {
  const disposers = []
  let config = loadConfig()

  // 全局 guard：每次工具执行前检查
  disposers.push(ctx.tools.guard((exec) => {
    const key = capabilityKey(exec)
    const tier = decide(config, key)
    return denialFor(tier, key)
  }))

  disposers.push(ctx.systemPrompt.section({ name: 'tool:permission-guard', order: 116, text: GUIDANCE }))

  disposers.push(ctx.tools.register(defineTool({
    name: 'permission_status',
    description: '查看当前权限白名单（四级：auto / give-command / confirm / never）与默认层级。',
    parameters: {},
    output: { schema: OBJ, render: (_a, v) => v.ok ? JSON.stringify(v.config, null, 2) : (v.error || '') },
    execute: () => Promise.resolve({ ok: true, config }),
    presentCall: () => 'Show permission allowlist',
  })))

  disposers.push(ctx.tools.register(defineTool({
    name: 'permission_reload',
    description: '重新加载 ~/.dsh/permission-guard.json 权限白名单（改配置后调用生效）。',
    parameters: {},
    output: { schema: OBJ, render: (_a, v) => v.ok ? '已重载权限白名单' : (v.error || '') },
    execute: () => { config = loadConfig(); return Promise.resolve({ ok: true, config }) },
    presentCall: () => 'Reload permission allowlist',
  })))

  ctx.effect(() => () => { for (const d of disposers) { try { d() } catch {} } }, '@dsh-external/dsh-permission-guard: lifecycle')
  ctx.logger?.info?.('[dsh-permission-guard] 已就绪：四级权限拦截 + permission_status/reload')
}

export const Config = undefined