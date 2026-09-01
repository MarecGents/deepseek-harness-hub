# PUBLISH.md — dsh-hub 打包发布流程约束（复用文档）

> 本文件沉淀自 2026-08-29~30 的完整发布历史（rc.11 → rc.18 → 0.1.0 → 0.1.1，含多次发布纠错），
> 是 **BUILD.md 的发布执行配套**：只讲「执行顺序、坑、必查项」。BUILD.md 讲工具链/打包机制，本文件讲发布纪律。
> 版本纪律：**任何发布动作前先读本文件 + BUILD.md §7.5。**
> **发布档位**：每次发布由仓库所有者指定档位（T1 快速修复 / T2 候选 / T3 正式）——T1 仅打包+推送 dev-v2，不发布 npmjs、不 merge main、不写更新日志；T2/T3 按指定补全（见 BUILD.md §7.4）。

## 1. 发布总流程（固定顺序，缺一不可）

```text
1. 版本 bump：package.json / package-lock.json（根 + packages[""] 两处）/ src-tauri/tauri.conf.json 三处一致
   （Cargo.toml 恒为 0.0.0 勿动）；README/FUNCTIONS.md 头部版本状态同步
2. 门禁：npm run build（tsc 零错误）→ npm run build:client（新 bundle 就位）→
   cargo fmt --check / cargo clippy --all-targets -- -D warnings / cargo test（18 个全绿）
3. 提交（commit 必须包含 lib/ 重建产物，见坑 1）→ node scripts/verify-release.mjs 必须 ALL PASS
4. npm run build:installer（NSIS + SHA256 校验，产物复制回 build/<version>/）
5. 发布：npm publish --tag latest --registry=https://registry.npmjs.org/ → npm dist-tag add <pkg>@<ver> rc
6. git tag v<version> → push tag；push dev-v2 → checkout main → merge dev-v2（fast-forward）→ push main → 回 dev-v2
7. 更新 docs/打包记录.md（合订本追加一节）+ 踩坑记录（如新坑）+ 更新日志（GitHub Release 手动发布，仓库所有者执行）
```

## 2. 硬性纪律

- **版本三处一致、Cargo.toml 不动**；产物名 / build/<version>/ / NSIS 全按 version。
- **lib/ 必须随提交**：`verify-release P3`（lib 零漂移）在未提交 lib 时 FAIL——先提交再 verify 是惯例（不是 bug）。
- **发布前不得有未提交改动**（P3 tree clean）；`npm i` 新依赖会清 SDK junction，必须重跑 build:client。
- **npm prerelease 版本必须显式 --tag**（`npm publish` 裸跑对 0.0.2-rc.* 直接 E403/报错）；stable 版 `--tag latest`。
- **npm publish 后 packument CDN TTL ≈ 5 分钟**：立即 `npm view` 会看到旧值/404，**勿重试发布**，等 3-5 分钟用注册表直查确认。
- **tag 打在 release 提交（版本 bump+lib 就位后的那个提交）**；打错（打在 bump 前）必须 `git tag -d` + `git push origin :refs/tags/<tag>` 重打。
- **main 永远 fast-forward**（dev-v2 是 main 后代时直接 merge）；有分叉先处理，禁止强推 main。
- **dev-v1（WebView2 时代）永久冻结**不接收任何更新；0.0.1-rc.* 系列历史归档。
- **数据安全**：测试/复现一律隔离 DSH_HOME，禁止碰真实 ~/.dsh；重启实例前 kill 干净（非 quit.marker 强杀会被 launcher 判崩溃重启）。

## 3. 发布后必查（闭环验证）

- `npm dist-tag` registry 直查：latest 与 rc 都指向新版本（`npm view` 走 CDN 可能旧，用 `curl -s https://registry.npmjs.org/<pkg> | jq .dist-tags` 直查）。
- `git tag` / `git push origin v<tag>` 成功；`git log main --oneline -1` 等于 release 提交。
- **安装包 SHA256 与打包记录一致**；真机安装覆盖升级验证新功能面（发布记录里写明验收要点）。

## 4. 发布历史踩坑速查（按 0.0.2-rc.14 之后）

| 坑 | 现象 | 正确做法 |
|---|---|---|
| publish 无 --tag（prerelease） | `npm error You must specify a tag using --tag` | 显式 `--tag latest`（或 rc） |
| dist-tag add 后 npm view 旧值 | packument CDN TTL ~5min | 等待 + registry 直查；**不要重复发布** |
| verify P3 FAIL（lib 未提交） | `FAIL P3 no uncommitted lib/ drift` | 先提交含 lib 的改动再 verify |
| tag 打在错误提交 | describe 显示 tag 前的 commit | 删 tag 重打（本地 + 远端） |
| 打包记录散落 12 个文件 | docs 混乱 | 已合订为 docs/打包记录.md（0.1.0 起追加节） |
| rc 版不发布但有 latest 指向旧 | latest/rc 漂移用户困惑 | 明确每次发布是 latest+rc 双写还是仅 rc |
| 正式版版本号带 v | npm 版本不能带 v（v0.1.0 会 404） | npm 用 `0.1.0`，git tag 用 `v0.1.0` |

## 5. 变更与回退

- **发布记录**：追加到 [docs/打包记录.md](docs/打包记录.md)（含索引行 + 完整章节，标题 `## 打包记录 <ver>`）。
- **更新日志**：GitHub Release 由仓库所有者手动发布；格式参照 latest Release（新增/修复/变更/优化/移出 五节，含 rc 归属）。
- **回退**：npm 错误版本 → `npm unpublish <ver>`（仅 72h 内可用）/ 发新版本覆盖 latest；git 错误 → 重置分支 + 强推须慎重（main 绝不强推）。

## 6. 版本号策略

- `0.x.y` stable（正式版）：latest + rc 双 tag 都指向；tag `v0.x.y`；发布 npm + NSIS。
- `0.0.2-rc.N`：rc 预览（npm latest/rc 策略由仓库所有者按次指定，默认 rc 双写）。
- 正式版前置：verify-release ALL PASS + 真机验证清单过（BUILD.md §5.2）。

## 7. 快速命令模板

```sh
# 门禁
npm run build && npm run build:client
cargo fmt --check && cargo clippy --all-targets -- -D warnings && cargo test
# 提交 → verify → 打包
git add -A && git commit -m "chore(release): bump <ver> …"
node scripts/verify-release.mjs
npm run build:installer
# 发布
npm publish --tag latest --registry=https://registry.npmjs.org/
npm dist-tag add @marecgents/dsh-hub@<ver> rc --registry=https://registry.npmjs.org/
git tag v<ver> && git push origin v<ver>
git push origin dev-v2 && git checkout main && git merge dev-v2 && git push origin main && git checkout dev-v2
# 确认
curl -s "https://registry.npmjs.org/@marecgents%2fdsh-hub" | python -c "import json,sys; print(json.load(sys.stdin)['dist-tags'])"
```

> 关联：BUILD.md（工具链/一键打包机制）、AGENTS.md（开发红线）、docs/关键踩坑记录.md（逐坑详情）。
> 本文档随每次发布复盘更新（新增坑 → 加入 §4 表）。
