/**
 * @dsh-external/dsh-project-memory — per-project persistent memory.
 *
 * Capabilities:
 *  1. Auto-load: systemPrompt.context injects the current workspace's
 *     .dsh-memory/ index (MEMORY.md) + FACT.md + JOURNAL.jsonl tail into the
 *     runtime context on every model step (active from session start, no
 *     explicit file reads). A per-cwd (mtime, size) cache skips disk re-reads
 *     while all three files are unchanged, so the hot prompt path only stats.
 *  2. Write-back tools: memory_save / memory_read / memory_log / memory_fact
 *     (indexed memory files, single-memory read by slug, append JSONL lines,
 *     de-duplicated facts).
 *  3. Auto-settle: a session/event listener appends a breadcrumb to
 *     JOURNAL.jsonl on turn/end; session/disposed records the session end.
 *
 * Storage layout under <workspace>/.dsh-memory/ (hidden, project-local,
 * git-ignorable):
 *   MEMORY.md     — index: one line per memory -> memories/<slug>.md,
 *                   injected every session.
 *   memories/*.md — individual memory bodies (frontmatter: name/description/
 *                   type), read on demand via memory_read name="<slug>".
 *   FACT.md       — durable one-line facts, injected whole.
 *   JOURNAL.jsonl — timestamped feedback stream, tail injected.
 *
 * Zero external runtime deps (node built-ins only) — no @deepseek-ai/* import;
 * loads without a junction dependency.
 */
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, statSync, openSync, readSync, closeSync, renameSync } from 'node:fs'
import { join } from 'node:path'

export const name = '@dsh-external/dsh-project-memory'
export const inject = ['tools', 'systemPrompt']

const MEMORY_DIR = '.dsh-memory'
const FACT_FILE = 'FACT.md'
const JOURNAL_FILE = 'JOURNAL.jsonl'
const MEM_DIR = 'memories'
const INDEX_FILE = 'MEMORY.md'
const MEM_TYPES = ['user', 'feedback', 'project', 'reference']
const MAX_FACT_BYTES = 64 * 1024
const JOURNAL_TAIL_BYTES = 96 * 1024
const JOURNAL_TAIL_LINES = 60
const JOURNAL_MAX_LINES = 4000
const MAX_INDEX_LINES = 120
const MAX_MEMORY_BYTES = 256 * 1024

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
function memoriesDir(cwd) { return join(memoryDir(cwd), MEM_DIR) }
function indexPath(cwd) { return join(memoryDir(cwd), INDEX_FILE) }
function memPath(cwd, name) { return join(memoriesDir(cwd), name + '.md') }

// ── memory slug ───────────────────────────────────────────────
function safeName(raw) {
  const s = String(raw || '').trim().toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/^-+|-+$/g, '')
  return s || null
}

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
function readIndexLines(cwd) {
  try {
    return readFileSync(indexPath(cwd), 'utf8').split('\n').map((l) => l.trimEnd()).filter((l) => l.trim())
  } catch { return [] }
}
function readOneMemory(cwd, name) {
  const slug = safeName(name)
  if (!slug) return { error: '记忆 slug 无效（只允许中英文/数字/连字符/下划线）' }
  const p = memPath(cwd, slug)
  try {
    return { memory: readFileSync(p, 'utf8'), path: p }
  } catch {
    return { error: `未找到记忆「${slug}」（${p}）。可用条目见 MEMORY.md 索引。` }
  }
}

// ── rendered injection block ──────────────────────────────────
// Simple per-cwd cache for the hot systemPrompt.context path: remember the
// (mtimeMs, size) of MEMORY.md / FACT.md / JOURNAL.jsonl plus the last
// rendered block. While all keys are unchanged, return the cached text
// without any file read (statSync is far cheaper than readFileSync). Any
// write — tool or auto settle — bumps mtime/size, so the next render
// naturally misses. Capped to keep the map bounded in a long-lived host.
const memoryCache = new Map() // cwd -> { iKey, fKey, jKey, text }
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
  const iKey = statKey(indexPath(cwd))
  const fKey = statKey(factPath(cwd))
  const jKey = statKey(journalPath(cwd))
  const hit = memoryCache.get(cwd)
  if (hit && hit.iKey === iKey && hit.fKey === fKey && hit.jKey === jKey) return hit.text
  const fact = readFact(cwd).trim()
  const journal = readJournalTail(cwd)
  const indexLines = readIndexLines(cwd)
  const parts = []
  if (indexLines.length) {
    const shown = indexLines.slice(0, MAX_INDEX_LINES)
    const more = indexLines.length - shown.length
    parts.push('## 记忆索引（MEMORY.md，全文按需读：memory_read name="<slug>"）\n'
      + shown.join('\n') + (more > 0 ? `\n（…另有 ${more} 条未展示）` : ''))
  }
  if (fact) parts.push('## 项目事实（FACT）\n' + fact)
  if (journal.length) parts.push('## 近期反馈流（JOURNAL 尾部）\n' + journal.join('\n'))
  const text = parts.length ? '### 项目记忆（dsh-project-memory，自动加载）\n' + parts.join('\n\n') : ''
  if (memoryCache.size >= 64) memoryCache.clear()
  memoryCache.set(cwd, { iKey, fKey, jKey, text })
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
function saveMemory(cwd, slug, description, content, type) {
  mkdirSync(memoriesDir(cwd), { recursive: true })
  const p = memPath(cwd, slug)
  const existed = existsSync(p)
  const body = `---\nname: ${slug}\ndescription: ${String(description).trim().replace(/\s*\n\s*/g, ' ')}\ntype: ${type}\n---\n\n${String(content).trim()}\n`
  writeFileSync(p, body, 'utf8')
  upsertIndex(cwd, slug, description)
  return { path: p, existed }
}
function upsertIndex(cwd, slug, description) {
  const p = indexPath(cwd)
  let lines = []
  try { lines = readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()) } catch { }
  const link = `memories/${slug}.md`
  lines = lines.filter((l) => !l.includes(`(${link})`))
  const desc = String(description || '').trim().replace(/\s+/g, ' ').slice(0, 160) || slug
  lines.push(`- [${slug}](${link}) — ${desc}`)
  writeFileSync(p, lines.join('\n') + '\n', 'utf8')
}

const GUIDANCE = `## 项目记忆（dsh-project-memory）

当前工作区存在「每项目持久记忆」，自动加载于每次对话的运行时上下文（无需你主动读）。
存放在工作区根目录的 .dsh-memory/ 下，由四部分组成：
- MEMORY.md     —— 记忆索引：一行一条（指向 memories/<slug>.md），已自动注入本次上下文。
- memories/*.md —— 单条记忆全文（带 name/description/type frontmatter），按需用 memory_read 读取。
- FACT.md       —— 耐久事实：项目关键路径、已验证结论、不可违反的规则、决策记录（已自动注入）。
- JOURNAL.jsonl —— 反馈流：带时间戳的发现、教训、实验记录（尾部已自动注入）。

用法：
- 需要回忆某条细节时，先看「记忆索引」里有没有相关条目，有 → 用 memory_read name="<slug>" 读全文。
- 学到一条值得沉淀的知识/决策/教训（成块内容）→ 调用 memory_save：给 slug + 一句话摘要 + 正文。
  它会写成 memories/<slug>.md 并自动登记进 MEMORY.md 索引，跨会话生效。
- 一行式简单事实 → memory_fact（写入 FACT.md，去重）。
- 带时间的流水记录（发现/实验/进度）→ memory_log（追加 JOURNAL.jsonl）。

写记忆的判断标准：只写**经过验证、对未来有用**的内容，不写流水账；摘要要能让未来的自己一眼判断"要不要读全文"。`

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
    description: '读取当前项目的持久记忆。不带 name：返回全部（MEMORY.md 索引 + FACT.md + JOURNAL 尾部）。带 name：返回单条记忆全文（memories/<slug>.md，slug 见索引）。',
    parameters: {
      name: { type: 'string', description: '可选。要读取的单条记忆 slug（见 MEMORY.md 索引）。省略则返回全部记忆。' }
    },
    output: { schema: MEM_OBJ, render: (_a, v) => [{ type: 'text', text: v.memory || v.error || '' }] },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区（exec.agent 无 header.cwd）' })
      if (args?.name) {
        const r = readOneMemory(cwd, args.name)
        return Promise.resolve(r.error ? { ok: false, error: r.error } : { ok: true, memory: r.memory, path: r.path })
      }
      return Promise.resolve({ ok: true, memory: renderMemory(cwd) || '(此工作区暂无项目记忆，可用 memory_save / memory_fact / memory_log 写入)' })
    },
    presentCall: () => ({ card: 'generic', title: '读取项目记忆', description: '读取项目持久记忆（全部或单条）' }),
  })))

  disposers.push(ctx.tools.register(defineTool({
    name: 'memory_save',
    description: '保存一条独立记忆（对标 ZCode 记忆库）：写成 memories/<slug>.md 并自动登记进 MEMORY.md 索引。适合成块的知识/决策/教训/规范；同 slug 覆盖更新。一行式简单事实请用 memory_fact。',
    parameters: {
      name: { type: 'string', required: true, description: '记忆 slug（中英文/数字/连字符/下划线，作文件名，如 api-auth-design）' },
      description: { type: 'string', required: true, description: '一句话摘要（展示在索引里，供未来判断是否读全文）' },
      content: { type: 'string', required: true, description: '记忆正文（Markdown）' },
      type: { type: 'string', enum: ['user', 'feedback', 'project', 'reference'], description: '记忆类型（默认 project）' }
    },
    output: { schema: MEM_OBJ, render: (_a, v) => [{ type: 'text', text: v.ok ? `已保存记忆并登记索引: ${v.path}（${v.note}）` : ('保存失败: ' + (v.error || '')) }] },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      const slug = safeName(args?.name)
      if (!slug) return Promise.resolve({ ok: false, error: 'name 无效：只允许中英文/数字/连字符/下划线' })
      const description = String(args?.description ?? '').trim()
      const content = String(args?.content ?? '').trim()
      if (!description) return Promise.resolve({ ok: false, error: 'description 不能为空（索引依赖它判断相关性）' })
      if (!content) return Promise.resolve({ ok: false, error: 'content 不能为空' })
      if (content.length > MAX_MEMORY_BYTES) return Promise.resolve({ ok: false, error: `content 过大（>${MAX_MEMORY_BYTES} 字节），请拆分成多条记忆` })
      const type = MEM_TYPES.includes(args?.type) ? args.type : 'project'
      try {
        const r = saveMemory(cwd, slug, description, content, type)
        return Promise.resolve({ ok: true, path: r.path, note: r.existed ? 'updated' : 'created' })
      } catch (e) {
        return Promise.resolve({ ok: false, error: String(e?.message ?? e) })
      }
    },
    presentCall: () => ({ card: 'generic', title: '保存项目记忆', description: '写入 memories/<slug>.md 并登记 MEMORY.md 索引' }),
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

  ctx.logger?.info?.('[dsh-project-memory] 已就绪：索引式记忆（MEMORY.md + memories/）+ memory_save/read/log/fact + turn-end 自动沉淀')
}

export const Config = undefined
