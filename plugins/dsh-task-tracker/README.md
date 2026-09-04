# dsh-task-tracker

任务状态追踪（对标 ZCode 的 TodoWrite：显式任务列表 + 状态管理，解决长对话中模型丢失任务状态的问题）。

## 功能
- **上下文注入**：`systemPrompt.context` 每次模型步把工作区 `.dsh-memory/TASKS.md` 的未完成任务（带状态/优先级标记）+ 完成统计注入运行时上下文——模型始终知道"现在在干嘛、还剩什么"。
- **任务工具**：`task_create` / `task_update` / `task_complete` / `task_list`（创建返回自增 id `T-N`；更新/完成用 id 定位；列表含已完成项）。
- **跨会话存活**：任务落盘 `<workspace>/.dsh-memory/TASKS.md`，会话结束不丢，下次会话自动加载。

## 任务格式
```markdown
- [ ] T-1 | high | 实现登录页
- [~] T-2 | medium | 写单元测试
- [x] T-3 | low | 初始化仓库
```
状态：`[ ]` pending / `[~]` in_progress / `[x]` completed；优先级 high（🔴）/ medium（🟡）/ low（⚪）。

## 挂载（profile 级）
纯 host 插件，无 client 产物（`exports` 仅 `.`）——插件自带 `cordis.patch.yml`（声明于 `package.json` 的 `dsh.bundle.patch`），内容即挂载行。与 `dsh-project-memory` 共用 `.dsh-memory/` 目录，互不冲突（文件名不重叠）。

## 数据与隐私
- 数据写 `<workspace>/.dsh-memory/TASKS.md`——**会在项目目录留下明文文件**。请把 `.dsh-memory/` 加入项目 `.gitignore`：
```gitignore
.dsh-memory/
```
- 如需关闭，从 profile 移除挂载即可。

## 配置（Config）
当前无配置项（`Config = undefined`）。
