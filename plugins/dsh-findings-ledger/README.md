# dsh-findings-ledger

baseline 快照 + 改动对账 + 覆盖度报告（对标 Zcode mimosa task-review / finding-ledger）。

## 功能
- **基线快照**：会话首个 turn 自动对工作区做 SHA-1 哈希快照（跳过 `node_modules/.git/.dsh/dist/build/lib`）；`findings_baseline` 工具可手动重捕获。
- **findings 账本**：agent 用 `findings_record` 记录"声称的发现 + 目标文件 + tag"。
- **变更对账**：`turn/end` 时对比当前工作区 vs 基线，输出 A/M/D 变更集。
- **覆盖度报告**：finding 目标文件在变更集中 → verified，否则 unverified；输出 coverage 状态 + reasons。

## 挂载（profile 级）
本插件无 `dsh.bundle` 块（纯 host 插件）——通过 profile 级 `cordis.patch.yml` 的 `plugins` 段挂载：
```yaml
plugins:
  - id: '@dsh-external/dsh-findings-ledger'
    name: dsh-findings-ledger
```
（需先装入 profile 的 node_modules；或并入 dsh-hub 仓库后随 `plugins/` 目录分发。）

## 数据与隐私
- 数据写 `<workspace>/.dsh-findings/`（`baseline.json` + `ledger.jsonl` + `reports/`）——**会在项目目录留下文件**，含 findings 明文。请把 `.dsh-findings/` 加入项目 `.gitignore`；如需关闭，从 profile 移除挂载即可。
- 性能：`turn/end` 全树哈希对超大仓库有成本——跳过列表可经插件 Config 调整。

## 配置（Config）
`{ baseline: { skip: [...], maxFileBytes } }`——快照跳过目录与最大文件字节阈值。
