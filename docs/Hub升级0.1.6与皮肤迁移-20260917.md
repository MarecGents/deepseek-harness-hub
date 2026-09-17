# Hub 升级 0.1.6 + Reasonix 皮肤迁移 — 交接文档

**日期**：2026-09-17
**目标仓库**：`G:\DSH\MarecGents-hub`
**状态**：✅ 已完成并验证（SDK 树最终为 dsh **0.1.6-alpha.1**）

---

## 零、SDK 树版本变更记录（2026-09-17 追加）

用户追加要求「升 0.1.6-alpha.1」，已完成：

| 项 | 变更前 | 变更后 |
|----|--------|--------|
| SDK 树位置 | `D:\1111YINYONG\dsh-012-sdk` | `D:\1111YINYONG\dsh-016-sdk`（新隔离前缀） |
| dsh 版本 | 0.1.2-rc.1（223+2 包） | **0.1.6-alpha.1（247 包，全量统一）** |
| junction 指向 | dsh-012-sdk | dsh-016-sdk |
| Hub 源码改动 | — | `right-sidebar.tsx` 3 处：`IconSendOutline16` → `IconSendOutline14` |

**唯一兼容性破坏点**：0.1.6-alpha.1 移除了 `IconSendOutline16`（只保留 14 尺寸版）。
Hub 用到 31 个图标名，实测只有这 1 个缺口，其余 30 个全部存在（`IconApplyFailed`/`IconFailed`/`IconHint` 是 i18n 字符串键，非图标导入）。

**验证结果（0.1.6-alpha.1 下）**：tsc 双检查零报错、tsdown bundle 1.05 MB、22 skins、`cargo check` 2.13s 通过。

**注意**：`D:\1111YINYONG\dsh-016` 是你原有的 0.1.6-alpha.1 双内核**测试环境**（独立 home + 前缀），本次**未改动它**——新建了独立的 `dsh-016-sdk` 目录专供 Hub 构建用。

---

## 一、背景与关键事实核实

### 1.1 用户诉求
「HUB 直接升 0.1.6」、「是官方的 0.1.6 版本」

### 1.2 核实结果（重要澄清）

| 事实 | 实测证据 |
|------|----------|
| **官方 dsh 没有 0.1.6 正式版** | `npm view @deepseek-ai/dsh dist-tags` → `{alpha: "0.1.6-alpha.1", latest: "0.1.5-rc.1", next: "0.1.5-rc.2"}`；`dsh@0.1.6` → E404 |
| **Hub 0.1.6 是官方归档版** | `package.json` version=0.1.6，`src-tauri/tauri.conf.json` version=0.1.6；dev-v2 归档点 `4cef0a8` |
| **Hub 0.1.6 配套 SDK 是 dsh 0.1.2-rc.1** | `.github/workflows/frontend.yml:62` → `npm install -g @deepseek-ai/dsh@0.1.2-rc.1` |
| **仓库已归档** | README：「项目已归档（2026-09-08），停止主动开发」 |

**结论**：用户说的「官方 0.1.6」= 官方仓库的 0.1.6 归档版本（Hub 自身版本号），不是 dsh 内核版本。Hub 0.1.6 要求 dsh 内核 ≥0.1.2-rc.1。

### 1.3 升级前状态

| 项 | 值 |
|----|-----|
| 本地 HEAD | `1e6494a`（0.1.4，2026-09-01） |
| 落后 origin/main | 46 个提交 |
| 已安装 dsh 内核 | 0.1.5-rc.2（全局），profile 独立树 0.1.5-rc.2 |
| Rust 工具链 | rustc 1.97.1 + MSVC BuildTools ✓ |
| node | v26.4.0 ✓ |
| 本地未提交改动 | ① 我的 7 套 Reasonix 皮肤（skins.ts/locale.ts）② token 导航补丁（node.rs/lib.rs）③ AGENTS.md 记录行 ④ lib/ 构建产物 |

---

## 二、方案设计与决策

### 2.1 关键决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 分支 | `origin/main`（= dev-v2 归档点） | main 与 dev-v2 完全同步（同 `4cef0a8`），无分叉 |
| 升级方式 | `git merge --ff-only` | 本地是 origin/main 祖先，可快进，无冲突风险 |
| SDK 树 | 装到隔离前缀 `D:\1111YINYONG\dsh-012-sdk` | **绝不动全局 dsh**——`dsh-launcher` 依赖 `npm-global/.../dsh/lib/bin.js`，改了会挂掉日常入口 |
| 皮肤改动保全 | `git stash` → 升级 → `stash pop` | skins.ts 在 0.1.4→0.1.6 之间**零差异**，可原样重放 |
| token 补丁 | **丢弃**（不重放） | 0.1.6 已原生实现（`lib.rs:915-919` + `node.rs` 28 处 token 处理） |

### 2.2 SDK 树版本选择的曲折

| 尝试 | 结果 |
|------|------|
| 用全局 dsh 0.1.5-rc.2 树 | ❌ 缺 `installSection`（0.1.2-rc.1 起新增的 API），且缺 `dsh-client-modules` 的 ui-slots/ui-primitives |
| 用 dsh-016 树（0.1.6-alpha.1） | ❌ 同样缺 ui-slots/ui-primitives |
| **装 dsh 0.1.2-rc.1 到隔离前缀** | ✅ 与 Hub CI 一致，`installSection` 存在，ui-slots/ui-primitives 从 npm 补装成功 |

**注意**：`ui-slots` / `ui-primitives` 在 dsh CLI 的 vendored 树里**不存在**，需从 npm 单独装（0.1.2-rc.1 版本在 npm 可得）。`schema-form` / `web-react` / `apiproxy` / `compact` / `paths` 在 build-client 的 SDK_PACKAGES 列表里但**无 0.1.2-rc.1 版本**，脚本会自动跳过（`if (!existsSync(source)) continue`），不影响构建。

---

## 三、实施步骤（已执行）

```bash
# 1. 备份（双保险）
cd G:/DSH/MarecGents-hub
git branch backup/local-0.1.4-20260917        # 备份分支 → 1e6494a

# 2. 暂存全部本地改动
git stash push -m "hub-rx-skins-0.1.4-base" src/client/skins.ts src/client/locale.ts
git stash push -m "local-0.1.4-rest-20260917"

# 3. 快进升级（46 提交）
git fetch origin && git merge --ff-only origin/main     # → 4cef0a8 (0.1.6)

# 4. 恢复皮肤改动
git stash pop stash@{1}                        # skins.ts + locale.ts 干净应用

# 5. 建隔离 SDK 树（不碰全局 dsh）
mkdir -p D:/1111YINYONG/dsh-012-sdk
npm install @deepseek-ai/dsh@0.1.2-rc.1
npm install @deepseek-ai/dsh-client-ui-slots@0.1.2-rc.1 \
            @deepseek-ai/dsh-client-ui-primitives@0.1.2-rc.1

# 6. 替换 Hub 的 SDK 树（旧实体树改名保留，非删除）
cd G:/DSH/MarecGents-hub
mv node_modules/@deepseek-ai node_modules/@deepseek-ai.old-0.1.0rc6
cmd //c "mklink /J G:\DSH\MarecGents-hub\node_modules\@deepseek-ai D:\1111YINYONG\dsh-012-sdk\node_modules\@deepseek-ai"

# 7. 构建验证
npm run build          # tsc ×2 → 零报错
npm run build:client   # tsdown → lib/client.js 1.05 MB
node scripts/export-skin-colors.mjs   # 22 skins（CI 门禁）
cargo check --manifest-path src-tauri/Cargo.toml   # Rust 壳编译通过
```

---

## 四、验收标准（全部达成）

| # | 标准 | 结果 | 证据 |
|---|------|------|------|
| 1 | 版本升到 0.1.6 | ✅ | `package.json` + `tauri.conf.json` 均 0.1.6 |
| 2 | 类型检查零报错 | ✅ | `npm run build` 双 tsc 通过 |
| 3 | client bundle 构建成功 | ✅ | `lib/client.js` 1,048,900 bytes |
| 4 | 7 套 Reasonix 皮肤进入产物 | ✅ | `grep rx-core\|rx-graphite\|…` 7/7 命中 |
| 5 | CI 皮肤色门禁通过 | ✅ | `export-skin-colors.mjs` → 22 skins |
| 6 | Rust 壳编译通过 | ✅ | `cargo check` Finished in 6.56s |
| 7 | 未破坏全局 dsh | ✅ | 隔离前缀安装，`npm-global` 未改动 |
| 8 | 原有 15 套皮肤未删 | ✅ | 22 = 原 15 + 新 7 |

**唯一 FAIL**：`verify-release.mjs` 的 P3（lib/ 未提交）——这是**发布门禁**，要求 lib/ 提交进 git 才能发 npm。本地使用不需要，可忽略。

---

## 五、剩余问题与后续动作

### 5.1 待处理

1. **stash@{0} 未清理**：`local-0.1.4-rest-20260917`，含 ① AGENTS.md 记录行 ② token 补丁 ③ package.json peerDeps 放宽。
   - token 补丁：**已被 0.1.6 原生取代**，可丢
   - package.json peerDeps：0.1.6 已是 `^0.1.2-rc.1`，无需重放
   - AGENTS.md 行：是用户自己的记录，**建议保留**（下方命令）

2. **旧 SDK 树残留**：`node_modules/@deepseek-ai.old-0.1.0rc6`（9.7 MB），验证稳定后可删

3. **皮肤尚未在任何运行环境生效**：需要装进 dsh profile 或跑 Tauri dev 才能看到

### 5.2 后续命令

```bash
# 恢复 AGENTS.md 那行（如需要）
cd G:/DSH/MarecGents-hub
git stash show -p "stash@{0}" -- AGENTS.md | git apply

# 查看效果（方式 A：独立开发窗口）
npm run tauri:dev      # 注意：需要 dsh 运行环境

# 方式 B：装进现役 profile（会碰日常环境，需单独确认）
# ~/.dsh/profiles/web/ 下挂载 @marecgents/dsh-hub
```

### 5.3 构建环境备忘（踩坑）

- **`npm install` 会清掉 `node_modules/@deepseek-ai` 的 junction**（Hub 踩坑 #19）→ 装完必须重建 junction 再跑 `build:client`
- **`npm run build:client` 依赖全局/指定的 dsh SDK 树**；本机已固化为 `D:\1111YINYONG\dsh-012-sdk`（dsh 0.1.2-rc.1）
- **不要动全局 `D:\1111YINYONG\npm-global\node_modules\@deepseek-ai\dsh`**——`dsh-launcher` 靠它启动日常 DSH 环境

---

## 六、改动文件清单

| 文件 | 改动 | 行数 |
|------|------|------|
| `src/client/skins.ts` | 新增 `ReasonixCore` 接口 + `reasonixPalette()` / `reasonixSkin()` 映射函数 + 7 条 `reasonixSkin(...)` 调用 | +280 |
| `src/client/locale.ts` | 中英词典各 +14 条（7 皮肤 × name/desc） | +28 |
| `src-tauri/src/skin-colors.json` | 由 `export-skin-colors.mjs` 自动生成（22 skins） | +70 |
| `lib/*` | 构建产物（已跟踪，P3 门禁要求提交） | 自动 |

**未改动**：Hub 架构、Rust 壳逻辑、组件功能、主题切换机制、原有 15 套皮肤。
