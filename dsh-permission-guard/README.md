# dsh-permission-guard

DSH 插件：逐命令 allowlist + 四级能力拦截（对标 Zcode 的 reasonix.toml 权限白名单）。

四级能力边界：
- auto         可自动执行（放行）
- give-command 只给命令不代跑（拒绝执行，提示用户手动跑）
- confirm      先讲清等确认（拒绝执行，提示需确认）
- never        红线，绝不（拒绝执行，硬禁止）

机制：注册全局 `tools.guard()`，每次工具执行前按「能力键」匹配白名单。
配置：`~/.dsh/permission-guard.json`（默认自动创建，支持 `*` 通配）。
零外部运行时依赖。
