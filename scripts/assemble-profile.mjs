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

import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
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

  // 5. Copy cordis.patch.yml into profile (dsh reads it from profile root).
  const patchSrc = join(packageRoot, 'cordis.patch.yml')
  const patchDst = join(profileDir, 'cordis.patch.yml')
  if (existsSync(patchSrc) && !existsSync(patchDst)) {
    try {
      writeFileSync(patchDst, readFileSync(patchSrc))
      log(`copied cordis.patch.yml to profile root`)
    } catch {}
  }

  log('assembly complete')
  return true
}

if (!assemble()) {
  log('FATAL: assembly failed')
  process.exit(1)
}
