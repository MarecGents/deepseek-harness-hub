#!/usr/bin/env node
/**
 * assemble-profile.mjs — T4.2: Extracted from bin/launcher.mjs ensureBundleInstalled.
 *
 * 职责：确保 dsh-hub 插件在 web profile 中正确装配（scoped bundle + junction 自愈）。
 * 供 Rust 壳 Node sidecar 调用（M4 首启装配），也供 verify-m4 断言脚本调用。
 *
 * 用法：node scripts/assemble-profile.mjs [--package-root <path>]
 *   --package-root  指定 junction 目标路径（M5 externalBin 内嵌资产路径；默认 = PACKAGE_ROOT）
 *
 * 退出码：0 = 装配成功（或已就绪），1 = 装配失败
 */

import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const args = process.argv.slice(2)
const pkgRootArg = args.includes('--package-root') ? args[args.indexOf('--package-root') + 1] : null

const BUNDLE_NAME = 'dsh-hub'
const BUNDLE_SCOPED = '@marecgents/dsh-hub'

function dshHome() {
  const env = process.env.DSH_HOME
  return env && env.trim() !== '' ? env.trim() : join(homedir(), '.dsh')
}

function log(msg) { console.log(`[assemble-profile] ${msg}`) }

/**
 * Remove legacy bare-name `dsh-hub` loader rows from a profile's
 * cordis.patch.yml (text-level; never parses YAML so `!!js` expressions in
 * user patches survive untouched). A legacy row looks like
 * `- id: dsh-hub` immediately followed by `name: dsh-hub` (bare). The
 * current bundle row (`id: dsh-hub` + `name: '@marecgents/dsh-hub'`) and any
 * row with a different id are left alone.
 * @param patchPath - absolute path of the profile patch file (may be absent).
 * @returns true when the file was rewritten.
 */
function scrubLegacyPatch(patchPath) {
  if (!existsSync(patchPath)) return false
  let text
  try { text = readFileSync(patchPath, 'utf8') } catch { return false }
  const lines = text.split(/\r?\n/)
  const out = []
  let changed = false
  for (let i = 0; i < lines.length; i++) {
    // A top-level `- insert:` opens a block; collect it with its indented
    // children (and interior blank/comment lines).
    if (/^- insert:\s*(?:#.*)?$/.test(lines[i])) {
      const block = [lines[i]]
      let j = i + 1
      while (j < lines.length
        && (lines[j].startsWith(' ') || lines[j].startsWith('\t')
          || lines[j].trim() === '' || /^\s*#/.test(lines[j]))) {
        block.push(lines[j])
        j++
      }
      const kept = []
      for (let k = 1; k < block.length; k++) {
        const idMatch = /^\s*- id:\s*'?dsh-hub'?\s*$/.exec(block[k])
        if (idMatch && k + 1 < block.length && /^\s*name:\s*'?dsh-hub'?\s*$/.test(block[k + 1])) {
          changed = true
          k += 1
          continue
        }
        kept.push(block[k])
      }
      // Keep the block only if it still has content rows; a block emptied by
      // the scrub (and an already-empty `- insert:`) is dropped wholesale so
      // the patch never carries an inert or malformed insert.
      if (kept.some((l) => /^\s*- /.test(l))) {
        out.push(block[0], ...kept)
      } else if (kept.length > 0) {
        changed = true
      }
      i = j - 1
      continue
    }
    out.push(lines[i])
  }
  if (!changed) return false
  // A profile patch must be a top-level YAML array; if the scrub left only
  // comments/blank lines, emit the standard empty array so dsh boot's
  // loadOverlayPatches does not reject the file (comment-only parses to null).
  const remaining = out.join('\n')
  const hasArrayItem = /^\s*- /m.test(remaining) || /^\s*\[/m.test(remaining)
  if (!hasArrayItem) out.push('[]')
  try {
    writeFileSync(patchPath, out.join('\n') + (text.endsWith('\n') ? '\n' : ''), 'utf8')
  } catch (e) {
    log(`patch scrub write failed: ${e.message}`)
    return false
  }
  log('removed legacy bare-name dsh-hub loader row from profile cordis.patch.yml (duplicate-loader fix)')
  return true
}

function assemble() {
  const profileDir = join(dshHome(), 'profiles', 'web')
  const manifestPath = join(profileDir, 'package.json')

  // 1. Read or create profile manifest.
  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    mkdirSync(profileDir, { recursive: true })
    manifest = {
      name: 'dsh-profile-web',
      private: true,
      dependencies: {},
      dsh: { profile: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'] } },
    }
  }
  const bundles = manifest.dsh?.profile?.bundles ?? []

  // 2. Register scoped name (drop bare name).
  const nmDir = join(profileDir, 'node_modules')
  const scopedDir = join(nmDir, '@marecgents')
  const scopedLink = join(scopedDir, 'dsh-hub')
  const bareLink = join(nmDir, BUNDLE_NAME)

  if (!bundles.includes(BUNDLE_SCOPED)) {
    const cleaned = bundles.filter(name => name !== BUNDLE_NAME)
    cleaned.push(BUNDLE_SCOPED)
    manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: cleaned } }
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
    log(`registered ${BUNDLE_SCOPED} in the web profile`)
  } else if (bundles.includes(BUNDLE_NAME)) {
    const cleaned = bundles.filter(name => name !== BUNDLE_NAME)
    manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: cleaned } }
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
    log(`removed legacy bare-name ${BUNDLE_NAME}`)
  } else {
    log(`${BUNDLE_SCOPED} already registered`)
  }

  // 3. Scoped junction self-heal (T4.2: DSH_HUB_PACKAGE_ROOT overrides PACKAGE_ROOT).
  const packageRoot = pkgRootArg || process.env.DSH_HUB_PACKAGE_ROOT || join(homedir(), '.dsh', 'dsh-hub', 'lib')
  mkdirSync(scopedDir, { recursive: true })

  try {
    const stat = lstatSync(scopedLink)
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      log(`found real directory at scoped link (pnpm or manual copy), using as-is`)
    } else {
      const current = readlinkSync(scopedLink)
      if (current.replace(/^\\\\\?\\/, '').replace(/\/+$/, '').toLowerCase()
        === packageRoot.replace(/^\\\\\?\\/, '').replace(/\/+$/, '').toLowerCase()) {
        log(`scoped junction already points to ${packageRoot}`)
      } else {
        rmSync(scopedLink, { recursive: true, force: true })
        symlinkSync(packageRoot, scopedLink, 'junction')
        log(`relinked ${BUNDLE_SCOPED} → ${packageRoot}`)
      }
    }
  } catch {
    symlinkSync(packageRoot, scopedLink, 'junction')
    log(`linked ${BUNDLE_SCOPED} → ${packageRoot}`)
  }

  // 4. Remove legacy bare-name junction.
  try {
    const bareStat = lstatSync(bareLink)
    if (bareStat.isSymbolicLink()) {
      rmSync(bareLink, { recursive: true, force: true })
      log(`removed legacy bare-name junction ${BUNDLE_NAME}`)
    }
  } catch {}

  // 5. NOTE: 不复制 cordis.patch.yml 到 profile。
  //    包的 cordis.patch.yml 含 `- insert: - id: dsh-hub` 行；bundles 条目
  //    （步骤 2）与 patch insert 是同一插件的两条装载路径，同时存在 =
  //    dsh 启动即崩 "duplicate loader entry id: dsh-hub"。
  //    launcher.ensureBundleInstalled（bin/launcher.mjs）从不复制 patch，
  //    bundles 是唯一装载机制（rc.14+ 实测），此处保持一致。
  //    若用户 profile 需要自定义 patch（如 MCP 配置），自行维护
  //    profiles/web/cordis.patch.yml，本脚本不覆盖。

  // 5.1 Scrub legacy bare-name dsh-hub loader rows from the profile patch.
  //    rc.8 初始化卡死根因（2026-08-25 隔离复现）：旧安装（WebView2 时代
  //    launcher / 早期 rc）可能在 profiles/web/cordis.patch.yml 残留
  //    `- insert: - id: dsh-hub / name: dsh-hub`（裸名）。rc.8 插件包自身 patch
  //    （_up_/cordis.patch.yml）也插入 `id: dsh-hub`（scoped name）——两个
  //    loader entry 同 id → cordis 抛 "duplicate loader entry id: dsh-hub" →
  //    dsh web 启动即崩 → 壳卡在初始化界面。此处仅移除「name 为裸名 dsh-hub」
  //    的 legacy 行（保留 id 为 dsh-hub 但 name 为 scoped 的正式行，以及用户
  //    其他 id 的 patch），对用户自定义 patch 零影响。
  scrubLegacyPatch(join(profileDir, 'cordis.patch.yml'))

  // 6. Assemble plugins/ (dual-track: bundled with hub, registered as bundles).
  //    Junction each plugin into profile node_modules/@dsh-external/<name> and
  //    register the scoped name as a bundle entry (same mechanism as dsh-hub
  //    itself). Failures are non-fatal — hub assembly stays intact.
  try {
    const pluginsDir = existsSync(join(packageRoot, 'plugins'))
      ? join(packageRoot, 'plugins')
      : join(packageRoot, '..', '_up_', 'plugins')
    if (existsSync(pluginsDir)) {
      const extsDir = join(nmDir, '@dsh-external')
      mkdirSync(extsDir, { recursive: true })
      for (const entry of readdirSync(pluginsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const pluginPath = join(pluginsDir, entry.name)
        const pkgPath = join(pluginPath, 'package.json')
        if (!existsSync(pkgPath)) continue
        let pkgName
        try { pkgName = JSON.parse(readFileSync(pkgPath, 'utf8')).name } catch { continue }
        if (typeof pkgName !== 'string' || !pkgName.startsWith('@')) continue
        const link = join(extsDir, entry.name)
        if (!existsSync(link)) {
          try { symlinkSync(pluginPath, link, 'junction'); log(`plugin junction ${pkgName}`) }
          catch (e) { log(`plugin junction ${entry.name} skipped: ${e.message}`) }
        }
        if (!bundles.includes(pkgName)) {
          const all = [...(manifest.dsh?.profile?.bundles ?? []), pkgName]
          manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: all } }
          writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
          log(`registered plugin bundle ${pkgName}`)
        }
      }
    }
  } catch (e) {
    log(`plugin assembly skipped: ${e.message}`)
  }

  log('assembly complete')
  return true
}

if (!assemble()) {
  log('FATAL: assembly failed')
  process.exit(1)
}
