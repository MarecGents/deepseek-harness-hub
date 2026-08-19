#!/usr/bin/env node
/**
 * dsh-web-sidecar.mjs — M4/T4.3 辅助脚本（M5 externalBin 场景预留）。
 *
 * 职责（保持精简可运行）：
 *   ① 解析 DSH_HOME（DSH_HOME env 或默认 ~/.dsh）；
 *   ② 调用 scripts/assemble-profile.mjs（spawn node，传 DSH_HOME +
 *      DSH_HUB_PACKAGE_ROOT=<repo 根>）确保 web profile 装配（scoped bundle +
 *      junction 自愈，幂等）；
 *   ③ 探测/解析 node 路径：优先 DSH_HUB_NODE env → PATH 里 node →
 *      `npm prefix -g` 下 node；
 *   ④ 解析 dsh 入口：`npm prefix -g` 下 @deepseek-ai/dsh（lib/bin.js）或
 *      dsh 命令（dsh.cmd / dsh.exe / dsh，prefix 与 PATH 两处找）；
 *   ⑤ 输出 JSON 摘要 {dshHome, nodePath, dshEntry, assembled}。
 *
 * 模块类别：Helper（bin 层辅助；独立运行，M5 externalBin 由 Rust 壳调用）。
 * 对外接口：
 *   node bin/dsh-web-sidecar.mjs [--json]
 *     stdout — 纯 JSON（默认单行；--json 格式化多行），供调用方解析；
 *     stderr — 人类可读诊断（含 assemble-profile 日志转发）；
 *     退出码 — 0 = 装配成功（node/dsh 未解析到仅 stderr 告警，不失败）；
 *              1 = 装配失败或脚本错误。
 *
 * 测试：DSH_HOME=<临时目录> node bin/dsh-web-sidecar.mjs
 * Windows 专属注意：spawn 一律 windowsHide（CREATE_NO_WINDOW，防控制台闪现）。
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repo root — also the DSH_HUB_PACKAGE_ROOT for profile assembly. */
const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
/** The profile assembly script this sidecar drives (T4.2 semantics). */
const ASSEMBLE_SCRIPT = join(REPO_ROOT, 'scripts', 'assemble-profile.mjs')
/** npm global prefix cache (spawned once per run). */
let npmPrefixCache = null

/**
 * Resolve $DSH_HOME (trimmed env or ~/.dsh), mirroring assemble-profile.mjs.
 * @returns {string} resolved DSH_HOME path.
 */
function resolveDshHome() {
  const env = process.env.DSH_HOME
  return env && env.trim() !== '' ? env.trim() : join(homedir(), '.dsh')
}

/**
 * Query `npm prefix -g`. On Windows npm is a .cmd shim, so it goes through
 * cmd.exe (CREATE_NO_WINDOW via windowsHide). Result is cached per run.
 * @returns {string|null} npm global prefix, or null when unavailable.
 */
function npmGlobalPrefix() {
  if (npmPrefixCache !== null) return npmPrefixCache
  const run = process.platform === 'win32'
    ? spawnSync('cmd', ['/d', '/s', '/c', 'npm prefix -g'], { encoding: 'utf8', windowsHide: true, timeout: 15_000 })
    : spawnSync('npm', ['prefix', '-g'], { encoding: 'utf8', timeout: 15_000 })
  const prefix = (run.stdout ?? '').trim()
  npmPrefixCache = prefix !== '' && existsSync(prefix) ? prefix : null
  return npmPrefixCache
}

/** PATH directories split by the platform separator (quotes stripped). */
function pathDirs() {
  const sep = process.platform === 'win32' ? ';' : ':'
  return (process.env.PATH ?? '')
    .split(sep)
    .map((d) => d.trim().replace(/^"(.*)"$/, '$1'))
    .filter(Boolean)
}

/**
 * Resolve the node executable to run dsh web (M5 externalBin target).
 * Priority: DSH_HUB_NODE env → node in PATH → node under `npm prefix -g`.
 * @returns {string|null} absolute node path, or null when not found.
 */
function resolveNodePath() {
  const candidates = []
  const envNode = process.env.DSH_HUB_NODE
  if (envNode && envNode.trim() !== '') candidates.push(envNode.trim())
  const nodeName = process.platform === 'win32' ? 'node.exe' : 'node'
  for (const dir of pathDirs()) candidates.push(join(dir, nodeName))
  const prefix = npmGlobalPrefix()
  if (prefix) candidates.push(join(prefix, nodeName))
  return candidates.find(existsSync) ?? null
}

/**
 * Resolve the dsh CLI entry (mirrors bin/hub-exe.mjs resolveDshEntry).
 * Priority: `npm prefix -g`/node_modules/@deepseek-ai/dsh/lib/bin.js →
 * dsh command in the npm-global prefix → dsh command in PATH.
 * @returns {string|null} JS entry or command shim path, or null.
 */
function resolveDshEntry() {
  const prefix = npmGlobalPrefix()
  if (prefix) {
    const jsEntry = join(prefix, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
    if (existsSync(jsEntry)) return jsEntry
    for (const name of ['dsh.cmd', 'dsh.exe', 'dsh']) {
      const candidate = join(prefix, name)
      if (existsSync(candidate)) return candidate
    }
  }
  for (const dir of pathDirs()) {
    for (const name of ['dsh.cmd', 'dsh.exe', 'dsh']) {
      const candidate = join(dir, name)
      if (existsSync(candidate)) return candidate
    }
  }
  return null
}

/**
 * Ensure the web profile is assembled by spawning assemble-profile.mjs with
 * DSH_HOME + DSH_HUB_PACKAGE_ROOT=<repo root>. Its logs are forwarded to
 * stderr so stdout stays pure JSON. Idempotent (scoped bundle + junction
 * self-heal, T4.2).
 * @param {string} home - resolved DSH_HOME.
 * @returns {boolean} true when the script exited 0.
 */
function assembleProfile(home) {
  const run = spawnSync(process.execPath, [ASSEMBLE_SCRIPT], {
    env: { ...process.env, DSH_HOME: home, DSH_HUB_PACKAGE_ROOT: REPO_ROOT },
    encoding: 'utf8',
    windowsHide: true,
    timeout: 60_000,
  })
  for (const stream of [run.stdout, run.stderr]) {
    if (stream && stream.trim() !== '') process.stderr.write(stream)
  }
  if (run.error) process.stderr.write(`[dsh-web-sidecar] assemble-profile error: ${run.error.message}\n`)
  return run.status === 0
}

const pretty = process.argv.includes('--json')
const home = resolveDshHome()

if (!assembleProfile(home)) {
  process.stderr.write('[dsh-web-sidecar] FATAL: profile assembly failed\n')
  process.exit(1)
}

const nodePath = resolveNodePath()
const dshEntry = resolveDshEntry()
if (!nodePath) {
  process.stderr.write('[dsh-web-sidecar] WARN: node not found (DSH_HUB_NODE / PATH / npm prefix -g)\n')
}
if (!dshEntry) {
  process.stderr.write('[dsh-web-sidecar] WARN: dsh entry not found (@deepseek-ai/dsh or dsh command)\n')
}

const summary = { dshHome: home, nodePath, dshEntry, assembled: true }
process.stdout.write(pretty ? `${JSON.stringify(summary, null, 2)}\n` : `${JSON.stringify(summary)}\n`)
process.exit(0)
