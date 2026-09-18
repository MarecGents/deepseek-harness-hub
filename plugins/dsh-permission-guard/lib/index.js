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
 *   - THE `follow` POLICY READS HOST SERVICES, NOT SESSION EVENTS (2026-09-18
 *     fix). dsh 0.1.6 dropped the 0.1.5 `agent.session.events` array — a
 *     session face carries `header` / `surface.nodes` / `append()` / `id`, and
 *     the mode/approval knobs fold into session PROJECTIONS. The old event scan
 *     therefore returned undefined on every call, `follow` silently fell
 *     through to the allowlist, and with approval prompts disabled that is a
 *     hard deny even inside a Full Access session (real incident: every
 *     non-allowlisted tool — skill / present / findings_* / memory_* — and
 *     every shell command not starting with an allowlisted prefix was refused
 *     while the session sat at danger-full-access + approval never).
 *     The knobs now come from `sandboxPolicy.resolve()` and
 *     `approval.effectivePolicy()` on the calling agent's context; the event
 *     scan survives only as a last-resort fallback for older harnesses, and an
 *     unreadable state is REPORTED once instead of degrading quietly.
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
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export const name = '@dsh-external/dsh-permission-guard'
export const inject = ['tools', 'systemPrompt', 'webServer']

const CONFIG_NAME = 'permission-guard.json'

// Default posture is strict: anything not explicitly tiered requires
// confirmation. The `rules` list is a conservative fallback so that even if a
// user switches defaultTier back to 'auto', shell commands not on the
// allowlist still require confirmation. `pwsh=` entries mirror `bash=` for the
// Windows main platform; pure-Windows red-line commands live only under
// `pwsh=` so no pattern is dead on every OS.
const DEFAULT_CONFIG = {
  // Policy tier: 'follow' (default) mirrors the session's official permission
  // preset (danger-full-access -> only the never red lines stay; read-only ->
  // read-only allowlist only); 'strict' always applies this allowlist; 
  // 'read-only' unconditionally allows only the read-only allowlist.
  policy: 'follow',
  // What `follow` does when the session's knobs cannot be read at all — an
  // agentless execution (no `exec.agent`) or a harness without the policy
  // providers. 'allowlist' (default) keeps the allowlist gate; 'allow' skips
  // the gate. Either way the condition is reported once, never silently.
  onUnknownPolicy: 'allowlist',
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
      writeFileSync(p + '.tmp', JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf8')
      renameSync(p + '.tmp', p)
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

// ── session permission state (zero-dependency fold from the session log) ──
// dsh keeps sandbox/mode, approval/policy and permission/preset as log events;
// the effective value is the LAST one written. agentless executions (no
// session) yield undefined and fall back to the allowlist behaviour.
function lastEventValue(exec, type) {
  const events = exec?.agent?.session?.events
  if (!Array.isArray(events)) return undefined
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i]
    if (ev?.type === type) return ev?.data?.value ?? ev?.data?.mode ?? ev?.data?.policy
  }
  return undefined
}

/**
 * Per-session sandbox mode + approval policy, read from the HOST SERVICES.
 *
 * Source of truth in dsh 0.1.6 (verified against the shipped packages):
 *   - `dsh-sandbox-policy` registers the `sandboxPolicy` service; its
 *     `resolve({ session }).mode` folds the session's last `sandbox/mode`
 *     event through the `sandboxMode` session projection and falls back to the
 *     deployment default.
 *   - `dsh-user-approval` registers the `approval` service; its
 *     `effectivePolicy(session)` returns 'ask' | 'never'.
 * Both are reached through the calling agent's context (`agent.ctx.get(...)`),
 * exactly as `dsh-api-terminal-controller` does when it resolves the cwd.
 *
 * @param agent - the guard execution's `exec.agent` (may be undefined).
 * @returns {{ mode?: string, approval?: string } | undefined} undefined when
 *   neither knob could be read (agentless execution, or providers absent).
 */
function sessionPolicyOf(agent) {
  const session = agent?.session
  const agentCtx = agent?.ctx
  if (session === undefined || agentCtx?.get === undefined) return undefined
  let mode
  let approval
  try {
    const sandbox = agentCtx.get('sandboxPolicy')
    if (typeof sandbox?.resolve === 'function') mode = sandbox.resolve({ session })?.mode
  } catch { /* provider absent or throwing -> knob stays unknown */ }
  try {
    const approvals = agentCtx.get('approval')
    if (typeof approvals?.effectivePolicy === 'function') approval = approvals.effectivePolicy(session)
  } catch { /* provider absent or throwing -> knob stays unknown */ }
  if (mode === undefined && approval === undefined) return undefined
  return { mode, approval }
}

/**
 * The deployment-default sandbox mode, read without a session. This is the
 * only sane reference for an AGENTLESS guard call, which belongs to no
 * session. Read lazily off the plugin context so provider mount order cannot
 * matter.
 *
 * @returns {string | undefined} 'read-only' | 'workspace-write' |
 *   'danger-full-access', or undefined without a provider.
 */
function deploymentDefaultMode(pluginCtx) {
  try {
    const sandbox = pluginCtx?.get?.('sandboxPolicy')
    return typeof sandbox?.defaultMode === 'string' ? sandbox.defaultMode : undefined
  } catch {
    return undefined
  }
}

// ── policy write (update only the policy field of the raw config) ────────
function writePolicy(policy) {
  const p = configPath()
  let raw = {}
  try { raw = JSON.parse(readFileSync(p, 'utf8')) } catch { /* missing/corrupt -> start fresh */ }
  raw.policy = policy
  writeFileSync(p + '.tmp', JSON.stringify(raw, null, 2) + '\n', 'utf8')
  renameSync(p + '.tmp', p)
  configCache = null
  return raw
}

// ── policy HTTP route (read/write the policy tier from the dsh-hub UI) ───
// DNS-rebinding / CSRF guards copied from dsh-hub's host-guard (loopback-only
// Host, loopback-or-tauri Origin on state-changing requests).
function isHostAllowed(req) {
  const host = (req.headers.host ?? '').trim().toLowerCase()
  const hostname = host.startsWith('[') ? host.slice(1, host.indexOf(']')) : host.split(':')[0]
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
}
function rejectIfBadHost(req, res) {
  if (isHostAllowed(req)) return false
  res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ ok: false, error: 'host-not-allowed' }))
  return true
}
function isOriginAllowed(req) {
  const origin = (req.headers.origin ?? '').trim().toLowerCase()
  if (origin === '') return false
  try {
    const u = new URL(origin)
    if (u.protocol === 'tauri:') return u.hostname === 'localhost'
    return u.hostname === '127.0.0.1' || u.hostname === 'localhost' || u.hostname === '::1'
  } catch { return false }
}
function rejectIfBadOrigin(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') return false
  if (isOriginAllowed(req)) return false
  res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ ok: false, error: 'origin-not-allowed' }))
  return true
}
function readJsonBody(req) {
  const MAX_BODY_SIZE = 1024 * 1024 // 1MB limit
  return new Promise((resolve, reject) => {
    const chunks = []
    let totalSize = 0
    req.on('data', (c) => {
      totalSize += c.length
      if (totalSize > MAX_BODY_SIZE) {
        req.destroy() // Stop reading
        reject(new Error('Body too large'))
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) }
      catch { resolve({}) }
    })
    req.on('error', (err) => {
      if (err.message === 'Body too large') {
        reject(err)
      } else {
        resolve({})
      }
    })
  })
}
function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}
const POLICY_VALUES = ['follow', 'strict', 'read-only']

// ── decision ──────────────────────────────────────────────────────────────
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

/** Read-only allowlist test: only the auto tier entries may run. */
function readonlyDenial(config, key, label) {
  if (matchAny(key, config.tiers.auto)) return undefined
  return '权限拦截（' + label + '）：此操作不在只读放行列表 → ' + key
}

const GUIDANCE = '## 权限分级（dsh-permission-guard）\n\n当前会话启用逐命令权限白名单（~/.dsh/permission-guard.json），策略档位（policy）决定拦截松紧：\n- follow（默认）跟随会话官方权限预设（读 sandboxPolicy.resolve / approval.effectivePolicy 服务）：danger-full-access（Full Access）→ 除 never 红线外全部放行；read-only → 只放行只读操作；workspace-write 或无会话状态（agentless 调用）→ 按下方白名单（由 onUnknownPolicy 决定，且会告警一次，不再静默降级）\n- strict        始终按白名单四级拦截（auto / give-command / confirm / never），不跟随会话预设\n- read-only     无条件只放行只读操作\n\n四级能力边界：auto 可自动执行；give-command 只给命令不代跑；confirm 先讲清等确认（默认层级，未列入白名单的操作一律需确认）；never 红线绝不执行。bash/pwsh 命令按逐命令匹配（Windows 会话为 pwsh）。被拦截时不要绕过；按层级提示用户。可用 permission_status 查看白名单，permission_reload 重载配置（只读操作，auto 放行）。若用户修改了 permission-guard.json 中的放行条目，先 permission_reload 使新配置生效，再重试被拦截的操作。'

const OBJ = { type: 'object', additionalProperties: false, properties: { ok: { type: 'boolean' }, config: { type: 'object' }, error: { type: 'string' } } }

export function apply(ctx) {
  const disposers = []
  let config = loadConfigCached(true)

  // One-shot notice: `follow` could not read the session's knobs, so it is
  // gating by allowlist instead. Reported loudly because the previous silent
  // version looked exactly like "Full Access, yet everything is refused"
  // (2026-09-18 incident).
  let warnedUnknownPolicy = false
  const noteUnknownPolicy = (reason) => {
    if (warnedUnknownPolicy) return
    warnedUnknownPolicy = true
    ctx.logger?.warn?.(
      '[dsh-permission-guard] follow 无法读取会话权限状态（' + reason + '）——已按白名单处理；'
      + '如需一律放行，把 ~/.dsh/permission-guard.json 的 onUnknownPolicy 设为 "allow"。'
    )
  }

  // Global guard: checked before every tool execution.
  disposers.push(ctx.tools.guard((exec) => {
    const config = loadConfigCached(false)
    const key = capabilityKey(exec)
    const policy = config.policy || 'follow'

    // The never tier is absolute in every policy (including Full Access).
    if (matchAny(key, config.tiers.never)) return denialFor('never', key)

    if (policy === 'strict') return denialFor(decide(config, key), key)

    if (policy === 'read-only') return readonlyDenial(config, key, 'read-only 档')

    // follow: mirror the session's official permission preset.
    // Preferred source: the host policy services (dsh 0.1.6). Fallback: the
    // 0.1.5-style session-event scan, kept for older harnesses.
    let state = sessionPolicyOf(exec?.agent)
    if (state === undefined) {
      const mode = lastEventValue(exec, 'sandbox/mode')
      const approval = lastEventValue(exec, 'approval/policy')
      if (mode !== undefined || approval !== undefined) state = { mode, approval }
    }
    if (state !== undefined) {
      if (state.mode === 'danger-full-access' || state.approval === 'never') return undefined
      if (state.mode === 'read-only') return readonlyDenial(config, key, '只读会话')
      // workspace-write: the allowlist logic.
      return denialFor(decide(config, key), key)
    }

    // Agentless call, or a harness whose providers are unreadable. An agentless
    // call belongs to no session, so the deployment default is the honest
    // reference; failing that, the configured posture — announced, never silent.
    const deploymentMode = deploymentDefaultMode(ctx)
    if (deploymentMode === 'danger-full-access') return undefined
    if (deploymentMode === 'read-only') return readonlyDenial(config, key, '只读会话（部署默认）')
    if ((config.onUnknownPolicy || 'allowlist') === 'allow') {
      noteUnknownPolicy('onUnknownPolicy=allow')
      return undefined
    }
    noteUnknownPolicy(exec?.agent === undefined ? 'agentless 调用' : '策略服务不可读')
    return denialFor(decide(config, key), key)
  }))

  // Policy tier route for the dsh-hub settings card and composer chip.
  const server = ctx.get('webServer')
  if (server && typeof server.register === 'function') {
    const disposeRoute = server.register({
      kind: 'exact',
      path: '/api/dsh-permission-guard/policy',
      handler: (req, res) => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (req.method === 'GET') {
          json(res, 200, { ok: true, policy: (loadConfigCached(false).policy || 'follow') })
          return Promise.resolve()
        }
        if (req.method === 'POST') {
          if (rejectIfBadOrigin(req, res)) return Promise.resolve()
          return readJsonBody(req).then((body) => {
            const policy = body?.policy
            if (!POLICY_VALUES.includes(policy)) {
              json(res, 400, { ok: false, error: 'invalid policy; expected one of ' + POLICY_VALUES.join('/') })
              return
            }
            writePolicy(policy)
            config = loadConfigCached(true)
            json(res, 200, { ok: true, policy })
          })
        }
        json(res, 405, { ok: false, error: 'method-not-allowed' })
        return Promise.resolve()
      },
    })
    if (typeof disposeRoute === 'function') disposers.push(disposeRoute)
    ctx.logger?.info?.('[dsh-permission-guard] policy route mounted at /api/dsh-permission-guard/policy')
  }

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

// Test-only access to internal helpers (no runtime consumer).
export const __internals = {
  wildcardToRegExp,
  matchAny,
  capabilityKey,
  lastEventValue,
  sessionPolicyOf,
  deploymentDefaultMode,
  decide,
  denialFor,
  readonlyDenial,
  isHostAllowed,
  isOriginAllowed,
  toJsonSchema,
  DEFAULT_CONFIG,
}
