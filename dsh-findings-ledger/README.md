# dsh-findings-ledger

DSH 插件：baseline 快照 + 改动对账 + 覆盖度报告（对标 Zcode 的 mimosa task-review）。

- `findings_baseline`  捕获/重捕获工作区文件快照
- `findings_record`    记录一条「声称的发现/结论」及目标文件
- `findings_report`    生成覆盖度报告（哪些发现已被改动文件验证）

存储：`<workspace>/.dsh-findings/`（baseline.json + ledger.jsonl + reports/）。
turn-start 自动捕获基线，turn-end 自动出报告。零外部依赖。
