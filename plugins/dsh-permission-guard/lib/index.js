/**
 * @dsh-external/dsh-permission-guard — per-command allowlist with a four-tier
 * capability gate (auto / give-command / confirm / never).
 *
 * Landed from PR #37 with the following landing fixes (see README.md):
 *   - cordis.patch.yml shipped alongside (dsh.bundle.patch must exist or the
 *     bundle mount fails at boot).
 *   - pwsh= capability keys mirror bash= for the Windows main platform (the
 *     default session shell is pwsh); bash= is kept for cross-platform use.
 *   - Pure-Windows red-line commands (format c:, del /f /s /q c:, rd /s /q c:)
 *     live only under pwsh=; a tool-level `rules` fallback (bash=* / pwsh=*
 *     -> confirm) replaces the dead bash=-keyed entries.
 *   - `rules` list + defaultTier 'confirm': anything not explicitly tiered is
 *     denied until confirmed (README explains how to switch back to 'auto').
 *   - Config file reads are cached by mtime/size; permission_reload forces a
 *     cache invalidation.
 *   - presentCall returns { card: 'generic', title, description } objects.
 *
 * Four tiers:
 *   auto          run automatically (allow)
 *   give-command  hand the command to the user to run manually (deny)
 *   confirm       explain and wait for confirmation (deny until approved)
 *   never         hard red line, never run (deny)
 *
 * Mechanism: a global ctx.tools.guard() is evaluated before every tool
 * execution and matched against the allowlist by capability key:
 *   bash=<command> / pwsh=<command>  (shell tools, per command)
 *   <toolname>                       (any other tool by name)
 * Config: ~/.dsh/permission-guard.json (auto-created on first run), with `*`
 * wildcard support.
 * Zero external runtime dependencies (Node built-ins only).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export const name = '@dsh-external/dsh-permission-guard'
export const inject = ['tools', 'systemPrompt']

const CONFIG_NAME = 'permission-guard.json'

// Default posture is strict: anything not explicitly tiered requires
// confirmation. The `rules` list is a conservative fallback so that even if a
// user switches defaultTier back to 'auto', shell commands not on the
// allowlist still require confirmation. `pwsh=` entries mirror `bash=` for the
// Windows main platform; pure-Windows red-line commands live only under
// `pwsh=` so no pattern is dead on every OS.
const DEFAULT_CONFIG = {
  defaultTier: 'confirm',
  rules: [
    { match: 'bash=*', tier: 'confirm' },
    { match: 'pwsh=*', tier: 'confirm' }
  ],
  tiers: {
    auto: [
      'bash=ls*', 'bash=cat*', 'bash=echo*', 'bash=pwd*', 'bash=cd*',
      'bash=find*', 'bash=grep*', 'bash=sed -n*', 'bash=node --check*',
      'pwsh=git *', 'pwsh=Get-ChildItem*', 'pwsh=Get-Content*', 'pwsh=Write-Output*',
      'pwsh=Get-Location*', 'pwsh=Set-Location*', 'pwsh=Select-String*', 'pwsh=node --check*',
      'pwsh=ls*', 'pwsh=cat*', 'pwsh=pwd*', 'pwsh=cd*', 'pwsh=echo*',
      'read', 'glob', 'grep', 'permission_status',
      // Read-only, side-effect-free tools must never be confirm-gated: reload
      // only re-reads the config (gating it deadlocks config updates), and
      // ask_user_question IS the confirmation channel itself (gating it makes
      // the confirm tier unusable). Real incident 2026-08-28 (#89).
      'permission_reload', 'ask_user_question'
    ],
    'give-command': [
      'bash=rm*', 'bash=reg*', 'bash=shutdown*', 'bash=del /f*', 'bash=rd /s*', 'bash=taskkill*',
      'pwsh=Remove-Item*', 'pwsh=rm*', 'pwsh=reg*', 'pwsh=shutdown*', 'pwsh=del /f*', 'pwsh=rd /s*', 'pwsh=taskkill*'
    ],
    confirm: [
      'bash=git push*', 'bash=git reset*', 'bash=curl*', 'bash=wget*', 'bash=chmod*',
      'bash=chown*', 'bash=scp*', 'bash=rsync*',
      'pwsh=git push*', 'pwsh=git reset*', 'pwsh=curl*', 'pwsh=wget*', 'pwsh=scp*',
      'pwsh=Invoke-WebRequest*', 'pwsh=Invoke-RestMethod*'
    ],
    never: [
      'bash=rm -rf*',
      'pwsh=rm -rf*', 'pwsh=format c:*', 'pwsh=del /f /s /q c:*', 'pwsh=rd /s /q c:*'
    ]
  }
}

// ── minimal local defineTool (zero dependency) ────────────
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

// ── config load with a simple mtime/size cache ────────────
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
    return {
      ...DEFAULT_CONFIG,
      ...raw,
      tiers: { ...DEFAULT_CONFIG.tiers, ...(raw.tiers || {}) },
      rules: raw.rules ?? DEFAULT_CONFIG.rules
    }
  } catch {
    // Unreadable/corrupt file falls back to defaults so the gate never dead-locks.
    return DEFAULT_CONFIG
  }
}

// The guard runs before every tool execution; stat()-ing the file (mtime+size)
// instead of re-parsing it keeps the hot path cheap while still picking up
// edits. permission_reload forces a reload.
let configCache = null
function loadConfigCached(force) {
  const p = configPath()
  let stat = null
  try { stat = statSync(p) } catch { /* missing file -> treat as changed */ }
  if (!force && configCache && configCache.stat && stat &&
      stat.mtimeMs === configCache.stat.mtimeMs && stat.size === configCache.stat.size) {
    return configCache.config
  }
  const config = loadConfig()
  try { stat = statSync(p) } catch { stat = null }
  configCache = { stat, config }
  return config
}

// ── wildcard matching (`*` matches any run) ───────────────
function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^\${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp('^' + escaped + '$')
}
function matchAny(key, patterns) {
  for (const p of patterns || []) {
    try { if (wildcardToRegExp(p).test(key)) return true } catch { /* bad pattern -> skip */ }
  }
  return false
}

// ── capability key ────────────────────────────────────────
function capabilityKey(exec) {
  const execName = exec?.name
  const args = exec?.arguments || {}
  if (execName === 'bash' || execName === 'pwsh') {
    const cmd = String(args.command || args.script || '')
    return execName + '=' + cmd.trim()
  }
  return String(execName || '')
}

// ── decision ──────────────────────────────────────────────
// Precedence: explicit tier patterns (never > confirm > give-command > auto),
// then ordered `rules` fallbacks, then defaultTier.
function decide(config, key) {
  const tiers = config.tiers || {}
  for (const tier of ['never', 'confirm', 'give-command', 'auto']) {
    if (matchAny(key, tiers[tier])) return tier
  }
  for (const rule of config.rules || []) {
    if (rule && rule.match && rule.tier && matchAny(key, [rule.match])) return rule.tier
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

const GUIDANCE = '## 权限分级（dsh-permission-guard）\n\n当前会话启用逐命令权限白名单（~/.dsh/permission-guard.json），四级能力边界：\n- auto         可自动执行（放行）\n- give-command 只给命令不代跑：被拦截时把命令原样给用户，让用户自己执行\n- confirm      先讲清等确认：被拦截时说明改什么/为什么/影响，等用户确认（默认层级，未列入白名单的操作一律需确认）\n- never        红线：绝不执行\n\nbash/pwsh 命令按逐命令匹配（Windows 会话为 pwsh）；未命中白名单的 shell 命令默认走 confirm。被拦截时不要绕过；按层级提示用户。可用 permission_status 查看白名单，permission_reload 重载配置（只读操作，auto 放行）。若用户修改了 permission-guard.json 中的放行条目，先 permission_reload 使新配置生效，再重试被拦截的操作。'

const OBJ = { type: 'object', additionalProperties: false, properties: { ok: { type: 'boolean' }, config: { type: 'object' }, error: { type: 'string' } } }

export function apply(ctx) {
  const disposers = []
  let config = loadConfigCached(true)

  // Global guard: checked before every tool execution.
  disposers.push(ctx.tools.guard((exec) => {
    const key = capabilityKey(exec)
    const tier = decide(loadConfigCached(false), key)
    return denialFor(tier, key)
  }))

  disposers.push(ctx.systemPrompt.section({ name: 'tool:permission-guard', order: 116, text: GUIDANCE }))

  disposers.push(ctx.tools.register(defineTool({
    name: 'permission_status',
    description: '查看当前权限白名单（四级：auto / give-command / confirm / never）、rules 兜底规则与默认层级。',
    parameters: {},
    output: { schema: OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? JSON.stringify(v.config, null, 2) : (v.error || '') }] },
    execute: () => Promise.resolve({ ok: true, config }),
    presentCall: () => ({ card: 'generic', title: 'View permission allowlist', description: 'Show the current permission-guard tiers, rules, and default tier.' }),
  })))

  disposers.push(ctx.tools.register(defineTool({
    name: 'permission_reload',
    description: '重新加载 ~/.dsh/permission-guard.json 权限白名单（改配置后调用生效，强制刷新缓存）。',
    parameters: {},
    output: { schema: OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? '已重载权限白名单' : (v.error || '') }] },
    execute: () => { config = loadConfigCached(true); return Promise.resolve({ ok: true, config }) },
    presentCall: () => ({ card: 'generic', title: 'Reload permission allowlist', description: 'Re-read ~/.dsh/permission-guard.json and invalidate the config cache.' }),
  })))

  ctx.effect(() => () => { for (const d of disposers) { try { d() } catch {} } }, '@dsh-external/dsh-permission-guard: lifecycle')
  ctx.logger?.info?.('[dsh-permission-guard] 已就绪：四级权限拦截 + permission_status/reload')
}

export const Config = undefined
