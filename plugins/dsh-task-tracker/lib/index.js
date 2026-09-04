/**
 * @dsh-external/dsh-task-tracker — task-state tracking for long conversations.
 *
 * Capabilities:
 *  1. Context injection: systemPrompt.context renders the workspace's
 *     .dsh-memory/TASKS.md into every model step (pending tasks with priority
 *     markers + completed count), so the model always sees what it is doing.
 *  2. Task tools: task_create / task_update / task_complete / task_list.
 *
 * Storage: <workspace>/.dsh-memory/TASKS.md (same directory as
 * dsh-project-memory; survives across sessions).
 * Line format: `- [ ] T-1 | high | title` with status chars
 * ` ` pending / `~` in_progress / `x` completed.
 *
 * Zero external runtime deps (node built-ins only) — no @deepseek-ai/* import;
 * loads without a junction dependency.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const name = '@dsh-external/dsh-task-tracker'
export const inject = ['tools', 'systemPrompt']

const MEMORY_DIR = '.dsh-memory'
const TASKS_FILE = 'TASKS.md'
const MAX_TASKS = 60

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
function tasksPath(cwd) { return join(memoryDir(cwd), TASKS_FILE) }

// ── TASKS.md parse/serialize ─────────────────────────────────
const LINE_RE = /^\[( |~|x)\]\s+(T-(\d+))\s*\|\s*(high|medium|low)\s*\|\s*(.+)$/
const STATUS_MAP = { ' ': 'pending', '~': 'in_progress', 'x': 'completed' }

function readTasks(cwd) {
  try {
    const text = readFileSync(tasksPath(cwd), 'utf8')
    return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const m = l.replace(/^-\s*/, '').match(LINE_RE)
      if (!m) return null
      return { status: STATUS_MAP[m[1]], id: m[2], _num: parseInt(m[3], 10), priority: m[4], title: m[5] }
    }).filter(Boolean)
  } catch { return [] }
}

function writeTasks(cwd, tasks) {
  mkdirSync(memoryDir(cwd), { recursive: true })
  const lines = tasks.map((t) => {
    const st = t.status === 'completed' ? 'x' : t.status === 'in_progress' ? '~' : ' '
    return `- [${st}] ${t.id} | ${t.priority} | ${t.title}`
  })
  writeFileSync(tasksPath(cwd), lines.join('\n') + '\n', 'utf8')
}

function nextId(tasks) {
  const max = tasks.reduce((m, t) => Math.max(m, t._num), 0)
  return 'T-' + (max + 1)
}

// ── rendered injection block ──────────────────────────────────
function renderTasks(cwd) {
  const tasks = readTasks(cwd)
  if (!tasks.length) return ''
  const pending = tasks.filter((t) => t.status !== 'completed')
  const completed = tasks.filter((t) => t.status === 'completed')
  const parts = []
  parts.push(`### 任务列表（${pending.length} 待办 / ${completed.length} 已完成）`)
  if (pending.length) {
    parts.push(pending.map((t) => {
      const st = t.status === 'in_progress' ? '🔄' : '⬜'
      const pr = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '⚪'
      return `${st} ${pr} ${t.id} — ${t.title}`
    }).join('\n'))
  }
  if (completed.length) {
    parts.push(`> ✅ 已完成 ${completed.length} 项（完整列表见 task_list）`)
  }
  parts.push('（增删改：task_create / task_update / task_complete；查：task_list）')
  return parts.join('\n')
}

// ── GUIDANCE ─────────────────────────────────────────
const GUIDANCE = `## 任务列表（dsh-task-tracker）

对话过程中维护一份 TASKS.md 任务列表，自动注入每次模型步上下文，解决"对话长了不知道在干嘛"的问题。

用法：
- 开始新工作 → task_create（给标题 + 优先级 high/medium/low）
- 任务进入执行 → task_update status=in_progress
- 任务完成 → task_complete
- 想看全部任务（含已完成） → task_list

状态码：pending（待做）/ in_progress（进行中）/ completed（完成）。
优先级：high（🔴）、medium（🟡）、low（⚪），帮助判断先做哪个。
每个任务自动分配唯一 id（T-1, T-2...），更新和完成时用 id 指定。
最多 ${MAX_TASKS} 个任务，最早完成的建议归档或删除。`

// ── tool output contract ─────────────────────────────────────
const TASK_OBJ = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' },
    message: { type: 'string' },
    error: { type: 'string' }
  }
}
function textBlocks(s) { return [{ type: 'text', text: (s == null || s === '') ? '(no output)' : String(s) }] }

// ── plugin entry ─────────────────────────────────────────────
export function apply(ctx) {
  const disposers = []

  disposers.push(ctx.systemPrompt.context({
    name: 'task:tracker',
    order: 17,
    text: (asmCtx) => renderTasks(cwdOf(asmCtx?.agent)),
  }))

  disposers.push(ctx.systemPrompt.section({
    name: 'tool:task-tracker',
    order: 116,
    text: GUIDANCE,
  }))

  // ── task_create ──
  disposers.push(ctx.tools.register(defineTool({
    name: 'task_create',
    description: '创建新任务。开始新工作或拆分步骤时调用，返回任务 id（T-N）。',
    parameters: {
      title: { type: 'string', required: true, description: '任务标题（一句话）' },
      priority: { type: 'string', enum: ['high', 'medium', 'low'], description: '优先级（默认 medium）' }
    },
    output: { schema: TASK_OBJ, render: (_a, v) => textBlocks(v.ok ? v.message : v.error) },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      const tasks = readTasks(cwd)
      if (tasks.length >= MAX_TASKS) return Promise.resolve({ ok: false, error: `任务数已达上限（${MAX_TASKS}），请先完成或归档旧任务` })
      const id = nextId(tasks)
      const priority = ['high', 'medium', 'low'].includes(args?.priority) ? args.priority : 'medium'
      const title = String(args?.title ?? '').trim()
      if (!title) return Promise.resolve({ ok: false, error: 'title 不能为空' })
      tasks.push({ status: 'pending', id, _num: parseInt(id.split('-')[1], 10), priority, title })
      writeTasks(cwd, tasks)
      return Promise.resolve({ ok: true, message: `已创建任务 ${id} [${priority}]：${title}` })
    },
    presentCall: () => ({ card: 'generic', title: '创建任务', description: '新增一条待办任务' }),
  })))

  // ── task_update ──
  disposers.push(ctx.tools.register(defineTool({
    name: 'task_update',
    description: '更新任务状态/标题/优先级。用 id（T-N）指定任务，未指定的字段保持不变。',
    parameters: {
      id: { type: 'string', required: true, description: '任务 id（如 T-1）' },
      title: { type: 'string', description: '新标题（可选）' },
      priority: { type: 'string', enum: ['high', 'medium', 'low'], description: '新优先级（可选）' },
      status: { type: 'string', enum: ['pending', 'in_progress', 'completed'], description: '新状态（可选）' }
    },
    output: { schema: TASK_OBJ, render: (_a, v) => textBlocks(v.ok ? v.message : v.error) },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      const tasks = readTasks(cwd)
      const t = tasks.find((t) => t.id === args?.id)
      if (!t) return Promise.resolve({ ok: false, error: `未找到任务 ${args?.id}，用 task_list 查看现有任务` })
      if (args?.title) t.title = String(args.title).trim()
      if (args?.priority && ['high', 'medium', 'low'].includes(args.priority)) t.priority = args.priority
      if (args?.status && ['pending', 'in_progress', 'completed'].includes(args.status)) t.status = args.status
      writeTasks(cwd, tasks)
      const stLabel = t.status === 'completed' ? '✅' : t.status === 'in_progress' ? '🔄' : '⬜'
      return Promise.resolve({ ok: true, message: `${stLabel} ${t.id} | ${t.priority} | ${t.title}` })
    },
    presentCall: () => ({ card: 'generic', title: '更新任务', description: '修改任务状态/标题/优先级' }),
  })))

  // ── task_complete ──
  disposers.push(ctx.tools.register(defineTool({
    name: 'task_complete',
    description: '将任务标记为完成。简洁写法，等价于 task_update status=completed。',
    parameters: {
      id: { type: 'string', required: true, description: '任务 id（如 T-1）' }
    },
    output: { schema: TASK_OBJ, render: (_a, v) => textBlocks(v.ok ? v.message : v.error) },
    execute: (args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      const tasks = readTasks(cwd)
      const t = tasks.find((t) => t.id === args?.id)
      if (!t) return Promise.resolve({ ok: false, error: `未找到任务 ${args?.id}` })
      t.status = 'completed'
      writeTasks(cwd, tasks)
      return Promise.resolve({ ok: true, message: `✅ 已完成 ${t.id}：${t.title}` })
    },
    presentCall: () => ({ card: 'generic', title: '完成任务', description: '标记任务为已完成' }),
  })))

  // ── task_list ──
  disposers.push(ctx.tools.register(defineTool({
    name: 'task_list',
    description: '列出全部任务（含已完成）。',
    parameters: {},
    output: { schema: TASK_OBJ, render: (_a, v) => textBlocks(v.message || v.error || '') },
    execute: (_args, exec) => {
      const cwd = cwdOf(exec.agent)
      if (!cwd) return Promise.resolve({ ok: false, error: '无法确定工作区' })
      const tasks = readTasks(cwd)
      if (!tasks.length) return Promise.resolve({ ok: true, message: '当前没有任务（用 task_create 新建）' })
      const lines = tasks.map((t) => {
        const st = t.status === 'completed' ? '✅' : t.status === 'in_progress' ? '🔄' : '⬜'
        const pr = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '⚪'
        return `${st} ${t.id} | ${pr} ${t.priority} | ${t.title}`
      })
      return Promise.resolve({ ok: true, message: lines.join('\n') })
    },
    presentCall: () => ({ card: 'generic', title: '查看任务列表', description: '列出全部任务及状态' }),
  })))

  ctx.effect(() => () => {
    for (const d of disposers) { try { d() } catch {} }
  }, '@dsh-external/dsh-task-tracker: lifecycle')

  ctx.logger?.info?.('[dsh-task-tracker] 已就绪：TASKS.md 注入 + task_create/update/complete/list 工具')
}

export const Config = undefined
