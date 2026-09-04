# dsh-project-memory

每项目持久记忆（对标 ZCode 的记忆库：`MEMORY.md` 索引 + `memories/<slug>.md` 单记忆文件 + `FACT.md` 耐久事实 + `JOURNAL.jsonl` 反馈流）。

## 功能
- **自动加载**：`systemPrompt.context` 每次模型步把当前工作区 `.dsh-memory/` 的 **MEMORY.md 索引** + `FACT.md` + `JOURNAL.jsonl` 尾部注入运行时上下文（会话启动即生效，无需显式读文件）。带 **per-cwd (mtime, size) 缓存**：三个文件未变更时直接返回缓存文本，只在变更时重读盘，避免每步同步读文件。
- **索引式记忆**：`memory_save` 把成块的知识/决策/教训写成 `memories/<slug>.md`（带 name/description/type frontmatter）并自动登记进 `MEMORY.md` 索引；`memory_read name="<slug>"` 按需读单条全文——索引常驻上下文、正文按需加载，长项目不爆 token。
- **工具写回**：`memory_save` / `memory_read` / `memory_log` / `memory_fact`（索引式记忆、单条读、追加 JSONL 日志、写 FACT.md 并去重）。
- **自动沉淀**：`turn/end` 自动把 breadcrumb 追加进 `JOURNAL.jsonl`；`session/disposed` 时记录会话结束。

## 存储布局
```
<workspace>/.dsh-memory/
├── MEMORY.md      # 索引：- [slug](memories/slug.md) — 摘要（每次会话注入）
├── memories/      # 单条记忆全文（按需 memory_read 读取）
│   └── <slug>.md  # frontmatter: name / description / type
├── FACT.md        # 耐久事实（一行式，整体注入）
└── JOURNAL.jsonl  # 反馈流（带时间戳，尾部注入）
```

## 挂载（profile 级）
纯 host 插件，无 client 产物（`exports` 仅 `.`）——通过 profile 级 `cordis.patch.yml` 的 `plugins` 段挂载：
```yaml
plugins:
  - id: '@dsh-external/dsh-project-memory'
    name: dsh-project-memory
```
（需先装入 profile 的 node_modules；或并入 dsh-hub 仓库后随 `plugins/` 目录分发。插件自带 `cordis.patch.yml`（声明于 `package.json` 的 `dsh.bundle.patch`），内容即上述挂载行。）

## 数据与隐私
- 数据写 `<workspace>/.dsh-memory/`（`MEMORY.md` + `memories/` + `FACT.md` + `JOURNAL.jsonl`）——**会在项目目录留下明文文件**。请把 `.dsh-memory/` 加入项目 `.gitignore`：
```gitignore
.dsh-memory/
```
- 如需关闭，从 profile 移除挂载即可。

## 配置（Config）
当前无配置项（`Config = undefined`）。
