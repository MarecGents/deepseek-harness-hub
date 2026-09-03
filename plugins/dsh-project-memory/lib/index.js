/**
 * @dsh-external/dsh-project-memory — per-project persistent memory.
 *
 * Capabilities:
 *  1. Auto-load: systemPrompt.context injects the current workspace's
 *     .dsh-memory/FACT.md + JOURNAL.jsonl tail into the runtime context on
 *     every model step (active from session start, no explicit file reads).
 *     A per-cwd (mtime, size) cache skips disk re-reads while both files are
 *     unchanged, so the hot prompt path only stats.
 *  2. Write-back tools: memory_read / memory_log / memory_fact (write FACT.md,
 *     append JSONL lines, de-duplicate facts).
 *  3. Auto-settle: a session/event listener appends a breadcrumb to
 *     JOURNAL.jsonl on turn/end; session/disposed records the session end.
 *
 * Storage: <workspace>/.dsh-memory/ (hidden, project-local, git-ignorable).
 * Zero external runtime deps (node built-ins only) — no @deepseek-ai/* import;
 * loads without a junction dependency.
 */
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, statSync, openSync, readSync, closeSync, renameSync } from 'node:fs'
import { join } from 'node:path'

export const name = '@dsh-external/dsh-project-memory'
export const inject = ['tools', 'systemPrompt']

const MEMORY_DIR = '.dsh-memory'
const FACT_FILE = 'FACT.md'
const JOURNAL_FILE = 'JOURNAL.jsonl'
const MAX_FACT_BYTES = 64 * 1024
const JOURNAL_TAIL_BYTES = 96 * 1024
const JOURNAL_TAIL_LINES = 60
const JOURNAL_MAX_LINES = 4000

// ── local defineTool (zero-dependency) ───────────────────────
function toJsonSchema(spec) {
  const properties = {}
  const required = []
  for (const [k, v] of Object.entries(spec || {})) {
    const p = { type: v.type || 'string' }
    if (v.description) p.description = v.description
    if (v.enum) p.enum = v.enum
    properties[k] = p
    if (v.required) required.push(k)
  }
  const schema = { type: 'object', properties }
  if (required.length) schema.required = required
  return schema
}
function defineTool(options) {
  const tool = {
    name: options.name,
    description: options.description,
    parameters: toJsonSchema(options.parameters),
    output: options.output,
    execute: options.execute,
  }
  if (options.presentCall) tool.presentCall = options.presentCall
  if (options.presentResult) tool.presentResult = options.presentResult
  if (options.isConcurrencySafe) tool.isConcurrencySafe = options.isConcurrencySafe
  return tool
}

// ── workspace resolution ──────────────────────────────────────
function cwdOf(candidate) {
  if (!candidate) return null
  const h = candidate.session?.header?.cwd || candidate.header?.cwd || candidate.cwd
  return h || null
}
function memoryDir(cwd) { return join(cwd, MEMORY_DIR) }
function factPath(cwd) { return join(memoryDir(cwd), FACT_FILE) }
function journalPath(cwd) { return join(memoryDir(cwd), JOURNAL_FILE) }

// ── reads ─────────────────────────────────────────────────────
function readFact(cwd) {
  const p = factPath(cwd)
  try {
    const st = statSync(p)
    if (st.size === 0) return ''
    if (st.size <= MAX_FACT_BYTES) return readFileSync(p, 'utf8')
    const fd = openSync(p, 'r'); const buf = Buffer.alloc(MAX_FACT_BYTES)
    const n = readSync(fd, buf, 0, MAX_FACT_BYTES, st.size - MAX_FACT_BYTES); closeSync(fd)
    return buf.toString('utf8', 0, n)
  } catch { return '' }
}
function readJournalTail(cwd) {
  const p = journalPath(cwd)
  try {
    const st = statSync(p)
    if (st.size === 0) return []
    let text
    if (st.size <= JOURNAL_TAIL_BYTES) {
      text = readFileSync(p, 'utf8')
    } else {
      const fd = openSync(p, 'r'); const buf = Buffer.alloc(JOURNAL_TAIL_BYTES)
      const n = readSync(fd, buf, 0, JOURNAL_TAIL_BYTES, st.size - JOURNAL_TAIL_BYTES); closeSync(fd)
      text = buf.toString('utf8', 0, n)
    }
    return text.split('\n').map((l) => l.trim()).filter(Boolean).slice(-JOURNAL_TAIL_LINES)
  } catch { return [] }
}

// ── rendered injection block ──────────────────────────────────
// Simple per-cwd cache for the hot systemPrompt.context path: remember the
// (mtimeMs, size) of FACT.md / JOURNAL.jsonl plus the last rendered block.
// While both keys are unchanged, return the cached text without any file read
// (statSync is far cheaper than readFileSync). Any write — tool or auto
// settle — bumps mtime/size, so the next render naturally misses. Capped to
// keep the map bounded in a long-lived host.
const memoryCache = new Map() // cwd -> { fKey, jKey, text }
function statKey(p) {
  try {
    const st = statSync(p)
    return st.mtimeMs + ':' + st.size
  } catch {
    return null // missing/unreadable -> no read below
  }
}
function renderMemory(cwd) {
  if (!cwd) return ''
  const fKey = statKey(factPath(cwd))
  const jKey = statKey(journalPath(cwd))
  const hit = memoryCache.get(cwd)
  if (hit && hit.fKey === fKey && hit.jKey === jKey) return hit.text
  const fact = readFact(cwd).trim()
  const journal = readJournalTail(cwd)
  const parts = []
  if (fact) parts.push('## 项目事实（FACT）\n' + fact)
  if (journal.length) parts.push('## 近期反馈流（JOURNAL 尾部）\n' + journal.join('\n'))
  const text = parts.length ? '### 项目记忆（dsh-project-memory，自动加载）\n' + parts.join('\n\n') : ''
  if (memoryCache.size >= 64) memoryCache.clear()
  memoryCache.set(cwd, { fKey, jKey, text })
  return text
}

// ── writes ────────────────────────────────────────────────────
function appendJournal(cwd, rec) {
  mkdirSync(memoryDir(cwd), { recursive: true })
  const p = journalPath(cwd)
  appendFileSync(p, JSON.stringify(rec) + '\n', 'utf8')
  try {
    const st = statSync(p)
    if (st.size > 2 * 1024 * 1024) {
      const lines = readFileSync(p, 'utf8').split('\n').filter(Boolean).slice(-JOURNAL_MAX_LINES)
      writeFileSync(p + '.tmp', lines.join('\n') + '\n', 'utf8')
      renameSync(p + '.tmp', p)
    }
  } catch { }
}
function appendFact(cwd, statement) {
  mkdirSync(memoryDir(cwd), { recursive: true })
  const p = factPath(cwd)
  const line = statement.trim().replace(/\s*\n\s*/g, ' ').replace(/^[-*]\s*/, '')
  if (!line) return false
  try {
    const cur = readFileSync(p, 'utf8')
    if (cur.split('\n').some((l) => l.trim() === '- ' + line || l.trim() === line)) return false
  } catch {}
  appendFileSync(p, '- ' + line + '\n', 'utf8')
  return true
}

const GUIDANCE = `## 项目记忆（dsh-project-memory）

当前工作区存在「每项目持久记忆」，自动加载于每次对话的运行时上下文（无需你主动读）。
它由两个文件组成，存放在工作区根目录的 .dsh-memory/ 下：
- FACT.md      —— 耐久事实：项目关键路径、已验证结论、不可违反的规则、决策记录。
- JOURNAL.jsonl—— 反馈流：带时间戳的发现、教训、实验记录（每行一条 JSON）。

用法：
- 需要回忆过往决策/约束/教训时，直接看运行时上下文的「项目记忆」块，或调用 memory_read。
- 学到一条可复用的事实/约束 → 调用 memory_fact 持久化进 FACT.md。
- 记一条带时间的发现/教训/实验结论 → 调用 memory_log 追加进 JOURNAL.jsonl。
- 写回的条目会自动在下次对话自动加载，跨会话生效。

注意：只写**经过验证、对未来有用**的内容，不写流水账；改前备份、删前归档是项目铁律。`

const MEM_OBJ = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' },
    memory: { type: 'string' },
    path: { type: 'string' },
    error: { type: 'string' },
    note: { type: 'string' }
  }
}

export function apply(ctx) {
  const disposers = []

  disposers.push(ctx.systemPrompt.context({
    name: 'project:memory',
    order: 18,
    text: (asmCtx) => renderMemory(cwdOf(asmCtx?.agent)),
  }))

  disposers.push(ctx.systemPrompt.section({
    name: 'tool:project-memory',
    order: 115,
    text: GUIDANCE,
  }))

  disposers.push(ctx.tools.register(defineTool({
    name: 'memory_read',
    description: '读取当前项目的持久记忆（FACT.md 耐久事实 + JOURNAL.jsonl 近期反馈流），存于工作区 .dsh-memory/。需要回忆过往决策/约束/教训时调用。',
    parameters: {},
    output: { schema: MEM_OBJ, render: (_a, v) => [{ type: 'text', text: v.memory || v.error || '' }] },
    execute: (_args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区（exec.agent 无 header.cwd）' })
      return Promise.resolve({ ok: true, memory: renderMemory(cwd) || '(此工作区暂无项目记忆，可用 memory_fact / memory_log 写入)' })
    },
    presentCall: () => ({ card: 'generic', title: '读取项目记忆', description: '读取当前项目的 FACT + JOURNAL 持久记忆' }),
  })))

  disposers.push(ctx.tools.register(defineTool({
    name: 'memory_log',
    description: '向当前项目的 JOURNAL.jsonl（带时间戳的反馈流）追加一条记录。用于记录发现/教训/实验结论/进度等带时序的内容。',
    parameters: {
      entry: { type: 'string', required: true, description: '要记录的内容（一句话到一小段）' },
      tag: { type: 'string', description: '可选标签，如 fix / lesson / experiment / progress' }
    },
    output: { schema: MEM_OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? '已记录到项目 JOURNAL' : ('记录失败: ' + (v.error || '')) }] },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      try {
        appendJournal(cwd, {
          ts: new Date().toISOString(),
          session: exec.agent?.id ?? null,
          tag: args.tag || 'note',
          entry: String(args.entry)
        })
        return Promise.resolve({ ok: true, path: journalPath(cwd) })
      } catch (e) {
        return Promise.resolve({ ok: false, error: String(e?.message ?? e) })
      }
    },
    presentCall: () => ({ card: 'generic', title: '记录项目日志', description: '向项目 JOURNAL.jsonl 追加一条带时间戳的记录' }),
  })))

  disposers.push(ctx.tools.register(defineTool({
    name: 'memory_fact',
    description: '向当前项目的 FACT.md 追加一条耐久事实（去重：已存在的行不会重复写入）。用于持久化关键路径、已验证结论、不可违反的规则等跨会话事实。',
    parameters: {
      statement: { type: 'string', required: true, description: '要持久化的事实陈述（一句话）' }
    },
    output: { schema: MEM_OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? '已写入项目 FACT.md' : ('写入失败: ' + (v.error || '')) }] },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      try {
        const added = appendFact(cwd, String(args.statement))
        return Promise.resolve({ ok: true, path: factPath(cwd), note: added ? 'added' : 'duplicate-skipped' })
      } catch (e) {
        return Promise.resolve({ ok: false, error: String(e?.message ?? e) })
      }
    },
    presentCall: () => ({ card: 'generic', title: '写入项目事实', description: '向项目 FACT.md 追加一条耐久事实（去重）' }),
  })))

  // Auto-settle: breadcrumb on turn/end (session/flush stays in the filter
  // for when the runtime dispatches it through session/event); session
  // disposal records the session end. Both are real dsh session events.
  const settle = (session, eventType, tag) => {
    const cwd = session?.header?.cwd
    if (!cwd) return
    try {
      appendJournal(cwd, { ts: new Date().toISOString(), session: session?.id ?? null, tag, auto: true, event: eventType })
    } catch { }
  }
  const offTurn = ctx.on('session/event', (session, event) => {
    const type = event?.type || ''
    if (!/turn\/end|session\/flush/.test(type)) return
    settle(session, type, 'turn-end')
  })
  const offDispose = ctx.on('session/disposed', (session) => settle(session, 'session/disposed', 'session-end'))

  ctx.effect(() => () => {
    try { offTurn?.() } catch {}
    try { offDispose?.() } catch {}
    for (const d of disposers) { try { d() } catch {} }
  }, '@dsh-external/dsh-project-memory: lifecycle')

  ctx.logger?.info?.('[dsh-project-memory] 已就绪：自动加载 + memory_read/log/fact 工具 + turn-end 自动沉淀')
}

export const Config = undefined

// Test-only access to internal helpers (no runtime consumer).
export const __internals = {
  cwdOf,
  readFact,
  readJournalTail,
  renderMemory,
  appendJournal,
  appendFact,
}
