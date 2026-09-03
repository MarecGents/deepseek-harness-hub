/**
 * @dsh-external/dsh-findings-ledger — baseline 快照 + 改动对账 + 覆盖度报告
 *
 * 对标 Zcode 的 .mimosa（finding-ledger + hook-state baseline + reports/task-review）：
 *  1. baseline 快照：会话开始时对工作区做文件 hash 快照（跳过 node_modules/.git/.dsh 等）。
 *  2. findings 账本：agent 用 findings_record 记录「声称的发现/结论」及目标文件。
 *  3. 改动对账：turn 结束时把当前工作区 vs baseline 对比出改动文件。
 *  4. 覆盖度报告：每条 finding 若有目标文件且该文件被改动 → 判为「已对账 verified」；
 *     否则「未对账 unverified」；输出 coverage 状态（complete/partial/incomplete）与 reason 列表。
 *
 * 存储：<workspace>/.dsh-findings/{baseline.json, ledger.jsonl, reports/task-review-*.json}
 * 零外部运行时依赖（只 node 内建模块 + node:crypto）。
 */
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync, statSync, renameSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createHash } from 'node:crypto'

export const name = '@dsh-external/dsh-findings-ledger'
export const inject = ['tools', 'systemPrompt']

const DIR_NAME = '.dsh-findings'
const BASELINE = 'baseline.json'
const LEDGER = 'ledger.jsonl'
const SKIP_DIRS = new Set(['node_modules', '.git', '.hg', '.svn', '.dsh', '.dsh-memory', '.dsh-findings', 'dist', 'build', 'coverage', 'lib', 'obj', 'bin', '.cache'])
const MAX_FILE_BYTES = 4 * 1024 * 1024

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

// ── 路径 ────────────────────────────────────────────
function cwdOf(candidate) {
  if (!candidate) return null
  return candidate.session?.header?.cwd || candidate.header?.cwd || candidate.cwd || null
}
function baseDir(cwd) { return join(cwd, DIR_NAME) }
function baselinePath(cwd) { return join(baseDir(cwd), BASELINE) }
function ledgerPath(cwd) { return join(baseDir(cwd), LEDGER) }
function reportsDir(cwd) { return join(baseDir(cwd), 'reports') }

// ── 快照 ────────────────────────────────────────────
function collectSnapshot(cwd) {
  const map = {}
  const stack = [cwd]
  while (stack.length) {
    const abs = stack.pop()
    let entries
    try { entries = readdirSync(abs, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      const abs2 = join(abs, e.name)
      const rel = relative(cwd, abs2).replace(/\\/g, '/')
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) stack.push(abs2) }
      else if (e.isFile()) {
        try {
          const st = statSync(abs2)
          if (st.size > MAX_FILE_BYTES) continue
          const h = createHash('sha1').update(readFileSync(abs2)).digest('hex')
          map[rel] = h
        } catch {}
      }
    }
  }
  return map
}
function captureBaseline(cwd) {
  mkdirSync(baseDir(cwd), { recursive: true })
  const snap = collectSnapshot(cwd)
  writeFileSync(baselinePath(cwd) + '.tmp', JSON.stringify({ cwd, capturedAt: new Date().toISOString(), files: snap }, null, 2), 'utf8')
  renameSync(baselinePath(cwd) + '.tmp', baselinePath(cwd))
  return Object.keys(snap).length
}
function loadBaseline(cwd) {
  try { return JSON.parse(readFileSync(baselinePath(cwd), 'utf8')) } catch { return null }
}

// ── 改动对账 ────────────────────────────────────────
function diffSnapshot(baseMap, curMap) {
  const rels = new Set([...Object.keys(baseMap), ...Object.keys(curMap)])
  const changes = []
  for (const rel of rels) {
    const b = baseMap[rel], c = curMap[rel]
    const status = (c === undefined) ? 'D' : (b === undefined) ? 'A' : (b !== c) ? 'M' : ''
    if (status) changes.push({ path: rel, status })
  }
  return changes.sort((a, b) => a.path.localeCompare(b.path))
}

// ── 账本 ────────────────────────────────────────────
function loadLedger(cwd) {
  try {
    return readFileSync(ledgerPath(cwd), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
      .map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
  } catch { return [] }
}
function recordFinding(cwd, session, statement, targetFile, tag) {
  mkdirSync(baseDir(cwd), { recursive: true })
  const rec = { ts: new Date().toISOString(), session: session || null, tag: tag || 'finding', statement, targetFile: targetFile || null }
  appendFileSync(ledgerPath(cwd), JSON.stringify(rec) + '\n', 'utf8')
  return rec
}

// ── 覆盖度报告 ──────────────────────────────────────
function generateReport(cwd, session, errors = []) {
  const base = loadBaseline(cwd)
  const cur = collectSnapshot(cwd)
  const baseFiles = base?.files || {}
  const changes = base ? diffSnapshot(baseFiles, cur) : []
  const ledger = loadLedger(cwd)
  const changedSet = new Set(changes.map((c) => c.path))
  const findings = ledger.map((f, i) => {
    const target = f.targetFile ? String(f.targetFile).replace(/\\/g, '/').replace(/^\.\//, '') : null
    const verified = target ? changedSet.has(target) : false
    return { id: i + 1, statement: f.statement, tag: f.tag, targetFile: target, verified, reason: target ? (verified ? 'file-changed' : 'file-unchanged') : 'no-target' }
  })
  const total = findings.length
  const verifiedCount = findings.filter((f) => f.verified).length
  const status = errors.length > 0 ? 'incomplete' : (total > 0 && verifiedCount === total) ? 'complete' : (total > 0 && verifiedCount > 0) ? 'partial' : 'none'
  const report = {
    schema_version: 'dsh-findings-ledger/v1',
    session: null,
    run_status: status,
    coverage: {
      status,
      baseline: base ? { captured: true, capturedFiles: Object.keys(baseFiles).length } : { captured: false },
      change_tracking: { changes: changes.length, changedFiles: changes.map((c) => c.path) },
      findings: { total, verified: verifiedCount, unverified: total - verifiedCount },
    },
    findings,
    reasons: errors || (total > 0 && verifiedCount === 0 ? [{ code: 'no-findings-verified', stage: 'scan', affects_completion: true }] : []),
    errors: errors || [],
    generatedAt: new Date().toISOString(),
  }
  mkdirSync(reportsDir(cwd), { recursive: true })
  const file = join(reportsDir(cwd), 'task-review-' + Date.now() + '.json')
  writeFileSync(file + '.tmp', JSON.stringify(report, null, 2), 'utf8')
  renameSync(file + '.tmp', file)
  return { report, file }
}

const GUIDANCE = '## 发现审计（dsh-findings-ledger）\n\n本插件做 baseline 快照 + 改动对账 + 覆盖度报告（对标 mimosa task-review）：\n- findings_baseline  捕获/重捕获工作区文件快照\n- findings_record    记录一条「声称的发现/结论」及其目标文件\n- findings_report    生成/查看当前覆盖度报告（哪些发现已被改动文件验证）\n\n诚实性纪律：下结论前先记录 findings，turn 结束会自动对账是否真在代码里落地。存储于工作区 .dsh-findings/。'

const OBJ = { type: 'object', additionalProperties: false, properties: { ok: { type: 'boolean' }, report: { type: 'object' }, file: { type: 'string' }, count: { type: 'number' }, error: { type: 'string' } } }

export function apply(ctx) {
  const disposers = []
  
  disposers.push(ctx.systemPrompt.section({ name: 'tool:findings-ledger', order: 117, text: GUIDANCE }))

  disposers.push(ctx.tools.register(defineTool({
    name: 'findings_baseline',
    description: '捕获/重捕获当前工作区的文件快照基线（跳过 node_modules/.git 等）。会话首次 turn 也会自动捕获。返回快照文件数。',
    parameters: {},
    output: { schema: OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? ('已捕获基线，共 ' + v.count + ' 个文件') : (v.error || '') }] },
    execute: (_a, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      const count = captureBaseline(cwd)
      return Promise.resolve({ ok: true, count })
    },
    presentCall: () => ({ card: 'generic', title: '捕获 findings 基线', description: '重新捕获当前工作区基线快照' }),
  })))

  disposers.push(ctx.tools.register(defineTool({
    name: 'findings_record',
    description: '记录一条声称的发现/结论到账本（.dsh-findings/ledger.jsonl）。target_file 为该发现对应的目标文件（相对路径），用于对账。',
    parameters: {
      statement: { type: 'string', required: true, description: '声称的发现/结论（一句话）' },
      target_file: { type: 'string', description: '该发现对应的目标文件相对路径' },
      tag: { type: 'string', description: '标签，如 fix / bug / lesson' }
    },
    output: { schema: OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? '已记录 finding' : (v.error || '') }] },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      recordFinding(cwd, exec.agent?.id, String(args.statement), args.target_file || null, args.tag)
      return Promise.resolve({ ok: true })
    },
    presentCall: () => ({ card: 'generic', title: '记录 finding', description: '把一条结论/发现记入账本' }),
  })))

  disposers.push(ctx.tools.register(defineTool({
    name: 'findings_report',
    description: '生成并查看当前覆盖度报告：基线是否存在、改动文件数、每条 finding 是否被改动文件对账、coverage 状态（complete/partial/incomplete）。',
    parameters: {},
    output: { schema: OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? JSON.stringify(v.report, null, 2) : (v.error || '') }] },
    execute: (_a, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      const { report, file } = generateReport(cwd)
      return Promise.resolve({ ok: true, report, file })
    },
    presentCall: () => ({ card: 'generic', title: '生成 findings 报告', description: '输出变更对账与覆盖度报告' }),
  })))

  // session/event：首次 turn 捕获基线，turn-end 自动出报告
  const off = ctx.on('session/event', (session, event) => {
    const type = event?.type || ''
    const cwd = session?.header?.cwd
    if (!cwd) return
    if (type === 'turn/start' && !existsSync(baselinePath(cwd))) {
      try { captureBaseline(cwd) } catch {}
    } else if (type === 'turn/end') {
      try { generateReport(cwd) } catch {}
    }
  })

  ctx.effect(() => () => { try { off?.() } catch {}; for (const d of disposers) { try { d() } catch {} } }, '@dsh-external/dsh-findings-ledger: lifecycle')
  ctx.logger?.info?.('[dsh-findings-ledger] 已就绪：baseline + findings + 覆盖度报告')
}

// 插件配置：快照跳过目录（Config schema——普通对象作默认值；如需校验用 schemastery）
export const Config = undefined

// Test-only access to internal helpers (no runtime consumer).
export const __internals = {
  cwdOf,
  collectSnapshot,
  captureBaseline,
  loadBaseline,
  diffSnapshot,
  loadLedger,
  recordFinding,
  generateReport,
  SKIP_DIRS,
}
