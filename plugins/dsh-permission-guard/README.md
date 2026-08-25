# dsh-permission-guard

逐命令权限白名单 + 四级能力拦截（对标 Zcode `reasonix.toml [permissions].allow` 与 AGENTS.md 四级能力边界）。基于 PR #37 落地修订：补齐 `cordis.patch.yml`、补齐 Windows（pwsh）键位、修复死条目、默认姿态收紧为 confirm、配置读取加缓存。

## 功能

- **逐命令白名单**：`ctx.tools.guard` 在**每次工具执行前**检查「能力键」并匹配白名单，命中即按层放行/拦截。
- **四级语义**：
  | 层级 | 行为 |
  |---|---|
  | `auto` | 可自动执行（放行） |
  | `give-command` | 只给命令不代跑：把命令原样给用户，让用户自己执行（拒绝执行） |
  | `confirm` | 先讲清等确认：说明改什么/为什么/影响，等用户确认（拒绝执行直到确认） |
  | `never` | 红线，绝不执行（硬拒绝） |
- **能力键**：shell 工具按命令粒度 `bash=<cmd>` / `pwsh=<cmd>`；非 shell 工具按工具名 `<toolname>`。支持 `*` 通配。
- **内置工具**：
  - `permission_status`：查看当前白名单（tiers/rules/defaultTier）。
  - `permission_reload`：重新加载配置并强制失效缓存（该操作本身受拦截策略约束，默认需确认——它可能改变策略本身）。

## 挂载

`package.json` 声明 `dsh.bundle.patch: "./cordis.patch.yml"`；把 `@dsh-external/dsh-permission-guard` 加入 profile 的 `dsh.profile.bundles` 即自动挂载（bundle 层 patch 把插件行 `insert` 进装配树）：

```yaml
# 包内 cordis.patch.yml（随包分发，无需手写）
- insert:
    - id: '@dsh-external/dsh-permission-guard'
      name: dsh-permission-guard
```

或（profile 级手工挂载，不依赖 bundle 机制）：

```yaml
# profiles/<name>/cordis.patch.yml
- insert:
    - id: '@dsh-external/dsh-permission-guard'
      name: dsh-permission-guard
```

> 注意：`cordis.patch.yml` 必须是**顶层 YAML 数组**（loader patch 条目）；`plugins:` 映射形式会让 dsh 启动时解析失败（"must be a top-level YAML array"）。

## 配置格式

配置文件：`~/.dsh/permission-guard.json`（`$DSH_HOME` 优先；不存在则首次自动创建默认配置）。

```jsonc
{
  "defaultTier": "confirm",            // 未命中任何规则的默认层级
  "rules": [                           // 兜底规则（tiers 未命中后按序匹配）
    { "match": "bash=*", "tier": "confirm" },
    { "match": "pwsh=*", "tier": "confirm" }
  ],
  "tiers": {
    "auto": [
      "bash=ls*", "bash=cat*", "bash=echo*", "bash=pwd*", "bash=cd*",
      "bash=find*", "bash=grep*", "bash=sed -n*", "bash=node --check*",
      "pwsh=git *", "pwsh=Get-ChildItem*", "pwsh=Get-Content*",
      "pwsh=Write-Output*", "pwsh=Get-Location*", "pwsh=Set-Location*",
      "pwsh=Select-String*", "pwsh=node --check*",
      "pwsh=ls*", "pwsh=cat*", "pwsh=pwd*", "pwsh=cd*", "pwsh=echo*",
      "read", "glob", "grep", "permission_status"
    ],
    "give-command": [
      "bash=rm*", "bash=reg*", "bash=shutdown*", "bash=del /f*", "bash=rd /s*", "bash=taskkill*",
      "pwsh=Remove-Item*", "pwsh=rm*", "pwsh=reg*", "pwsh=shutdown*",
      "pwsh=del /f*", "pwsh=rd /s*", "pwsh=taskkill*"
    ],
    "confirm": [
      "bash=git push*", "bash=git reset*", "bash=curl*", "bash=wget*",
      "bash=chmod*", "bash=chown*", "bash=scp*", "bash=rsync*",
      "pwsh=git push*", "pwsh=git reset*", "pwsh=curl*", "pwsh=wget*", "pwsh=scp*",
      "pwsh=Invoke-WebRequest*", "pwsh=Invoke-RestMethod*"
    ],
    "never": [
      "bash=rm -rf*",
      "pwsh=rm -rf*", "pwsh=format c:*", "pwsh=del /f /s /q c:*", "pwsh=rd /s /q c:*"
    ]
  }
}
```

要点：

- **Windows 主平台键位**：默认会话 shell 是 pwsh，因此每个 `bash=` 模式都有对应的 `pwsh=` 模式；`bash=` 保留用于跨平台（macOS/Linux/WSL）。纯 Windows 红线命令（`format c:` / `del /f /s /q c:` / `rd /s /q c:`）只挂在 `pwsh=` 下——挂在 `bash=` 下在任何环境都不会触发（死条目）。
- **判定优先级**：`tiers` 精确模式（never > confirm > give-command > auto）→ `rules` 兜底（按序，首个命中生效）→ `defaultTier`。
- **`rules` 的意义**：即使把 `defaultTier` 改回 `auto`，未列入白名单的 shell 命令仍会命中 `bash=*`/`pwsh=*` 兜底规则而要求确认。
- 提供自定义 `tiers` 时按层级整体替换该层列表；提供 `rules` 时整体替换默认兜底（置 `[]` 可关闭兜底）。

## 安全提示

- **默认 `confirm`（收紧）**：任何未列入白名单的操作默认需确认；自认环境可信、想恢复 PR 原版「默认放行」姿态时，把 `defaultTier` 改为 `"auto"`（此时 shell 命令仍受 `rules` 兜底约束）。
- `permission_reload` 未列入 `auto`：重载会改变策略本身，默认需确认。
- 配置为明文 JSON 存于用户目录，属「防呆不防人」：它约束 agent 行为，不替代对恶意本地进程的防护。
- 本插件只做拦截判定，不记录/上传任何命令内容。
