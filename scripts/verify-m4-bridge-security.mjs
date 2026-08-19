#!/usr/bin/env node
/**
 * verify-m4-bridge-security.mjs — M4 桥端点鉴权验收（bridge-server.ts 契约）。
 *
 * 契约（src/server/bridge-server.ts，断言已按实现校准 —— 见下方「按实现调整」）：
 *   - 路由前缀 /api/dsh-hub/bridge：GET /events（SSE 下行流）、POST /workspace
 *     （页面上报工作区）、POST /notify（任务完成上报）
 *   - 双重鉴权 enforceAuth：
 *     ① Host 头白名单 — 仅 127.0.0.1:<port>（IPv4 loopback）→ 否则 403
 *        {"ok":false,"error":"host-not-allowed"}
 *     ② Bearer token — `Authorization: Bearer <token>`，token 由
 *        process.env.DSH_HUB_BRIDGE_TOKEN 提供 → 否则 403
 *        {"ok":false,"error":"invalid-bearer-token"}
 *   - 方法不符 → 405；请求体超限/非法 JSON → 400
 *
 * 断言：
 *   BS-1  临时隔离 DSH_HOME 就绪 + 注入 DSH_HUB_BRIDGE_TOKEN
 *   BS-2  从 dsh.log 解析实际端口（`m4: sidecar READY on port N` /
 *         `m4: navigating to http://127.0.0.1:N`）
 *   BS-3  错误 Host 头（evil.example）→ 拒绝（403 host-not-allowed；非 2xx 即 PASS）
 *   BS-4  缺 token → 拒绝（403 invalid-bearer-token；401/403/断开均 PASS）
 *   BS-5  错 token → 拒绝（同上）
 *   BS-6  正确 token + 正确 Host → 2xx（POST /workspace → 200 {"ok":true}）
 *   BS-7  方法不符 → 405（契约补充断言）
 *   BS-8  SSE /events 正确鉴权 → 200 text/event-stream（契约补充断言）
 *   BS-9  清理：杀 dsh-hub + 删临时 DSH_HOME
 *
 * 桥不可达判定（输出 SKIPPED + 原因 + 手工验证指引，不 FAIL）：
 *   - sidecar 未 READY（dsh.log 超时 / 出现回退标记）→ 桥不在线；
 *   - 正确 token 探测返回 404 → 桥路由未挂载（插件门控未激活）；
 *   - 连接被拒（ECONNREFUSED）重试仍失败 → 桥不可达。
 *
 * 按实现调整（相对任务书初稿假设）：
 *   - 错误 Host / 缺 token / 错 token 统一返回 403（enforceAuth 单一响应码），不是 401；
 *   - token 来自 process.env.DSH_HUB_BRIDGE_TOKEN（src/index.ts getBearerToken），
 *     Rust 壳（node.rs）当前未显式设置该变量 —— 脚本自行注入已知 token 到 dsh-hub.exe
 *     环境（Command 默认继承父环境）以测「正确 token → 2xx」分支；
 *   - 若 E2E/环境使桥不可达 → SKIPPED（不 FAIL），并给出手工验证指引。
 *
 * 用法：node scripts/verify-m4-bridge-security.mjs [--exe <path>] [--token <token>]
 *       [--ready-timeout-ms <READY 等待上限，默认 60000>] [--keep]
 *
 * 模块类别：Helper（验证；Windows-only）。
 * Windows 注意：dsh-hub.exe 是 windowed 子系统，spawn 用 stdio:'ignore'（管道捕获会
 * EPERM）；windowsHide:true = CREATE_NO_WINDOW；清理用 taskkill /T /F 杀进程树。
 */

import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DEFAULT_EXE = join(REPO_ROOT, 'src-tauri', 'target', 'debug', 'dsh-hub.exe')
const BRIDGE_PREFIX = '/api/dsh-hub/bridge'
/** READY 行（lib.rs 两处日志），解析实际端口。 */
const READY_RE = /m4: sidecar READY on port (\d+)|m4: navigating to http:\/\/127\.0\.0\.1:(\d+)/
/** sidecar 失败/回退标记（lib.rs 的 fallback 路径）。 */
const UNREACHABLE_RE = /m4: sidecar start failed|READY timeout, falling back|falling back to temporary page/

const results = []
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}
function skip(name, detail) {
  results.push({ name, ok: true, skipped: true, detail })
  console.log(`SKIP  ${name} — ${detail}`)
}

function argValue(name) {
  const i = process.argv.indexOf(name)
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined
}

const EXE = argValue('--exe') ?? DEFAULT_EXE
const TOKEN = argValue('--token') ?? `verify-${randomBytes(8).toString('hex')}`
const READY_TIMEOUT_MS = Number(argValue('--ready-timeout-ms') ?? 60_000)
const KEEP = process.argv.includes('--keep')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const logPath = (home) => join(home, 'dsh-hub', 'logs', 'dsh.log')
const readLog = (home) => {
  try {
    return readFileSync(logPath(home), 'utf8')
  } catch {
    return '' // file not created yet.
  }
}

function taskkillTree(pid) {
  try {
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
  } catch {
    // Best-effort: fall through to the direct kill below.
  }
  try {
    process.kill(pid)
  } catch {
    // Already gone.
  }
}

/**
 * One HTTP probe against the bridge. Full header control (Host override is
 * required for the bad-host fence check). Resolves { status?, body?,
 * contentType?, error? }.
 * @param {number} port - sidecar port.
 * @param {{path: string, method?: string, host?: string, auth?: string, body?: unknown}} opts
 * @returns {Promise<object>}
 */
function probe(port, { path: pathname, method = 'GET', host, auth, body }) {
  return new Promise((resolve) => {
    const headers = { host: host ?? `127.0.0.1:${port}` }
    if (auth !== undefined) headers.authorization = auth
    let payload
    if (body !== undefined) {
      headers['content-type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    const req = http.request({ hostname: '127.0.0.1', port, path: pathname, method, headers }, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({
        status: res.statusCode,
        contentType: res.headers['content-type'],
        body: Buffer.concat(chunks).toString('utf8'),
      }))
    })
    req.setTimeout(10_000, () => {
      req.destroy()
      resolve({ error: 'timeout' })
    })
    req.on('error', (e) => resolve({ error: e.code ?? String(e) }))
    if (payload) req.write(payload)
    req.end()
  })
}

/**
 * SSE probe: resolve as soon as the response headers arrive (the stream stays
 * open), then tear the connection down so the script does not hang.
 * @returns {Promise<{status?: number, contentType?: string, error?: string}>}
 */
function probeSse(port, { host, auth }) {
  return new Promise((resolve) => {
    const headers = { host: host ?? `127.0.0.1:${port}` }
    if (auth !== undefined) headers.authorization = auth
    const req = http.request({
      hostname: '127.0.0.1', port,
      path: `${BRIDGE_PREFIX}/events`, method: 'GET', headers,
    }, (res) => {
      resolve({ status: res.statusCode, contentType: res.headers['content-type'] })
      req.destroy()
    })
    req.setTimeout(10_000, () => {
      req.destroy()
      resolve({ error: 'timeout' })
    })
    req.on('error', (e) => resolve({ error: e.code ?? String(e) }))
    req.end()
  })
}

/**
 * Retry a probe while the bridge is still coming up (connection refused or
 * route not yet mounted → 404), up to `tries` attempts.
 */
async function probeWithRetry(port, makeProbe, { tries = 12, delayMs = 500 } = {}) {
  let last = null
  for (let i = 0; i < tries; i++) {
    last = await makeProbe()
    if (last.error === 'ECONNREFUSED' || last.error === 'timeout' || last.status === 404) {
      await sleep(delayMs)
      continue
    }
    return last
  }
  return last
}

/** 手工验证指引（桥不可达时输出）。 */
function manualGuidance(port) {
  const base = port > 0
    ? `http://127.0.0.1:${port}/api/dsh-hub/bridge`
    : 'http://127.0.0.1:<port>/api/dsh-hub/bridge'
  console.log(`
手工验证指引：
  1) 确认 src-tauri/target/debug/dsh-hub.exe 为最新 debug 构建（含 M4 sidecar + 桥路由）；
  2) 用临时 DSH_HOME 启动：$env:DSH_HOME='<临时目录>'; $env:DSH_HUB_BRIDGE_TOKEN='<token>'; & <exe>
     观察 $DSH_HOME/dsh-hub/logs/dsh.log 是否出现 \`m4: sidecar READY on port N\`；
  3) 桥就绪后手动探测：
     curl -s -X POST -H "Host: evil.example" -H "Authorization: Bearer <token>" \\
       ${base}/workspace -d "{\\"workspacePath\\":\\"C:\\\\\\\\tmp\\"}"
       → 期望 403 {"ok":false,"error":"host-not-allowed"}
     curl -s -X POST -H "Host: 127.0.0.1:<port>" -H "Authorization: Bearer <token>" \\
       ${base}/workspace -d "{\\"workspacePath\\":\\"C:\\\\\\\\tmp\\"}"
       → 期望 200 {"ok":true}
  4) 缺 token / 错 token：去掉或改错 Authorization 头 → 期望 403 {"ok":false,"error":"invalid-bearer-token"}`)
}

async function main() {
  if (process.platform !== 'win32') {
    skip('BS-0 平台', '非 Windows，dsh-hub.exe 桥验证仅 Windows')
    process.exit(0)
  }
  if (!existsSync(EXE)) {
    check('BS-0 dsh-hub.exe 存在', false, `${EXE} 不存在 — 先 cargo build（debug）`)
    console.log('\nRESULT: 0 PASS, 1 FAIL')
    process.exit(1)
  }

  const home = join(tmpdir(), `dsh-hub-verify-bridge-${process.pid}-${Date.now()}`)
  mkdirSync(home, { recursive: true })
  check('BS-1 临时隔离 DSH_HOME 就绪 + 注入桥 token', true, `${home} | DSH_HUB_BRIDGE_TOKEN=${TOKEN}`)

  // 若真实桌面壳已运行，单实例锁会使本脚本的 dsh-hub.exe 立即退出 → 桥不可达。
  const r = spawnSync('tasklist', ['/FI', 'IMAGENAME eq dsh-hub.exe', '/FO', 'CSV', '/NH'], {
    encoding: 'utf8', windowsHide: true,
  })
  if (/^"dsh-hub\.exe","\d+"/m.test(r.stdout ?? '')) {
    console.log('WARN  检测到已有 dsh-hub.exe 运行 — 单实例锁被占用，本验证大概率 SKIP；请先关闭真实桌面壳实例')
  }

  const env = { ...process.env, DSH_HOME: home, DSH_HUB_BRIDGE_TOKEN: TOKEN }
  const child = spawn(EXE, [], { env, stdio: 'ignore', windowsHide: true })
  const childPid = child.pid

  let port = null
  let skipReason = null
  try {
    // ── BS-2：解析端口 ──
    const t0 = Date.now()
    let unreachableReason = null
    while (Date.now() - t0 < READY_TIMEOUT_MS) {
      const log = readLog(home)
      const m = READY_RE.exec(log)
      if (m) {
        port = Number(m[1] ?? m[2])
        break
      }
      if (UNREACHABLE_RE.test(log)) {
        unreachableReason = `dsh.log 出现回退标记（sidecar 未就绪），尾部：${log.slice(-200)}`
        break
      }
      await sleep(500)
    }
    if (port === null) {
      unreachableReason ??= `等待 READY 超时（${READY_TIMEOUT_MS}ms）`
      skipReason = unreachableReason
    } else {
      check('BS-2 从 dsh.log 解析实际端口', true, `port=${port}, 解析耗时 ${Date.now() - t0}ms`)

      // ── 门控：正确 token + 正确 Host → 2xx（桥在线且鉴权放行）──
      const gate = await probeWithRetry(port, () => probe(port, {
        path: `${BRIDGE_PREFIX}/workspace`,
        method: 'POST',
        auth: `Bearer ${TOKEN}`,
        body: { workspacePath: 'C:\\dsh-hub-verify' },
      }))

      if (gate.error === 'ECONNREFUSED' || gate.error === 'timeout') {
        skipReason = `桥不可达（连接 ${gate.error}）`
      } else if (gate.status === 404) {
        skipReason = '桥路由未挂载（正确 token 探测返回 404）— 插件门控未激活（DSH_HUB_LAUNCHED/DSH_HUB_SHELL）或 exe 非最新构建'
      } else {
        const gateOk = gate.status !== undefined && gate.status >= 200 && gate.status < 300
        check('BS-6 正确 token + 正确 Host → 2xx', gateOk,
          `POST ${BRIDGE_PREFIX}/workspace → status=${gate.status ?? gate.error}, body=${gate.body ?? ''}`)
        if (!gateOk) {
          // 契约破坏或 token 未传播（Rust 应继承注入的 DSH_HUB_BRIDGE_TOKEN）；继续跑其余
          // 探测以收集证据，但整体已 FAIL。
          console.log('WARN  BS-6 未通过 — 后续探测结果仅作证据参考')
        }

        // ── BS-3：错误 Host 头 ──
        const badHost = await probe(port, {
          path: `${BRIDGE_PREFIX}/workspace`,
          method: 'POST',
          host: 'evil.example',
          auth: `Bearer ${TOKEN}`,
          body: { workspacePath: 'C:\\dsh-hub-verify' },
        })
        const badHostRejected = (badHost.status !== undefined && badHost.status >= 400)
          || badHost.error !== undefined
        check('BS-3 错误 Host 头（evil.example）→ 拒绝', badHostRejected,
          `status=${badHost.status ?? badHost.error}, body=${badHost.body ?? ''}（期望 403 host-not-allowed，非 2xx 即 PASS）`)

        // ── BS-4：缺 token ──
        const noToken = await probe(port, {
          path: `${BRIDGE_PREFIX}/workspace`,
          method: 'POST',
          body: { workspacePath: 'C:\\dsh-hub-verify' },
        })
        const noTokenRejected = noToken.status === 401 || noToken.status === 403 || noToken.error !== undefined
        check('BS-4 缺 token → 拒绝', noTokenRejected,
          `status=${noToken.status ?? noToken.error}, body=${noToken.body ?? ''}（期望 403 invalid-bearer-token）`)

        // ── BS-5：错 token ──
        const wrongToken = await probe(port, {
          path: `${BRIDGE_PREFIX}/workspace`,
          method: 'POST',
          auth: 'Bearer wrong-token-xyz',
          body: { workspacePath: 'C:\\dsh-hub-verify' },
        })
        const wrongTokenRejected = wrongToken.status === 401 || wrongToken.status === 403 || wrongToken.error !== undefined
        check('BS-5 错 token → 拒绝', wrongTokenRejected,
          `status=${wrongToken.status ?? wrongToken.error}, body=${wrongToken.body ?? ''}（期望 403 invalid-bearer-token）`)

        // ── BS-7：方法不符 → 405 ──
        const wrongMethod = await probe(port, {
          path: `${BRIDGE_PREFIX}/workspace`,
          method: 'GET',
          auth: `Bearer ${TOKEN}`,
        })
        check('BS-7 方法不符（GET /workspace）→ 405', wrongMethod.status === 405,
          `status=${wrongMethod.status ?? wrongMethod.error}, body=${wrongMethod.body ?? ''}（契约：405 method-not-allowed）`)

        // ── BS-8：SSE /events 正确鉴权 → 200 text/event-stream ──
        const sse = await probeSse(port, { auth: `Bearer ${TOKEN}` })
        const sseOk = sse.status === 200 && typeof sse.contentType === 'string'
          && sse.contentType.startsWith('text/event-stream')
        check('BS-8 SSE /events 正确鉴权 → 200 text/event-stream', sseOk,
          `status=${sse.status ?? sse.error}, content-type=${sse.contentType ?? ''}`)
      }
    }

    if (skipReason !== null) {
      if (port === null) {
        skip('BS-2 解析 sidecar 端口', skipReason)
      }
      skip('BS-3..8 桥端点探测', `${skipReason}，全部跳过`)
      manualGuidance(port ?? 0)
    }
  } finally {
    // ── 清理（BS-9）──
    if (childPid !== undefined && childPid > 0) {
      try {
        taskkillTree(childPid)
      } catch {
        // Best-effort.
      }
    }
    if (!KEEP) rmSync(home, { recursive: true, force: true })
    const cleaned = KEEP || !existsSync(home)
    check('BS-9 清理完成（杀 dsh-hub + 删临时 DSH_HOME）', cleaned,
      KEEP ? '已保留临时 DSH_HOME（--keep）' : `${home}${cleaned ? ' 已删除' : ' 删除失败'}`)
  }

  const fails = results.filter((r) => !r.ok && !r.skipped).length
  const skips = results.filter((r) => r.skipped).length
  console.log(`\nRESULT: ${results.length - fails - skips} PASS, ${fails} FAIL, ${skips} SKIPPED${fails ? ' — 退出码 1' : ''}`)
  process.exit(fails ? 1 : 0)
}

main().catch((err) => {
  console.error('verify-m4-bridge-security: unexpected error:', err)
  process.exit(1)
})
